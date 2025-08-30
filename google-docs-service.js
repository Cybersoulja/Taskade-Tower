
const { google } = require('googleapis');

class GoogleDocsService {
  constructor() {
    // Initialize with service account credentials from environment
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
    };

    this.auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive'
      ]
    });
    
    this.docs = google.docs({ version: 'v1', auth: this.auth });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  // Create a new document and make it publicly readable
  async createDocument(title) {
    try {
      const response = await this.docs.documents.create({
        requestBody: {
          title: title
        }
      });

      // Make the document publicly readable
      await this.drive.permissions.create({
        fileId: response.data.documentId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Insert text at the beginning of the document
  async insertText(documentId, text) {
    try {
      const requests = [{
        insertText: {
          location: {
            index: 1
          },
          text: text
        }
      }];

      const response = await this.updateDocument(documentId, requests);
      return response;
    } catch (error) {
      console.error('Error inserting text:', error);
      throw error;
    }
  }

  // Append text to the end of the document
  async appendText(documentId, text) {
    try {
      // First get the document to find the end index
      const doc = await this.getDocument(documentId);
      const endIndex = doc.body.content[doc.body.content.length - 1].endIndex - 1;

      const requests = [{
        insertText: {
          location: {
            index: endIndex
          },
          text: text
        }
      }];

      const response = await this.updateDocument(documentId, requests);
      return response;
    } catch (error) {
      console.error('Error appending text:', error);
      throw error;
    }
  }

  // Replace all occurrences of a text string
  async replaceText(documentId, searchText, replaceText) {
    try {
      const requests = [{
        replaceAllText: {
          containsText: {
            text: searchText,
            matchCase: false
          },
          replaceText: replaceText
        }
      }];

      const response = await this.updateDocument(documentId, requests);
      return response;
    } catch (error) {
      console.error('Error replacing text:', error);
      throw error;
    }
  }

  // Extract plain text content from document
  extractTextContent(doc) {
    let text = '';
    
    function extractFromContent(content) {
      content.forEach(element => {
        if (element.paragraph) {
          element.paragraph.elements.forEach(elem => {
            if (elem.textRun) {
              text += elem.textRun.content;
            }
          });
        } else if (element.table) {
          element.table.tableRows.forEach(row => {
            row.tableCells.forEach(cell => {
              extractFromContent(cell.content);
            });
          });
        }
      });
    }

    if (doc.body && doc.body.content) {
      extractFromContent(doc.body.content);
    }

    return text;
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
