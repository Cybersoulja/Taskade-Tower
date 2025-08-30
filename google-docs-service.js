
const { google } = require('googleapis');

class GoogleDocsService {
  constructor() {
    // You'll need to set up authentication with a service account
    // or OAuth2 credentials
    this.auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/service-account-key.json', // Service account key
      scopes: ['https://www.googleapis.com/auth/documents']
    });
    
    this.docs = google.docs({ version: 'v1', auth: this.auth });
  }

  // Create a new document
  async createDocument(title) {
    try {
      const response = await this.docs.documents.create({
        requestBody: {
          title: title
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Read document content
  async getDocument(documentId) {
    try {
      const response = await this.docs.documents.get({
        documentId: documentId
      });
      return response.data;
    } catch (error) {
      console.error('Error reading document:', error);
      throw error;
    }
  }

  // Update document content
  async updateDocument(documentId, requests) {
    try {
      const response = await this.docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
          requests: requests
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
}

module.exports = GoogleDocsService;
