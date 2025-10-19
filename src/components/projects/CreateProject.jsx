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
import { X, ArrowLeft, ArrowRight, Check, Briefcase, Target, Wrench } from 'lucide-react';
import { projectService } from '../../services/projectService.js';
import { dataService } from '../../services/dataService.js';

// Step Indicator for Progress Bar
const StepIndicator = ({ step, active, completed, title, icon }) => (
  <div className="flex flex-col items-center space-y-2 text-center w-24">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
      completed
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
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Updated formData state to match the CreateProjectRequest DTO
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    category: '',
    goals: '',
    objectives: '',
    requirements: '',
    maxTeamSize: '',
    techStack: [],
    githubRepo: '',
    demoUrl: '',
    expectedStartDate: '',
    expectedEndDate: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await dataService.getProjectCategories();
        setProjectCategories(response.data || []);
      } catch (err) {
        setError('Failed to load project categories. Please try again later.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const [techStackInput, setTechStackInput] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    }
  };

  // Renamed from handleRemoveSkill to handleRemoveTech
  const handleRemoveTech = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== techToRemove),
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
      return formData.goals.trim() && formData.objectives.trim() && formData.requirements.trim();
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
      // The formData object now matches the DTO
      await projectService.createProject(formData);
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
                <Select value={formData.category} onValueChange={v => handleInputChange('category', v)} disabled={isLoadingCategories}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
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
                <Label htmlFor="requirements" className="font-medium text-gray-700">Requirements *</Label>
                <Textarea
                  id="requirements" value={formData.requirements} onChange={e => handleInputChange('requirements', e.target.value)}
                  placeholder="What are the specific requirements? (e.g., must be responsive, use React for frontend)" rows={3} className="mt-1" maxLength={1000}
                />
                 <p className="text-xs text-gray-500 mt-1">{formData.requirements.length}/1000</p>
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
                <div className="flex gap-2 mt-1">
                  <Input
                    value={techStackInput} onChange={e => setTechStackInput(e.target.value)} placeholder="e.g., React, Spring Boot"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                  />
                  <Button type="button" onClick={handleAddTech}>Add</Button>
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
      </div>
    </div>
  );
}
