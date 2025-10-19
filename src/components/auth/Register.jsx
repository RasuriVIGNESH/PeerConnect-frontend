import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, BookOpen, Linkedin } from 'lucide-react';
import { dataService } from '../../services/dataService.js';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: '',
    branch: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithLinkedIn, isCollegeEmail } = useAuth();
  const navigate = useNavigate();
  const [staticData, setStaticData] = useState({ branches: [], graduationYears: [] });
  const [isLoadingStaticData, setIsLoadingStaticData] = useState(false);

  useEffect(() => {
    const fetchStaticData = async () => {
      setIsLoadingStaticData(true);
      try {
        const [branchesRes, yearsRes] = await Promise.all([
          dataService.getBranches(),
          dataService.getGraduationYears()
        ]);
        setStaticData({
          branches: branchesRes.data || [],
          graduationYears: yearsRes.data || []
        });
      } catch (err) {
        setError('Failed to load registration data. Please refresh the page.');
      } finally {
        setIsLoadingStaticData(false);
      }
    };
    fetchStaticData();
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSelectChange(name, value) {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        graduationYear: parseInt(formData.graduationYear),
        branch: formData.branch
      };
      
      await signup(formData.email, formData.password, userData);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error('Registration error:', error);
    }

    setLoading(false);
  }

  async function handleLinkedInLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithLinkedIn();
    } catch (error) {
      setError('LinkedIn login failed. Please try again.');
      console.error('LinkedIn login error:', error);
    }
    setLoading(false);
  }

  const isCollegeEmailValid = isCollegeEmail(formData.email);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join PeerConnect</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start connecting with peers
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
                {formData.email && !isCollegeEmailValid && (
                  <p className="text-sm text-amber-600">
                    💡 Use your college email (.edu.in) for full access and verification
                  </p>
                )}
                {formData.email && isCollegeEmailValid && (
                  <p className="text-sm text-green-600">
                    ✓ College email detected - you'll get full access!
                  </p>
                )}
              </div>
              
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
                        {staticData.graduationYears.map(year => (
                          <SelectItem key={year} value={String(year)}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                          <SelectItem key={branch} value={branch}>
                            {branch.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
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
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleLinkedInLogin}
              disabled={loading}
            >
              <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
              {loading ? 'Connecting...' : 'Sign up with LinkedIn'}
            </Button>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
