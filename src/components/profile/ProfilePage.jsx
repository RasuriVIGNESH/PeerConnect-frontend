import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, GraduationCap, BookOpen, Github, Linkedin, Globe, Camera, Plus, X, Save, Edit3, FolderOpen } from 'lucide-react';
import SkillsManager from './SkillsManager';

export default function ProfilePage() {
    const { currentUser, userProfile, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        graduationYear: '',
        branch: '',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        availabilityStatus: 'AVAILABLE'
    });

    const currentYear = new Date().getFullYear();
    const graduationYears = Array.from({ length: 8 }, (_, i) => currentYear + i);

    const branches = [
        'Computer Science',
        'Information Technology',
        'Electronics and Communication',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Chemical Engineering',
        'Biotechnology',
        'Business Administration',
        'Economics',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Other'
    ];

    const availabilityOptions = [
        { value: 'AVAILABLE', label: 'Available', color: 'bg-green-500' },
        { value: 'BUSY', label: 'Busy', color: 'bg-yellow-500' },
        { value: 'OFFLINE', label: 'Offline', color: 'bg-gray-500' }
    ];

    // Initialize form data when user profile loads
    useEffect(() => {
        console.log('ProfilePage useEffect - currentUser:', currentUser);
        console.log('ProfilePage useEffect - userProfile:', userProfile);
        
        if (userProfile) {
            setFormData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                bio: userProfile.bio || '',
                graduationYear: userProfile.graduationYear?.toString() || '',
                branch: userProfile.branch || '',
                githubUrl: userProfile.githubUrl || '',
                linkedinUrl: userProfile.linkedinUrl || '',
                portfolioUrl: userProfile.portfolioUrl || '',
                availabilityStatus: userProfile.availabilityStatus || 'AVAILABLE'
            });
        }
    }, [userProfile, currentUser]);

    function handleInputChange(e) {
        const { name, value } = e.target;
        console.log('Input change:', name, value);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleSelectChange(name, value) {
        console.log('Select change:', name, value);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSave() {
        try {
            console.log('=== PROFILE UPDATE DEBUG ===');
            console.log('currentUser:', currentUser);
            console.log('userProfile:', userProfile);
            console.log('formData before processing:', formData);

            setError('');
            setMessage('');
            setLoading(true);

            // Validate user authentication
            if (!currentUser || !currentUser.id) {
                throw new Error('User not authenticated. Please log in again.');
            }

            // Validate required fields
            if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
                throw new Error('First name and last name are required');
            }

            // Prepare update data - match your backend entity fields
            const updates = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                bio: formData.bio?.trim() || '',
                branch: formData.branch?.trim() || '',
                githubUrl: formData.githubUrl?.trim() || '',
                linkedinUrl: formData.linkedinUrl?.trim() || '',
                portfolioUrl: formData.portfolioUrl?.trim() || '',
                availabilityStatus: formData.availabilityStatus || 'AVAILABLE'
            };

            // Add graduation year if provided
            if (formData.graduationYear && !isNaN(parseInt(formData.graduationYear))) {
                updates.graduationYear = parseInt(formData.graduationYear);
            }

            console.log('Final updates object:', updates);
            console.log('User ID for update:', currentUser.id);

            // Call the update function - DO NOT pass userId here, it's handled in AuthContext
            await updateUserProfile(updates);
            
            setMessage('Profile updated successfully!');
            setIsEditing(false);
            
        } catch (error) {
            console.error('Profile update error:', error);
            setError(error.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        // Reset form data to original values
        if (userProfile) {
            setFormData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                bio: userProfile.bio || '',
                graduationYear: userProfile.graduationYear?.toString() || '',
                branch: userProfile.branch || '',
                githubUrl: userProfile.githubUrl || '',
                linkedinUrl: userProfile.linkedinUrl || '',
                portfolioUrl: userProfile.portfolioUrl || '',
                availabilityStatus: userProfile.availabilityStatus || 'AVAILABLE'
            });
        }
        setIsEditing(false);
        setError('');
        setMessage('');
    }

    const getInitials = () => {
        const first = formData.firstName || userProfile?.firstName || '';
        const last = formData.lastName || userProfile?.lastName || '';
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    const currentAvailability = availabilityOptions.find(
        option => option.value === (userProfile?.availabilityStatus || 'AVAILABLE')
    );

    // Show loading or login prompt
    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            Please log in to access your profile.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                    <div className="space-y-6">
                        {/* Profile Header Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={userProfile?.profilePictureUrl} />
                                            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {userProfile?.firstName} {userProfile?.lastName}
                                                <Badge 
                                                    variant="secondary" 
                                                    className={`${currentAvailability?.color} text-white`}
                                                >
                                                    {currentAvailability?.label}
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Mail className="h-4 w-4" />
                                                {userProfile?.email}
                                            </CardDescription>
                                            {userProfile?.branch && (
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <BookOpen className="h-4 w-4" />
                                                    {userProfile.branch} • Class of {userProfile.graduationYear}
                                                </CardDescription>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant={isEditing ? "outline" : "default"}
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="gap-2"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Alerts */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {message && (
                            <Alert>
                                <AlertDescription className="text-green-600">{message}</AlertDescription>
                            </Alert>
                        )}

                        {/* Profile Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Details</CardTitle>
                                <CardDescription>
                                    {isEditing ? 'Update your personal information' : 'Your personal information'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="branch">Branch</Label>
                                        <Select
                                            value={formData.branch}
                                            onValueChange={(value) => handleSelectChange('branch', value)}
                                            disabled={!isEditing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branches.map((branch) => (
                                                    <SelectItem key={branch} value={branch}>
                                                        {branch}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="graduationYear">Graduation Year</Label>
                                        <Select
                                            value={formData.graduationYear}
                                            onValueChange={(value) => handleSelectChange('graduationYear', value)}
                                            disabled={!isEditing}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select graduation year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {graduationYears.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="availabilityStatus">Availability Status</Label>
                                    <Select
                                        value={formData.availabilityStatus}
                                        onValueChange={(value) => handleSelectChange('availabilityStatus', value)}
                                        disabled={!isEditing}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select availability" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availabilityOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Links Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Social Links</CardTitle>
                                <CardDescription>
                                    Connect your social profiles
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="githubUrl" className="flex items-center gap-2">
                                        <Github className="h-4 w-4" />
                                        GitHub URL
                                    </Label>
                                    <Input
                                        id="githubUrl"
                                        name="githubUrl"
                                        value={formData.githubUrl}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="https://github.com/yourusername"
                                        type="url"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn URL
                                    </Label>
                                    <Input
                                        id="linkedinUrl"
                                        name="linkedinUrl"
                                        value={formData.linkedinUrl}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="https://linkedin.com/in/yourusername"
                                        type="url"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="portfolioUrl" className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Portfolio URL
                                    </Label>
                                    <Input
                                        id="portfolioUrl"
                                        name="portfolioUrl"
                                        value={formData.portfolioUrl}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="https://yourportfolio.com"
                                        type="url"
                                    />
                                </div>
                            </CardContent>

                            {isEditing && (
                                <CardContent className="pt-0">
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={handleCancel}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="skills">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Expertise</CardTitle>
                            <CardDescription>
                                Manage your skills and proficiency levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SkillsManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderOpen className="h-5 w-5" />
                                Projects
                            </CardTitle>
                            <CardDescription>
                                Showcase your projects and contributions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No projects yet.</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first project to get started!
                                </p>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Project
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}