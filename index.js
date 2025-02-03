
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base URL for Taskade API
const TASKADE_API_URL = 'https://www.taskade.com/api/v1';

// Middleware to check for API key
const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers['x_api_key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }
  req.apiKey = apiKey;
  next();
};

// Get agents list
app.get('/agents', authenticateRequest, async (req, res) => {
  try {
    const response = await axios.get(`${TASKADE_API_URL}/agents`, {
      headers: { 'Authorization': `Bearer ${req.apiKey}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error'
    });
  }
});

// Create agent
app.post('/agents', authenticateRequest, async (req, res) => {
  try {
    const response = await axios.post(`${TASKADE_API_URL}/agents`, req.body, {
      headers: { 'Authorization': `Bearer ${req.apiKey}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error'
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
      { headers: { 'Authorization': `Bearer ${req.apiKey}` } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal server error'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
