const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Get agents list
app.get('/agents', authenticateRequest, async (req, res) => {
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
app.post('/agents', authenticateRequest, async (req, res) => {
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
app.get('/agents/:agentId', authenticateRequest, async (req, res) => {
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
app.put('/agents/:agentId', authenticateRequest, async (req, res) => {
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
app.delete('/agents/:agentId', authenticateRequest, async (req, res) => {
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
app.post('/agents/:agentId/execute', authenticateRequest, async (req, res) => {
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
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Taskade Agent Integration API is running',
    apiKeyConfigured: !!process.env.TASKADE_API_KEY
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key configured: ${!!process.env.TASKADE_API_KEY}`);
});