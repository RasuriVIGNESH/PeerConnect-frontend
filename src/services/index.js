// Export all services - Updated to include new services
export { default as apiService } from './api.js';
export { default as authService } from './authService.js';
export { default as userService } from './userService.js';
export { default as skillsService } from './skillsService.js';
export { default as projectService } from './projectService.js';
export { default as analyticsService } from './analyticsService.js';
export { default as dataService } from './dataService.js';

// New services based on backend controllers
export { default as chatService } from './Chatservice.js';
export { default as notificationService } from './NotificationService.js';
export { default as teamService } from './TeamService.js';