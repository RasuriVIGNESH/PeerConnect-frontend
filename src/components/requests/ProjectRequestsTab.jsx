// src/components/requests/ProjectRequestsTab.jsx

import React from 'react';
import { useRequests } from '../../contexts/RequestContext';
import RequestCard from './RequestCard';
import { joinRequestService } from '../../services/JoinRequestService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users } from 'lucide-react';

export default function ProjectRequestsTab() {
  const { receivedJoinRequests, loading, error, refresh } = useRequests();

  const handleJoinRequestAccept = async (requestId) => {
    try {
      await joinRequestService.acceptJoinRequest(requestId);
      refresh();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleJoinRequestReject = async (requestId) => {
    try {
      await joinRequestService.rejectJoinRequest(requestId);
      refresh();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const pendingJoinRequests = receivedJoinRequests.filter(req => req.status === 'PENDING');
  const respondedJoinRequests = receivedJoinRequests.filter(req => req.status !== 'PENDING');

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Join Requests
              <Badge variant="secondary" className="text-sm">{pendingJoinRequests.length}</Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              People requesting to join your projects
            </p>
          </div>
        </div>
        {pendingJoinRequests.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingJoinRequests.map(req => (
              <RequestCard
                key={req.id}
                item={req}
                type="join-request"
                onAccept={handleJoinRequestAccept}
                onReject={handleJoinRequestReject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No pending join requests</p>
            <p className="text-sm text-muted-foreground mt-1">
              When people request to join your projects, they'll appear here
            </p>
          </div>
        )}
      </div>

      {respondedJoinRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            History
            <Badge variant="outline" className="text-xs">{respondedJoinRequests.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70">
            {respondedJoinRequests.map(req => (
              <RequestCard key={req.id} item={req} type="join-request" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}