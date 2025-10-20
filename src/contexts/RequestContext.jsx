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
      console.log("RequestContext: Fetching all data for user:", currentUserId);
      
      const [joinRequestsRes, invitationsRes, myProjectsResponse] = await Promise.all([
        joinRequestService.getMyJoinRequests(),
        teamService.getUserInvitations(),
        projectService.getMyProjects()
      ]);

      console.log("RequestContext: API Responses:", {
        joinRequests: joinRequestsRes,
        invitations: invitationsRes,
        myProjects: myProjectsResponse
      });

      // Fix: Backend returns invitations directly as array, not nested in data.content
      const invitations = invitationsRes.data || invitationsRes || [];
      console.log("RequestContext: Processed invitations:", invitations);
      setReceivedInvitations(invitations);
      
      // Fix: Backend returns join requests directly as array
      const sentRequests = joinRequestsRes.data || joinRequestsRes || [];
      console.log("RequestContext: Processed sent join requests:", sentRequests);
      setSentJoinRequests(sentRequests);

      const myProjects = myProjectsResponse.content || [];
      const ownedProjects = myProjects.filter(p => p.Lead?.id === currentUserId);
      console.log("RequestContext: Owned projects:", ownedProjects);
      
      if (ownedProjects.length > 0) {
        const requestsPromises = ownedProjects.map(project => 
          joinRequestService.getProjectJoinRequests(project.id)
        );
        const results = await Promise.all(requestsPromises);
        console.log("RequestContext: Received join requests results:", results);
        // Fix: Backend returns join requests directly as array
        const allJoinRequests = results.map(res => res.data || res || []).flat();
        console.log("RequestContext: Processed received join requests:", allJoinRequests);
        setReceivedJoinRequests(allJoinRequests);
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