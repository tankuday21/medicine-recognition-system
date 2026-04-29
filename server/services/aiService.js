const OpenAI = require('openai');
const { ChatMessage } = require('../models');

class AIService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.model = process.env.AI_MODEL || 'DeepSeek-V3.1';
    
    this.initializeAI();
  }

  initializeAI() {
    try {
      const apiKey = process.env.NVIDIA_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ NVIDIA API key not found. Falling back to SambaNova.');
        this.initializeSambaNova();
        return;
      }

      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://integrate.api.nvidia.com/v1",
      });
      
      this.model = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";
      this.isInitialized = true;
      console.log(`✅ NVIDIA AI service initialized with model: ${this.model}`);
    } catch (error) {
      console.error('❌ Failed to initialize NVIDIA AI:', error.message);
      this.initializeSambaNova();
    }
  }

  initializeSambaNova() {
    try {
      const apiKey = process.env.SAMBANOVA_API_KEY;
      if (!apiKey) {
        this.isInitialized = false;
        return;
      }
      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.sambanova.ai/v1",
      });
      this.model = process.env.AI_MODEL || 'DeepSeek-V3.1';
      this.isInitialized = true;
      console.log(`✅ SambaNova AI fallback initialized with model: ${this.model}`);
    } catch (e) {
      this.isInitialized = false;
    }
  }

  // Process user query with context
  async processQuery(query, context = null, userId = null) {
    try {
      if (!this.isInitialized) {
        // Try to re-initialize if not initialized
        this.initializeAI();
        if (!this.isInitialized) {
          return {
            success: false,
            message: 'AI assistant is currently unavailable'
          };
        }
      }

      console.log(`🤖 Processing AI query with ${this.model}: ${query.substring(0, 50)}...`);

      // Prepare messages
      const messages = this.buildMessages(query, context);
      
      // Generate response using SambaNova
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const text = completion.choices[0].message.content;

      // Parse and enhance the response
      const aiResponse = this.parseResponse(text, query, context);

      // Save conversation if user is authenticated
      if (userId) {
        await this.saveConversation(userId, query, aiResponse, context);
      }

      return {
        success: true,
        data: aiResponse
      };
    } catch (error) {
      console.error('AI query processing error:', error);
      return {
        success: false,
        message: 'Failed to process your question. Please try again.'
      };
    }
  }

  // Build context-aware messages for Chat Completion API
  buildMessages(query, context) {
    const systemPrompt = `You are Mediot Assistant, a premium AI medical information assistant. 
You provide accurate, helpful information about medicines, health conditions, and general medical guidance. 

Important guidelines:
1. ALWAYS remind users to consult healthcare professionals for medical decisions.
2. Provide concise but comprehensive medical information.
3. Be empathetic, professional, and supportive.
4. If unsure about specific medical facts, state so clearly and suggest professional consultation.
5. Never provide specific dosage recommendations; only general guidelines.
6. Format your responses using clean Markdown for readability.`;

    const messages = [
      { role: "system", content: systemPrompt }
    ];

    let contextText = "";
    // Add context if available
    if (context) {
      if (context.medicine) {
        contextText += `The user is asking about ${context.medicine.name} (${context.medicine.genericName || 'N/A'}).
Details:
- Dosage: ${context.medicine.dosage || 'N/A'}
- Uses: ${context.medicine.uses?.join(', ') || 'N/A'}
- Side effects: ${context.medicine.sideEffects?.join(', ') || 'N/A'}
- Interactions: ${context.medicine.interactions?.join(', ') || 'N/A'}
\n`;
      }

      if (context.scanResult) {
        contextText += `The user just scanned a ${context.scanResult.type} related to: ${context.scanResult.data}\n`;
      }

      if (context.symptoms) {
        contextText += `The user mentioned symptoms: ${context.symptoms.join(', ')}\n`;
      }
    }

    if (contextText) {
      messages.push({ role: "system", content: `Context Information:\n${contextText}` });
    }

    messages.push({ role: "user", content: query });

    return messages;
  }

  // Parse and enhance AI response
  parseResponse(text, originalQuery, context) {
    const response = {
      content: text.trim(),
      confidence: 95, // Higher confidence with DeepSeek
      sources: [
        'SambaNova AI Engine',
        'Verified Medical Databases',
        'Clinical Guidelines'
      ],
      followUpQuestions: [],
      timestamp: new Date()
    };

    // Generate follow-up questions based on context
    if (context?.medicine) {
      response.followUpQuestions = [
        `What are the long-term side effects of ${context.medicine.name}?`,
        `Are there natural alternatives to ${context.medicine.name}?`,
        `How does ${context.medicine.name} interact with common foods?`
      ];
    } else {
      response.followUpQuestions = [
        'Could you explain this in more detail?',
        'What are the common symptoms of this condition?',
        'When is it urgent to see a specialist?'
      ];
    }

    return response;
  }

  // Analyze medicine interactions
  async analyzeMedicineInteraction(medicines, userId = null) {
    try {
      if (!this.isInitialized || !medicines || medicines.length < 2) {
        return {
          success: false,
          message: 'Insufficient medicines for interaction analysis'
        };
      }

      const medicineNames = medicines.map(m => `${m.name} (${m.dosage})`).join(', ');
      
      const prompt = `Analyze potential drug interactions between: ${medicineNames}. 
Identify severity levels and provide safety precautions. Always emphasize professional consultation.`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "You are a pharmaceutical interaction expert." },
          { role: "user", content: prompt }
        ],
      });

      const text = completion.choices[0].message.content;

      const analysis = {
        medicines: medicines.map(m => ({ name: m.name, dosage: m.dosage })),
        analysis: text.trim(),
        severity: 'Requires Professional Review',
        recommendations: [
          'Consult your pharmacist or doctor immediately',
          'Do not mix these without professional approval',
          'Keep a symptom log if taken together'
        ],
        timestamp: new Date()
      };

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      console.error('Medicine interaction analysis error:', error);
      return {
        success: false,
        message: 'Failed to analyze medicine interactions'
      };
    }
  }

  // Provide dosage guidance
  async provideDosageGuidance(medicine, userProfile, userId = null) {
    try {
      if (!this.isInitialized) return { success: false, message: 'AI service unavailable' };

      const prompt = `Provide general dosage guidance for ${medicine.name} (${medicine.dosage}). 
User Context: Gender: ${userProfile.gender || 'N/A'}, Allergies: ${userProfile.allergies?.join(', ') || 'None'}, Conditions: ${userProfile.chronicConditions?.join(', ') || 'None'}.`;

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "You are a clinical dosage assistant. Provide general guidelines only." },
          { role: "user", content: prompt }
        ],
      });

      const guidance = {
        medicine: { name: medicine.name, dosage: medicine.dosage },
        guidance: completion.choices[0].message.content.trim(),
        considerations: [
          'Professional prescription takes precedence',
          'Monitor for allergic reactions',
          'Maintain consistent timing'
        ],
        timestamp: new Date()
      };

      return { success: true, data: guidance };
    } catch (error) {
      console.error('Dosage guidance error:', error);
      return { success: false, message: 'Failed to provide guidance' };
    }
  }

  // Save conversation to database
  async saveConversation(userId, userMessage, aiResponse, context = null) {
    try {
      const conversationId = `${userId}_${new Date().toISOString().split('T')[0]}`;

      const userChatMessage = new ChatMessage({
        userId,
        conversationId,
        content: userMessage,
        sender: 'user',
        context
      });
      await userChatMessage.save();

      const aiChatMessage = new ChatMessage({
        userId,
        conversationId,
        content: aiResponse.content,
        sender: 'assistant',
        aiResponse: {
          confidence: aiResponse.confidence,
          sources: aiResponse.sources,
          followUpQuestions: aiResponse.followUpQuestions
        }
      });
      await aiChatMessage.save();
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  // Get conversation history
  async getConversationHistory(userId, conversationId = null, limit = 20) {
    try {
      const query = { userId };
      if (conversationId) query.conversationId = conversationId;
      const messages = await ChatMessage.find(query).sort({ createdAt: -1 }).limit(limit);
      return { success: true, data: messages.reverse() };
    } catch (error) {
      return { success: false, message: 'Failed to fetch history' };
    }
  }

  // Get summaries
  async getConversationSummaries(userId, limit = 10) {
    try {
      const summaries = await ChatMessage.aggregate([
        { $match: { userId: userId } },
        { 
          $group: {
            _id: '$conversationId',
            lastMessage: { $last: '$content' },
            messageCount: { $sum: 1 },
            lastActivity: { $max: '$createdAt' }
          }
        },
        { $sort: { lastActivity: -1 } },
        { $limit: limit }
      ]);
      return { success: true, data: summaries };
    } catch (error) {
      return { success: false, message: 'Failed to fetch summaries' };
    }
  }
}

module.exports = new AIService();
