const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChatMessage } = require('../models');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
    
    this.initializeAI();
  }

  initializeAI() {
    try {
      // Disable real AI service for now - use mock instead
      console.warn('⚠️ Real Gemini AI service disabled. Using mock AI service.');
      this.isInitialized = false;
      return;

      if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ Gemini API key not found. AI features will be disabled.');
        return;
      }

      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.isInitialized = true;
      
      console.log('✅ Gemini AI service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
      this.isInitialized = false;
    }
  }

  // Process user query with context
  async processQuery(query, context = null, userId = null) {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          message: 'AI service is not available'
        };
      }

      console.log(`🤖 Processing AI query: ${query.substring(0, 50)}...`);

      // Build the prompt with context
      const prompt = this.buildPrompt(query, context);
      
      // Generate response
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
      // Disable AI service if there's an error
      this.isInitialized = false;
      return {
        success: false,
        message: 'Failed to process your question. Please try again.'
      };
    }
  }

  // Build context-aware prompt
  buildPrompt(query, context) {
    let prompt = `You are Mediot Assistant, a helpful AI medical information assistant. You provide accurate, helpful information about medicines, health conditions, and general medical guidance. Always remind users to consult healthcare professionals for medical decisions.

Important guidelines:
- Provide accurate medical information
- Always recommend consulting healthcare professionals
- Be empathetic and supportive
- Keep responses concise but informative
- If unsure, say so and recommend professional consultation
- Never provide specific dosage recommendations without professional consultation

`;

    // Add context if available
    if (context) {
      if (context.medicine) {
        prompt += `Context: The user is asking about ${context.medicine.name} (${context.medicine.genericName || 'N/A'}), ${context.medicine.dosage}.
Medicine details:
- Uses: ${context.medicine.uses?.join(', ') || 'N/A'}
- Side effects: ${context.medicine.sideEffects?.join(', ') || 'N/A'}
- Interactions: ${context.medicine.interactions?.join(', ') || 'N/A'}
- Manufacturer: ${context.medicine.manufacturer || 'N/A'}

`;
      }

      if (context.scanResult) {
        prompt += `Context: The user just scanned a ${context.scanResult.type} with data: ${context.scanResult.data}

`;
      }

      if (context.symptoms) {
        prompt += `Context: The user mentioned symptoms: ${context.symptoms.join(', ')}

`;
      }
    }

    prompt += `User question: ${query}

Please provide a helpful, accurate response:`;

    return prompt;
  }

  // Parse and enhance AI response
  parseResponse(text, originalQuery, context) {
    const response = {
      content: text.trim(),
      confidence: 85, // Default confidence
      sources: [],
      followUpQuestions: [],
      timestamp: new Date()
    };

    // Generate follow-up questions based on context
    if (context?.medicine) {
      response.followUpQuestions = [
        `What are the side effects of ${context.medicine.name}?`,
        `How should I take ${context.medicine.name}?`,
        `What should I avoid while taking ${context.medicine.name}?`
      ];
    } else {
      // General follow-up questions
      response.followUpQuestions = [
        'Can you tell me more about this condition?',
        'What are the treatment options?',
        'When should I see a doctor?'
      ];
    }

    // Add relevant sources (placeholder for now)
    response.sources = [
      'Medical literature',
      'Drug information databases',
      'Healthcare guidelines'
    ];

    return response;
  }

  // Analyze medicine interactions
  async analyzeMedicineInteraction(medicines, userId = null) {
    try {
      if (!this.isInitialized || !medicines || medicines.length < 2) {
        return {
          success: false,
          message: 'AI service not available or insufficient medicines for interaction analysis'
        };
      }

      const medicineNames = medicines.map(m => `${m.name} (${m.dosage})`).join(', ');
      
      const prompt = `As a medical AI assistant, analyze potential drug interactions between these medicines: ${medicineNames}

Please provide:
1. Potential interactions and their severity
2. Precautions to take
3. Recommendation to consult healthcare provider

Keep the response concise and always emphasize consulting a healthcare professional.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const analysis = {
        medicines: medicines.map(m => ({ name: m.name, dosage: m.dosage })),
        analysis: text.trim(),
        severity: 'moderate', // This would be determined by AI analysis
        recommendations: [
          'Consult your healthcare provider',
          'Monitor for side effects',
          'Take medicines as prescribed'
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
      if (!this.isInitialized) {
        return {
          success: false,
          message: 'AI service not available'
        };
      }

      const prompt = `Provide general dosage guidance for ${medicine.name} (${medicine.dosage}). 
User profile: Age group based on DOB, Gender: ${userProfile.gender || 'not specified'}
Allergies: ${userProfile.allergies?.join(', ') || 'none specified'}
Chronic conditions: ${userProfile.chronicConditions?.join(', ') || 'none specified'}

Please provide:
1. General dosage information
2. Important considerations
3. When to consult healthcare provider

Always emphasize that this is general information and professional consultation is required for specific dosage recommendations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const guidance = {
        medicine: { name: medicine.name, dosage: medicine.dosage },
        guidance: text.trim(),
        considerations: [
          'Follow healthcare provider instructions',
          'Do not exceed recommended dose',
          'Take with or without food as directed'
        ],
        timestamp: new Date()
      };

      return {
        success: true,
        data: guidance
      };
    } catch (error) {
      console.error('Dosage guidance error:', error);
      return {
        success: false,
        message: 'Failed to provide dosage guidance'
      };
    }
  }

  // Save conversation to database
  async saveConversation(userId, userMessage, aiResponse, context = null) {
    try {
      // Generate conversation ID based on date and user
      const conversationId = `${userId}_${new Date().toISOString().split('T')[0]}`;

      // Save user message
      const userChatMessage = new ChatMessage({
        userId,
        conversationId,
        content: userMessage,
        sender: 'user',
        context
      });
      await userChatMessage.save();

      // Save AI response
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

      console.log('✅ Conversation saved to database');
    } catch (error) {
      console.error('Failed to save conversation:', error);
      // Don't throw error, just log it
    }
  }

  // Get conversation history
  async getConversationHistory(userId, conversationId = null, limit = 20) {
    try {
      const query = { userId };
      if (conversationId) {
        query.conversationId = conversationId;
      }

      const messages = await ChatMessage.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);

      return {
        success: true,
        data: messages.reverse() // Return in chronological order
      };
    } catch (error) {
      console.error('Conversation history fetch error:', error);
      return {
        success: false,
        message: 'Failed to fetch conversation history'
      };
    }
  }

  // Get conversation summaries
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

      return {
        success: true,
        data: summaries
      };
    } catch (error) {
      console.error('Conversation summaries fetch error:', error);
      return {
        success: false,
        message: 'Failed to fetch conversation summaries'
      };
    }
  }
}

module.exports = new AIService();