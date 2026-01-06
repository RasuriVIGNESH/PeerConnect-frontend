// Template for InvitationsTab / ProjectRequestsTab / SentRequestsTab
import React from 'react';
import { motion } from 'framer-motion';
import RequestCard from './RequestCard';
import { Inbox, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function TabContent({ title, description, items, type, ...handlers }) {
    const pending = items.filter(i => i.status === 'PENDING');
    const history = items.filter(i => i.status !== 'PENDING');

    return (
        <motion.div variants={containerVar} initial="hidden" animate="visible" className="space-y-12">

            {/* Pending Section */}
            <section>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                        <p className="text-sm font-medium text-slate-400">{description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto bg-indigo-50 text-indigo-600 font-black px-4 py-1 rounded-full">
                        {pending.length} Active
                    </Badge>
                </div>

                {pending.length > 0 ? (
                    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                        {pending.map(item => (
                            <RequestCard key={item.id} item={item} type={type} {...handlers} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[48px] bg-slate-50/30">
                        <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Layers className="text-slate-200 w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Your queue is clear</h3>
                        <p className="text-sm text-slate-400">All caught up! New requests will appear here.</p>
                    </div>
                )}
            </section>

            {/* History Section */}
            {history.length > 0 && (
                <section className="pt-12 border-t border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Interaction History</h3>
                    <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 opacity-60 hover:opacity-100 transition-opacity">
                        {history.map(item => (
                            <RequestCard key={item.id} item={item} type={type} />
                        ))}
                    </div>
                </section>
            )}
        </motion.div>
    );
}