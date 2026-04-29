const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');

class NVIDIAService {
  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY;
    this.model = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";
    this.baseURL = 'https://integrate.api.nvidia.com/v1';
    
    if (!this.apiKey) {
      console.warn('⚠️ NVIDIA_API_KEY not found. NVIDIA AI features will be limited.');
    }

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
    });
  }

  async generateChatResponse(message, history = [], context = {}, language = 'en') {
    try {
      console.log(`[NVIDIA] Generating chat response for: ${message.substring(0, 50)}...`);

      const messages = [
        { 
          role: "system", 
          content: `You are Mediot Assistant, a premium AI medical information assistant. 
Language: ${language}.
Important guidelines:
1. ALWAYS remind users to consult healthcare professionals for medical decisions.
2. Provide concise but comprehensive medical information.
3. Be empathetic, professional, and supportive.
4. Never provide specific dosage recommendations; only general guidelines.
5. Format your responses using clean Markdown.`
        }
      ];

      // Add history
      history.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message || msg.content
        });
      });

      // Add current message
      messages.push({ role: "user", content: message });

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 65536,
        reasoning_budget: 16384,
        chat_template_kwargs: {"enable_thinking":false},
      });

      const responseText = completion.choices[0].message.content;

      return {
        success: true,
        data: {
          message: responseText,
          followUpSuggestions: this.generateFollowUpQuestions(responseText),
          timestamp: new Date().toISOString(),
          provider: 'NVIDIA'
        }
      };
    } catch (error) {
      console.error('[NVIDIA] Chat error:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeImage(imagePath, prompt, language = 'en') {
    try {
      console.log(`[NVIDIA] Analyzing image: ${imagePath}`);
      
      let base64Image;
      if (imagePath.startsWith('data:')) {
        base64Image = imagePath.split(',')[1];
      } else {
        const imageBuffer = await fs.readFile(imagePath);
        base64Image = imageBuffer.toString('base64');
      }

      const mimeType = imagePath.startsWith('data:') 
        ? imagePath.split(';')[0].split(':')[1] 
        : this.getMimeType(imagePath);

      const messages = [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ];

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 4096,
      });

      return {
        success: true,
        data: completion.choices[0].message.content,
        provider: 'NVIDIA'
      };
    } catch (error) {
      console.error('[NVIDIA] Image analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.png': return 'image/png';
      case '.jpg':
      case '.jpeg': return 'image/jpeg';
      case '.webp': return 'image/webp';
      default: return 'image/jpeg';
    }
  }

  generateFollowUpQuestions(text) {
    // Simple heuristic for follow-up questions if not provided by AI
    return [
      "Can you explain more about this?",
      "What are the precautions?",
      "Are there any side effects?"
    ];
  }
}

module.exports = new NVIDIAService();
