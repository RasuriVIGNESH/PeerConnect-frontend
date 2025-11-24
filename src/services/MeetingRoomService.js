import apiService from './api';

class MeetingRoomService {
  // ============================================
  // ROOM OPERATIONS
  // ============================================

  async getMeetingRooms(projectId) {
    try {
      return await apiService.get(`/projects/${projectId}/rooms`);
    } catch (error) {
      console.error('Failed to get meeting rooms:', error);
      throw new Error(error.message || 'Failed to get meeting rooms');
    }
  }

  async createMeetingRoom(projectId, roomData) {
    try {
      return await apiService.post(`/projects/${projectId}/rooms`, roomData);
    } catch (error) {
      console.error('Failed to create meeting room:', error);
      throw new Error(error.message || 'Failed to create meeting room');
    }
  }

  async deleteMeetingRoom(roomId) {
    try {
      return await apiService.delete(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to delete meeting room:', error);
      throw new Error(error.message || 'Failed to delete meeting room');
    }
  }

  // ============================================
  // NOTE OPERATIONS
  // ============================================

  async getNotes(roomId) {
    try {
      return await apiService.get(`/rooms/${roomId}/notes`);
    } catch (error) {
      console.error('Failed to get notes:', error);
      throw new Error(error.message || 'Failed to get notes');
    }
  }

  async createNote(roomId, noteData) {
    try {
      return await apiService.post(`/rooms/${roomId}/notes`, noteData);
    } catch (error) {
      console.error('Failed to create note:', error);
      throw new Error(error.message || 'Failed to create note');
    }
  }

  async updateNote(noteId, noteData) {
    try {
      return await apiService.put(`/notes/${noteId}`, noteData);
    } catch (error) {
      console.error('Failed to update note:', error);
      throw new Error(error.message || 'Failed to update note');
    }
  }

  async deleteNote(noteId) {
    try {
      return await apiService.delete(`/notes/${noteId}`);
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw new Error(error.message || 'Failed to delete note');
    }
  }
}

// Create and export a singleton instance of the service
export const meetingRoomService = new MeetingRoomService();

