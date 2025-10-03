import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Plus,
    X,
    Search,
    Star,
    TrendingUp,
    Code,
    Palette,
    BarChart3,
    Smartphone,
    Settings,
    Trash2
} from 'lucide-react';
import skillsService from '../../services/skillsService';

export default function SkillsManager() {
    const { currentUser } = useAuth();
    const [predefinedSkills, setPredefinedSkills] = useState([]);
    const [userSkills, setUserSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const proficiencyLevels = [
        { value: 'BEGINNER', label: 'Beginner', color: 'bg-gray-500' },
        { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-blue-500' },
        { value: 'ADVANCED', label: 'Advanced', color: 'bg-green-500' },
        { value: 'EXPERT', label: 'Expert', color: 'bg-purple-500' }
    ];

    const categoryIcons = {
        'Programming': <Code className="h-4 w-4" />,
        'Design': <Palette className="h-4 w-4" />,
        'Data': <BarChart3 className="h-4 w-4" />,
        'Mobile': <Smartphone className="h-4 w-4" />,
        'Other': <Settings className="h-4 w-4" />
    };

    const skillCategories = [
        'Programming',
        'Design',
        'Data',
        'Mobile',
        'DevOps',
        'Testing',
        'Project Management',
        'Other'
    ];

    // Load predefined skills and user skills
    useEffect(() => {
        const initializeSkills = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                console.log('Initializing skills for user:', currentUser.id);

                // Load predefined skills and user skills in parallel
                await Promise.all([
                    loadPredefinedSkills(),
                    loadUserSkills()
                ]);

            } catch (error) {
                console.error('Error initializing skills:', error);
                setError('Failed to load skills. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        initializeSkills();
    }, [currentUser]);

    // Load predefined skills from backend
    const loadPredefinedSkills = async () => {
        try {
            console.log('Loading predefined skills...');
            const response = await skillsService.getPredefinedSkills();
            console.log('Predefined skills response:', response);

            if (response && response.data) {
                setPredefinedSkills(response.data);
            } else {
                setPredefinedSkills(response || []);
            }
        } catch (error) {
            console.error('Error loading predefined skills:', error);
            setError('Failed to load predefined skills.');
        }
    };

    // Load user skills from backend
    const loadUserSkills = async () => {
        try {
            if (!currentUser || !currentUser.id) {
                console.error('No current user or user ID');
                return;
            }

            console.log('Loading user skills for:', currentUser.id);
            const response = await skillsService.getUserSkills(currentUser.id);
            console.log('User skills response:', response);

            if (response && response.data) {
                setUserSkills(response.data);
            } else {
                setUserSkills(response || []);
            }
        } catch (error) {
            console.error('Error loading user skills:', error);
            setError('Failed to load your skills.');
        }
    };

    // Add skill to user profile
    const addSkill = async (skillName, skillCategory, level = 'BEGINNER') => {
        try {
            if (!currentUser || !currentUser.id) {
                throw new Error('User not authenticated');
            }

            console.log('Adding skill:', {
                skillName,
                skillCategory,
                level,
                userId: currentUser.id
            });

            const skillData = {
                skillName: skillName.trim(),
                category: skillCategory,
                level: level,
                yearsOfExperience: 0
            };

            const response = await skillsService.addUserSkill(skillData);
            console.log('Add skill response:', response);

            // Reload user skills to get the updated list
            await loadUserSkills();
            
            setMessage('Skill added successfully!');
            clearMessages();

        } catch (error) {
            console.error('Error adding skill:', error);
            setError(error.message || 'Failed to add skill');
            clearMessages();
        }
    };

    // Update skill level
    const updateSkillLevel = async (userSkillId, newLevel) => {
        try {
            console.log('Updating skill level:', userSkillId, newLevel);

            const skillData = {
                level: newLevel
            };

            await skillsService.updateUserSkill(userSkillId, skillData);
            
            // Reload user skills to reflect changes
            await loadUserSkills();
            
            setMessage('Skill level updated!');
            clearMessages();

        } catch (error) {
            console.error('Error updating skill level:', error);
            setError('Failed to update skill level');
            clearMessages();
        }
    };

    // Remove skill from user profile
    const removeSkill = async (userSkillId) => {
        try {
            console.log('Removing skill:', userSkillId);
            
            await skillsService.deleteUserSkill(userSkillId);
            
            // Reload user skills to reflect changes
            await loadUserSkills();
            
            setMessage('Skill removed successfully!');
            clearMessages();

        } catch (error) {
            console.error('Error removing skill:', error);
            setError('Failed to remove skill');
            clearMessages();
        }
    };

    // Handle adding predefined skill
    const handleAddPredefinedSkill = async (skill, level) => {
        await addSkill(skill.name, skill.category, level);
    };

    // Handle adding custom skill
    const handleAddCustomSkill = async () => {
        if (!newSkillName.trim() || !newSkillCategory) {
            setError('Please provide skill name and category');
            return;
        }

        await addSkill(newSkillName, newSkillCategory, 'BEGINNER');
        
        // Reset form
        setNewSkillName('');
        setNewSkillCategory('');
        setIsAddDialogOpen(false);
    };

    // Clear messages after delay
    const clearMessages = () => {
        setTimeout(() => {
            setMessage('');
            setError('');
        }, 3000);
    };

    // Filter predefined skills
    const filteredPredefinedSkills = predefinedSkills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
        const notAlreadyAdded = !userSkills.some(userSkill => 
            userSkill.skill && userSkill.skill.name.toLowerCase() === skill.name.toLowerCase()
        );
        return matchesSearch && matchesCategory && notAlreadyAdded;
    });

    // Get unique categories from predefined skills
    const availableCategories = [...new Set(predefinedSkills.map(skill => skill.category))];

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading skills...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
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

            {/* User Skills Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Your Skills ({userSkills.length})
                    </CardTitle>
                    <CardDescription>
                        Manage your skills and proficiency levels
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {userSkills.length === 0 ? (
                        <div className="text-center py-8">
                            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No skills added yet.</h3>
                            <p className="text-muted-foreground mb-4">
                                Add your first skill to get started!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userSkills.map((userSkill) => {
                                const levelInfo = proficiencyLevels.find(level => 
                                    level.value === userSkill.level
                                );
                                
                                return (
                                    <Card key={userSkill.id} className="relative">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {categoryIcons[userSkill.skill?.category] || 
                                                     categoryIcons['Other']}
                                                    <h4 className="font-medium">
                                                        {userSkill.skill?.name || userSkill.skillName}
                                                    </h4>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSkill(userSkill.id)}
                                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {userSkill.skill?.category || 'Other'}
                                            </p>
                                            
                                            <div className="space-y-2">
                                                <Label className="text-xs">Proficiency Level</Label>
                                                <Select
                                                    value={userSkill.level}
                                                    onValueChange={(newLevel) => 
                                                        updateSkillLevel(userSkill.id, newLevel)
                                                    }
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {proficiencyLevels.map((level) => (
                                                            <SelectItem key={level.value} value={level.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${level.color}`}></div>
                                                                    {level.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Skills Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Add New Skills
                    </CardTitle>
                    <CardDescription>
                        Choose from predefined skills or add your own
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {availableCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {/* Add Custom Skill Dialog */}
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Custom
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Custom Skill</DialogTitle>
                                    <DialogDescription>
                                        Add a skill that's not in our predefined list
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="skillName">Skill Name</Label>
                                        <Input
                                            id="skillName"
                                            value={newSkillName}
                                            onChange={(e) => setNewSkillName(e.target.value)}
                                            placeholder="e.g., React Native"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="skillCategory">Category</Label>
                                        <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {skillCategories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddCustomSkill}>
                                            Add Skill
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Predefined Skills Grid */}
                    {filteredPredefinedSkills.length === 0 ? (
                        <div className="text-center py-8">
                            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm || selectedCategory !== 'all' 
                                    ? 'No skills found matching your criteria.'
                                    : 'No predefined skills available.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPredefinedSkills.map((skill) => (
                                <Card key={skill.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            {categoryIcons[skill.category] || categoryIcons['Other']}
                                            <h4 className="font-medium">{skill.name}</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {skill.category}
                                        </p>
                                        <Select
                                            onValueChange={(level) => handleAddPredefinedSkill(skill, level)}
                                            defaultValue=""
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select level & add" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {proficiencyLevels.map((level) => (
                                                    <SelectItem key={level.value} value={level.value}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${level.color}`}></div>
                                                            {level.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}