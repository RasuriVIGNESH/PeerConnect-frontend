// src/pages/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Eye, EyeOff, Mail, Lock, User, GraduationCap, BookOpen,
  Building, ArrowRight, ArrowLeft, Github, Sparkles, CheckCircle2
} from 'lucide-react';
import { dataService } from '../../services/dataService.js';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: '',
    branch: '',
    collegeId: null
  });

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [staticData, setStaticData] = useState({ branches: [], graduationYears: [], colleges: [] });
  const [isLoadingStaticData, setIsLoadingStaticData] = useState(false);

  const { signup, loginWithGitHub, isCollegeEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaticData = async () => {
      setIsLoadingStaticData(true);
      try {
        const branchesRes = await dataService.getBranches().catch(() => ({ data: [] }));
        const yearsRes = await dataService.getGraduationYears().catch(() => ({ data: [] }));
        const collegesRes = await dataService.getColleges().catch(() => ({ data: [] }));
        setStaticData({
          branches: branchesRes.data || [],
          graduationYears: yearsRes.data || [],
          colleges: collegesRes.data || []
        });
      } finally {
        setIsLoadingStaticData(false);
      }
    };
    fetchStaticData();
  }, []);

  const isCollegeEmailValid = isCollegeEmail(formData.email);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setError('');
  }

  function handleSelectChange(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  }

  function validateStep(currentStep) {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.firstName.trim()) errs.firstName = 'First name is required';
      if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
      if (!formData.email.trim()) errs.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errs.email = 'Invalid email';
    } else if (currentStep === 2) {
      if (!formData.graduationYear) errs.graduationYear = 'Select your graduation year';
      if (!formData.branch) errs.branch = 'Select your branch/major';
      if (!formData.collegeId) errs.collegeId = 'Select your college';
    } else if (currentStep === 3) {
      if (!formData.password) errs.password = 'Password is required';
      else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) errs.confirmPassword = 'Confirm your password';
      else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    setError('');
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, 3));
  }

  function handleBack() {
    setError('');
    setStep(prev => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validateStep(step)) return;
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    try {
      setLoading(true);
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        graduationYear: parseInt(formData.graduationYear, 10),
        branch: formData.branch,
        collegeId: formData.collegeId
      };
      await signup(formData.email, formData.password, userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create account: ' + (err?.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHubLogin() {
    setError('');
    try {
      setLoading(true);
      localStorage.setItem('oauth_intent', 'register');
      await loginWithGitHub();
    } catch (err) {
      console.error('GitHub login error:', err);
      setError('GitHub login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  const StepProgress = React.useCallback(({ currentStep }) => {
    const steps = [
      { id: 1, label: 'Account', icon: <User className="h-4 w-4" /> },
      { id: 2, label: 'Academic', icon: <GraduationCap className="h-4 w-4" /> },
      { id: 3, label: 'Security', icon: <Lock className="h-4 w-4" /> }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {steps.map((s, idx) => (
            <motion.div
              key={s.id}
              className="relative z-10 flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${s.id === currentStep
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 scale-110'
                  : s.id < currentStep
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                layout // Helps with smooth transitions if layout changes
              >
                {s.id < currentStep ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
              </motion.div>
              <span className={`text-xs mt-2 font-semibold transition-colors duration-300 ${s.id === currentStep ? 'text-indigo-600' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-indigo-200/40 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/4 w-[900px] h-[900px] bg-gradient-to-br from-purple-200/40 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="inline-flex items-center justify-center"
            >
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-4xl font-black text-slate-900"
            >
              Join PeerConnect
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-lg text-slate-600"
            >
              Create your account in 3 simple steps
            </motion.p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50">
              <CardContent className="p-8">
                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <StepProgress currentStep={step} />

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {/* STEP 1 - Account */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-slate-700 font-semibold">First Name</Label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                              <Input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            {fieldErrors.firstName && <p className="text-xs text-red-500">{fieldErrors.firstName}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-slate-700 font-semibold">Last Name</Label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                              <Input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500 transition-all"
                                required
                              />
                            </div>
                            {fieldErrors.lastName && <p className="text-xs text-red-500">{fieldErrors.lastName}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="your.email@college.edu"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500 transition-all"
                              required
                            />
                          </div>
                          {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                          {formData.email && !isCollegeEmailValid && (
                            <p className="text-sm text-amber-600 flex items-center gap-2">
                              💡 Use your college email (.edu.in) for full access
                            </p>
                          )}
                          {formData.email && isCollegeEmailValid && (
                            <p className="text-sm text-emerald-600 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" /> College email detected
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2 - Academic */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold">Graduation Year</Label>
                            <div className="relative">
                              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                              <Select onValueChange={(value) => handleSelectChange('graduationYear', value)} disabled={isLoadingStaticData}>
                                <SelectTrigger className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500">
                                  <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select year"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {staticData.graduationYears.map(year => (
                                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {fieldErrors.graduationYear && <p className="text-xs text-red-500">{fieldErrors.graduationYear}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-700 font-semibold">Branch/Major</Label>
                            <div className="relative">
                              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                              <Select onValueChange={(value) => handleSelectChange('branch', value)} disabled={isLoadingStaticData}>
                                <SelectTrigger className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500">
                                  <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select branch"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {staticData.branches.map(branch => (
                                    <SelectItem key={branch} value={branch}>
                                      {branch.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {fieldErrors.branch && <p className="text-xs text-red-500">{fieldErrors.branch}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">College</Label>
                          <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                            <Select onValueChange={(value) => handleSelectChange('collegeId', value)} disabled={isLoadingStaticData}>
                              <SelectTrigger className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500">
                                <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select your college"} />
                              </SelectTrigger>
                              <SelectContent>
                                {staticData.colleges.map(college => (
                                  <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {fieldErrors.collegeId && <p className="text-xs text-red-500">{fieldErrors.collegeId}</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3 - Security */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a strong password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="pl-12 pr-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500 transition-all"
                              required
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </motion.button>
                          </div>
                          {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
                          <p className="text-xs text-slate-500">At least 6 characters with letters and numbers</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirm Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Re-enter your password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="pl-12 pr-12 h-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500 transition-all"
                              required
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </motion.button>
                          </div>
                          {fieldErrors.confirmPassword && <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-4 pt-4">
                    {step > 1 && (
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          onClick={handleBack}
                          variant="outline"
                          className="w-full h-12 rounded-xl border-2 font-semibold"
                        >
                          <ArrowLeft className="h-5 w-5 mr-2" />
                          Back
                        </Button>
                      </motion.div>
                    )}

                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {step < 3 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl font-bold shadow-lg shadow-indigo-200"
                        >
                          Next
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl font-bold shadow-lg shadow-indigo-200"
                          disabled={loading}
                        >
                          {loading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            'Create Account'
                          )}
                        </Button>
                      )}
                    </motion.div>
                  </div>
                </form>

                {/* Divider */}
                {step === 1 && (
                  <>
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl border-2 font-semibold"
                        onClick={handleGitHubLogin}
                        disabled={loading}
                      >
                        <Github className="h-5 w-5 mr-2" />
                        Sign up with GitHub
                      </Button>
                    </motion.div>
                  </>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium">
              ← Back to home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}