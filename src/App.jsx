import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import CompleteProfile from './components/auth/CompleteProfile';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/profile/ProfilePage';
import CreateProject from './components/projects/CreateProject';
import ProjectPage from './components/project/ProjectPage';
import InviteMembers from './components/project/InviteMembers';
import StudentDiscovery from './components/discovery/StudentDiscovery';
import ProjectDiscovery from './components/discovery/ProjectDiscovery';
import SkillDiscovery from './components/discovery/SkillDiscovery';
import MyProjects from './components/projects/MyProjects';
import OAuth2RedirectHandler from './components/auth/OAuth2RedirectHandler';
import { RequestProvider } from './contexts/RequestContext';
import RequestsPage from './components/requests/RequestsPage';
import MeetingRoomsPage from '../src/components/project/MeetingRoomsPage';
import SkillMastery from './components/profile/SkillMastery';

import { Toaster } from '@/components/ui/sonner';
import './App.css';



function App() {
  return (
    <Router>
      <AuthProvider>
        <RequestProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/oauth2/redirect" element={<OAuth2RedirectHandler />} />
              <Route
                path="/complete-profile"
                element={
                  <ProtectedRoute>
                    <CompleteProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/create"
                element={
                  <ProtectedRoute>
                    <CreateProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:projectId"
                element={
                  <ProtectedRoute>
                    <ProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:projectId/invite"
                element={
                  <ProtectedRoute>
                    <InviteMembers />
                  </ProtectedRoute>
                }
              />
              <Route path="/projects/:projectId/rooms" element={<MeetingRoomsPage />} />
              <Route
                path="/discover/students"
                element={
                  <ProtectedRoute>
                    <StudentDiscovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discover/projects"
                element={
                  <ProtectedRoute>
                    <ProjectDiscovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discover/skills"
                element={
                  <ProtectedRoute>
                    <SkillDiscovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests"
                element={
                  <ProtectedRoute>
                    <RequestsPage />
                  </ProtectedRoute>
                }
              />

              {/* New Routes for Dashboard functionality */}
              <Route
                path="/projects/my-projects"
                element={
                  <ProtectedRoute>
                    <MyProjects />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/skills"
                element={
                  <ProtectedRoute>
                    <SkillMastery />
                  </ProtectedRoute>
                }
              />

              {/* Redirect any unknown routes to landing page */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Toaster richColors position="top-center" closeButton />
          </div>
        </RequestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
