import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skillsService } from '../../services/skillsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, TrendingUp, Users, BookOpen, Filter,
  Sparkles, Zap, ChartBar, Layers, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Design Constants ---
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

export default function SkillDiscovery() {
  const [skills, setSkills] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [cats, popular] = await Promise.all([
          skillsService.getSkillCategories(),
          skillsService.getPopularSkills()
        ]);
        setCategories(cats.data || []);
        const content = popular.data?.content || [];
        setPopularSkills(content);
        setSkills(content);
      } catch (err) { setError('Sync failed.'); }
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  // --- Handlers ---
  const handleSearch = async () => {
    setLoading(true);
    try {
      if (selectedCategory !== 'all') {
        const res = await skillsService.getSkillsByCategory(selectedCategory);
        let list = res.data?.content || [];
        if (searchTerm) list = list.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setSkills(list);
      } else if (searchTerm) {
        const res = await skillsService.searchSkills(searchTerm);
        setSkills(res.data?.content || []);
      } else {
        setSkills(popularSkills);
      }
    } catch (err) { setError('Search failed.'); }
    finally { setLoading(false); }
  };

  const chartData = popularSkills.slice(0, 6).map((skill, index) => ({
    name: skill.name,
    users: skill.users || 0,
    color: COLORS[index % COLORS.length]
  }));

  const totalUsers = popularSkills.reduce((sum, skill) => sum + (skill.users || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">

      {/* --- SLIM STICKY HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Skill Intelligence</h1>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3 py-1">
              {skills.length} SKILLS FOUND
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-10">

        {/* --- MARKET INTEL BENTO BOX --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

          {/* Chart Tile */}
          <Card className="lg:col-span-8 border-none shadow-2xl shadow-slate-200/50 rounded-[40px] bg-white p-8">
            <CardHeader className="p-0 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Trending Distribution</CardTitle>
                  <p className="text-sm text-slate-500 font-medium">Most requested skills in the student network</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><ChartBar size={20} /></div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[350px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={90}
                    outerRadius={130}
                    paddingAngle={8}
                    dataKey="users"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Stats */}
              <div className="absolute top-1/2 left-1/2 -translate-x-[110%] -translate-y-1/2 text-center pointer-events-none hidden md:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global</p>
                <p className="text-3xl font-black text-slate-900">{totalUsers}</p>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Learners</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Tiles */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <Card className="flex-1 border-none shadow-sm rounded-[32px] bg-indigo-600 p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Growth Index</p>
                <h3 className="text-5xl font-black mb-4">Top 1%</h3>
                <div className="flex items-center gap-2 text-indigo-100 text-sm">
                  <TrendingUp size={16} /> Fast-growing tech stack
                </div>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
            </Card>

            <Card className="flex-1 border-none shadow-sm rounded-[32px] bg-white p-8 border border-slate-100">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Skill Diversity</p>
              <h3 className="text-4xl font-black text-slate-900">{categories.length}</h3>
              <p className="text-slate-500 text-sm mt-2">Active Categories</p>
              <div className="mt-6 flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">C{i}</div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* --- DISCOVERY BAR --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Filter by technology name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-12 h-14 bg-white border-none shadow-xl shadow-slate-200/50 rounded-2xl text-lg outline-none"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-64 h-14 bg-white border-none shadow-xl shadow-slate-200/50 rounded-2xl font-bold">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="all">All Ecosystems</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold shadow-xl">
            Explore
          </Button>
        </div>

        {/* --- SKILLS GRID --- */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-[32px]" />
            ))
          ) : (
            skills.map((skill, idx) => (
              <motion.div key={skill.id} variants={itemVar}>
                <Card className="group border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[32px] bg-white p-6 cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl transition-colors">
                        <Layers size={20} />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                        <Users size={12} /> {skill.users || 0}
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {skill.name}
                    </h4>
                    <Badge variant="outline" className="w-fit border-slate-100 text-[9px] uppercase tracking-widest text-slate-400">
                      {skill.category.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {error && (
          <Alert className="mt-10 bg-red-50 border-red-100 text-red-600 rounded-2xl">
            <AlertDescription className="font-bold">{error}</AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}