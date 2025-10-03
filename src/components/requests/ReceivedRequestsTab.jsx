// src/components/requests/ReceivedRequestsTab.jsx

import React from 'react';
import { useRequests } from '../../contexts/RequestContext';
import RequestCard from './RequestCard';
import { teamService } from '../../services/TeamService';
import { joinRequestService } from '../../services/JoinRequestService'; // V-- 1. IMPORT joinRequestService --V
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function ReceivedRequestsTab() {
  // V-- 2. GET receivedJoinRequests FROM THE CONTEXT --V
  const { receivedInvitations, receivedJoinRequests, loading, error, refresh } = useRequests();

  const handleInvitationResponse = async (invitationId, response) => {
    try {
      await teamService.respondToInvitation(invitationId, response);
      refresh();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // V-- 3. ADD HANDLERS FOR ACCEPTING/REJECTING JOIN REQUESTS --V
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

  if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  const pendingInvitations = receivedInvitations.filter(i => i.status === 'PENDING');
  const respondedInvitations = receivedInvitations.filter(i => i.status !== 'PENDING');

  // V-- 4. FILTER JOIN REQUESTS INTO PENDING AND RESPONDED --V
  const pendingJoinRequests = receivedJoinRequests.filter(req => req.status === 'PENDING');
  const respondedJoinRequests = receivedJoinRequests.filter(req => req.status !== 'PENDING');

  return (
    <div className="space-y-8">
      {/* // V-- 5. NEW SECTION FOR RECEIVED JOIN REQUESTS --V */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Received Join Requests ({pendingJoinRequests.length} Pending)</h2>
        {pendingJoinRequests.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
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
        ) : <p className="text-muted-foreground">No pending join requests for your projects.</p>}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Pending Invitations ({pendingInvitations.length})</h2>
        {pendingInvitations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingInvitations.map(inv => (
              <RequestCard
                key={inv.id}
                item={inv}
                type="invitation"
                onAccept={(id) => handleInvitationResponse(id, 'ACCEPTED')}
                onReject={(id) => handleInvitationResponse(id, 'REJECTED')}
              />
            ))}
          </div>
        ) : <p className="text-muted-foreground">You have no pending invitations.</p>}
      </div>

      {/* Optional: You can also display responded requests */}
      {(respondedJoinRequests.length > 0 || respondedInvitations.length > 0) && (
        <div>
          <h2 className="text-xl font-semibold mb-3">History</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {respondedJoinRequests.map(req => <RequestCard key={req.id} item={req} type="join-request" />)}
            {respondedInvitations.map(inv => <RequestCard key={inv.id} item={inv} type="invitation" />)}
          </div>
        </div>
      )}
    </div>
  );
}