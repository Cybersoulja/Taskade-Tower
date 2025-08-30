
const { Gitlab } = require('@gitbeaker/node');

class GitlabService {
  constructor() {
    if (!process.env.GITLAB_API_KEY) {
      throw new Error('GITLAB_API_KEY environment variable is not set');
    }
    
    this.api = new Gitlab({
      token: process.env.GITLAB_API_KEY,
      host: process.env.GITLAB_HOST || 'https://gitlab.com'
    });
  }

  // Get current user info
  async getCurrentUser() {
    try {
      const user = await this.api.Users.current();
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  // Get all projects
  async getProjects(options = {}) {
    try {
      const projects = await this.api.Projects.all({
        owned: true,
        membership: true,
        ...options
      });
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get specific project
  async getProject(projectId) {
    try {
      const project = await this.api.Projects.show(projectId);
      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create a new project
  async createProject(projectData) {
    try {
      const project = await this.api.Projects.create(projectData);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Get project branches
  async getBranches(projectId) {
    try {
      const branches = await this.api.Branches.all(projectId);
      return branches;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  }

  // Create a new branch
  async createBranch(projectId, branchName, ref = 'main') {
    try {
      const branch = await this.api.Branches.create(projectId, branchName, ref);
      return branch;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  }

  // Get commits for a project
  async getCommits(projectId, options = {}) {
    try {
      const commits = await this.api.Commits.all(projectId, options);
      return commits;
    } catch (error) {
      console.error('Error fetching commits:', error);
      throw error;
    }
  }

  // Get specific commit
  async getCommit(projectId, commitSha) {
    try {
      const commit = await this.api.Commits.show(projectId, commitSha);
      return commit;
    } catch (error) {
      console.error('Error fetching commit:', error);
      throw error;
    }
  }

  // Get issues for a project
  async getIssues(projectId, options = {}) {
    try {
      const issues = await this.api.Issues.all({ projectId, ...options });
      return issues;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  }

  // Create a new issue
  async createIssue(projectId, issueData) {
    try {
      const issue = await this.api.Issues.create(projectId, issueData);
      return issue;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  // Update an issue
  async updateIssue(projectId, issueIid, updateData) {
    try {
      const issue = await this.api.Issues.edit(projectId, issueIid, updateData);
      return issue;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }

  // Get merge requests for a project
  async getMergeRequests(projectId, options = {}) {
    try {
      const mergeRequests = await this.api.MergeRequests.all({ projectId, ...options });
      return mergeRequests;
    } catch (error) {
      console.error('Error fetching merge requests:', error);
      throw error;
    }
  }

  // Create a merge request
  async createMergeRequest(projectId, mergeRequestData) {
    try {
      const mergeRequest = await this.api.MergeRequests.create(projectId, mergeRequestData);
      return mergeRequest;
    } catch (error) {
      console.error('Error creating merge request:', error);
      throw error;
    }
  }

  // Get pipelines for a project
  async getPipelines(projectId, options = {}) {
    try {
      const pipelines = await this.api.Pipelines.all(projectId, options);
      return pipelines;
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw error;
    }
  }

  // Create a pipeline
  async createPipeline(projectId, ref, variables = {}) {
    try {
      const pipeline = await this.api.Pipelines.create(projectId, ref, variables);
      return pipeline;
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw error;
    }
  }

  // Get project members
  async getProjectMembers(projectId) {
    try {
      const members = await this.api.ProjectMembers.all(projectId);
      return members;
    } catch (error) {
      console.error('Error fetching project members:', error);
      throw error;
    }
  }

  // Add project member
  async addProjectMember(projectId, userId, accessLevel) {
    try {
      const member = await this.api.ProjectMembers.add(projectId, userId, accessLevel);
      return member;
    } catch (error) {
      console.error('Error adding project member:', error);
      throw error;
    }
  }

  // Get repository files
  async getRepositoryFiles(projectId, path = '', ref = 'main') {
    try {
      const files = await this.api.RepositoryFiles.showRaw(projectId, path, ref);
      return files;
    } catch (error) {
      console.error('Error fetching repository files:', error);
      throw error;
    }
  }

  // Create or update a file
  async createOrUpdateFile(projectId, filePath, content, commitMessage, branch = 'main') {
    try {
      const fileData = {
        file_path: filePath,
        branch,
        content,
        commit_message: commitMessage
      };

      // Try to get the file first to see if it exists
      try {
        await this.api.RepositoryFiles.show(projectId, filePath, branch);
        // File exists, update it
        const result = await this.api.RepositoryFiles.edit(projectId, filePath, fileData);
        return result;
      } catch (error) {
        // File doesn't exist, create it
        const result = await this.api.RepositoryFiles.create(projectId, filePath, fileData);
        return result;
      }
    } catch (error) {
      console.error('Error creating/updating file:', error);
      throw error;
    }
  }

  // Delete a file
  async deleteFile(projectId, filePath, commitMessage, branch = 'main') {
    try {
      const result = await this.api.RepositoryFiles.remove(projectId, filePath, {
        branch,
        commit_message: commitMessage
      });
      return result;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Get project statistics
  async getProjectStatistics(projectId) {
    try {
      const stats = await this.api.ProjectStatistics.show(projectId);
      return stats;
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      throw error;
    }
  }
}

module.exports = GitlabService;
