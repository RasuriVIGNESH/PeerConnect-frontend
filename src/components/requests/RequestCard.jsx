// src/components/requests/RequestCard.jsx

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  User, 
  Clock, 
  Mail, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Enhanced User Info Component
const UserInfoCard = ({ label, user, compact = false }) => {
  if (!user) return null;
  
  return (
    <div className={`flex items-center gap-3 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/50 p-3 ${compact ? 'py-2' : ''}`}>
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
          <User className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-0.5">{label}</div>
        <Link
          to={`/profile/${user.id}`}
          className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors block"
        >
          {user.firstName} {user.lastName}
        </Link>
        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
          <Mail className="h-3 w-3 mr-1.5 flex-shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
      </div>
    </div>
  );
};

export default function RequestCard({ item, type, onAccept, onReject, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isJoinRequest = type === 'join-request';
  const isInvitation = type === 'invitation';
  
  const relevantUser = isInvitation ? item.invitedBy : item.user;
  const userLabel = isInvitation ? 'Invited by' : 'Request from';

  const statusConfig = {
    PENDING: { 
      color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      icon: AlertCircle,
      label: 'Pending'
    },
    ACCEPTED: { 
      color: 'bg-green-500/10 text-green-700 border-green-500/20',
      icon: CheckCircle2,
      label: 'Accepted'
    },
    REJECTED: { 
      color: 'bg-red-500/10 text-red-700 border-red-500/20',
      icon: XCircle,
      label: 'Rejected'
    },
    CANCELED: { 
      color: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
      icon: XCircle,
      label: 'Canceled'
    }
  };

  const status = statusConfig[item.status] || statusConfig.CANCELED;
  const StatusIcon = status.icon;

  const handleAction = async (action) => {
    setIsProcessing(true);
    try {
      await action(item.id);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <Link 
              to={`/projects/${item.project?.id}`}
              className="text-lg font-bold text-foreground mb-1 truncate group-hover:text-primary transition-colors block"
            >
              {item.project?.title}
            </Link>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {new Date(item.createdAt || item.invitedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
          <Badge className={`${status.color} border px-2.5 py-1 flex items-center gap-1.5 flex-shrink-0`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <UserInfoCard label={userLabel} user={relevantUser} compact />

        {isInvitation && item.role && (
          <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">Role</div>
              <div className="font-semibold text-sm truncate">{item.role}</div>
            </div>
          </div>
        )}

        {item.message && (
          <div className="relative pl-4 py-2 border-l-2 border-primary/30">
            <MessageSquare className="absolute left-[-8px] top-2 h-4 w-4 text-primary bg-background" />
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              "{item.message}"
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 bg-muted/30 pt-4 border-t">
        {item.status === 'PENDING' && (
          <>
            {onAccept && (
              <Button 
                size="sm" 
                onClick={() => handleAction(onAccept)}
                disabled={isProcessing}
                className="flex-1 min-w-[100px]"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
            )}
            {onReject && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleAction(onReject)}
                disabled={isProcessing}
                className="flex-1 min-w-[100px]"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            )}
            {onCancel && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAction(onCancel)}
                disabled={isProcessing}
                className="flex-1 min-w-[100px]"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                )}
              </Button>
            )}
          </>
        )}
        <Button size="sm" variant="ghost" className="ml-auto" asChild>
          <Link to={`/projects/${item.project?.id}`}>
            View Project <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}