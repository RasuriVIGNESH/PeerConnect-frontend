import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming Tabs component from UI library
import {
    User, Mail, GraduationCap, BookOpen, Github, Linkedin, Globe, Camera, Plus, X, Save, Edit3, FolderOpen,
    CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';

// --- CONSTANTS ---
const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 8 }, (_, i) => currentYear + i);

const branches = [
    'Computer Science', 'Information Technology', 'Electronics and Communication',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Chemical Engineering', 'Biotechnology', 'Business Administration',
    'Economics', 'Mathematics', 'Physics', 'Chemistry', 'Other'
];

const availabilityOptions = [
    { value: 'AVAILABLE', label: 'Available', color: 'bg-green-600' },
    { value: 'BUSY', label: 'Busy', color: 'bg-yellow-600' },
    { value: 'OFFLINE', label: 'Offline', color: 'bg-gray-500' }
];

// --- UTILITY FUNCTIONS ---
const getInitials = (userProfile, formData) => {
    const first = formData.firstName || userProfile?.firstName || '';
    const last = formData.lastName || userProfile?.lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};

const getAvailability = (userProfile) => {
    return availabilityOptions.find(
        option => option.value === (userProfile?.availabilityStatus || 'AVAILABLE')
    );
};

// --- MAIN COMPONENT ---
export default function ProfilePage() {
    const { currentUser, userProfile, updateUserProfile, fetchUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPictureInput, setShowPictureInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // State for active tab
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', bio: '', profilePictureUrl: '',
        graduationYear: '', branch: '', githubUrl: '', linkedinUrl: '',
        portfolioUrl: '', availabilityStatus: 'AVAILABLE', collegeName: ''
    });

    // Initialize form data when user profile loads
    useEffect(() => {
        if (userProfile) {
            setFormData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                bio: userProfile.bio || '',
                profilePictureUrl: userProfile.profilePictureUrl || '',
                graduationYear: userProfile.graduationYear?.toString() || '',
                branch: userProfile.branch || '',
                githubUrl: userProfile.githubUrl || '',
                linkedinUrl: userProfile.linkedinUrl || '',
                portfolioUrl: userProfile.portfolioUrl || '',
                availabilityStatus: userProfile.availabilityStatus || 'AVAILABLE',
                collegeName: userProfile.college?.name || ''
            });
        }
    }, [userProfile]);

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function handleSelectChange(name, value) {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    // --- Photo Handlers (Simplified for brevity, functionality preserved) ---
    async function handleUploadPhoto() {
        if (!photoFile) return;

        try {
            setPhotoLoading(true);
            setError('');
            setMessage('');

            await userService.uploadProfilePicture(photoFile);

            // Refresh profile to get the new photo
            await fetchUserProfile(currentUser.id);

            setMessage('Profile photo uploaded successfully!');
            setPhotoFile(null);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Photo upload error:', error);
            setError(error.message || 'Failed to upload photo');
        } finally {
            setPhotoLoading(false);
        }
    }

    async function handleDeletePhoto() {
        try {
            setPhotoLoading(true);
            setError('');
            setMessage('');

            await userService.deleteProfilePhoto();

            // Refresh profile
            await fetchUserProfile(currentUser.id);

            setMessage('Profile photo removed successfully!');

        } catch (error) {
            console.error('Photo delete error:', error);
            setError(error.message || 'Failed to delete photo');
        } finally {
            setPhotoLoading(false);
        }
    }

    // --- Save/Cancel Handlers (Functionality preserved) ---
    async function handleSave() {
        try {
            setError('');
            setMessage('');
            setLoading(true);

            if (!currentUser) {
                throw new Error('User not authenticated. Please log in again.');
            }
            if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
                throw new Error('First name and last name are required');
            }

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

            if (formData.graduationYear && !isNaN(parseInt(formData.graduationYear))) {
                updates.graduationYear = parseInt(formData.graduationYear);
            }

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
                profilePictureUrl: userProfile.profilePictureUrl || '',
                graduationYear: userProfile.graduationYear?.toString() || '',
                branch: userProfile.branch || '',
                githubUrl: userProfile.githubUrl || '',
                linkedinUrl: userProfile.linkedinUrl || '',
                portfolioUrl: userProfile.portfolioUrl || '',
                availabilityStatus: userProfile.availabilityStatus || 'AVAILABLE',
                collegeName: userProfile.college?.name || ''
            });
        }
        setIsEditing(false);
        setError('');
        setMessage('');
    }

    const currentAvailability = getAvailability(userProfile);

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md shadow-lg">
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">
                            Please log in to access your profile.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- RENDER ---
    return (
        // Full screen container with fixed height to prevent scrolling
        <div className="h-screen w-full bg-gray-50 flex items-center justify-center p-8">
            <Card className="w-full max-w-6xl h-full shadow-2xl flex flex-col md:flex-row-reverse overflow-hidden">
                {/* Left Column: Details/Edit Form (70% width) */}
                <div className="flex-1 p-6 overflow-y-auto border-r border-blue-700/10">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Edit Profile' : 'Profile Details'}
                        </h2>
                        <Button
                            variant={isEditing ? "outline" : "default"}
                            onClick={() => {
                                if (isEditing) handleCancel();
                                setIsEditing(!isEditing);
                            }}
                            className="gap-2 transition-all duration-300"
                        >
                            <Edit3 className="h-4 w-4" />
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {message && (
                        <Alert className="mb-4 bg-green-50 border-green-200 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    {isEditing ? (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 h-10">
                                <TabsTrigger value="details">Personal Info</TabsTrigger>
                                <TabsTrigger value="social">Social Links</TabsTrigger>
                                <TabsTrigger value="photo">Photo Management</TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Personal Info */}
                            <TabsContent value="details" className="mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." rows={3} />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="branch">Branch</Label>
                                        <Select value={formData.branch} onValueChange={(value) => handleSelectChange('branch', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                                            <SelectContent>
                                                {branches.map((branch) => (<SelectItem key={branch} value={branch}>{branch}</SelectItem>))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="graduationYear">Graduation Year</Label>
                                        <Select value={formData.graduationYear} onValueChange={(value) => handleSelectChange('graduationYear', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                                            <SelectContent>
                                                {graduationYears.map((year) => (<SelectItem key={year} value={year.toString()}>{year}</SelectItem>))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="availabilityStatus">Availability</Label>
                                        <Select value={formData.availabilityStatus} onValueChange={(value) => handleSelectChange('availabilityStatus', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger>
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
                                </div>
                            </TabsContent>

                            {/* Tab 2: Social Links */}
                            <TabsContent value="social" className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="githubUrl" className="flex items-center gap-2"><Github className="h-4 w-4 text-gray-500" /> GitHub URL</Label>
                                    <Input id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="https://github.com/yourusername" type="url" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linkedinUrl" className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-gray-500" /> LinkedIn URL</Label>
                                    <Input id="linkedinUrl" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="https://linkedin.com/in/yourusername" type="url" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolioUrl" className="flex items-center gap-2"><Globe className="h-4 w-4 text-gray-500" /> Portfolio URL</Label>
                                    <Input id="portfolioUrl" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} placeholder="https://yourportfolio.com" type="url" />
                                </div>
                            </TabsContent>

                            {/* Tab 3: Photo Management */}
                            <TabsContent value="photo" className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="profilePhoto">Upload New Profile Photo</Label>
                                    <Input
                                        ref={fileInputRef}
                                        id="profilePhoto"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" onClick={handleUploadPhoto} disabled={photoLoading || !photoFile} className="bg-blue-700 hover:bg-blue-800 transition-colors duration-300">
                                            {photoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                                            {photoLoading ? 'Uploading...' : 'Upload Photo'}
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={handleDeletePhoto} disabled={photoLoading || !userProfile?.profilePictureUrl} className="transition-colors duration-300">
                                            <X className="h-4 w-4 mr-2" />
                                            Delete Current Photo
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Save Button for Edit Mode */}
                            <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                                <Button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="gap-2 bg-blue-700 hover:bg-blue-800 transition-colors duration-300"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </Tabs>
                    ) : (
                        // View Mode - Simplified and condensed display
                        <div className="space-y-6">
                            <Card className="shadow-none border-l-4 border-blue-700">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold text-gray-700">About Me</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 italic">{userProfile?.bio || "No bio provided."}</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-none border-l-4 border-green-600">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold text-gray-700">Academic Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-gray-500" /> <span>Branch: {userProfile?.branch || "N/A"}</span></div>
                                    <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-gray-500" /> <span>Graduation: {userProfile?.graduationYear || "N/A"}</span></div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-none border-l-4 border-indigo-600">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold text-gray-700">Social Presence</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                                    {userProfile?.githubUrl && <a href={userProfile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><Github className="h-4 w-4" /> GitHub</a>}
                                    {userProfile?.linkedinUrl && <a href={userProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><Linkedin className="h-4 w-4" /> LinkedIn</a>}
                                    {userProfile?.portfolioUrl && <a href={userProfile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><Globe className="h-4 w-4" /> Portfolio</a>}
                                    {(!userProfile?.githubUrl && !userProfile?.linkedinUrl && !userProfile?.portfolioUrl) && <p className="text-gray-500 italic col-span-3">No social links provided.</p>}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Column: Profile Summary (30% width) - Always Visible */}
                <div className="w-full md:w-80 bg-blue-700/5 p-6 flex flex-col items-center justify-center">
                    <div className="text-center">
                        <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-blue-700/20 hover:ring-blue-700/50 transition-all duration-500">
                            <AvatarImage src={userProfile?.profilePictureUrl} />
                            <AvatarFallback className="text-3xl bg-blue-700 text-white">{getInitials(userProfile, formData)}</AvatarFallback>
                        </Avatar>

                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            {userProfile?.firstName} {userProfile?.lastName}
                        </h3>

                        <Badge
                            className={`text-white text-sm font-medium mb-4 ${currentAvailability?.color} transition-colors duration-300`}
                        >
                            {currentAvailability?.label}
                        </Badge>

                        <p className="text-sm text-gray-600 flex items-center justify-center gap-2 mb-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            {userProfile?.email}
                        </p>

                        {userProfile?.collegeName && (
                            <p className="text-sm text-gray-600 flex items-center justify-center gap-2 mb-2">
                                <GraduationCap className="h-4 w-4 text-gray-500" />
                                {userProfile.collegeName}
                            </p>
                        )}

                        <div className="mt-6 pt-4 border-t border-blue-700/10">
                            <p className="text-xs text-gray-500 italic">
                                Last updated: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
