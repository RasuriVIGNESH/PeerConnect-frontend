import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search, Users, UserPlus, Check, ArrowLeft,
  Loader2, Sparkles, MapPin, GraduationCap, Trophy
} from 'lucide-react';
import userService from '../../services/userService';
import { projectService } from '../../services/projectService';

// --- Animation Variants ---
const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

export default function InviteMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [usersRes, membersRes, projectRes] = await Promise.all([
          userService.discoverUsers(),
          projectService.getProjectMembers(projectId),
          projectService.getProject(projectId)
        ]);

        const allStudents = usersRes?.data?.content || usersRes?.data || [];

        // Normalize students to ensure they have an id or fallbacks
        const allStudentsNormalized = allStudents.map(s => ({
          ...s,
          id: s.id || s.userId || s._id,
          // Use email as a fallback unique key for React rendering if ID is missing
          uniqueKey: s.id || s.userId || s._id || s.email
        }));

        const currentMembers = membersRes?.data || [];
        const memberIds = new Set(currentMembers.map(m => m.user.id));

        const leadId = projectRes?.lead?.id || projectRes?.Lead?.id;
        if (leadId) memberIds.add(leadId);

        const available = allStudentsNormalized.filter(s => !memberIds.has(s.id));
        const processed = available.map(s => ({
          ...s,
          displayName: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
          studentSkills: s.skills?.map(sk => typeof sk === 'string' ? sk : sk.name) || [],
          collegeName: s.college?.name || s.collage?.name
        }));

        setStudents(processed);
        setFilteredStudents(processed);
      } catch (err) {
        setError('Failed to fetch talent pool.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredStudents(students.filter(s =>
      s.displayName.toLowerCase().includes(term) ||
      s.studentSkills.some(skill => skill.toLowerCase().includes(term))
    ));
  }, [searchTerm, students]);

  const handleInvite = async (student) => {
    try {
      await projectService.sendInvitation(projectId, {
        invitedUserId: student.id,
        role: 'MEMBER',
        message: `Join our team for this amazing project!`
      });
      setInvitedUserIds(prev => [...prev, student.id]);
    } catch (err) {
      alert("Invitation failed to send.");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"
      />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Scanning Campus Talent...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">

      {/* --- STICKY TOP BAR --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="rounded-2xl hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Recruitment Center</h1>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Finding the best matches</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-slate-100 text-slate-500 border-none font-bold px-3 py-1">
            {invitedUserIds.length} Invited
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">

        {/* --- SEARCH SECTION --- */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-4xl font-black text-slate-900 mb-2">Build your <span className="text-indigo-600">Dream Team</span>.</h2>
            <p className="text-slate-500 font-medium">Connect with skilled students and invite them to contribute to your vision.</p>
          </motion.div>

          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
            <Input
              placeholder="Search by name, branch, or specific skills (e.g. React, Python)..."
              className="h-16 pl-12 rounded-[24px] bg-white border-none shadow-xl shadow-slate-200/50 text-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && <Alert variant="destructive" className="mb-8 rounded-2xl"><AlertDescription>{error}</AlertDescription></Alert>}

        {/* --- TALENT GRID --- */}
        <AnimatePresence>
          {filteredStudents.length > 0 ? (
            <motion.div
              variants={containerVar}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredStudents.map(student => {
                const isInvited = student.id && invitedUserIds.includes(student.id);
                return (
                  <motion.div key={student.uniqueKey} variants={itemVar}>
                    <Card className="group border-none shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[40px] overflow-hidden bg-white p-8 flex flex-col h-full relative">

                      {/* Decorative Element */}
                      <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-indigo-50 transition-colors">
                        <Trophy size={60} />
                      </div>

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            <Avatar className="h-16 w-16 ring-4 ring-slate-50 group-hover:ring-indigo-100 transition-all duration-500">
                              <AvatarImage src={student.profilePictureUrl || student.profileImage} />
                              <AvatarFallback className="bg-indigo-600 text-white font-black">
                                {student.displayName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            {student.studentSkills.length > 5 && (
                              <div className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full text-white shadow-lg">
                                <Sparkles size={10} />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight">{student.displayName}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.branch || 'Innovator'}</p>
                          </div>
                        </div>

                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                            <MapPin size={14} className="text-indigo-500" />
                            {student.collegeName || 'Verified Campus'}
                          </div>

                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 italic">
                            "{student.bio || 'Passionate builder ready to collaborate on innovative projects.'}"
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {student.studentSkills.slice(0, 4).map((skill, idx) => (
                              <Badge key={idx} className="bg-slate-50 text-slate-600 border-none px-3 py-1 rounded-lg text-[10px] font-bold">
                                {skill}
                              </Badge>
                            ))}
                            {student.studentSkills.length > 4 && (
                              <span className="text-[10px] font-black text-indigo-400 flex items-center">
                                +{student.studentSkills.length - 4} MORE
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-8">
                          <Button
                            onClick={() => handleInvite(student)}
                            disabled={isInvited || !student.id}
                            className={`w-full h-14 rounded-3xl font-black text-md shadow-xl transition-all duration-300 ${isInvited
                              ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100 pointer-events-none'
                              : !student.id
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 text-white shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 active:scale-95'
                              }`}
                          >
                            {isInvited ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                <Check className="h-5 w-5" /> Invitation Sent
                              </motion.div>
                            ) : !student.id ? (
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" /> Unavailable (No ID)
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" /> Send Invitation
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
              <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Users size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">No new talent found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Either everyone is already on your team, or it's time to broaden your search!</p>
              <Button variant="link" onClick={() => setSearchTerm('')} className="mt-4 text-indigo-600 font-bold">Clear filters</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}