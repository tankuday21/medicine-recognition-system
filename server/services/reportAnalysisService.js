const geminiService = require('./geminiService');
const nvidiaService = require('./nvidiaService');
const fs = require('fs-extra');

class ReportAnalysisService {
  constructor() {
    this.healthMetrics = this.initializeHealthMetrics();
    console.log('📊 Report Analysis Service initialized (AI-Powered)');
  }

  // Initialize health metrics patterns and normal ranges (Kept for fallback/validation)
  initializeHealthMetrics() {
    return {
      // Structure kept for reference, but AI will do the heavy lifting
    };
  }

  // Main analysis function using Gemini AI
  async analyzeReport(filePath, options = {}) {
    try {
      console.log('📊 Analyzing medical report with Gemini AI...');

      // Use Gemini for OCR and DeepSeek for analysis
      const aiResult = await this.analyzeWithAI(filePath);

      if (aiResult.success) {
        return {
          success: true,
          analysis: aiResult.data
        };
      } else {
        throw new Error(aiResult.error || 'AI analysis failed');
      }

    } catch (error) {
      console.error('Report analysis error:', error);
      return {
        success: false,
        message: 'Failed to analyze report',
        error: error.message
      };
    }
  }

  async extractText(filePath) {
    console.log('🔄 Extracting text from medical report with NVIDIA...');
    const imageBuffer = await fs.readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    
    const ocrPrompt = "Extract ALL text from this medical report image. Preserve the layout exactly.";
    
    try {
      const nvidiaResult = await nvidiaService.client.chat.completions.create({
        model: nvidiaService.model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: ocrPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      });
      return nvidiaResult.choices[0].message.content;
    } catch (error) {
      console.warn('⚠️ NVIDIA OCR failed, falling back to Gemini...', error.message);
      const imageData = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      };
      const ocrResult = await geminiService.generateContentWithFallback([ocrPrompt, imageData]);
      return (await ocrResult.response).text();
    }
  }

  async analyzeBasic(rawText) {
    const prompt = `Extract basic info from this medical report text: ${rawText}
      JSON Structure:
      {
        "document_metadata": { "type": string, "date": string },
        "hospital_details": { "name": string, "address": string },
        "patient_details": { "name": string, "age": string, "gender": string },
        "summary": "Short 2-sentence summary"
      }`;
    return await this.callAI(prompt);
  }

  async analyzeDetailed(rawText) {
    const prompt = `Extract detailed clinical data from this medical report text: ${rawText}
      JSON Structure:
      {
        "vitals": [ { "name": string, "value": string, "unit": string, "interpretation": string } ],
        "investigations": {
          "results": [ { "name": string, "value": string, "unit": string, "normal_range": string, "interpretation": string, "is_abnormal": boolean } ]
        },
        "medications": [ { "name": string, "dosage": string, "frequency": string } ],
        "advice": [ { "title": string, "description": string, "category": string } ]
      }`;
    return await this.callAI(prompt);
  }

  async callAI(prompt) {
    let data;
    let fallbackToSamba = false;

    console.log(`🤖 Attempting analysis with NVIDIA (${nvidiaService.model})...`);
    try {
      const nvidiaResult = await nvidiaService.client.chat.completions.create({
        model: nvidiaService.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      });
      
      const content = nvidiaResult.choices[0].message.content;
      data = geminiService._extractJson(content);
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Invalid JSON response from NVIDIA');
      }
    } catch (error) {
      console.warn('⚠️ NVIDIA analysis failed, falling back to SambaNova...', error.message);
      fallbackToSamba = true;
    }

    if (fallbackToSamba) {
      if (geminiService.sambaNovaClients && geminiService.sambaNovaClients.length > 0) {
        try {
          const samba = geminiService._getAvailableSambaClient();
          if (samba) {
            console.log(`🤖 Attempting analysis with SambaNova (${geminiService.sambaNovaModel})...`);
            const completion = await samba.client.chat.completions.create({
              model: geminiService.sambaNovaModel,
              messages: [{ role: "user", content: prompt }],
              response_format: { type: "json_object" }
            });
            
            const content = completion.choices[0].message.content;
            data = geminiService._extractJson(content);
            if (!data || Object.keys(data).length === 0) {
              throw new Error('Invalid JSON response from SambaNova');
            }
          } else {
            throw new Error('No SambaNova clients available');
          }
        } catch (error) {
          console.warn('⚠️ SambaNova fallback failed, falling back to Gemini...', error.message);
          const result = await geminiService.model.generateContent(prompt);
          const text = (await result.response).text();
          data = geminiService._extractJson(text);
          if (!data || Object.keys(data).length === 0) {
            throw new Error('Could not extract JSON from Gemini response');
          }
        }
      } else {
        console.log('🤖 Falling back to Google Gemini for clinical analysis...');
        const result = await geminiService.model.generateContent(prompt);
        const text = (await result.response).text();
        data = geminiService._extractJson(text);
        if (!data || Object.keys(data).length === 0) {
          throw new Error('Could not extract JSON from Gemini response');
        }
      }
    }

    return data;
  }

  async analyzeWithAI(filePath) {
    try {
      const rawText = await this.extractText(filePath);
      const basic = await this.analyzeBasic(rawText);
      const detailed = await this.analyzeDetailed(rawText);
      return { success: true, data: { ...basic, ...detailed } };
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return { success: false, error: error.message };
    }
  }

  // Assess completeness (simplified version for AI response)
  assessCompleteness(extractedMetrics) {
    if (!extractedMetrics) return { percentage: 0 };
    return {
      percentage: Math.min(100, extractedMetrics.length * 5) // Rough heuristic
    };
  }

  // Get service status
  getStatus() {
    return {
      isEnabled: true,
      provider: 'Gemini AI (Multimodal)'
    };
  }
}

const reportAnalysisService = new ReportAnalysisService();
module.exports = reportAnalysisService;