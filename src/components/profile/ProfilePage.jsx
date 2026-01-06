import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User, Mail, GraduationCap, BookOpen, Github, Linkedin, Globe, Camera,
    X, Save, Edit3, CheckCircle, AlertTriangle, Loader2, Sparkles, MapPin,
    Briefcase, Link as LinkIcon, Trash2
} from 'lucide-react';

// --- Constants ---
const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 8 }, (_, i) => currentYear + i);
const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business', 'Other'];
const availabilityOptions = [
    { value: 'AVAILABLE', label: 'Active Now', color: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
    { value: 'BUSY', label: 'Busy', color: 'bg-amber-500', shadow: 'shadow-amber-200' },
    { value: 'OFFLINE', label: 'Offline', color: 'bg-slate-400', shadow: 'shadow-slate-200' }
];

export default function ProfilePage() {
    const { currentUser, userProfile, updateUserProfile, fetchUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', bio: '', graduationYear: '',
        branch: '', githubUrl: '', linkedinUrl: '', portfolioUrl: '',
        availabilityStatus: 'AVAILABLE'
    });

    useEffect(() => {
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
                availabilityStatus: userProfile.availabilityStatus || 'AVAILABLE',
            });
        }
    }, [userProfile]);

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    const handleSave = async () => {
        try {
            setLoading(true); setError(''); setMessage('');
            const updates = { ...formData, graduationYear: parseInt(formData.graduationYear) };
            await updateUserProfile(updates);
            setMessage('Profile optimized successfully!');
            setIsEditing(false);
        } catch (err) { setError(err.message || 'Update failed'); }
        finally { setLoading(false); }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setPhotoLoading(true);
            await userService.uploadProfilePicture(file);
            await fetchUserProfile(currentUser.id);
            setMessage('Identity photo updated!');
        } catch (err) { setError('Photo upload failed'); }
        finally { setPhotoLoading(false); }
    };

    const currentAvail = availabilityOptions.find(o => o.value === formData.availabilityStatus);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden font-sans">

            {/* --- LEFT SIDE: IDENTITY SIDEBAR --- */}
            <aside className="w-full md:w-[380px] bg-slate-900 flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 space-y-6 w-full">
                    {/* Avatar with Status Pulse */}
                    <div className="relative mx-auto w-40 h-40">
                        <div className={`absolute inset-0 rounded-full border-4 ${currentAvail?.color} opacity-20 animate-ping`} />
                        <Avatar className="h-40 w-40 ring-4 ring-white/10 shadow-2xl relative">
                            <AvatarImage src={userProfile?.profilePictureUrl} className="object-cover" />
                            <AvatarFallback className="bg-indigo-600 text-white text-4xl font-black">
                                {formData.firstName?.[0]}{formData.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>

                        <label className="absolute bottom-1 right-1 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-lg">
                            <Camera size={18} />
                            <input type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
                        </label>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white tracking-tight">
                            {userProfile?.firstName} {userProfile?.lastName}
                        </h2>
                        <Badge className={`${currentAvail?.color} text-white border-none px-4 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest`}>
                            {currentAvail?.label}
                        </Badge>
                    </div>

                    <div className="pt-6 space-y-4 text-slate-400 text-sm font-medium">
                        <div className="flex items-center justify-center gap-3">
                            <Mail size={16} className="text-indigo-400" /> {userProfile?.email}
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <GraduationCap size={16} className="text-indigo-400" /> {userProfile?.collegeName || 'Verified Student'}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-8">
                        {userProfile?.githubUrl && <a href={userProfile.githubUrl} target="_blank" className="p-3 bg-white/5 rounded-2xl text-white hover:bg-indigo-600 transition-colors"><Github size={20} /></a>}
                        {userProfile?.linkedinUrl && <a href={userProfile.linkedinUrl} target="_blank" className="p-3 bg-white/5 rounded-2xl text-white hover:bg-indigo-600 transition-colors"><Linkedin size={20} /></a>}
                        {userProfile?.portfolioUrl && <a href={userProfile.portfolioUrl} target="_blank" className="p-3 bg-white/5 rounded-2xl text-white hover:bg-indigo-600 transition-colors"><Globe size={20} /></a>}
                    </div>
                </div>
            </aside>

            {/* --- RIGHT SIDE: CONTENT FEED --- */}
            <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 lg:p-16">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Digital Profile</h1>
                            <p className="text-slate-500 font-medium">Manage your professional presence across PeerConnect.</p>
                        </div>
                        <Button
                            onClick={() => { if (isEditing) handleSave(); else setIsEditing(true); }}
                            className={`${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} rounded-2xl h-12 px-8 font-bold shadow-xl shadow-indigo-200 transition-all`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
                            {isEditing ? 'Save Identity' : 'Customize Profile'}
                        </Button>
                    </div>

                    {/* Feedback Alerts */}
                    <AnimatePresence>
                        {message && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Alert className="mb-6 bg-emerald-50 border-emerald-100 text-emerald-700 rounded-2xl"><CheckCircle className="h-4 w-4" /> <AlertDescription>{message}</AlertDescription></Alert>
                            </motion.div>
                        )}
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <Alert variant="destructive" className="mb-6 rounded-2xl"><AlertTriangle className="h-4 w-4" /> <AlertDescription>{error}</AlertDescription></Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* CONTENT BENTO GRID */}
                    <AnimatePresence mode="wait">
                        {!isEditing ? (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                <Card className="md:col-span-2 border-none shadow-sm rounded-[32px] p-10 bg-white">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bio & Introduction</h4>
                                    <p className="text-xl text-slate-700 font-medium leading-relaxed italic">
                                        "{userProfile?.bio || "No professional summary provided yet."}"
                                    </p>
                                </Card>

                                <Card className="border-none shadow-sm rounded-[32px] p-8 bg-white flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Education</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BookOpen size={20} /></div>
                                                <div><p className="text-xs text-slate-400 font-bold">Branch</p><p className="font-bold text-slate-800">{userProfile?.branch || 'N/A'}</p></div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><GraduationCap size={20} /></div>
                                                <div><p className="text-xs text-slate-400 font-bold">Graduation Year</p><p className="font-bold text-slate-800">{userProfile?.graduationYear || 'N/A'}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="border-none shadow-sm rounded-[32px] p-8 bg-white overflow-hidden relative group">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Network Health</h4>
                                    <div className="text-center py-4">
                                        <div className="text-5xl font-black text-indigo-600 mb-2">{userProfile?.connectionCount || 0}</div>
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Global Connections</p>
                                    </div>
                                    <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Tabs defaultValue="details" className="w-full">
                                    <TabsList className="bg-slate-100 p-2 rounded-2xl mb-8">
                                        <TabsTrigger value="details" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Personal</TabsTrigger>
                                        <TabsTrigger value="social" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Socials</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-700 ml-1">First Name</Label>
                                                <Input name="firstName" value={formData.firstName} onChange={handleInputChange} className="h-14 rounded-2xl bg-white border-slate-200" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-700 ml-1">Last Name</Label>
                                                <Input name="lastName" value={formData.lastName} onChange={handleInputChange} className="h-14 rounded-2xl bg-white border-slate-200" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold text-slate-700 ml-1">Bio</Label>
                                            <Textarea name="bio" value={formData.bio} onChange={handleInputChange} className="rounded-2xl bg-white border-slate-200 min-h-[120px]" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-700 ml-1">Availability</Label>
                                                <Select value={formData.availabilityStatus} onValueChange={(v) => handleSelectChange('availabilityStatus', v)}>
                                                    <SelectTrigger className="h-14 rounded-2xl bg-white"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {availabilityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-700 ml-1">Graduation</Label>
                                                <Select value={formData.graduationYear} onValueChange={(v) => handleSelectChange('graduationYear', v)}>
                                                    <SelectTrigger className="h-14 rounded-2xl bg-white"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {graduationYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-bold text-slate-700 ml-1">Branch</Label>
                                                <Select value={formData.branch} onValueChange={(v) => handleSelectChange('branch', v)}>
                                                    <SelectTrigger className="h-14 rounded-2xl bg-white"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="social" className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="font-bold text-slate-700 ml-1">GitHub Portfolio</Label>
                                            <Input name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="https://github.com/..." className="h-14 rounded-2xl bg-white border-slate-200" />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="font-bold text-slate-700 ml-1">LinkedIn Profile</Label>
                                            <Input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className="h-14 rounded-2xl bg-white border-slate-200" />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="font-bold text-slate-700 ml-1">Personal Website</Label>
                                            <Input name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} placeholder="https://..." className="h-14 rounded-2xl bg-white border-slate-200" />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}