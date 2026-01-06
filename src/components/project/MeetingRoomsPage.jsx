import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService.js';
import MeetingRooms from './MeetingRooms';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function MeetingRoomsPage() {
  const { projectId } = useParams();
  const { userProfile, currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await projectService.getProject(projectId);
        setProject(res);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadData();
  }, [projectId]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFDFF]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  if (!project) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFDFF]">
      <div className="text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 uppercase italic">Access Denied</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Project session not found</p>
      </div>
    </div>
  );

  const currentUserId = userProfile?.id || currentUser?.id || currentUser?.userId || currentUser?._id;
  const isProjectLead = (currentUserId && project?.lead?.id && String(currentUserId) === String(project.lead.id)) ||
    (userProfile?.email === project?.lead?.email);

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto h-full">
        <MeetingRooms
          projectId={projectId}
          projectName={project.title}
          isProjectLead={isProjectLead}
        />
      </div>
    </div>
  );
}