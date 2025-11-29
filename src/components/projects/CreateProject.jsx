import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, ArrowRight, Check, Briefcase, Target, Wrench, PlusCircle } from 'lucide-react';
import { projectService } from '../../services/projectService.js';
import { dataService } from '../../services/dataService.js';
// Added skillsService import to fetch the static skills
import { skillsService } from '../../services/skillsService.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Step Indicator for Progress Bar
const StepIndicator = ({ step, active, completed, title, icon }) => (
  <div className="flex flex-col items-center space-y-2 text-center w-24">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${completed
      ? 'bg-black text-white border-black'
      : active
        ? 'bg-white border-black text-black shadow-lg'
        : 'bg-gray-100 border-gray-300 text-gray-400'
      }`}>
      {completed ? <Check className="h-5 w-5" /> : icon}
    </div>
    <span className={`text-xs font-medium ${active || completed ? 'text-black' : 'text-gray-400'}`}>
      {title}
    </span>
  </div>
);

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // States for Tech Stack Autocomplete
  const [staticSkills, setStaticSkills] = useState([]);
  const [filteredTechSuggestions, setFilteredTechSuggestions] = useState([]);
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);

  // Updated formData state to match the CreateProjectRequest DTO
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    category: '',
    goals: '',
    objectives: '',
    skillsRequired: [],
    maxTeamSize: '',
    techStack: [],
    githubRepo: '',
    demoUrl: '',
    expectedStartDate: '',
    expectedEndDate: '',
  });

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categories = await projectService.getProjectCategories();
      setProjectCategories(categories || []);
    } catch (err) {
      setError('Failed to load project categories.');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch both categories and static skills
  useEffect(() => {
    const initData = async () => {
      await fetchCategories();

      // Fetch static skills for tech stack suggestions
      try {
        const response = await skillsService.getStaticPredefinedSkills();
        const skills = response?.data || response || [];
        // Normalize to simple string array
        const formattedSkills = skills.map(s => (typeof s === 'string' ? s : s.name));
        setStaticSkills(formattedSkills);
      } catch (err) {
        console.error("Failed to load static skills", err);
      }
    };
    initData();
  }, []);

  const [techStackInput, setTechStackInput] = useState('');
  const [skillsRequiredInput, setSkillsRequiredInput] = useState('');
  const [filteredSkillsSuggestions, setFilteredSkillsSuggestions] = useState([]);
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Tech Stack Input changes to filter suggestions
  const handleTechStackInputChange = (e) => {
    const value = e.target.value;
    setTechStackInput(value);

    if (value.length > 0) {
      const filtered = staticSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !formData.techStack.includes(skill) // Don't suggest if already added
      );
      setFilteredTechSuggestions(filtered.slice(0, 8));
      setShowTechSuggestions(true);
    } else {
      setShowTechSuggestions(false);
    }
  };

  // Add tech from suggestion click
  const handleSuggestionClick = (techName) => {
    if (!formData.techStack.includes(techName)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, techName],
      }));
    }
    setTechStackInput('');
    setShowTechSuggestions(false);
  };

  // Renamed from handleAddSkill to handleAddTech
  const handleAddTech = () => {
    if (techStackInput.trim()) {
      const newTech = techStackInput.trim();
      if (!formData.techStack.includes(newTech)) {
        setFormData(prev => ({
          ...prev,
          techStack: [...prev.techStack, newTech],
        }));
      }
      setTechStackInput('');
      setShowTechSuggestions(false);
    }
  };

  // Renamed from handleRemoveSkill to handleRemoveTech
  const handleRemoveTech = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== techToRemove),
    }));
  };

  // --- Skills Required Handlers ---

  const handleSkillsRequiredInputChange = (e) => {
    const value = e.target.value;
    setSkillsRequiredInput(value);

    if (value.length > 0) {
      const filtered = staticSkills.filter(
        (skill) =>
          skill.toLowerCase().includes(value.toLowerCase()) &&
          !formData.skillsRequired.includes(skill)
      );
      setFilteredSkillsSuggestions(filtered.slice(0, 8));
      setShowSkillsSuggestions(true);
    } else {
      setShowSkillsSuggestions(false);
    }
  };

  const handleSkillsSuggestionClick = (skillName) => {
    if (!formData.skillsRequired.includes(skillName)) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillName],
      }));
    }
    setSkillsRequiredInput('');
    setShowSkillsSuggestions(false);
  };

  const handleAddSkillRequired = () => {
    if (skillsRequiredInput.trim()) {
      const newSkill = skillsRequiredInput.trim();
      if (!formData.skillsRequired.includes(newSkill)) {
        setFormData(prev => ({
          ...prev,
          skillsRequired: [...prev.skillsRequired, newSkill],
        }));
      }
      setSkillsRequiredInput('');
      setShowSkillsSuggestions(false);
    }
  };

  const handleRemoveSkillRequired = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(s => s !== skillToRemove),
    }));
  };

  const validateStep = step => {
    if (step === 1) {
      return (
        formData.title.trim().length >= 5 &&
        formData.description.trim().length >= 10 &&
        formData.problemStatement.trim() &&
        formData.category
      );
    }
    if (step === 2) {
      return formData.goals.trim() && formData.objectives.trim() && formData.skillsRequired.length > 0;
    }
    if (step === 3) {
      return formData.maxTeamSize && parseInt(formData.maxTeamSize, 10) >= 2;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill all required fields (*) with valid information before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleCategoryChange = (value) => {
    if (value === 'create_new') {
      setShowCategoryDialog(true);
    } else {
      handleInputChange('category', value);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name.');
      return;
    }
    try {
      const newCategory = await projectService.createProjectCategory({ name: newCategoryName });
      await fetchCategories(); // Refresh the list
      handleInputChange('category', newCategory.name); // Auto-select the new category
      setNewCategoryName('');
      setShowCategoryDialog(false);
    } catch (err) {
      alert('Failed to create category. It might already exist.');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateStep(3)) {
      setError('Please fill all required fields (*) with valid information.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Create a payload and map the fields for the backend
      const payload = {
        ...formData,
        // 1. Convert maxTeamSize from a string to a number
        maxTeamSize: parseInt(formData.maxTeamSize, 10),

        // 2. Map the frontend 'category' field to the backend 'categoryName'
        categoryName: formData.category,
      };

      // 3. Remove the now-redundant 'category' key
      delete payload.category;

      // Send the corrected payload to the service
      await projectService.createProject(payload);

      setMessage('Project created successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/dashboard');

  const renderStepContent = () => {
    switch (currentStep) {
      // Step 1: Core Idea
      case 1:
        return (
          <Card className="max-w-2xl mx-auto border shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl text-gray-800">The Core Idea</CardTitle>
              <CardDescription className="text-gray-600">What's your project about?</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="title" className="font-medium text-gray-700">Project Title *</Label>
                <Input
                  id="title" value={formData.title} onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="e.g., PeerConnect Platform" className="mt-1" maxLength={100}
                />
                <p className={`text-xs mt-1 ${formData.title.length < 5 ? 'text-red-600' : 'text-gray-500'}`}>
                  {formData.title.length}/100 (min 5)
                </p>
              </div>

              <div>
                <Label htmlFor="problemStatement" className="font-medium text-gray-700">Problem Statement *</Label>
                <Textarea
                  id="problemStatement" value={formData.problemStatement} onChange={e => handleInputChange('problemStatement', e.target.value)}
                  placeholder="What problem are you solving?" rows={3} className="mt-1" maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.problemStatement.length}/1000</p>
              </div>
              <div>
                <Label htmlFor="description" className="font-medium text-gray-700">Project Description *</Label>
                <Textarea
                  id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="A brief summary of your project." rows={4} className="mt-1" maxLength={1000}
                />
                <p className={`text-xs mt-1 ${formData.description.length < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                  {formData.description.length}/1000 (min 10)
                </p>
              </div>
              <div>
                <Label htmlFor="category" className="font-medium text-gray-700">Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange} disabled={isLoadingCategories}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="create_new" className="text-blue-600">
                      <span className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" /> Create New Category
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      // Step 2: Project Scope
      case 2:
        return (
          <Card className="max-w-2xl mx-auto border shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl text-gray-800">Project Scope</CardTitle>
              <CardDescription className="text-gray-600">Define the goals and requirements for your project.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="goals" className="font-medium text-gray-700">Project Goals *</Label>
                <Textarea
                  id="goals" value={formData.goals} onChange={e => handleInputChange('goals', e.target.value)}
                  placeholder="What are the main goals? (e.g., develop a fully functional prototype)" rows={3} className="mt-1" maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.goals.length}/1000</p>
              </div>
              <div>
                <Label htmlFor="objectives" className="font-medium text-gray-700">Objectives *</Label>
                <Textarea
                  id="objectives" value={formData.objectives} onChange={e => handleInputChange('objectives', e.target.value)}
                  placeholder="List specific, measurable objectives. (e.g., user authentication, project creation feature)" rows={3} className="mt-1" maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.objectives.length}/1000</p>
              </div>
              <div>
                <Label className="font-medium text-gray-700">Skills Required *</Label>
                <div className="flex gap-2 mt-1 relative">
                  <Input
                    value={skillsRequiredInput}
                    onChange={handleSkillsRequiredInputChange}
                    placeholder="e.g., Java, Python, Communication"
                    onBlur={() => setTimeout(() => setShowSkillsSuggestions(false), 200)}
                    onFocus={() => { if (skillsRequiredInput) setShowSkillsSuggestions(true) }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillRequired(); } }}
                    autoComplete="off"
                  />
                  <Button type="button" onClick={handleAddSkillRequired}>Add</Button>

                  {/* Skills Suggestions Dropdown */}
                  {showSkillsSuggestions && filteredSkillsSuggestions.length > 0 && (
                    <div className="absolute top-10 left-0 w-full z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredSkillsSuggestions.map((skill, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleSkillsSuggestionClick(skill)}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skillsRequired.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="px-2 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200">
                      {skill}
                      <button onClick={() => handleRemoveSkillRequired(skill)} className="ml-2 rounded-full hover:bg-blue-200 p-0.5">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Suggested Skills Cloud */}
                {staticSkills.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <Label className="text-sm text-gray-500 mb-2 block">Popular Skills (Click to add)</Label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                      {staticSkills
                        .filter(skill => !formData.skillsRequired.includes(skill))
                        .map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors py-1 px-2 font-normal"
                            onClick={() => handleSkillsSuggestionClick(skill)}
                          >
                            + {skill}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {formData.skillsRequired.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">At least one skill is required.</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      // Step 3: Technical & Team Details
      case 3:
        return (
          <Card className="max-w-2xl mx-auto border shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl text-gray-800">Team & Technical Details</CardTitle>
              <CardDescription className="text-gray-600">Provide details about the team, timeline, and technology.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="maxTeamSize" className="font-medium text-gray-700">Max Team Size *</Label>
                <Input
                  id="maxTeamSize" type="number" value={formData.maxTeamSize} onChange={e => handleInputChange('maxTeamSize', e.target.value)}
                  placeholder="e.g., 5" min="2" max="20" className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Between 2 and 20 members.</p>
              </div>

              <div>
                <Label className="font-medium text-gray-700">Tech Stack</Label>
                <div className="flex gap-2 mt-1 relative">
                  <Input
                    value={techStackInput}
                    onChange={handleTechStackInputChange}
                    placeholder="e.g., React, Spring Boot"
                    onBlur={() => setTimeout(() => setShowTechSuggestions(false), 200)}
                    onFocus={() => { if (techStackInput) setShowTechSuggestions(true) }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                    autoComplete="off"
                  />
                  <Button type="button" onClick={handleAddTech}>Add</Button>

                  {/* Tech Stack Suggestions Dropdown */}
                  {showTechSuggestions && filteredTechSuggestions.length > 0 && (
                    <div className="absolute top-10 left-0 w-full z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredTechSuggestions.map((tech, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleSuggestionClick(tech)}
                        >
                          {tech}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.techStack.map((tech, idx) => (
                    <Badge key={idx} variant="secondary" className="px-2 py-1 text-sm">
                      {tech}
                      <button onClick={() => handleRemoveTech(tech)} className="ml-2 rounded-full hover:bg-gray-300 p-0.5">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="expectedStartDate" className="font-medium text-gray-700">Expected Start Date</Label>
                  <Input id="expectedStartDate" type="date" value={formData.expectedStartDate} onChange={e => handleInputChange('expectedStartDate', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="expectedEndDate" className="font-medium text-gray-700">Expected End Date</Label>
                  <Input id="expectedEndDate" type="date" value={formData.expectedEndDate} onChange={e => handleInputChange('expectedEndDate', e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="githubRepo" className="font-medium text-gray-700">GitHub Repository URL</Label>
                <Input id="githubRepo" value={formData.githubRepo} onChange={e => handleInputChange('githubRepo', e.target.value)} placeholder="https://github.com/user/repo" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="demoUrl" className="font-medium text-gray-700">Demo URL</Label>
                <Input id="demoUrl" value={formData.demoUrl} onChange={e => handleInputChange('demoUrl', e.target.value)} placeholder="https://your-project-demo.com" className="mt-1" />
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Create a New Project</h1>
          <p className="mt-2 text-gray-600">Follow the steps below to bring your idea to life.</p>
        </div>

        <div className="mb-10 flex justify-center space-x-4 sm:space-x-8">
          <StepIndicator step={1} active={currentStep === 1} completed={completedSteps.includes(1)} title="Core Idea" icon={<Briefcase />} />
          <StepIndicator step={2} active={currentStep === 2} completed={completedSteps.includes(2)} title="Project Scope" icon={<Target />} />
          <StepIndicator step={3} active={currentStep === 3} completed={completedSteps.includes(3)} title="Team & Tech" icon={<Wrench />} />
        </div>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {error && <Alert variant="destructive" className="max-w-2xl mx-auto mt-6"><AlertDescription>{error}</AlertDescription></Alert>}
          {message && <Alert className="max-w-2xl mx-auto mt-6 bg-green-50 border-green-200 text-green-800"><AlertDescription>{message}</AlertDescription></Alert>}

          <div className="max-w-2xl mx-auto mt-6 flex justify-between">
            {currentStep > 1 ? (
              <Button type="button" onClick={handlePrevious} disabled={loading} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            ) : <div />}

            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} disabled={loading}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading || !!message}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </form>
        {/* --- DIALOG FOR CREATING A NEW CATEGORY --- */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="newCategoryName">Category Name</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Artificial Intelligence"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateCategory}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}