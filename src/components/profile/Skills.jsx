import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  TrendingUp,
  Plus,
  Search,
  ArrowLeft,
  Star,
  BookOpen,
  Award,
  Target,
  Edit3,
  Trash2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import skillsService from '../../services/skillsService';

export default function Skills() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State for user skills and predefined skills
  const [userSkills, setUserSkills] = useState([]);
  const [predefinedSkills, setPredefinedSkills] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);

  // New State for Static Predefined Skills (Autocomplete)
  const [staticSkillList, setStaticSkillList] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Loading and UI states
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);

  // Add skill form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('BEGINNER');
  const [newSkillExperience, setNewSkillExperience] = useState('');

  // Messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Proficiency levels mapping
  const proficiencyLevels = [
    { value: 'BEGINNER', label: 'Beginner', color: 'bg-gray-500', percentage: 25 },
    { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-blue-500', percentage: 50 },
    { value: 'ADVANCED', label: 'Advanced', color: 'bg-green-500', percentage: 75 },
    { value: 'EXPERT', label: 'Expert', color: 'bg-purple-500', percentage: 90 }
  ];

  // Initialize data on component mount
  useEffect(() => {
    if (currentUser) {
      initializeSkills();
    }
  }, [currentUser]);

  const initializeSkills = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserSkills(),
        loadPredefinedSkills(),
        loadSkillCategories(),
        loadStaticSkillList() // Fetch new static list
      ]);
    } catch (error) {
      console.error('Error initializing skills:', error);
      setError('Failed to load skills data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load user's skills
  const loadUserSkills = async () => {
    try {
      const response = await skillsService.getUserSkills();
      const skills = response?.data || response || [];
      setUserSkills(skills);
    } catch (error) {
      console.error('Error loading user skills:', error);
      throw error;
    }
  };

  // Load predefined skills for adding new ones (existing method)
  const loadPredefinedSkills = async () => {
    try {
      const response = await skillsService.getPredefinedSkills();
      const rawSkills = response?.data || response || [];

      // Normalize to objects with name and id (if missing) to prevent crashes
      const skills = rawSkills.map((s, index) => {
        if (typeof s === 'string') {
          return { id: `static-${index}-${s}`, name: s };
        }
        return s;
      });

      setPredefinedSkills(skills);
    } catch (error) {
      console.error('Error loading predefined skills:', error);
    }
  };

  // NEW: Load Static Skill List for Autocomplete
  const loadStaticSkillList = async () => {
    try {
      const response = await skillsService.getStaticPredefinedSkills();
      const skills = response?.data || response || [];
      // Ensure we are working with an array of strings or objects. 
      // If objects, we map to names, if strings we keep as is.
      const formattedSkills = skills.map(s => (typeof s === 'string' ? s : s.name));
      setStaticSkillList(formattedSkills);
    } catch (error) {
      console.error('Error loading static skill list:', error);
    }
  };

  // Load skill categories
  const loadSkillCategories = async () => {
    try {
      const response = await skillsService.getSkillsByCategory();
      const categories = response?.data || response || [];
      setSkillCategories(categories);
    } catch (error) {
      console.error('Error loading skill categories:', error);
      setSkillCategories([
        'Programming', 'Design', 'Data Science', 'Mobile Development',
        'DevOps', 'Testing', 'Project Management', 'Other'
      ]);
    }
  };

  // Handle input change for skill name with autocomplete
  const handleSkillNameChange = (e) => {
    const value = e.target.value;
    setNewSkillName(value);

    if (value.length > 0) {
      const filtered = staticSkillList.filter(
        (skill) => skill.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle selection from autocomplete
  const handleSuggestionClick = (skill) => {
    setNewSkillName(skill);
    setShowSuggestions(false);
  };

  // Add new skill
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      setError('Please enter a skill name');
      return;
    }

    // Check if skill already exists
    const skillExists = userSkills.some(
      userSkill => userSkill.skill?.name?.toLowerCase() === newSkillName.toLowerCase()
    );

    if (skillExists) {
      setError('You already have this skill in your profile');
      return;
    }

    try {
      setAddingSkill(true);

      const skillData = {
        skillName: newSkillName.trim(),
        level: newSkillLevel,
        experience: newSkillExperience.trim() || '0'
      };

      await skillsService.addUserSkill(skillData);

      // Reload user skills
      await loadUserSkills();

      // Reset form
      setNewSkillName('');
      setNewSkillCategory('');
      setNewSkillLevel('BEGINNER');
      setNewSkillExperience('');
      setShowAddSkill(false);
      setShowSuggestions(false);

      setMessage('Skill added successfully!');
      clearMessages();

    } catch (error) {
      console.error('Error adding skill:', error);
      setError(error.message || 'Failed to add skill');
      clearMessages();
    } finally {
      setAddingSkill(false);
    }
  };

  // Update skill level
  const handleUpdateSkillLevel = async (userSkillId, newLevel) => {
    try {
      const skillData = {
        level: newLevel,
        experience: '0'
      };

      await skillsService.updateUserSkill(userSkillId, skillData);
      await loadUserSkills();

      setMessage('Skill level updated!');
      clearMessages();
    } catch (error) {
      console.error('Error updating skill:', error);
      setError('Failed to update skill level');
      clearMessages();
    }
  };

  // Remove skill
  const handleRemoveSkill = async (userSkillId) => {
    try {
      await skillsService.deleteUserSkill(userSkillId);
      await loadUserSkills();

      setMessage('Skill removed successfully!');
      clearMessages();
    } catch (error) {
      console.error('Error removing skill:', error);
      setError('Failed to remove skill');
      clearMessages();
    }
  };

  // Add predefined skill (from sidebar)
  const handleAddPredefinedSkill = async (predefinedSkill, level) => {
    try {
      const skillData = {
        skillName: predefinedSkill.name,
        level: level,
        experience: '0'
      };

      await skillsService.addUserSkill(skillData);
      await loadUserSkills();

      setMessage('Skill added successfully!');
      clearMessages();
    } catch (error) {
      console.error('Error adding predefined skill:', error);
      setError(error.message || 'Failed to add skill');
      clearMessages();
    }
  };

  // Clear messages after delay
  const clearMessages = () => {
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 3000);
  };

  // Get proficiency info for a skill level
  const getProficiencyInfo = (level) => {
    return proficiencyLevels.find(p => p.value === level) || proficiencyLevels[0];
  };

  // Filter user skills based on search
  const filteredUserSkills = userSkills.filter(userSkill => {
    const skillName = userSkill.skill?.name || userSkill.skillName || '';
    const skillCategory = userSkill.skill?.category || '';
    const searchLower = searchTerm.toLowerCase();

    return skillName.toLowerCase().includes(searchLower) ||
      skillCategory.toLowerCase().includes(searchLower);
  });

  // Group skills by category
  const skillsByCategory = filteredUserSkills.reduce((acc, userSkill) => {
    const category = userSkill.skill?.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(userSkill);
    return acc;
  }, {});

  // Get available predefined skills (not already added by user)
  const availablePredefinedSkills = predefinedSkills.filter(predefinedSkill => {
    const predefinedName = typeof predefinedSkill === 'string' ? predefinedSkill : predefinedSkill?.name;

    if (!predefinedName) return false;

    return !userSkills.some(userSkill => {
      const userSkillName = userSkill.skill?.name || userSkill.skillName;
      return userSkillName && userSkillName.toLowerCase() === predefinedName.toLowerCase();
    });
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Skills</h1>
                <p className="text-sm text-gray-600">
                  {userSkills.length} skill{userSkills.length !== 1 ? 's' : ''} in your profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="mb-6">
            <AlertDescription className="text-green-600">{message}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-8">
          {/* Skills List */}
          <div className="flex-1">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search skills by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Add Skill Form */}
            {showAddSkill && (
              <Card className="mb-6 overflow-visible">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Skill</CardTitle>
                  <CardDescription>
                    Add a skill to your profile with proficiency level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <Label htmlFor="skillName">Skill Name *</Label>
                      <Input
                        id="skillName"
                        type="text"
                        placeholder="e.g., React, Python, UI Design"
                        value={newSkillName}
                        onChange={handleSkillNameChange}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => { if (newSkillName) setShowSuggestions(true) }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        autoComplete="off"
                      />
                      {/* Suggestions Dropdown */}
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                          {filteredSuggestions.map((skill, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => handleSuggestionClick(skill)}
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skillLevel">Proficiency Level</Label>
                      <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                        <SelectTrigger>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skillExperience">Experience/Notes (Optional)</Label>
                    <Input
                      id="skillExperience"
                      type="text"
                      placeholder="e.g., 2 years, Used in 5 projects, Self-taught"
                      value={newSkillExperience}
                      onChange={(e) => setNewSkillExperience(e.target.value)}
                    />
                  </div>

                  {/* Popular Skills Selection */}
                  {staticSkillList.length > 0 && (
                    <div className="pt-2">
                      <Label className="text-xs text-gray-500 mb-2 block">Popular Skills (Click to select)</Label>
                      <div className="flex flex-wrap gap-2">
                        {staticSkillList
                          .filter(skill => !userSkills.some(us => (us.skill?.name || us.skillName)?.toLowerCase() === skill.toLowerCase()))
                          .slice(0, 15)
                          .map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors py-1 px-2 font-normal"
                              onClick={() => setNewSkillName(skill)}
                            >
                              + {skill}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddSkill}
                      disabled={addingSkill}
                    >
                      {addingSkill ? 'Adding...' : 'Add Skill'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddSkill(false);
                        setNewSkillName('');
                        setNewSkillCategory('');
                        setNewSkillLevel('BEGINNER');
                        setNewSkillExperience('');
                        setShowSuggestions(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User Skills Display */}
            {filteredUserSkills.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No matching skills found' : 'No skills added yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Start building your skill profile to attract better project opportunities'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowAddSkill(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Skill
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      {category}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {categorySkills.length}
                      </Badge>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categorySkills.map((userSkill) => {
                        const proficiencyInfo = getProficiencyInfo(userSkill.level);
                        const skillName = userSkill.skill?.name || userSkill.skillName;

                        return (
                          <Card key={userSkill.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg mb-2">{skillName}</CardTitle>
                                  <div className="flex items-center space-x-2">
                                    <Badge
                                      variant="secondary"
                                      className={`${proficiencyInfo.color} text-white text-xs`}
                                    >
                                      {proficiencyInfo.label}
                                    </Badge>
                                    {userSkill.experience && (
                                      <span className="text-xs text-gray-600">
                                        {userSkill.experience}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  onClick={() => handleRemoveSkill(userSkill.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                {/* Proficiency Progress */}
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      Proficiency
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {proficiencyInfo.percentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${proficiencyInfo.color}`}
                                      style={{ width: `${proficiencyInfo.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Update Level */}
                                <div className="space-y-2">
                                  <Label className="text-xs">Update Level</Label>
                                  <Select
                                    value={userSkill.level}
                                    onValueChange={(newLevel) =>
                                      handleUpdateSkillLevel(userSkill.id, newLevel)
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
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={() => setShowAddSkill(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Skill
                </Button>
                <Link to="/analytics" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Skills Analytics
                  </Button>
                </Link>
                <Link to="/discover/projects" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Find Matching Projects
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Skills Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Skills Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Skills</span>
                    <span className="font-medium">{userSkills.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expert Level</span>
                    <span className="font-medium text-purple-600">
                      {userSkills.filter(s => s.level === 'EXPERT').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Advanced Level</span>
                    <span className="font-medium text-green-600">
                      {userSkills.filter(s => s.level === 'ADVANCED').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Categories</span>
                    <span className="font-medium">
                      {Object.keys(skillsByCategory).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Add from Predefined */}
            {availablePredefinedSkills.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Skills</CardTitle>
                  <CardDescription>Popular skills you might want to add</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availablePredefinedSkills.slice(0, 5).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <Select
                          onValueChange={(level) => handleAddPredefinedSkill(skill, level)}
                          defaultValue=""
                        >
                          <SelectTrigger className="w-24 h-7 text-xs">
                            <SelectValue placeholder="Add" />
                          </SelectTrigger>
                          <SelectContent>
                            {proficiencyLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}