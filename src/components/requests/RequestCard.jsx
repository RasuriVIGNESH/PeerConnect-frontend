import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowRight, Clock, Mail, CheckCircle2, XCircle,
  AlertCircle, Loader2, MessageSquare, Users, Trash2, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function RequestCard({ item, type, onAccept, onReject, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isInvitation = type === 'invitation';
  const relevantUser = isInvitation ? item.invitedBy : item.user;

  const statusStyles = {
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-200 shadow-amber-100/50",
    ACCEPTED: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    REJECTED: "bg-rose-500/10 text-rose-600 border-rose-200",
    CANCELED: "bg-slate-100 text-slate-500 border-slate-200"
  };

  const handleAction = async (action) => {
    setIsProcessing(true);
    try { await action(item.id); }
    catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  return (
    <motion.div variants={itemVar} layout>
      <Card className={`group relative border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[32px] overflow-hidden bg-white ${item.status !== 'PENDING' ? 'opacity-75 grayscale-[0.5]' : ''}`}>

        {/* Progress Loading Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Project & User Context */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all">
                  <AvatarImage src={relevantUser?.profileImage || relevantUser?.profilePictureUrl} />
                  <AvatarFallback className="bg-indigo-600 text-white font-black">
                    {relevantUser?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-sm border ${item.status === 'PENDING' ? 'text-amber-500' : 'text-slate-400'}`}>
                  {isInvitation ? <Zap size={10} fill="currentColor" /> : <Users size={10} />}
                </div>
              </div>

              <div className="space-y-1">
                <Badge className={`${statusStyles[item.status]} border-none text-[9px] font-black uppercase tracking-widest px-3 mb-1`}>
                  {item.status}
                </Badge>
                <Link to={`/projects/${item.project?.id}`} className="block text-xl font-black text-slate-900 leading-tight hover:text-indigo-600 transition-colors">
                  {item.project?.title}
                </Link>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  {isInvitation ? 'Invited by' : 'Request from'} <span className="text-slate-600 underline decoration-indigo-200 underline-offset-4 font-black">{relevantUser?.firstName} {relevantUser?.lastName}</span>
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full h-fit">
              <Clock size={12} className="text-indigo-400" />
              {new Date(item.createdAt || item.invitedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Message Bubble */}
          {item.message && (
            <div className="mt-6 p-5 bg-indigo-50/50 rounded-[24px] rounded-tl-none border border-indigo-100 relative group-hover:bg-indigo-50 transition-colors">
              <MessageSquare size={14} className="absolute -top-2 -left-2 text-indigo-400 bg-white rounded-full p-0.5" />
              <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                "{item.message}"
              </p>
            </div>
          )}

          {/* Action Footer */}
          {item.status === 'PENDING' && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3 flex-1 md:flex-none">
                {onAccept && (
                  <Button
                    onClick={() => handleAction(onAccept)}
                    className="flex-1 md:flex-none h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black shadow-lg shadow-indigo-100"
                  >
                    <CheckCircle2 className="mr-2 w-4 h-4" /> Accept
                  </Button>
                )}
                {onReject && (
                  <Button
                    variant="ghost"
                    onClick={() => handleAction(onReject)}
                    className="flex-1 md:flex-none h-12 px-8 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold"
                  >
                    <XCircle className="mr-2 w-4 h-4" /> Decline
                  </Button>
                )}
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction(onCancel)}
                    className="flex-1 md:flex-none h-12 px-8 rounded-2xl border-slate-200 text-slate-500 font-bold"
                  >
                    <Trash2 className="mr-2 w-4 h-4" /> Cancel Request
                  </Button>
                )}
              </div>

              <Button variant="ghost" className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 group/btn" asChild>
                <Link to={`/projects/${item.project?.id}`}>
                  Explore Base <ArrowRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}