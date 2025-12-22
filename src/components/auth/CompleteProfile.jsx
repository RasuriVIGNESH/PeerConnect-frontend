import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, BookOpen, Building } from 'lucide-react';
import { dataService } from '../../services/dataService.js';

export default function CompleteProfile() {
    const { currentUser, updateUserProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        graduationYear: '',
        branch: '',
        collegeId: ''
    });

    const [staticData, setStaticData] = useState({ branches: [], graduationYears: [], colleges: [] });
    const [isLoadingStaticData, setIsLoadingStaticData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

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

    // Pre-fill data if available in currentUser
    useEffect(() => {
        if (currentUser) {
            setFormData({
                graduationYear: currentUser.graduationYear ? String(currentUser.graduationYear) : '',
                branch: currentUser.branch || '',
                collegeId: currentUser.collegeId || (currentUser.college?.id) || ''
            });
        }
    }, [currentUser]);

    function handleSelectChange(name, value) {
        setFormData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    function validate() {
        const errs = {};
        if (!formData.collegeId) errs.collegeId = 'Please select your college';

        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        try {
            setLoading(true);
            const updates = {
                collegeId: formData.collegeId
            };

            // Only include optional fields if they are selected
            if (formData.graduationYear) {
                updates.graduationYear = parseInt(formData.graduationYear, 10);
            }
            if (formData.branch) {
                updates.branch = formData.branch;
            }

            await updateUserProfile(updates);
            navigate('/dashboard');
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Failed to update profile: ' + (err?.message || 'Please try again.'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
                    <p className="mt-2 text-sm text-gray-600">Please provide a few more details to get started.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Essential Details</CardTitle>
                        <CardDescription>Tell us about your academic background</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentUser && (
                            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    {currentUser.profileImage ? (
                                        <img
                                            src={currentUser.profileImage}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                            {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {currentUser.firstName} {currentUser.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {currentUser.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <Alert className="mb-4" variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="college">College <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                                    <Select
                                        value={formData.collegeId}
                                        onValueChange={(value) => handleSelectChange('collegeId', value)}
                                        disabled={isLoadingStaticData}
                                    >
                                        <SelectTrigger className="pl-10">
                                            <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select your college"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staticData.colleges.map(college => (
                                                <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {fieldErrors.collegeId && <p className="text-xs text-red-500 mt-1">{fieldErrors.collegeId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="graduationYear">Graduation Year (Optional)</Label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                                    <Select
                                        value={formData.graduationYear}
                                        onValueChange={(value) => handleSelectChange('graduationYear', value)}
                                        disabled={isLoadingStaticData}
                                    >
                                        <SelectTrigger className="pl-10">
                                            <SelectValue placeholder={isLoadingStaticData ? "Loading..." : "Select year"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staticData.graduationYears.map(year => (
                                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="branch">Branch/Major (Optional)</Label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                                    <Select
                                        value={formData.branch}
                                        onValueChange={(value) => handleSelectChange('branch', value)}
                                        disabled={isLoadingStaticData}
                                    >
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

                            <Button type="submit" className="w-full mt-6" disabled={loading}>
                                {loading ? 'Saving...' : 'Continue to Dashboard'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
