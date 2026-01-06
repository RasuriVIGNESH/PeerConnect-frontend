import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequests } from '../../contexts/RequestContext';
import SentRequestsTab from './SentRequestsTab';
import InvitationsTab from './InvitationsTab';
import ProjectRequestsTab from './ProjectRequestsTab';
import { Inbox, Users, Send, Sparkles, ShieldCheck } from 'lucide-react';

export default function RequestsPage() {
  const { pendingCount } = useRequests();

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 pt-20 pb-28 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/2" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <Inbox size={20} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Communication Center</h1>
            </div>
            <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
              Review incoming project invites and manage your active collaboration requests in one central hub.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 -mt-12 relative z-20">
        <Tabs defaultValue="invitations" className="space-y-10">

          {/* MODERN TAB LIST */}
          <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[32px] shadow-2xl shadow-slate-200/40 border border-white sticky top-24">
            <TabsList className="grid grid-cols-3 bg-transparent h-16 p-0 gap-2">
              {[
                { id: 'invitations', label: 'My Invitations', icon: <Sparkles size={16} /> },
                { id: 'project-requests', label: 'Team Requests', icon: <Users size={16} /> },
                { id: 'sent', label: 'Sent Log', icon: <Send size={16} /> }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-[24px] h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-500 font-black text-xs uppercase tracking-widest gap-3"
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === 'invitations' && pendingCount > 0 && (
                    <span className="bg-indigo-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-indigo-50">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="px-2 pt-4">
            <AnimatePresence mode="wait">
              <TabsContent value="invitations">
                <InvitationsTab />
              </TabsContent>
              <TabsContent value="project-requests">
                <ProjectRequestsTab />
              </TabsContent>
              <TabsContent value="sent">
                <SentRequestsTab />
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </main>
    </div>
  );
}