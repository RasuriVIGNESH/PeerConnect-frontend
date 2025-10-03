// src/components/requests/SentRequestsTab.jsx

import React from 'react';
import { useRequests } from '../../contexts/RequestContext';
import RequestCard from './RequestCard';
import { joinRequestService } from '../../services/JoinRequestService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function SentRequestsTab() {
  const { sentJoinRequests, loading, error, refresh } = useRequests();

  const handleCancel = async (requestId) => {
    try {
      await joinRequestService.cancelJoinRequest(requestId);
      refresh();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Sent Join Requests ({sentJoinRequests.length})</h2>
      {sentJoinRequests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sentJoinRequests.map(req => (
            <RequestCard
              key={req.id}
              item={req}
              type="join-request"
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : <p className="text-muted-foreground">You haven't sent any join requests yet.</p>}
    </div>
  );
}