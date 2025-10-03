import apiService from './api.js';

class NotificationService {
  // Get user notifications with filters - matches NotificationController endpoint
  async getNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Match NotificationController parameters
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.unreadOnly !== undefined) queryParams.append('unreadOnly', filters.unreadOnly);
      if (filters.page !== undefined) queryParams.append('page', filters.page);
      if (filters.size !== undefined) queryParams.append('size', filters.size);

      console.log('NotificationService: Getting notifications with filters:', filters);
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
      
      const response = await apiService.get(endpoint);
      console.log('NotificationService: Notifications retrieved:', response);
      return response;
    } catch (error) {
      console.error('NotificationService: Error getting notifications:', error);
      throw new Error(error.message || 'Failed to get notifications');
    }
  }

  // Get recent unread notifications - matches NotificationController endpoint
  async getRecentNotifications() {
    try {
      console.log('NotificationService: Getting recent notifications...');
      const response = await apiService.get('/notifications/recent');
      console.log('NotificationService: Recent notifications retrieved:', response);
      return response;
    } catch (error) {
      console.error('NotificationService: Error getting recent notifications:', error);
      throw new Error(error.message || 'Failed to get recent notifications');
    }
  }

  // Get unread notification count - matches NotificationController endpoint
  async getUnreadCount() {
    try {
      console.log('NotificationService: Getting unread count...');
      const response = await apiService.get('/notifications/unread-count');
      console.log('NotificationService: Unread count retrieved:', response);
      return response;
    } catch (error) {
      console.error('NotificationService: Error getting unread count:', error);
      throw new Error(error.message || 'Failed to get unread count');
    }
  }

  // Mark notification as read - matches NotificationController endpoint
  async markAsRead(notificationId) {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      console.log('NotificationService: Marking notification as read:', notificationId);
      const response = await apiService.put(`/notifications/${notificationId}/read`);
      console.log('NotificationService: Notification marked as read:', response);
      return response;
    } catch (error) {
      console.error('NotificationService: Error marking notification as read:', error);
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }

  // Mark all notifications as read - matches NotificationController endpoint
  async markAllAsRead() {
    try {
      console.log('NotificationService: Marking all notifications as read...');
      const response = await apiService.put('/notifications/mark-all-read');
      console.log('NotificationService: All notifications marked as read:', response);
      return response;
    } catch (error) {
      console.error('NotificationService: Error marking all as read:', error);
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  }

  // Delete notification - matches NotificationController endpoint
  async deleteNotification(notificationId) {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      console.log('NotificationService: Deleting notification:', notificationId);
      const response = await apiService.delete(`/notifications/${notificationId}`);
      console.log('NotificationService: Notification deleted:', response);
      return response;
    } catch (error) {
      console.error('NotificationService: Error deleting notification:', error);
      throw new Error(error.message || 'Failed to delete notification');
    }
  }

  // Delete all notifications - matches NotificationController endpoint
  async deleteAllNotifications() {
    try {
      console.log('NotificationService: Deleting all notifications...');
      const response = await apiService.delete('/notifications/all');
      console.log('NotificationService: All notifications deleted:', response);
      return response;
    } catch (error) {
      console.error('NotificationService: Error deleting all notifications:', error);
      throw new Error(error.message || 'Failed to delete all notifications');
    }
  }

  // Get notification by ID - matches NotificationController endpoint
  async getNotificationById(notificationId) {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }

      console.log('NotificationService: Getting notification by ID:', notificationId);
      const response = await apiService.get(`/notifications/${notificationId}`);
      console.log('NotificationService: Notification retrieved:', response);
      return response;
    } catch (error) {
      console.error('NotificationService: Error getting notification by ID:', error);
      throw new Error(error.message || 'Failed to get notification');
    }
  }

  // Helper methods for common notification operations

  // Get only unread notifications
  async getUnreadNotifications(page = 0, size = 20) {
    try {
      return await this.getNotifications({
        unreadOnly: true,
        page,
        size
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to get unread notifications');
    }
  }

  // Get notifications by type
  async getNotificationsByType(type, page = 0, size = 20) {
    try {
      if (!type) {
        throw new Error('Notification type is required');
      }
      
      return await this.getNotifications({
        type,
        page,
        size
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to get notifications by type');
    }
  }

  // Real-time notification polling (since WebSocket isn't implemented)
  async startNotificationPolling(callback, intervalMs = 30000) {
    try {
      console.log('NotificationService: Starting notification polling...');
      
      const pollNotifications = async () => {
        try {
          const unreadCount = await this.getUnreadCount();
          const recentNotifications = await this.getRecentNotifications();
          
          if (callback && typeof callback === 'function') {
            callback({
              unreadCount: unreadCount?.data || 0,
              recentNotifications: recentNotifications?.data || []
            });
          }
        } catch (error) {
          console.error('NotificationService: Polling error:', error);
        }
      };

      // Initial call
      await pollNotifications();
      
      // Set up interval
      return setInterval(pollNotifications, intervalMs);
    } catch (error) {
      console.error('NotificationService: Error setting up notification polling:', error);
      throw new Error('Failed to set up notification polling');
    }
  }

  // Stop notification polling
  stopNotificationPolling(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
      console.log('NotificationService: Notification polling stopped');
    }
  }

  // Utility method to format notification data
  formatNotification(notification) {
    if (!notification) return null;

    return {
      id: notification.id,
      type: notification.type,
      title: notification.title || 'Notification',
      message: notification.message || notification.content,
      isRead: notification.read || false,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      user: notification.user,
      relatedEntity: notification.relatedEntity
    };
  }

  // Batch operations helper
  async performBatchOperation(notificationIds, operation) {
    try {
      if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
        throw new Error('Notification IDs array is required');
      }

      const results = [];
      for (const id of notificationIds) {
        try {
          let result;
          switch (operation) {
            case 'markRead':
              result = await this.markAsRead(id);
              break;
            case 'delete':
              result = await this.deleteNotification(id);
              break;
            default:
              throw new Error(`Unknown operation: ${operation}`);
          }
          results.push({ id, success: true, result });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw new Error(error.message || 'Failed to perform batch operation');
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;