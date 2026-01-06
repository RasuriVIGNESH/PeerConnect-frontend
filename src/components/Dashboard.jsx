import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestContext';
import { dashboardService } from '../services/dashboardService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FolderOpen,
  TrendingUp,
  LogOut,
  Plus,
  Menu,
  User,
  Mail,
  Sparkles,
  BookOpen,
  Search,
  ArrowRight,
  Bell,
  Zap,
  Target,
  Activity,
  Trophy,
  Clock,
  CheckCircle,
  MessageSquare,
  Star,
  GitBranch,
  Rocket,
  Briefcase,
  Code,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// Scroll-triggered section component
const ScrollSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default function Dashboard() {
  const { userProfile, logout } = useAuth();
  const { pendingCount } = useRequests();
  const [projectCount, setProjectCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardService.getDashboardCounts();
        if (response.success) {
          setProjectCount(response.data.projectsCount || 0);
          setSkillCount(response.data.skillsCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Dynamic inspiring messages based on project count
  const welcomeMessage = React.useMemo(() => {
    const count = parseInt(projectCount) || 0;
    const connections = userProfile?.connectionCount || 0;

    if (count === 0) {
      const msgs = [
        "Ready to start your journey? Create your first project today!",
        "Your portfolio is a blank canvas. Start painting!",
        "Great things start with a single project.",
        "The world is waiting for your ideas. Launch one!",
        "Every expert was once a beginner. Start building."
      ];
      return <span className="italic text-slate-500">{msgs[Math.floor(Math.random() * msgs.length)]}</span>;
    } else {
      const msgs = [
        <>You're building momentum! Managing <span className="text-indigo-600 font-bold">{count} active projects</span> and connecting with {connections} peers.</>,
        <>Great progress! You have <span className="text-indigo-600 font-bold">{count} active projects</span> underway.</>,
        <>Keep pushing boundaries with your <span className="text-indigo-600 font-bold">{count} active projects</span>.</>,
        <>Your portfolio is growing! <span className="text-indigo-600 font-bold">{count} projects</span> are currently active.</>,
        <>Innovation in action. You're leading <span className="text-indigo-600 font-bold">{count} exciting initiatives</span>.</>
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
  }, [projectCount, userProfile]);

  // Recent Activity Items
  const recentActivities = [
    {
      title: "New connection request",
      user: "Sarah Chen",
      time: "2 hours ago",
      icon: <Users className="h-4 w-4" />,
      color: "bg-blue-500",
      action: () => navigate('/requests')
    },
    {
      title: "Project milestone completed",
      user: "AI Learning Platform",
      time: "5 hours ago",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "bg-emerald-500",
      action: () => navigate('/projects/my-projects')
    },
    {
      title: "New skill endorsed",
      user: "React Development",
      time: "1 day ago",
      icon: <Star className="h-4 w-4" />,
      color: "bg-amber-500",
      action: () => navigate('/skills')
    }
  ];

  // Recommended Projects
  const recommendedProjects = [
    {
      title: "ML Model Training Platform",
      description: "Build scalable machine learning infrastructure",
      members: 12,
      skills: ["Python", "TensorFlow", "Docker"],
      gradient: "from-violet-500 to-purple-500",
      id: "ml-platform"
    },
    {
      title: "Social Analytics Dashboard",
      description: "Real-time data visualization for social media",
      members: 8,
      skills: ["React", "D3.js", "Node.js"],
      gradient: "from-blue-500 to-cyan-500",
      id: "analytics-dash"
    },
    {
      title: "Blockchain Wallet App",
      description: "Secure cryptocurrency management solution",
      members: 15,
      skills: ["Solidity", "Web3", "React Native"],
      gradient: "from-amber-500 to-orange-500",
      id: "crypto-wallet"
    }
  ];

  // Trending Skills
  const trendingSkills = [
    { name: "React.js", count: 234, trend: "+12%", icon: <Code className="h-4 w-4" /> },
    { name: "Python", count: 189, trend: "+8%", icon: <Code className="h-4 w-4" /> },
    { name: "TypeScript", count: 156, trend: "+15%", icon: <Code className="h-4 w-4" /> },
    { name: "Machine Learning", count: 142, trend: "+20%", icon: <Code className="h-4 w-4" /> },
    { name: "Docker", count: 128, trend: "+10%", icon: <Code className="h-4 w-4" /> }
  ];

  // Quick Stats
  const quickStats = [
    {
      label: "Active Projects",
      value: projectCount,
      icon: <FolderOpen className="h-5 w-5" />,
      gradient: "from-violet-500 to-purple-500",
      link: "/projects/my-projects"
    },
    {
      label: "Connections",
      value: userProfile?.connectionCount || "0",
      icon: <Users className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-500",
      link: "/connections"
    },
    {
      label: "Skills",
      value: skillCount,
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: "from-emerald-500 to-teal-500",
      link: "/skills"
    },
    {
      label: "Achievements",
      value: "12",
      icon: <Trophy className="h-5 w-5" />,
      gradient: "from-amber-500 to-orange-500",
      link: "/achievements"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-200/40 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-200/40 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Floating Header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-xl shadow-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                PeerConnect
              </span>
            </motion.div>

            <div className="flex items-center gap-3">
              {userProfile?.isCollegeVerified && (
                <Badge className="bg-emerald-500 text-white border-0">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-white mr-2"
                  />
                  Verified
                </Badge>
              )}

              {pendingCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/requests')}
                  className="relative p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <Bell className="h-5 w-5 text-indigo-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                </motion.button>
              )}

              <Link to="/profile">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-violet-500"
                >
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    {userProfile?.profileImage ? (
                      <img src={userProfile.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Menu className="h-5 w-5 text-slate-600" />
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                    >
                      <button
                        onClick={() => { navigate('/requests'); setShowMenu(false); }}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-indigo-500" />
                          <span className="font-medium text-slate-700">Requests</span>
                        </div>
                        {pendingCount > 0 && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                            {pendingCount}
                          </span>
                        )}
                      </button>
                      <div className="h-px bg-slate-100" />
                      <button
                        onClick={() => { setShowLogoutConfirm(true); setShowMenu(false); }}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Scrollable Sections */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">

        {/* Hero Section */}
        <motion.section style={{ scale: heroScale }} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-end mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 shadow-sm">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-6">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">
                {userProfile?.firstName || "Explorer"}
              </span>
            </h1>
            <p className="text-2xl text-slate-600 mb-8 max-w-3xl">
              {welcomeMessage}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/projects/create')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Start New Project
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/discover/projects')}
                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Explore Projects
              </motion.button>
            </div>
          </motion.div>
        </motion.section>

        {/* Quick Stats Grid */}
        <ScrollSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {quickStats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => navigate(stat.link)}
                className="cursor-pointer bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </ScrollSection>

        {/* Recommended Projects Section */}
        <ScrollSection delay={0.1}>
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">Recommended Projects</h2>
                <p className="text-slate-600 text-lg">Join exciting collaborations matching your skills</p>
              </div>
              <Link to="/discover/projects">
                <motion.button
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700"
                >
                  View All
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedProjects.map((project, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="cursor-pointer group"
                >
                  <Card className="h-full border-0 bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${project.gradient}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${project.gradient} text-white shadow-lg`}>
                          <GitBranch className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 text-sm">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">{project.members}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <motion.div
                        className="flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:gap-3 transition-all"
                        whileHover={{ x: 5 }}
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollSection>

        {/* Two Column Layout - Activity & Trending */}
        <ScrollSection delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-slate-900">Recent Activity</h2>
                <Link to="/activity" className="text-indigo-600 font-bold text-sm hover:text-indigo-700">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {recentActivities.map((activity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                    onClick={activity.action}
                    className="cursor-pointer bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-slate-200/60 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${activity.color} w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                        {activity.icon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-slate-900 mb-1">{activity.title}</p>
                        <p className="text-sm text-slate-600 truncate">{activity.user}</p>
                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trending Skills */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-slate-900">Trending Skills</h2>
                <Link to="/discover/skills" className="text-indigo-600 font-bold text-sm hover:text-indigo-700">
                  Explore
                </Link>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 overflow-hidden">
                {trendingSkills.map((skill, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 5, backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                    onClick={() => navigate(`/skills/${skill.name}`)}
                    className="cursor-pointer px-6 py-4 border-b border-slate-100 last:border-0 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-grow">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          {skill.icon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{skill.name}</p>
                          <p className="text-sm text-slate-500">{skill.count} students</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {skill.trend}
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ScrollSection>

        {/* Call to Action Banner */}
        <ScrollSection delay={0.3}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 p-12 text-white shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Rocket className="h-6 w-6" />
                </div>
                <span className="px-4 py-1 bg-white/20 backdrop-blur-xl rounded-full text-sm font-bold">
                  New Feature
                </span>
              </div>

              <h2 className="text-4xl font-black mb-4">Ready to Build Something Amazing?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Connect with talented peers, showcase your skills, and bring your ideas to life with PeerConnect.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/projects/create')}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Create Project
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/discover')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  Discover More
                  <ExternalLink className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </ScrollSection>
      </main>

      {/* Logout Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogOut className="h-10 w-10 text-red-500" />
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-3">Sign Out?</h3>
                <p className="text-slate-600 text-lg mb-8">
                  We'll miss you! Come back soon to continue your journey.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 text-lg font-bold shadow-xl"
                  >
                    Yes, Sign Out
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-14 text-lg rounded-2xl font-semibold"
                  >
                    Stay Logged In
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Menu Backdrop */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}