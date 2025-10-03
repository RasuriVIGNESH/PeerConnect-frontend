import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { teamService } from '../services/TeamService';
import { joinRequestService } from '../services/JoinRequestService';
import { projectService } from '../services/projectService';

const RequestContext = createContext();

export const useRequests = () => useContext(RequestContext);

export const RequestProvider = ({ children }) => {
  const { isAuthenticated, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sentJoinRequests, setSentJoinRequests] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [receivedJoinRequests, setReceivedJoinRequests] = useState([]);

  const fetchAllData = useCallback(async (currentUserId) => {
    setLoading(true);
    setError(null);
    try {
      const [joinRequestsRes, invitationsRes, myProjectsResponse] = await Promise.all([
        joinRequestService.getMyJoinRequests(),
        teamService.getUserInvitations(),
        projectService.getMyProjects()
      ]);

      // V-- THIS IS THE FIX --V
      // Correctly access the nested data.content array for invitations
      setReceivedInvitations(invitationsRes.data?.content || []);
      // ^-- END OF FIX --^
      
      setSentJoinRequests(joinRequestsRes.data || joinRequestsRes || []);

      const myProjects = myProjectsResponse.content || [];
      const ownedProjects = myProjects.filter(p => p.owner?.id === currentUserId);
      
      if (ownedProjects.length > 0) {
        const requestsPromises = ownedProjects.map(project => 
          joinRequestService.getProjectJoinRequests(project.id)
        );
        const results = await Promise.all(requestsPromises);
        setReceivedJoinRequests(results.flat());
      } else {
        setReceivedJoinRequests([]);
      }

    } catch (err) {
      console.error("RequestContext: Failed to fetch requests data:", err);
      setError("Could not load requests and invitations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && userProfile?.id) {
      fetchAllData(userProfile.id);
    }
  }, [isAuthenticated, userProfile, fetchAllData]);

  const pendingInvitationCount = receivedInvitations.filter(inv => inv.status === 'PENDING').length;
  const pendingJoinRequestCount = receivedJoinRequests.filter(req => req.status === 'PENDING').length;

  const value = {
    loading,
    error,
    sentJoinRequests,
    receivedInvitations,
    receivedJoinRequests,
    refresh: () => {
        if (isAuthenticated && userProfile?.id) {
            fetchAllData(userProfile.id);
        }
    },
    pendingCount: pendingInvitationCount + pendingJoinRequestCount,
  };

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  );
};