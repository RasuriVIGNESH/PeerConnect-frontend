import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  Target,
  Lightbulb,
  Trophy,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Rocket,
  GitBranch,
  TrendingUp,
  Shield,
  Star,
  Code,
  MessageSquare,
  Globe,
  Menu,
  X
} from 'lucide-react';

// Animated section component
const AnimatedSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Floating card component
const FloatingCard = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Smart Matching",
      description: "AI-powered algorithm connects you with students who have complementary skills",
      gradient: "from-slate-700 to-slate-900",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700"
    },
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: "Project Collaboration",
      description: "Built-in tools for seamless team coordination and project management",
      gradient: "from-slate-700 to-slate-900",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Skills Analytics",
      description: "Track trending skills and plan your learning journey with data insights",
      gradient: "from-slate-700 to-slate-900",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Achievement System",
      description: "Earn recognition and build your portfolio with every contribution",
      gradient: "from-slate-700 to-slate-900",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700"
    }
  ];

  const benefits = [
    { text: "Find teammates with complementary skills", icon: <Users className="h-5 w-5" /> },
    { text: "Showcase your projects and achievements", icon: <Trophy className="h-5 w-5" /> },
    { text: "Discover trending skills in your field", icon: <TrendingUp className="h-5 w-5" /> },
    { text: "Build your professional network early", icon: <Globe className="h-5 w-5" /> },
    { text: "Collaborate on real-world projects", icon: <Code className="h-5 w-5" /> },
    { text: "Get peer feedback and skill ratings", icon: <Star className="h-5 w-5" /> }
  ];

  const stats = [
    { value: "10K+", label: "Active Students", gradient: "from-slate-900 to-slate-700" },
    { value: "5K+", label: "Projects Created", gradient: "from-slate-900 to-slate-700" },
    { value: "50+", label: "Universities", gradient: "from-slate-900 to-slate-700" },
    { value: "98%", label: "Satisfaction Rate", gradient: "from-slate-900 to-slate-700" }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-hidden">
      {/* Animated Background - Subtle Grayscale */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-slate-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/4 w-[900px] h-[900px] bg-slate-300/20 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Header */}
      <motion.header
        style={{ opacity: headerOpacity }}
        className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-xl shadow-slate-200/50 px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                PeerConnect
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="rounded-xl font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-slate-900 text-white hover:bg-black rounded-xl font-semibold shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-4 mt-4 border-t border-slate-200 space-y-2"
            >
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full rounded-xl font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="block">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-semibold">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6"
            >
              Connect. Collaborate.{' '}
              <span className="text-slate-900">
                Create.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              The ultimate platform for college students to form teams, share skills,
              and build amazing projects together. Find your perfect project partners
              based on complementary skills and shared interests.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="text-lg px-10 py-7 rounded-2xl bg-slate-900 text-white hover:bg-black shadow-2xl font-bold">
                    Join PeerConnect
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="lg" className="text-lg px-10 py-7 rounded-2xl border-2 font-bold">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Floating Elements */}
            <div className="relative mt-20">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/4 w-20 h-20 bg-slate-200/50 rounded-2xl backdrop-blur-xl rotate-12"
              />
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-20 right-1/4 w-16 h-16 bg-slate-200/50 rounded-full backdrop-blur-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection delay={0.2}>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <FloatingCard key={idx} delay={idx * 0.1}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/60 text-center hover:shadow-2xl transition-all">
                    <div className={`text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                      {stat.value}
                    </div>
                    <div className="text-slate-600 font-semibold">{stat.label}</div>
                  </div>
                </FloatingCard>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection delay={0.3}>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 mb-6">
                <Zap className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Powerful Features</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
                Everything you need to{' '}
                <span className="text-slate-900">
                  succeed
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                PeerConnect provides all the tools you need to find teammates,
                manage projects, and grow your skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FloatingCard key={index} delay={index * 0.1}>
                  <Card className="h-full border-0 bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                    <CardContent className="p-8">
                      <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center ${feature.iconColor} mb-6 group-hover:scale-110 transition-transform`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                      <div className={`mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} transition-all duration-500 rounded-full`} />
                    </CardContent>
                  </Card>
                </FloatingCard>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Benefits Section */}
      <AnimatedSection delay={0.4}>
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 mb-6">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Why Choose Us</span>
                </div>

                <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
                  Why choose{' '}
                  <span className="text-slate-900">
                    PeerConnect?
                  </span>
                </h2>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                  Join thousands of students who are already using PeerConnect to
                  build amazing projects and advance their careers.
                </p>

                <div className="space-y-5">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-xl border border-slate-200/60 hover:shadow-lg transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <span className="text-slate-700 font-semibold">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/50 to-violet-200/50 rounded-3xl blur-3xl" />
                  <div className="relative bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Rocket className="h-6 w-6 text-slate-700" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-900">
                        Ready to get started?
                      </h3>
                    </div>

                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      Create your account today and start connecting with talented
                      students from your college and beyond.
                    </p>

                    <Link to="/register">
                      <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                        <Button size="lg" className="w-full text-lg py-7 rounded-2xl bg-slate-900 text-white hover:bg-black shadow-xl font-bold">
                          Create Your Account
                          <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                      </motion.div>
                    </Link>

                    <p className="text-sm text-slate-500 mt-6 text-center flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Free to join • No credit card required
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={0.5}>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-3xl bg-slate-900 p-16 text-white shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto mb-8 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center"
                >
                  <Sparkles className="h-10 w-10" />
                </motion.div>

                <h2 className="text-5xl md:text-6xl font-black mb-6">
                  Start Building Today
                </h2>
                <p className="text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
                  Join the community of innovators and turn your ideas into reality
                </p>

                <Link to="/register">
                  <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="text-lg px-12 py-7 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-2xl font-bold">
                      Get Started Free
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold">PeerConnect</h3>
            </div>

            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Connecting college students for better collaboration
            </p>

            <div className="flex justify-center gap-8 mb-10">
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors font-semibold">
                Sign In
              </Link>
              <Link to="/register" className="text-slate-400 hover:text-white transition-colors font-semibold">
                Sign Up
              </Link>
            </div>

            <div className="pt-8 border-t border-slate-800">
              <p className="text-slate-500">
                © 2024 PeerConnect. Built for students, by students. ❤️
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}