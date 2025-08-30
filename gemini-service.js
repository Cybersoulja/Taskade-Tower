
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  // Generate content based on a prompt
  async generateContent(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  // Analyze document content
  async analyzeContent(text, analysisType = 'summary') {
    try {
      let prompt;
      
      switch (analysisType) {
        case 'summary':
          prompt = `Please provide a concise summary of the following text:\n\n${text}`;
          break;
        case 'sentiment':
          prompt = `Analyze the sentiment of the following text and classify it as positive, negative, or neutral. Provide a brief explanation:\n\n${text}`;
          break;
        case 'keywords':
          prompt = `Extract the main keywords and key phrases from the following text:\n\n${text}`;
          break;
        case 'improve':
          prompt = `Please improve the following text by making it clearer, more concise, and better structured:\n\n${text}`;
          break;
        default:
          prompt = `Analyze the following text:\n\n${text}`;
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  }

  // Generate content for a specific topic or outline
  async generateDocumentContent(topic, contentType = 'article', length = 'medium') {
    try {
      let lengthGuide;
      
      switch (length) {
        case 'short':
          lengthGuide = 'Keep it brief, around 200-300 words.';
          break;
        case 'medium':
          lengthGuide = 'Make it moderately detailed, around 500-800 words.';
          break;
        case 'long':
          lengthGuide = 'Create a comprehensive piece, around 1000-1500 words.';
          break;
        default:
          lengthGuide = 'Use appropriate length for the content.';
      }

      const prompt = `Create a well-structured ${contentType} about "${topic}". ${lengthGuide} 
      
      Please include:
      - A compelling title
      - Clear headings and subheadings
      - Well-organized content
      - A proper conclusion
      
      Format it as clean text that can be easily inserted into a Google Doc.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating document content:', error);
      throw error;
    }
  }

  // Enhance existing content
  async enhanceContent(originalText, enhancementType = 'improve') {
    try {
      let prompt;
      
      switch (enhancementType) {
        case 'improve':
          prompt = `Improve the following text by making it more engaging, clear, and well-structured. Maintain the original meaning but enhance readability:\n\n${originalText}`;
          break;
        case 'expand':
          prompt = `Expand the following text by adding more details, examples, and explanations while maintaining the original tone and structure:\n\n${originalText}`;
          break;
        case 'simplify':
          prompt = `Simplify the following text to make it easier to understand while preserving all important information:\n\n${originalText}`;
          break;
        case 'professional':
          prompt = `Rewrite the following text in a more professional and formal tone:\n\n${originalText}`;
          break;
        case 'casual':
          prompt = `Rewrite the following text in a more casual and conversational tone:\n\n${originalText}`;
          break;
        default:
          prompt = `Enhance the following text:\n\n${originalText}`;
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error enhancing content:', error);
      throw error;
    }
  }
}

module.exports = GeminiService;
