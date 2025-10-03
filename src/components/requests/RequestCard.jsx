// src/components/requests/RequestCard.jsx

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, Briefcase, Clock } from 'lucide-react';

export default function RequestCard({ item, type, onAccept, onReject, onCancel }) {
  const isJoinRequest = type === 'join-request';
  const isInvitation = type === 'invitation';

  const title = isJoinRequest ? item.project?.title : item.project?.title;
  const targetUser = isJoinRequest ? item.user : item.invitedUser;
  const project = item.project;

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge className={statusColors[item.status]}>{item.status}</Badge>
        </div>
        <div className="text-sm text-muted-foreground flex items-center pt-1">
          <Clock className="h-4 w-4 mr-2" />
          {new Date(item.createdAt || item.invitedAt).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent>
        {isInvitation && (
          <div className="text-sm space-y-2">
            <div className="flex items-center"><Briefcase className="h-4 w-4 mr-2 text-gray-500" />Invited for role: <strong>{item.role}</strong></div>
            <div className="flex items-center"><User className="h-4 w-4 mr-2 text-gray-500" />Invited by: <strong>{item.invitedBy?.firstName} {item.invitedBy?.lastName}</strong></div>
          </div>
        )}
        {isJoinRequest && (
          <div className="text-sm space-y-2">
            <div className="flex items-center"><User className="h-4 w-4 mr-2 text-gray-500" />Requested by: <strong>{item.user?.firstName} {item.user?.lastName}</strong></div>
          </div>
        )}
        {item.message && <p className="text-sm mt-3 p-3 bg-gray-50 rounded-md border">{item.message}</p>}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {item.status === 'PENDING' && onAccept && <Button size="sm" onClick={() => onAccept(item.id)}>Accept</Button>}
        {item.status === 'PENDING' && onReject && <Button size="sm" variant="destructive" onClick={() => onReject(item.id)}>Reject</Button>}
        {item.status === 'PENDING' && onCancel && <Button size="sm" variant="ghost" onClick={() => onCancel(item.id)}>Cancel</Button>}
        <Button size="sm" variant="outline" asChild><a href={`/projects/${project.id}`}>View Project <ArrowRight className="h-4 w-4 ml-2" /></a></Button>
      </CardFooter>
    </Card>
  );
}