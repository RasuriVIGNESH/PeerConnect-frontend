// src/components/project/MeetingRoomsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed
import { projectService } from '../../services/projectService.js'; // Adjust path
import MeetingRooms from './MeetingRooms'; // Adjust path to the actual component

// Import your loading/error components
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MeetingRoomsPage() {
  const { projectId } = useParams();
  const { userProfile } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        setError(null);
        // We fetch the full project details just to get the member and lead info
        const response = await projectService.getProject(projectId);
        setProject(response);
      } catch (err) {
        setError('Failed to load project details for the meeting room.');
      } finally {
        setLoading(false);
      }
    };
    loadProjectData();
  }, [projectId, userProfile]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>;
  }

  if (error || !project) {
    return <div className="flex h-screen items-center justify-center"><Alert variant="destructive" className="max-w-md"><AlertCircle className="h-4 w-4" /><AlertDescription>{error || 'Project not found.'}</AlertDescription></Alert></div>;
  }

  // === THIS IS THE FIX ===
  // Now we can calculate the props that MeetingRooms needs

  const isProjectLead = project?.lead?.id && userProfile?.id && String(project.lead.id) === String(userProfile.id);

  // Get the member list (based on the logic from your MemberManagement component)
  const lead = project?.lead;
  const projectMembers = project.projectMembers || [];
  let allMembers = [...projectMembers];

  if (lead && !projectMembers.some(member => member.user.id === lead.id)) {
    allMembers.unshift({ id: `lead-${lead.id}`, user: lead, role: 'Lead' });
  }

  // Now, render the MeetingRooms component with all the required props
  return (
    <MeetingRooms
      projectId={projectId}
      projectName={project.title} // Pass the project name
      projectMembers={allMembers} // Pass the full member list
      isProjectLead={isProjectLead}  // Pass the calculated boolean
    />
  );
}