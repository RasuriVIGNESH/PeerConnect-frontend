import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import LinkedInCallback from './components/auth/LinkedInCallback';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/profile/ProfilePage';
import CreateProject from './components/projects/CreateProject';
import ProjectDetail from './components/projects/ProjectDetail';
import InviteMembers from './components/projects/InviteMembers';
import StudentDiscovery from './components/discovery/StudentDiscovery';
import ProjectDiscovery from './components/discovery/ProjectDiscovery';
import MyProjects from './components/projects/MyProjects';
import { RequestProvider } from './contexts/RequestContext';
import Connections from './components/profile/Connections';
import RequestsPage from './components/requests/RequestsPage';
import Skills from './components/profile/Skills';
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
            <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
            
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
                  <ProjectDetail />
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
              path="/connections" 
              element={
                <ProtectedRoute>
                  <Connections />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skills" 
              element={
                <ProtectedRoute>
                  <Skills />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect any unknown routes to landing page */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        </RequestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;