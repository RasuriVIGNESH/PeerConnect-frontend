import apiService from './api.js';

class ChatService {
  // Send message to project chat - matches ChatController endpoint
  async sendMessage(projectId, content) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!content || content.trim().length === 0) {
        throw new Error('Message content is required');
      }

      console.log('ChatService: Sending message to project:', projectId);
      const response = await apiService.post(`/chat/projects/${projectId}/messages`, {
        content: content.trim()
      });
      console.log('ChatService: Message sent successfully:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error sending message:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }

  // Get project messages with pagination - matches ChatController endpoint
  async getProjectMessages(projectId, page = 0, size = 50) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('ChatService: Getting messages for project:', projectId);
      const params = { page, size };
      const response = await apiService.get(`/chat/projects/${projectId}/messages`, params);
      console.log('ChatService: Messages retrieved:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error getting project messages:', error);
      throw new Error(error.message || 'Failed to get project messages');
    }
  }

  // Get recent messages (last 24 hours) - matches ChatController endpoint
  async getRecentMessages(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('ChatService: Getting recent messages for project:', projectId);
      const response = await apiService.get(`/chat/projects/${projectId}/messages/recent`);
      console.log('ChatService: Recent messages retrieved:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error getting recent messages:', error);
      throw new Error(error.message || 'Failed to get recent messages');
    }
  }

  // Search messages - matches ChatController endpoint
  async searchMessages(projectId, query, page = 0, size = 20) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }

      console.log('ChatService: Searching messages in project:', projectId, 'with query:', query);
      const params = { query: query.trim(), page, size };
      const response = await apiService.get(`/chat/projects/${projectId}/messages/search`, params);
      console.log('ChatService: Search results:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error searching messages:', error);
      throw new Error(error.message || 'Failed to search messages');
    }
  }

  // Get messages after specific time - matches ChatController endpoint
  async getMessagesAfter(projectId, afterTime) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!afterTime) {
        throw new Error('After time is required');
      }

      console.log('ChatService: Getting messages after:', afterTime);
      const params = { after: afterTime };
      const response = await apiService.get(`/chat/projects/${projectId}/messages/after`, params);
      console.log('ChatService: Messages after time retrieved:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error getting messages after time:', error);
      throw new Error(error.message || 'Failed to get messages after specified time');
    }
  }

  // Edit message - matches ChatController endpoint
  async editMessage(messageId, content) {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }
      if (!content || content.trim().length === 0) {
        throw new Error('Message content is required');
      }

      console.log('ChatService: Editing message:', messageId);
      const response = await apiService.put(`/chat/messages/${messageId}`, {
        content: content.trim()
      });
      console.log('ChatService: Message edited successfully:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error editing message:', error);
      throw new Error(error.message || 'Failed to edit message');
    }
  }

  // Delete message - matches ChatController endpoint
  async deleteMessage(messageId) {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }

      console.log('ChatService: Deleting message:', messageId);
      const response = await apiService.delete(`/chat/messages/${messageId}`);
      console.log('ChatService: Message deleted successfully:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error deleting message:', error);
      throw new Error(error.message || 'Failed to delete message');
    }
  }

  // Get latest message in project - matches ChatController endpoint
  async getLatestMessage(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('ChatService: Getting latest message for project:', projectId);
      const response = await apiService.get(`/chat/projects/${projectId}/messages/latest`);
      console.log('ChatService: Latest message retrieved:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error getting latest message:', error);
      throw new Error(error.message || 'Failed to get latest message');
    }
  }

  // Get message count for project - matches ChatController endpoint
  async getMessageCount(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('ChatService: Getting message count for project:', projectId);
      const response = await apiService.get(`/chat/projects/${projectId}/messages/count`);
      console.log('ChatService: Message count retrieved:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error getting message count:', error);
      throw new Error(error.message || 'Failed to get message count');
    }
  }

  // Get message by ID - matches ChatController endpoint
  async getMessageById(messageId) {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }

      console.log('ChatService: Getting message by ID:', messageId);
      const response = await apiService.get(`/chat/messages/${messageId}`);
      console.log('ChatService: Message retrieved:', response);
      return response;
    } catch (error) {
      console.error('ChatService: Error getting message by ID:', error);
      throw new Error(error.message || 'Failed to get message');
    }
  }

  // Real-time polling helper (since WebSocket isn't implemented)
  async pollForNewMessages(projectId, lastMessageTime, intervalMs = 5000) {
    try {
      console.log('ChatService: Starting message polling for project:', projectId);
      
      const pollMessages = async () => {
        try {
          const messages = await this.getMessagesAfter(projectId, lastMessageTime);
          return messages;
        } catch (error) {
          console.error('ChatService: Polling error:', error);
          return null;
        }
      };

      return setInterval(pollMessages, intervalMs);
    } catch (error) {
      console.error('ChatService: Error setting up polling:', error);
      throw new Error('Failed to set up message polling');
    }
  }

  // Stop polling
  stopPolling(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
      console.log('ChatService: Message polling stopped');
    }
  }
}

export const chatService = new ChatService();
export default chatService;