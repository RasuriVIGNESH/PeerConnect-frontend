// src/components/requests/RequestsPage.jsx

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SentRequestsTab from './SentRequestsTab';
import InvitationsTab from './InvitationsTab';
import ProjectRequestsTab from './ProjectRequestsTab';
import { Inbox, Users, Send } from 'lucide-react';

export default function RequestsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Requests & Invitations
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your project invitations and collaboration requests
        </p>
      </div>
      
      <Tabs defaultValue="invitations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 h-auto">
          <TabsTrigger 
            value="invitations" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-3"
          >
            <Inbox className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">My </span>Invitations
          </TabsTrigger>
          <TabsTrigger 
            value="project-requests" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-3"
          >
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Project </span>Requests
          </TabsTrigger>
          <TabsTrigger 
            value="sent" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm py-3"
          >
            <Send className="h-4 w-4 mr-2" />
            Sent<span className="hidden sm:inline"> Requests</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invitations" className="mt-6">
          <InvitationsTab />
        </TabsContent>
        <TabsContent value="project-requests" className="mt-6">
          <ProjectRequestsTab />
        </TabsContent>
        <TabsContent value="sent" className="mt-6">
          <SentRequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}