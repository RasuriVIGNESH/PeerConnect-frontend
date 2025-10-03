// src/components/requests/RequestsPage.jsx

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SentRequestsTab from './SentRequestsTab';
import ReceivedRequestsTab from './ReceivedRequestsTab';
import { ArrowUpRightFromSquare, Inbox } from 'lucide-react';

export default function RequestsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Requests & Invitations</h1>
        <p className="text-muted-foreground">Manage your sent project requests and received invitations.</p>
      </div>
      <Tabs defaultValue="received">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received"><Inbox className="h-4 w-4 mr-2" />Received</TabsTrigger>
          <TabsTrigger value="sent"><ArrowUpRightFromSquare className="h-4 w-4 mr-2" />Sent</TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-4">
          <ReceivedRequestsTab />
        </TabsContent>
        <TabsContent value="sent" className="mt-4">
          <SentRequestsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}