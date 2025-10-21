import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
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
import Connections from './components/profile/Connections';
import RequestsPage from './components/requests/RequestsPage';
import Skills from './components/profile/Skills';
import MeetingRooms from './components/project/MeetingRooms';
import { projectService } from './services/projectService';
import { Loader2 } from 'lucide-react';
import './App.css';

// Wrapper component to fetch data for MeetingRooms
function MeetingRoomsPage() {
    const { projectId } = useParams();
    const { userProfile } = useAuth();
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch project details to get the name
                const projectData = await projectService.getProject(projectId);
                setProject(projectData);

                // Fetch project members
                const membersRes = await projectService.getProjectMembers(projectId);
                const projectMembers = membersRes.data?.content || membersRes.data || [];
                
                // Add project lead to members list if not already present
                const lead = projectData?.lead;
                let allTeamMembers = [...projectMembers];
                if (lead && !projectMembers.some(member => member.user.id === lead.id)) {
                  allTeamMembers.unshift({
                    id: `lead-${lead.id}`,
                    user: lead,
                    role: 'Lead'
                  });
                }
                setMembers(allTeamMembers);

            } catch (error) {
                console.error("Failed to load project data for meeting rooms", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-blue-600"/></div>;
    }

    if (!project) {
        return <div className="flex h-screen items-center justify-center">Project not found.</div>;
    }

    return (
        <MeetingRooms
            projectId={projectId}
            projectName={project.title}
            currentUser={userProfile}
            projectMembers={members.map(m => m.user)} // Pass user objects to component
        />
    );
}


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
            <Route 
              path="/projects/:projectId/rooms" 
              element={
                <ProtectedRoute>
                  <MeetingRoomsPage />
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
