import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, BookOpen, Linkedin, Building, ArrowRight, ArrowLeft } from 'lucide-react';
import { dataService } from '../../services/dataService.js';

// Multi-step Registration component
export default function Register() {
  // form data
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

  // UI state
  const [step, setStep] = useState(1); // 1..3
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // static data
  const [staticData, setStaticData] = useState({ branches: [], graduationYears: [], colleges: [] });
  const [isLoadingStaticData, setIsLoadingStaticData] = useState(false);

  const { signup, loginWithLinkedIn, isCollegeEmail } = useAuth();
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

  // Helpers
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

  // Per-step validation. returns true if valid and sets fieldErrors.
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

  // navigation
  function handleNext() {
    setError('');
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    } else {
      // simple shake by toggling a class could be added; keep it simple
    }
  }

  function handleBack() {
    setError('');
    setStep(prev => Math.max(prev - 1, 1));
  }

  // final submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validateStep(step)) return;

    // final safety validate all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    try {
      setLoading(true);
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        graduationYear: parseInt(formData.graduationYear),
        branch: formData.branch,
        collegeId: formData.collegeId
      };
      await signup(formData.email, formData.password, userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create account: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleLinkedInLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithLinkedIn();
    } catch (err) {
      console.error('LinkedIn error:', err);
      setError('LinkedIn login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // UI pieces for steps (keeps JSX tidy)
  function StepIndicator() {
    const steps = [
      { id: 1, label: 'Account' },
      { id: 2, label: 'Academic' },
      { id: 3, label: 'Security' }
    ];
    const pct = ((step - 1) / (steps.length - 1)) * 100;
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          {steps.map(s => (
            <div key={s.id} className="flex-1 text-center">
              <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${s.id === step ? 'bg-blue-600 text-white' : s.id < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {s.id}
              </div>
              <div className="text-xs mt-1 text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#4f46e5,#06b6d4)' }} />
        </div>
      </div>
    );
  }

  // Animated step container simple CSS transition (no new deps)
  const stepContainerClass = "transition-all duration-300 ease-in-out transform";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join PeerConnect</h2>
          <p className="mt-2 text-sm text-gray-600">A quick, staged signup to get you connected with peers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Complete the 3-step registration</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <StepIndicator />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* STEP 1 - Account */}
              <div className={`${step === 1 ? '' : 'hidden'} ${stepContainerClass}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="firstName" name="firstName" type="text" placeholder="First name" value={formData.firstName} onChange={handleInputChange} className="pl-10" required />
                    </div>
                    {fieldErrors.firstName && <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="lastName" name="lastName" type="text" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} className="pl-10" required />
                    </div>
                    {fieldErrors.lastName && <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="email" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} className="pl-10" required />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  {formData.email && !isCollegeEmailValid && <p className="text-sm text-amber-600">💡 Use your college email (.edu.in) for full access</p>}
                  {formData.email && isCollegeEmailValid && <p className="text-sm text-green-600">✓ College email detected</p>}
                </div>
              </div>

              {/* STEP 2 - Academic */}
              <div className={`${step === 2 ? '' : 'hidden'} ${stepContainerClass}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                      <Select onValueChange={(value) => handleSelectChange('graduationYear', value)} disabled={isLoadingStaticData}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select year"} />
                        </SelectTrigger>
                        <SelectContent>
                          {staticData.graduationYears.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {fieldErrors.graduationYear && <p className="text-xs text-red-500 mt-1">{fieldErrors.graduationYear}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch/Major</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                      <Select onValueChange={(value) => handleSelectChange('branch', value)} disabled={isLoadingStaticData}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select branch"} />
                        </SelectTrigger>
                        <SelectContent>
                          {staticData.branches.map(branch => (
                            <SelectItem key={branch} value={branch}>{branch.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {fieldErrors.branch && <p className="text-xs text-red-500 mt-1">{fieldErrors.branch}</p>}
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <Label htmlFor="college">College</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select onValueChange={(value) => handleSelectChange('collegeId', value ? parseInt(value) : null)} disabled={isLoadingStaticData}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select your college"} />
                      </SelectTrigger>
                      <SelectContent>
                        {staticData.colleges.map(college => <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {fieldErrors.collegeId && <p className="text-xs text-red-500 mt-1">{fieldErrors.collegeId}</p>}
                </div>
              </div>

              {/* STEP 3 - Security */}
              <div className={`${step === 3 ? '' : 'hidden'} ${stepContainerClass}`}>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={formData.password} onChange={handleInputChange} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                  <div className="text-xs text-gray-500 mt-1">Use at least 6 characters. Consider using a combination of letters and numbers.</div>
                </div>

                <div className="space-y-2 mt-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="flex-1">
                  {step > 1 ? (
                    <Button type="button" onClick={handleBack} variant="ghost" className="w-full flex items-center justify-center gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => setStep(1)} variant="ghost" className="w-full invisible">Back</Button>
                  )}
                </div>

                <div className="flex-1">
                  {step < 3 ? (
                    <Button type="button" onClick={handleNext} className="w-full flex items-center justify-center gap-2">
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* LinkedIn Login Button */}
            <Button type="button" variant="outline" className="w-full" onClick={handleLinkedInLogin} disabled={loading}>
              <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
              {loading ? 'Connecting...' : 'Sign up with LinkedIn'}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
