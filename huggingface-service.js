
const { HfInference } = require('@huggingface/inference');

class HuggingFaceService {
  constructor() {
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY environment variable is not set');
    }
    
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  // Text Generation
  async generateText(prompt, model = 'gpt2', parameters = {}) {
    try {
      const defaultParams = {
        max_new_tokens: 100,
        temperature: 0.7,
        ...parameters
      };

      const result = await this.hf.textGeneration({
        model: model,
        inputs: prompt,
        parameters: defaultParams
      });

      return result.generated_text;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  // Text Classification
  async classifyText(text, model = 'cardiffnlp/twitter-roberta-base-sentiment-latest') {
    try {
      const result = await this.hf.textClassification({
        model: model,
        inputs: text
      });

      return result;
    } catch (error) {
      console.error('Error classifying text:', error);
      throw error;
    }
  }

  // Question Answering
  async answerQuestion(question, context, model = 'deepset/roberta-base-squad2') {
    try {
      const result = await this.hf.questionAnswering({
        model: model,
        inputs: {
          question: question,
          context: context
        }
      });

      return result;
    } catch (error) {
      console.error('Error answering question:', error);
      throw error;
    }
  }

  // Text Summarization
  async summarizeText(text, model = 'facebook/bart-large-cnn', parameters = {}) {
    try {
      const defaultParams = {
        max_length: 130,
        min_length: 30,
        ...parameters
      };

      const result = await this.hf.summarization({
        model: model,
        inputs: text,
        parameters: defaultParams
      });

      return result[0].summary_text;
    } catch (error) {
      console.error('Error summarizing text:', error);
      throw error;
    }
  }

  // Named Entity Recognition
  async extractEntities(text, model = 'dbmdz/bert-large-cased-finetuned-conll03-english') {
    try {
      const result = await this.hf.tokenClassification({
        model: model,
        inputs: text
      });

      return result;
    } catch (error) {
      console.error('Error extracting entities:', error);
      throw error;
    }
  }

  // Translation
  async translateText(text, model = 'Helsinki-NLP/opus-mt-en-fr') {
    try {
      const result = await this.hf.translation({
        model: model,
        inputs: text
      });

      return result[0].translation_text;
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }

  // Feature Extraction (Embeddings)
  async getEmbeddings(text, model = 'sentence-transformers/all-MiniLM-L6-v2') {
    try {
      const result = await this.hf.featureExtraction({
        model: model,
        inputs: text
      });

      return result;
    } catch (error) {
      console.error('Error getting embeddings:', error);
      throw error;
    }
  }

  // Fill Mask
  async fillMask(text, model = 'bert-base-uncased') {
    try {
      const result = await this.hf.fillMask({
        model: model,
        inputs: text
      });

      return result;
    } catch (error) {
      console.error('Error filling mask:', error);
      throw error;
    }
  }

  // Image Classification
  async classifyImage(imageUrl, model = 'google/vit-base-patch16-224') {
    try {
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();

      const result = await this.hf.imageClassification({
        model: model,
        data: imageBlob
      });

      return result;
    } catch (error) {
      console.error('Error classifying image:', error);
      throw error;
    }
  }

  // Object Detection
  async detectObjects(imageUrl, model = 'facebook/detr-resnet-50') {
    try {
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();

      const result = await this.hf.objectDetection({
        model: model,
        data: imageBlob
      });

      return result;
    } catch (error) {
      console.error('Error detecting objects:', error);
      throw error;
    }
  }

  // Text-to-Image
  async generateImage(prompt, model = 'runwayml/stable-diffusion-v1-5') {
    try {
      const result = await this.hf.textToImage({
        model: model,
        inputs: prompt
      });

      return result;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  // Speech Recognition
  async speechToText(audioBlob, model = 'openai/whisper-base') {
    try {
      const result = await this.hf.automaticSpeechRecognition({
        model: model,
        data: audioBlob
      });

      return result.text;
    } catch (error) {
      console.error('Error converting speech to text:', error);
      throw error;
    }
  }
}

module.exports = HuggingFaceService;
