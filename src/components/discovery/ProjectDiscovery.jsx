import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Icons
import {
  Search, Users, UserPlus, Eye, Calendar, Loader2, Target, CheckCircle2,
  Send, Briefcase, TrendingUp, Filter, X, Sparkles, MapPin, Rocket,
  ChevronRight, Bookmark, Globe, Layers, LayoutGrid
} from 'lucide-react';

// Services
import projectService from '../../services/projectService';
import { joinRequestService } from '../../services/JoinRequestService';

export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterByCollege, setFilterByCollege] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let projectsData = [];
        if (filterByCollege && currentUser.collegeId) {
          const res = await projectService.getProjectsByCollege(currentUser.collegeId);
          projectsData = res.data || [];
        } else {
          const res = await projectService.discoverProjects(0, 50);
          projectsData = res.content || [];
        }
        setProjects(projectsData.map(p => ({
          ...p,
          requiredSkills: (p.requiredSkills || []).map(s => s.skill?.name).filter(Boolean)
        })));

        // Fetch categories
        const categoriesData = await projectService.getProjectCategories();
        setCategories(categoriesData || []);

        const reqs = await joinRequestService.getMyJoinRequests();
        setSentRequests(new Set((reqs || []).map(r => r.project?.id).filter(Boolean)));
      } catch (err) { setError("Failed to sync."); }
      finally { setLoading(false); }
    };
    loadData();
  }, [currentUser, filterByCollege]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredProjects(projects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.requiredSkills?.some(s => s.toLowerCase().includes(term));

      const matchesCategory = selectedCategory === 'All' || p.categoryName === selectedCategory;

      return matchesSearch && matchesCategory;
    }));
  }, [projects, searchTerm, selectedCategory]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col">

      {/* --- SLIM STICKY HEADER --- */}
      <header className="sticky top-0 z-50 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Rocket size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-900 tracking-tighter text-lg">Projects</span>
        </div>

        <div className="flex-1 max-w-md mx-8 relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects, skills, or teams..."
            className="w-full bg-slate-50 border-none rounded-xl h-10 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="rounded-full border-slate-100 text-slate-500 px-3 py-1 font-bold text-[10px]">
            {filteredProjects.length} AVAILABLE
          </Badge>
        </div>
      </header>

      <div className="flex flex-1">

        {/* --- LEFT FILTER SIDEBAR --- */}
        <aside className="w-64 border-r border-slate-100 p-6 hidden lg:flex flex-col gap-8 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Filters</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer transition-all">
                <Label htmlFor="college-side" className="text-xs font-bold text-slate-700 cursor-pointer">Campus Only</Label>
                <Switch id="college-side" checked={filterByCollege} onCheckedChange={setFilterByCollege} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
            <div className="flex flex-col gap-2">
              <Button
                variant={selectedCategory === 'All' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory('All')}
                className={`justify-start text-xs font-bold ${selectedCategory === 'All' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                All Categories
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.name ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`justify-start text-xs font-bold ${selectedCategory === cat.name ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <TrendingUp size={16} className="text-indigo-600" />
                <span className="text-xs font-bold">Trending High</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Sparkles size={16} className="text-amber-500" />
                <span className="text-xs font-bold">New Initiatives</span>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 bg-indigo-50 rounded-3xl border border-indigo-100">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Join the community</p>
            <p className="text-[10px] text-indigo-400 leading-relaxed">Collaborate with the best students across your campus.</p>
          </div>
        </aside>

        {/* --- CONTENT FEED --- */}
        <main className="flex-1 p-6 lg:p-10">

          {/* Mobile Categories (Horizontal Scroll) */}
          <div className="lg:hidden mb-6 overflow-x-auto pb-2 -mx-6 px-6 flex gap-2 no-scrollbar">
            <Badge
              onClick={() => setSelectedCategory('All')}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${selectedCategory === 'All' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${selectedCategory === cat.name ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                {cat.name}
              </Badge>
            ))}
          </div>

          <AnimatePresence>
            {filteredProjects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Briefcase size={48} className="text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No projects found</h3>
                <p className="text-slate-500 text-sm">Try broadening your search criteria.</p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredProjects.map((project) => (
                  <motion.div
                    layout
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="group bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 rounded-[28px] overflow-hidden flex flex-col h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-slate-50 text-slate-500 border-none font-bold text-[9px] uppercase tracking-widest px-2 py-0.5">
                            {project.categoryName}
                          </Badge>
                          <div className="flex -space-x-1">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-5 h-5 rounded-full bg-slate-100 border border-white" />
                            ))}
                          </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {project.requiredSkills?.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 ring-2 ring-white">
                              <AvatarImage src={project.lead?.profilePictureUrl} />
                              <AvatarFallback className="text-[8px] bg-slate-900 text-white">L</AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-bold text-slate-700">{project.lead?.firstName}</span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                            onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                          >
                            Details <ChevronRight size={12} className="ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* --- REFINED PROJECT MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] p-0 border-none overflow-hidden shadow-2xl">
          {selectedProject && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-8 text-white">
                <Badge className="bg-indigo-600 text-white border-none mb-3">{selectedProject.categoryName}</Badge>
                <h2 className="text-3xl font-black mb-2">{selectedProject.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{selectedProject.description}</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Team Vacancy</p>
                    <p className="text-lg font-black text-slate-900">{selectedProject.currentTeamSize + 1} / {selectedProject.maxTeamSize}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Architect</p>
                    <p className="text-lg font-black text-slate-900">{selectedProject.lead?.firstName} {selectedProject.lead?.lastName}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Skillset</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.requiredSkills?.map((s, i) => (
                      <Badge key={i} className="bg-white border-slate-200 text-slate-600 px-3 py-1 rounded-xl text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>

                {!sentRequests.has(selectedProject.id) && (
                  <Textarea
                    placeholder="Why are you a good fit for this squad?"
                    className="rounded-2xl border-slate-200 min-h-[100px] p-4 text-sm"
                    value={joinRequestMessage}
                    onChange={(e) => setJoinRequestMessage(e.target.value)}
                  />
                )}
              </div>

              <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold text-slate-500">Close</Button>
                <Button
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      await joinRequestService.sendJoinRequest(selectedProject.id, joinRequestMessage);
                      setSentRequests(p => new Set(p).add(selectedProject.id));
                      setIsModalOpen(false);
                    } catch (e) { alert("Error sending request."); }
                    finally { setIsSubmitting(false); }
                  }}
                  disabled={isSubmitting || sentRequests.has(selectedProject.id)}
                  className="bg-indigo-600 rounded-xl px-8 h-12 font-black shadow-lg shadow-indigo-200"
                >
                  {sentRequests.has(selectedProject.id) ? 'Application Sent' : 'Request to Join'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}