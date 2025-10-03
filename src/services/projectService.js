import apiService from './api.js';

class ProjectService {
  // ===== CORE PROJECT OPERATIONS =====
  
  // Get all projects - matches ProjectController endpoint
  async getProjects(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Match ProjectController parameters exactly
      if (filters.page !== undefined) queryParams.append('page', filters.page);
      if (filters.size !== undefined) queryParams.append('size', filters.size);
      if (filters.sortBy !== undefined) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortDir !== undefined) queryParams.append('sortDir', filters.sortDir);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/projects?${queryString}` : '/projects';
      
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw new Error(error.message || 'Failed to get projects');
    }
  }

  // Get user's owned projects - matches ProjectController endpoint
  async getMyProjects(page = 0, size = 20) {
    try {
      const params = { page, size };
      const response = await apiService.get('/projects/my-projects', params);
      console.log('Backend response:', response);
      return response;
    } catch (error) {
      console.error('Failed to get my projects:', error);
      throw new Error(error.message || 'Failed to get my projects');
    }
  }

  // Get joined projects - matches ProjectController endpoint
  async getJoinedProjects(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await apiService.get('/projects/joined', params);
    } catch (error) {
      console.error('Failed to get joined projects:', error);
      throw new Error(error.message || 'Failed to get joined projects');
    }
  }

  // Get available projects - matches ProjectController endpoint
  async getAvailableProjects(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await apiService.get('/projects/available', params);
    } catch (error) {
      console.error('Failed to get available projects:', error);
      throw new Error(error.message || 'Failed to get available projects');
    }
  }

  // Get project by ID - matches ProjectController endpoint
  async getProject(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
       // Return only the response body
    const response = await apiService.get(`/projects/${projectId}`);
    return response.data;
    } catch (error) {
      console.error(`Failed to get project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to get project');
    }
  }

  // Create new project - matches ProjectController endpoint
  async createProject(projectData) {
    try {
      if (!projectData.title || !projectData.description) {
        throw new Error('Project title and description are required');
      }
      
      console.log('Creating project with data:', projectData);
      const response = await apiService.post('/projects', projectData);
      console.log('Project created successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw new Error(error.message || 'Failed to create project');
    }
  }

  // Update project - matches ProjectController endpoint
  async updateProject(projectId, updateData) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      return await apiService.put(`/projects/${projectId}`, updateData);
    } catch (error) {
      console.error(`Failed to update project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to update project');
    }
  }

  // Delete project - matches ProjectController endpoint
  async deleteProject(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      return await apiService.delete(`/projects/${projectId}`);
    } catch (error) {
      console.error(`Failed to delete project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to delete project');
    }
  }

  // ===== TASK MANAGEMENT =====

  // Get tasks for a project - matches ProjectController endpoint
  async getProjectTasks(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      return await apiService.get(`/projects/${projectId}/tasks`);
    } catch (error) {
      console.error(`Failed to get tasks for project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to get project tasks');
    }
  }

  // Create task - matches ProjectController endpoint
  async createTask(projectId, taskData) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!taskData.title) {
        throw new Error('Task title is required');
      }
      
      return await apiService.post(`/projects/${projectId}/tasks`, taskData);
    } catch (error) {
      console.error(`Failed to create task for project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to create task');
    }
  }

  // Update task - matches ProjectController endpoint
  async updateTask(projectId, taskId, updateData) {
    try {
      if (!projectId || !taskId) {
        throw new Error('Project ID and Task ID are required');
      }
      
      return await apiService.put(`/projects/${projectId}/tasks/${taskId}`, updateData);
    } catch (error) {
      console.error(`Failed to update task ${taskId}:`, error);
      throw new Error(error.message || 'Failed to update task');
    }
  }

  // Toggle task completion - matches ProjectController endpoint
  async toggleTaskCompletion(projectId, taskId, completed = true) {
    try {
      if (!projectId || !taskId) {
        throw new Error('Project ID and Task ID are required');
      }
      
      // Use correct endpoint and request format from ProjectController
      return await apiService.put(`/projects/${projectId}/tasks/${taskId}/complete`, {
        completed: completed
      });
    } catch (error) {
      console.error(`Failed to toggle task ${taskId}:`, error);
      throw new Error(error.message || 'Failed to toggle task');
    }
  }

  // Delete task - matches ProjectController endpoint
  async deleteTask(projectId, taskId) {
    try {
      if (!projectId || !taskId) {
        throw new Error('Project ID and Task ID are required');
      }
      
      return await apiService.delete(`/projects/${projectId}/tasks/${taskId}`);
    } catch (error) {
      console.error(`Failed to delete task ${taskId}:`, error);
      throw new Error(error.message || 'Failed to delete task');
    }
  }

  // ===== MEMBER MANAGEMENT =====

  // Get project members - matches ProjectController endpoint
  async getProjectMembers(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      return await apiService.get(`/projects/${projectId}/members`);
    } catch (error) {
      console.error(`Failed to get project members:`, error);
      throw new Error(error.message || 'Failed to get project members');
    }
  }

  // Add member to project - matches ProjectController endpoint
  async addMember(projectId, memberData) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!memberData.userId) {
        throw new Error('User ID is required');
      }
      
      return await apiService.post(`/projects/${projectId}/members`, memberData);
    } catch (error) {
      console.error(`Failed to add member to project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to add member');
    }
  }

  // Update member role - matches ProjectController endpoint
  async updateMemberRole(projectId, memberId, role) {
    try {
      if (!projectId || !memberId) {
        throw new Error('Project ID and Member ID are required');
      }
      if (!role) {
        throw new Error('Role is required');
      }
      
      return await apiService.put(`/projects/${projectId}/members/${memberId}`, { role });
    } catch (error) {
      console.error(`Failed to update member role:`, error);
      throw new Error(error.message || 'Failed to update member role');
    }
  }

  // Remove member from project - matches ProjectController endpoint
  async removeMember(projectId, memberId) {
    try {
      if (!projectId || !memberId) {
        throw new Error('Project ID and Member ID are required');
      }
      
      return await apiService.delete(`/projects/${projectId}/members/${memberId}`);
    } catch (error) {
      console.error(`Failed to remove member:`, error);
      throw new Error(error.message || 'Failed to remove member');
    }
  }

  // Leave project - matches ProjectController endpoint (POST not DELETE)
  async leaveProject(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      return await apiService.post(`/projects/${projectId}/leave`);
    } catch (error) {
      console.error(`Failed to leave project ${projectId}:`, error);
      throw new Error(error.message || 'Failed to leave project');
    }
  }

  // ===== INVITATION MANAGEMENT =====

  // Send project invitation - matches ProjectController endpoint
  async sendInvitation(projectId, invitationData) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!invitationData.invitedUserId) {
        throw new Error('Invited User ID is required for invitation');
      }
      
      return await apiService.post(`/projects/${projectId}/invitations`, invitationData);
    } catch (error) {
      console.error(`Failed to send invitation:`, error);
      throw new Error(error.message || 'Failed to send invitation');
    }
  }

  // Get project invitations - matches ProjectController endpoint
  async getProjectInvitations(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      return await apiService.get(`/projects/${projectId}/invitations`);
    } catch (error) {
      console.error(`Failed to get invitations:`, error);
      throw new Error(error.message || 'Failed to get invitations');
    }
  }

  // Get received invitations - matches ProjectController endpoint
  async getReceivedInvitations() {
    try {
      return await apiService.get('/projects/invitations/received');
    } catch (error) {
      console.error('Failed to get received invitations:', error);
      throw new Error(error.message || 'Failed to get received invitations');
    }
  }

  // Accept invitation - matches ProjectController endpoint
  async acceptInvitation(invitationId) {
    try {
      if (!invitationId) {
        throw new Error('Invitation ID is required');
      }
      
      return await apiService.post(`/projects/invitations/${invitationId}/accept`);
    } catch (error) {
      console.error(`Failed to accept invitation:`, error);
      throw new Error(error.message || 'Failed to accept invitation');
    }
  }

  // Reject invitation - matches ProjectController endpoint
  async rejectInvitation(invitationId) {
    try {
      if (!invitationId) {
        throw new Error('Invitation ID is required');
      }
      
      return await apiService.post(`/projects/invitations/${invitationId}/reject`);
    } catch (error) {
      console.error(`Failed to reject invitation:`, error);
      throw new Error(error.message || 'Failed to reject invitation');
    }
  }

  // ===== PROJECT DISCOVERY =====

  // Search projects - matches ProjectController endpoint
  async searchProjects(searchParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Match ProjectController search parameters exactly
      if (searchParams.query) queryParams.append('query', searchParams.query);
      if (searchParams.category) queryParams.append('category', searchParams.category);
      if (searchParams.status) queryParams.append('status', searchParams.status);
      if (searchParams.skills && Array.isArray(searchParams.skills)) {
        searchParams.skills.forEach(skill => queryParams.append('skills', skill));
      }
      if (searchParams.availableOnly !== undefined) queryParams.append('availableOnly', searchParams.availableOnly);
      if (searchParams.page !== undefined) queryParams.append('page', searchParams.page);
      if (searchParams.size !== undefined) queryParams.append('size', searchParams.size);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/projects/search?${queryString}` : '/projects/search';
      
      return await apiService.get(endpoint);
    } catch (error) {
      console.error('Failed to search projects:', error);
      throw new Error(error.message || 'Failed to search projects');
    }
  }

  // Discover projects - matches ProjectController endpoint
  async discoverProjects(page = 0, size = 20) {
    try {
      const params = { page, size };
      return await apiService.get('/projects/discover', params);
    } catch (error) {
      console.error('Failed to discover projects:', error);
      throw new Error(error.message || 'Failed to discover projects');
    }
  }

  // ===== UTILITY METHODS =====

  // Get all user projects (owned + joined)
  async getAllUserProjects(page = 0, size = 50) {
    try {
      console.log('ProjectService: Getting all user projects...');
      
      const [ownedResponse, joinedResponse] = await Promise.all([
        this.getMyProjects(page, size),
        this.getJoinedProjects(page, size)
      ]);

      const ownedProjects = ownedResponse?.data?.content || [];
      const joinedProjects = joinedResponse?.data?.content || [];
      
      // Combine and remove duplicates based on project ID
      const allProjects = [...ownedProjects];
      joinedProjects.forEach(project => {
        if (!allProjects.find(p => p.id === project.id)) {
          allProjects.push(project);
        }
      });

      return {
        success: true,
        data: {
          content: allProjects,
          totalElements: allProjects.length,
          totalPages: Math.ceil(allProjects.length / size),
          size: size,
          number: page
        },
        message: 'All user projects retrieved successfully'
      };
    } catch (error) {
      console.error('ProjectService: Error getting all user projects:', error);
      throw new Error(error.message || 'Failed to get all user projects');
    }
  }

  // Get project summary with basic statistics
  async getProjectSummary(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('ProjectService: Getting project summary for:', projectId);
      
      const [project, tasks, members] = await Promise.all([
        this.getProject(projectId),
        this.getProjectTasks(projectId),
        this.getProjectMembers(projectId)
      ]);

      const projectData = project?.data || project;
      const tasksList = tasks?.data || tasks || [];
      const membersList = members?.data || members || [];

      const summary = {
        project: projectData,
        statistics: {
          totalTasks: tasksList.length,
          completedTasks: tasksList.filter(task => task.completed).length,
          pendingTasks: tasksList.filter(task => !task.completed).length,
          totalMembers: membersList.length,
          completionRate: tasksList.length > 0 
            ? Math.round((tasksList.filter(task => task.completed).length / tasksList.length) * 100) 
            : 0
        },
        recentActivity: {
          lastTaskUpdate: tasksList.length > 0 
            ? tasksList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] 
            : null,
          memberCount: membersList.length
        }
      };

      return {
        success: true,
        data: summary,
        message: 'Project summary retrieved successfully'
      };
    } catch (error) {
      console.error('ProjectService: Error getting project summary:', error);
      throw new Error(error.message || 'Failed to get project summary');
    }
  }

  // Bulk task operations
  async bulkUpdateTasks(projectId, taskUpdates) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!Array.isArray(taskUpdates) || taskUpdates.length === 0) {
        throw new Error('Task updates array is required');
      }

      console.log('ProjectService: Performing bulk task updates...');
      
      const results = [];
      for (const update of taskUpdates) {
        try {
          let result;
          switch (update.operation) {
            case 'update':
              result = await this.updateTask(projectId, update.taskId, update.data);
              break;
            case 'complete':
              result = await this.toggleTaskCompletion(projectId, update.taskId, true);
              break;
            case 'incomplete':
              result = await this.toggleTaskCompletion(projectId, update.taskId, false);
              break;
            case 'delete':
              result = await this.deleteTask(projectId, update.taskId);
              break;
            default:
              throw new Error(`Unknown operation: ${update.operation}`);
          }
          results.push({ 
            taskId: update.taskId, 
            operation: update.operation, 
            success: true, 
            result 
          });
        } catch (error) {
          results.push({ 
            taskId: update.taskId, 
            operation: update.operation, 
            success: false, 
            error: error.message 
          });
        }
      }

      return {
        success: true,
        data: results,
        message: `Bulk task operations completed. ${results.filter(r => r.success).length}/${results.length} successful.`
      };
    } catch (error) {
      console.error('ProjectService: Error in bulk task operations:', error);
      throw new Error(error.message || 'Failed to perform bulk task operations');
    }
  }
}

const projectService = new ProjectService();
export { projectService };
export default projectService;