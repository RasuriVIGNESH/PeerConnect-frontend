// src/services/JoinRequestService.js

import apiService from './api.js';

class JoinRequestService {
  /**
   * Send a request to join a project.
   * Corresponds to: POST /api/projects/{projectId}/join-requests
   */
  async sendJoinRequest(projectId, message) {
    return apiService.post(`/projects/${projectId}/join-requests`, { message });
  }

  /**
   * Get all join requests sent by the current user.
   * Corresponds to: GET /api/join-requests/my-requests
   */
  async getMyJoinRequests() {
    return apiService.get('/join-requests/my-requests');
  }

  /**
   * Get all join requests for a specific project (Lead only).
   * Corresponds to: GET /api/projects/{projectId}/join-requests
   */
  async getProjectJoinRequests(projectId) {
    return apiService.get(`/projects/${projectId}/join-requests`);
  }

  /**
   * Accept a join request (Lead only).
   * Corresponds to: PUT /api/join-requests/{requestId}/accept
   */
  async acceptJoinRequest(requestId) {
    return apiService.put(`/join-requests/${requestId}/accept`, null);
  }

  /**
   * Reject a join request (Lead only).
   * Corresponds to: PUT /api/join-requests/{requestId}/reject
   */
  async rejectJoinRequest(requestId) {
    return apiService.put(`/join-requests/${requestId}/reject`, null);
  }

  /**
   * Cancel a sent join request (requester only).
   * Corresponds to: DELETE /api/join-requests/{requestId}/cancel
   */
  async cancelJoinRequest(requestId) {
    return apiService.delete(`/join-requests/${requestId}/cancel`);
  }
}

export const joinRequestService = new JoinRequestService();
export default joinRequestService;