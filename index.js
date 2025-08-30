const express = require('express');
const cors = require('cors');
const axios = require('axios');
const GoogleDocsService = require('./google-docs-service');
const GeminiService = require('./gemini-service');
const CloudflareService = require('./cloudflare-service');
const HuggingFaceService = require('./huggingface-service');
const GitlabService = require('./gitlab-service');
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

// Initialize Cloudflare service
let cloudflareService;
try {
  cloudflareService = new CloudflareService();
} catch (error) {
  console.warn('Cloudflare service not initialized:', error.message);
}

// Initialize Hugging Face service
let huggingFaceService;
try {
  huggingFaceService = new HuggingFaceService();
} catch (error) {
  console.warn('Hugging Face service not initialized:', error.message);
}

// Initialize GitLab service
let gitlabService;
try {
  gitlabService = new GitlabService();
} catch (error) {
  console.warn('GitLab service not initialized:', error.message);
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

// Hugging Face API endpoints

// Text Generation
app.post('/huggingface/text-generation', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { prompt, model, parameters } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await huggingFaceService.generateText(prompt, model, parameters);
    res.json({
      success: true,
      generated_text: result,
      model: model || 'gpt2'
    });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Text Classification
app.post('/huggingface/text-classification', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { text, model } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await huggingFaceService.classifyText(text, model);
    res.json({
      success: true,
      classification: result,
      model: model || 'cardiffnlp/twitter-roberta-base-sentiment-latest'
    });
  } catch (error) {
    console.error('Error classifying text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Question Answering
app.post('/huggingface/question-answering', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { question, context, model } = req.body;
    if (!question || !context) {
      return res.status(400).json({ error: 'Both question and context are required' });
    }

    const result = await huggingFaceService.answerQuestion(question, context, model);
    res.json({
      success: true,
      answer: result,
      model: model || 'deepset/roberta-base-squad2'
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message });
  }
});

// Text Summarization
app.post('/huggingface/summarization', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { text, model, parameters } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await huggingFaceService.summarizeText(text, model, parameters);
    res.json({
      success: true,
      summary: result,
      model: model || 'facebook/bart-large-cnn'
    });
  } catch (error) {
    console.error('Error summarizing text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Named Entity Recognition
app.post('/huggingface/entity-recognition', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { text, model } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await huggingFaceService.extractEntities(text, model);
    res.json({
      success: true,
      entities: result,
      model: model || 'dbmdz/bert-large-cased-finetuned-conll03-english'
    });
  } catch (error) {
    console.error('Error extracting entities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Translation
app.post('/huggingface/translation', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { text, model } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await huggingFaceService.translateText(text, model);
    res.json({
      success: true,
      translation: result,
      model: model || 'Helsinki-NLP/opus-mt-en-fr'
    });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: error.message });
  }
});

// Feature Extraction (Embeddings)
app.post('/huggingface/embeddings', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { text, model } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await huggingFaceService.getEmbeddings(text, model);
    res.json({
      success: true,
      embeddings: result,
      model: model || 'sentence-transformers/all-MiniLM-L6-v2'
    });
  } catch (error) {
    console.error('Error getting embeddings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fill Mask
app.post('/huggingface/fill-mask', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { text, model } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text with [MASK] token is required' });
    }

    const result = await huggingFaceService.fillMask(text, model);
    res.json({
      success: true,
      predictions: result,
      model: model || 'bert-base-uncased'
    });
  } catch (error) {
    console.error('Error filling mask:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image Classification
app.post('/huggingface/image-classification', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { imageUrl, model } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const result = await huggingFaceService.classifyImage(imageUrl, model);
    res.json({
      success: true,
      classification: result,
      model: model || 'google/vit-base-patch16-224'
    });
  } catch (error) {
    console.error('Error classifying image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Object Detection
app.post('/huggingface/object-detection', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { imageUrl, model } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const result = await huggingFaceService.detectObjects(imageUrl, model);
    res.json({
      success: true,
      detections: result,
      model: model || 'facebook/detr-resnet-50'
    });
  } catch (error) {
    console.error('Error detecting objects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Text-to-Image
app.post('/huggingface/text-to-image', async (req, res) => {
  try {
    if (!huggingFaceService) {
      return res.status(503).json({ error: 'Hugging Face service is not available. Please check your HUGGINGFACE_API_KEY.' });
    }

    const { prompt, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await huggingFaceService.generateImage(prompt, model);
    res.json({
      success: true,
      image: result,
      model: model || 'runwayml/stable-diffusion-v1-5'
    });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message });
  }
});

// GitLab API endpoints

// Get current user
app.get('/gitlab/user', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const user = await gitlabService.getCurrentUser();
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all projects
app.get('/gitlab/projects', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { owned, membership, search, visibility } = req.query;
    const options = {};
    if (owned !== undefined) options.owned = owned === 'true';
    if (membership !== undefined) options.membership = membership === 'true';
    if (search) options.search = search;
    if (visibility) options.visibility = visibility;

    const projects = await gitlabService.getProjects(options);
    res.json({
      success: true,
      projects: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific project
app.get('/gitlab/projects/:projectId', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const project = await gitlabService.getProject(projectId);
    res.json({
      success: true,
      project: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new project
app.post('/gitlab/projects', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const projectData = req.body;
    if (!projectData.name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await gitlabService.createProject(projectData);
    res.json({
      success: true,
      project: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project branches
app.get('/gitlab/projects/:projectId/branches', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const branches = await gitlabService.getBranches(projectId);
    res.json({
      success: true,
      branches: branches
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new branch
app.post('/gitlab/projects/:projectId/branches', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { branch_name, ref = 'main' } = req.body;
    
    if (!branch_name) {
      return res.status(400).json({ error: 'Branch name is required' });
    }

    const branch = await gitlabService.createBranch(projectId, branch_name, ref);
    res.json({
      success: true,
      branch: branch
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project commits
app.get('/gitlab/projects/:projectId/commits', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { ref_name, since, until, path } = req.query;
    const options = {};
    if (ref_name) options.ref_name = ref_name;
    if (since) options.since = since;
    if (until) options.until = until;
    if (path) options.path = path;

    const commits = await gitlabService.getCommits(projectId, options);
    res.json({
      success: true,
      commits: commits
    });
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific commit
app.get('/gitlab/projects/:projectId/commits/:commitSha', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId, commitSha } = req.params;
    const commit = await gitlabService.getCommit(projectId, commitSha);
    res.json({
      success: true,
      commit: commit
    });
  } catch (error) {
    console.error('Error fetching commit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project issues
app.get('/gitlab/projects/:projectId/issues', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { state, labels, milestone, assignee_id } = req.query;
    const options = {};
    if (state) options.state = state;
    if (labels) options.labels = labels;
    if (milestone) options.milestone = milestone;
    if (assignee_id) options.assignee_id = assignee_id;

    const issues = await gitlabService.getIssues(projectId, options);
    res.json({
      success: true,
      issues: issues
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new issue
app.post('/gitlab/projects/:projectId/issues', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const issueData = req.body;
    
    if (!issueData.title) {
      return res.status(400).json({ error: 'Issue title is required' });
    }

    const issue = await gitlabService.createIssue(projectId, issueData);
    res.json({
      success: true,
      issue: issue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an issue
app.put('/gitlab/projects/:projectId/issues/:issueIid', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId, issueIid } = req.params;
    const updateData = req.body;

    const issue = await gitlabService.updateIssue(projectId, issueIid, updateData);
    res.json({
      success: true,
      issue: issue
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get merge requests
app.get('/gitlab/projects/:projectId/merge_requests', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { state, target_branch, source_branch } = req.query;
    const options = {};
    if (state) options.state = state;
    if (target_branch) options.target_branch = target_branch;
    if (source_branch) options.source_branch = source_branch;

    const mergeRequests = await gitlabService.getMergeRequests(projectId, options);
    res.json({
      success: true,
      merge_requests: mergeRequests
    });
  } catch (error) {
    console.error('Error fetching merge requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a merge request
app.post('/gitlab/projects/:projectId/merge_requests', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const mergeRequestData = req.body;
    
    if (!mergeRequestData.title || !mergeRequestData.source_branch || !mergeRequestData.target_branch) {
      return res.status(400).json({ error: 'Title, source_branch, and target_branch are required' });
    }

    const mergeRequest = await gitlabService.createMergeRequest(projectId, mergeRequestData);
    res.json({
      success: true,
      merge_request: mergeRequest
    });
  } catch (error) {
    console.error('Error creating merge request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pipelines
app.get('/gitlab/projects/:projectId/pipelines', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { status, ref, sha } = req.query;
    const options = {};
    if (status) options.status = status;
    if (ref) options.ref = ref;
    if (sha) options.sha = sha;

    const pipelines = await gitlabService.getPipelines(projectId, options);
    res.json({
      success: true,
      pipelines: pipelines
    });
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a pipeline
app.post('/gitlab/projects/:projectId/pipelines', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { ref, variables = {} } = req.body;
    
    if (!ref) {
      return res.status(400).json({ error: 'Branch/tag reference is required' });
    }

    const pipeline = await gitlabService.createPipeline(projectId, ref, variables);
    res.json({
      success: true,
      pipeline: pipeline
    });
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project members
app.get('/gitlab/projects/:projectId/members', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const members = await gitlabService.getProjectMembers(projectId);
    res.json({
      success: true,
      members: members
    });
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add project member
app.post('/gitlab/projects/:projectId/members', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { user_id, access_level } = req.body;
    
    if (!user_id || !access_level) {
      return res.status(400).json({ error: 'User ID and access level are required' });
    }

    const member = await gitlabService.addProjectMember(projectId, user_id, access_level);
    res.json({
      success: true,
      member: member
    });
  } catch (error) {
    console.error('Error adding project member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get repository files
app.get('/gitlab/projects/:projectId/repository/files', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { file_path = '', ref = 'main' } = req.query;

    const files = await gitlabService.getRepositoryFiles(projectId, file_path, ref);
    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Error fetching repository files:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update a file
app.post('/gitlab/projects/:projectId/repository/files', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { file_path, content, commit_message, branch = 'main' } = req.body;
    
    if (!file_path || !content || !commit_message) {
      return res.status(400).json({ error: 'File path, content, and commit message are required' });
    }

    const result = await gitlabService.createOrUpdateFile(projectId, file_path, content, commit_message, branch);
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error creating/updating file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
app.delete('/gitlab/projects/:projectId/repository/files', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const { file_path, commit_message, branch = 'main' } = req.body;
    
    if (!file_path || !commit_message) {
      return res.status(400).json({ error: 'File path and commit message are required' });
    }

    const result = await gitlabService.deleteFile(projectId, file_path, commit_message, branch);
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project statistics
app.get('/gitlab/projects/:projectId/statistics', async (req, res) => {
  try {
    if (!gitlabService) {
      return res.status(503).json({ error: 'GitLab service is not available. Please check your GITLAB_API_KEY.' });
    }

    const { projectId } = req.params;
    const stats = await gitlabService.getProjectStatistics(projectId);
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cloudflare API endpoints

// Get all zones (domains)
app.get('/cloudflare/zones', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const zones = await cloudflareService.getZones();
    res.json({
      success: true,
      zones: zones
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific zone details
app.get('/cloudflare/zones/:zoneId', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const zone = await cloudflareService.getZone(zoneId);
    res.json({
      success: true,
      zone: zone
    });
  } catch (error) {
    console.error('Error fetching zone:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get DNS records for a zone
app.get('/cloudflare/zones/:zoneId/dns', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const { type, name } = req.query;
    const records = await cloudflareService.getDNSRecords(zoneId, type, name);
    res.json({
      success: true,
      records: records
    });
  } catch (error) {
    console.error('Error fetching DNS records:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a DNS record
app.post('/cloudflare/zones/:zoneId/dns', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const recordData = req.body;
    
    if (!recordData.type || !recordData.name || !recordData.content) {
      return res.status(400).json({ error: 'DNS record requires type, name, and content fields' });
    }

    const record = await cloudflareService.createDNSRecord(zoneId, recordData);
    res.json({
      success: true,
      record: record
    });
  } catch (error) {
    console.error('Error creating DNS record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a DNS record
app.put('/cloudflare/zones/:zoneId/dns/:recordId', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId, recordId } = req.params;
    const recordData = req.body;
    
    const record = await cloudflareService.updateDNSRecord(zoneId, recordId, recordData);
    res.json({
      success: true,
      record: record
    });
  } catch (error) {
    console.error('Error updating DNS record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a DNS record
app.delete('/cloudflare/zones/:zoneId/dns/:recordId', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId, recordId } = req.params;
    const result = await cloudflareService.deleteDNSRecord(zoneId, recordId);
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error deleting DNS record:', error);
    res.status(500).json({ error: error.message });
  }
});

// Purge cache
app.post('/cloudflare/zones/:zoneId/purge-cache', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const { files } = req.body;
    
    const result = await cloudflareService.purgeCache(zoneId, files);
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error purging cache:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get zone analytics
app.get('/cloudflare/zones/:zoneId/analytics', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const { since, until } = req.query;
    
    const analytics = await cloudflareService.getAnalytics(zoneId, since, until);
    res.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get security settings
app.get('/cloudflare/zones/:zoneId/security', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const settings = await cloudflareService.getSecuritySettings(zoneId);
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update security level
app.put('/cloudflare/zones/:zoneId/security-level', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const { level } = req.body;
    
    if (!level || !['off', 'essentially_off', 'low', 'medium', 'high', 'under_attack'].includes(level)) {
      return res.status(400).json({ error: 'Invalid security level. Must be one of: off, essentially_off, low, medium, high, under_attack' });
    }

    const result = await cloudflareService.updateSecurityLevel(zoneId, level);
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error updating security level:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get SSL settings
app.get('/cloudflare/zones/:zoneId/ssl', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const ssl = await cloudflareService.getSSLSettings(zoneId);
    res.json({
      success: true,
      ssl: ssl
    });
  } catch (error) {
    console.error('Error fetching SSL settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update SSL mode
app.put('/cloudflare/zones/:zoneId/ssl', async (req, res) => {
  try {
    if (!cloudflareService) {
      return res.status(503).json({ error: 'Cloudflare service is not available. Please check your CLOUDFLARE_API_KEY.' });
    }

    const { zoneId } = req.params;
    const { mode } = req.body;
    
    if (!mode || !['off', 'flexible', 'full', 'strict'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid SSL mode. Must be one of: off, flexible, full, strict' });
    }

    const result = await cloudflareService.updateSSLMode(zoneId, mode);
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error updating SSL mode:', error);
    res.status(500).json({ error: error.message });
  }
});

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

// Serve Cloudflare test interface
app.get('/cloudflare-test', (req, res) => {
  res.sendFile(__dirname + '/cloudflare-test.html');
});

// Serve Hugging Face test interface
app.get('/huggingface-test', (req, res) => {
  res.sendFile(__dirname + '/huggingface-test.html');
});

// Serve GitLab test interface
app.get('/gitlab-test', (req, res) => {
  res.sendFile(__dirname + '/gitlab-test.html');
});

// Serve the main test interface
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/test-client.html');
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Taskade, Google Docs, Gemini AI, Cloudflare, Hugging Face & GitLab Integration API',
    endpoints: {
      taskade: '/taskade-tower/health',
      googleDocs: '/google-docs-test',
      gemini: '/gemini-test',
      cloudflare: '/cloudflare-test',
      huggingface: '/huggingface-test',
      gitlab: '/gitlab-test',
      test: '/test'
    },
    services: {
      geminiAvailable: !!geminiService,
      googleDocsAvailable: !!googleDocsService,
      cloudflareAvailable: !!cloudflareService,
      huggingFaceAvailable: !!huggingFaceService,
      gitlabAvailable: !!gitlabService,
      taskadeKeyConfigured: !!process.env.TASKADE_API_KEY
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key configured: ${!!process.env.TASKADE_API_KEY}`);
});