const express = require('express');
const cors = require('cors');
const axios = require('axios');
const GoogleDocsService = require('./google-docs-service');
const GeminiService = require('./gemini-service');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Docs service
const googleDocsService = new GoogleDocsService();

// Initialize Gemini AI service
let geminiService;
try {
  geminiService = new GeminiService();
} catch (error) {
  console.warn('Gemini service not initialized:', error.message);
}

app.use(cors());
app.use(express.json());

// Base URL for Taskade API
const TASKADE_API_URL = 'https://api.taskade.com/v1';

// Middleware to check for API key
const authenticateRequest = (req, res, next) => {
  const apiKey = process.env.TASKADE_API_KEY;
  if (!apiKey) {
    console.error('TASKADE_API_KEY environment variable is not set');
    return res.status(401).json({ error: 'TASKADE_API_KEY environment variable is not set. Please add it to Secrets.' });
  }
  req.apiKey = apiKey;
  next();
};

// Gemini AI endpoints

// Generate content with Gemini
app.post('/gemini/generate', async (req, res) => {
  try {
    if (!geminiService) {
      return res.status(503).json({ error: 'Gemini service is not available. Please check your GEMINI_API_KEY.' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const content = await geminiService.generateContent(prompt);
    res.json({
      success: true,
      content: content
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze content with Gemini
app.post('/gemini/analyze', async (req, res) => {
  try {
    if (!geminiService) {
      return res.status(503).json({ error: 'Gemini service is not available. Please check your GEMINI_API_KEY.' });
    }

    const { text, analysisType = 'summary' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const analysis = await geminiService.analyzeContent(text, analysisType);
    res.json({
      success: true,
      analysis: analysis,
      analysisType: analysisType
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate document content and optionally create Google Doc
app.post('/gemini/generate-document', async (req, res) => {
  try {
    if (!geminiService) {
      return res.status(503).json({ error: 'Gemini service is not available. Please check your GEMINI_API_KEY.' });
    }

    const { topic, contentType = 'article', length = 'medium', createGoogleDoc = false, documentTitle } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const content = await geminiService.generateDocumentContent(topic, contentType, length);
    
    let googleDocInfo = null;
    if (createGoogleDoc) {
      try {
        const title = documentTitle || `AI Generated: ${topic}`;
        const doc = await googleDocsService.createDocument(title);
        await googleDocsService.insertText(doc.documentId, content);
        
        googleDocInfo = {
          documentId: doc.documentId,
          title: doc.title,
          url: `https://docs.google.com/document/d/${doc.documentId}/edit`
        };
      } catch (docError) {
        console.error('Error creating Google Doc:', docError);
        // Continue without Google Doc creation
      }
    }

    res.json({
      success: true,
      content: content,
      topic: topic,
      contentType: contentType,
      length: length,
      googleDoc: googleDocInfo
    });
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhance existing Google Doc content
app.post('/gemini/enhance-document/:documentId', async (req, res) => {
  try {
    if (!geminiService) {
      return res.status(503).json({ error: 'Gemini service is not available. Please check your GEMINI_API_KEY.' });
    }

    const { documentId } = req.params;
    const { enhancementType = 'improve', replaceOriginal = false } = req.body;

    // Get the current document content
    const doc = await googleDocsService.getDocument(documentId);
    const originalText = googleDocsService.extractTextContent(doc);

    if (!originalText.trim()) {
      return res.status(400).json({ error: 'Document appears to be empty' });
    }

    // Enhance the content with Gemini
    const enhancedContent = await geminiService.enhanceContent(originalText, enhancementType);

    if (replaceOriginal) {
      // Replace the entire document content
      await googleDocsService.replaceText(documentId, originalText, enhancedContent);
    } else {
      // Append the enhanced content
      await googleDocsService.appendText(documentId, '\n\n--- Enhanced Version ---\n\n' + enhancedContent);
    }

    res.json({
      success: true,
      message: replaceOriginal ? 'Document content replaced with enhanced version' : 'Enhanced content appended to document',
      enhancementType: enhancementType,
      originalLength: originalText.length,
      enhancedLength: enhancedContent.length
    });
  } catch (error) {
    console.error('Error enhancing document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze Google Doc content
app.get('/gemini/analyze-document/:documentId', async (req, res) => {
  try {
    if (!geminiService) {
      return res.status(503).json({ error: 'Gemini service is not available. Please check your GEMINI_API_KEY.' });
    }

    const { documentId } = req.params;
    const { analysisType = 'summary' } = req.query;

    // Get the document content
    const doc = await googleDocsService.getDocument(documentId);
    const text = googleDocsService.extractTextContent(doc);

    if (!text.trim()) {
      return res.status(400).json({ error: 'Document appears to be empty' });
    }

    // Analyze with Gemini
    const analysis = await geminiService.analyzeContent(text, analysisType);

    res.json({
      success: true,
      documentId: documentId,
      documentTitle: doc.title,
      analysis: analysis,
      analysisType: analysisType,
      textLength: text.length
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google Docs API endpoints

// Create a new Google Doc
app.post('/google-docs/create', async (req, res) => {
  try {
    const { title = 'Untitled Document' } = req.body;
    const document = await googleDocsService.createDocument(title);
    res.json({
      success: true,
      documentId: document.documentId,
      title: document.title,
      url: `https://docs.google.com/document/d/${document.documentId}/edit`
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Read a Google Doc
app.get('/google-docs/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await googleDocsService.getDocument(documentId);
    const textContent = googleDocsService.extractTextContent(document);
    
    res.json({
      success: true,
      documentId: document.documentId,
      title: document.title,
      textContent: textContent,
      fullDocument: document
    });
  } catch (error) {
    console.error('Error reading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Insert text at the beginning of a document
app.post('/google-docs/:documentId/insert', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await googleDocsService.insertText(documentId, text);
    res.json({
      success: true,
      message: 'Text inserted successfully',
      result: result
    });
  } catch (error) {
    console.error('Error inserting text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Append text to the end of a document
app.post('/google-docs/:documentId/append', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await googleDocsService.appendText(documentId, text);
    res.json({
      success: true,
      message: 'Text appended successfully',
      result: result
    });
  } catch (error) {
    console.error('Error appending text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Replace text in a document
app.post('/google-docs/:documentId/replace', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { searchText, replaceText } = req.body;
    
    if (!searchText || replaceText === undefined) {
      return res.status(400).json({ error: 'Both searchText and replaceText are required' });
    }

    const result = await googleDocsService.replaceText(documentId, searchText, replaceText);
    res.json({
      success: true,
      message: 'Text replaced successfully',
      result: result
    });
  } catch (error) {
    console.error('Error replacing text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update document with custom requests
app.post('/google-docs/:documentId/update', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { requests } = req.body;
    
    if (!requests || !Array.isArray(requests)) {
      return res.status(400).json({ error: 'Requests array is required' });
    }

    const result = await googleDocsService.updateDocument(documentId, requests);
    res.json({
      success: true,
      message: 'Document updated successfully',
      result: result
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get agents list
app.get('/taskade-tower/agents', authenticateRequest, async (req, res) => {
  try {
    const response = await axios.get(`${TASKADE_API_URL}/agents`, {
      headers: {
        'x-api-key': req.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Internal server error'
    });
  }
});

// Create agent
app.post('/taskade-tower/agents', authenticateRequest, async (req, res) => {
  try {
    const response = await axios.post(`${TASKADE_API_URL}/agents`, req.body, {
      headers: { 'x-api-key': req.apiKey }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Internal server error'
    });
  }
});

// Get specific agent
app.get('/taskade-tower/agents/:agentId', authenticateRequest, async (req, res) => {
  try {
    const { agentId } = req.params;
    const response = await axios.get(`${TASKADE_API_URL}/agents/${agentId}`, {
      headers: {
        'x-api-key': req.apiKey,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Internal server error'
    });
  }
});

// Update agent
app.put('/taskade-tower/agents/:agentId', authenticateRequest, async (req, res) => {
  try {
    const { agentId } = req.params;
    const response = await axios.put(`${TASKADE_API_URL}/agents/${agentId}`, req.body, {
      headers: {
        'x-api-key': req.apiKey,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Internal server error'
    });
  }
});

// Delete agent
app.delete('/taskade-tower/agents/:agentId', authenticateRequest, async (req, res) => {
  try {
    const { agentId } = req.params;
    const response = await axios.delete(`${TASKADE_API_URL}/agents/${agentId}`, {
      headers: {
        'x-api-key': req.apiKey,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Internal server error'
    });
  }
});

// Execute agent
app.post('/taskade-tower/agents/:agentId/execute', authenticateRequest, async (req, res) => {
  try {
    const { agentId } = req.params;
    const response = await axios.post(
      `${TASKADE_API_URL}/agents/${agentId}/execute`,
      req.body,
      { 
        headers: { 
          'x-api-key': req.apiKey,
          'Content-Type': 'application/json'
        } 
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/taskade-tower/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Taskade Agent Integration API is running',
    apiKeyConfigured: !!process.env.TASKADE_API_KEY
  });
});

// Serve Google Docs test interface
app.get('/google-docs-test', (req, res) => {
  res.sendFile(__dirname + '/google-docs-test.html');
});

// Serve Gemini AI test interface
app.get('/gemini-test', (req, res) => {
  res.sendFile(__dirname + '/gemini-test.html');
});

// Serve the main test interface
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/test-client.html');
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Taskade, Google Docs & Gemini AI Integration API',
    endpoints: {
      taskade: '/taskade-tower/health',
      googleDocs: '/google-docs-test',
      gemini: '/gemini-test',
      test: '/test'
    },
    services: {
      geminiAvailable: !!geminiService,
      googleDocsAvailable: !!googleDocsService,
      taskadeKeyConfigured: !!process.env.TASKADE_API_KEY
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key configured: ${!!process.env.TASKADE_API_KEY}`);
});