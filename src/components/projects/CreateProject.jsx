import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  X, ArrowLeft, ArrowRight, Check, Briefcase,
  Target, Wrench, PlusCircle, Sparkles, Rocket, Lightbulb, Compass, Cpu
} from 'lucide-react';
import { projectService } from '../../services/projectService.js';
import { skillsService } from '../../services/skillsService.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const stepContent = {
  1: {
    title: "The Vision",
    subtitle: "Bring your idea to life",
    description: "Every great collaboration starts with a clear vision. Define the problem you're passionate about solving.",
    icon: <Lightbulb className="w-12 h-12 text-amber-400" />,
    color: "bg-amber-500/10"
  },
  2: {
    title: "The Scope",
    subtitle: "Define the boundaries",
    description: "Setting clear goals and objectives helps potential teammates understand how they can contribute effectively.",
    icon: <Compass className="w-12 h-12 text-blue-400" />,
    color: "bg-blue-500/10"
  },
  3: {
    title: "The Engine",
    subtitle: "Technical & Team Details",
    description: "Finalize the logistics. Define your tech stack and the size of the dream team you want to build.",
    icon: <Cpu className="w-12 h-12 text-indigo-400" />,
    color: "bg-indigo-500/10"
  }
};

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', problemStatement: '', category: '',
    goals: '', objectives: '', skillsRequired: [],
    maxTeamSize: '', techStack: [], githubRepo: '', demoUrl: '',
    expectedStartDate: '', expectedEndDate: '',
  });

  // UI States
  const [projectCategories, setProjectCategories] = useState([]);
  const [staticSkills, setStaticSkills] = useState([]);
  const [techStackInput, setTechStackInput] = useState('');
  const [skillsRequiredInput, setSkillsRequiredInput] = useState('');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const init = async () => {
      const cats = await projectService.getProjectCategories();
      setProjectCategories(cats || []);
      const sks = await skillsService.getStaticPredefinedSkills();
      setStaticSkills(sks?.data || sks || []);
    };
    init();
  }, []);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const validateStep = (step) => {
    if (step === 1) return formData.title.length >= 5 && formData.category;
    if (step === 2) return formData.goals.length > 0 && formData.skillsRequired.length > 0;
    if (step === 3) return formData.maxTeamSize >= 2;
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please complete the required fields.');
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, maxTeamSize: parseInt(formData.maxTeamSize), categoryName: formData.category, skills: formData.skillsRequired };
      const res = await projectService.createProject(payload);
      // setMessage("Project Launched Successfully!"); // Replaced by overlay
      setCreatedId(res.data?.id);
      setShowSuccess(true);
    } catch (err) {
      setError("Failed to create project.");
    } finally { setLoading(false); }
  };

  // Success Overlay Component
  const SuccessOverlay = ({ projectName, onComplete }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
      >
        {/* Background Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5],
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            className="absolute w-2 h-2 rounded-full bg-indigo-500/50"
          />
        ))}

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Animated Checkmark Circle */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <motion.svg
              viewBox="0 0 100 100"
              className="w-full h-full"
            >
              <motion.circle
                cx="50" cy="50" r="45"
                stroke="#4f46e5"
                strokeWidth="6"
                fill="transparent"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              <motion.path
                d="M30 50 L45 65 L70 35"
                stroke="#4f46e5"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="transparent"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              />
            </motion.svg>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl -z-10"
            />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-2xl font-black text-slate-900 mb-2"
          >
            Project Launched!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-slate-500 mb-8"
          >
            <span className="font-bold text-indigo-600">"{projectName}"</span> is now live and visible to potential teammates.
          </motion.p>

          {/* Redirect Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
              onAnimationComplete={onComplete}
              className="h-full bg-indigo-600"
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-3 font-bold">
            Redirecting to Project Page...
          </p>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            projectName={formData.title}
            onComplete={() => navigate(`/projects/${createdId}`)}
          />
        )}
      </AnimatePresence>
      {/* --- LEFT SIDE: THE NARRATIVE --- */}
      <div className="lg:w-2/5 bg-slate-900 relative p-8 lg:p-16 flex flex-col justify-between overflow-hidden">
        {/* Animated Background Pulse */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"
          />
        </div>

        <div className="relative z-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-slate-400 hover:text-white transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div className={`w-20 h-20 ${stepContent[currentStep].color} rounded-3xl flex items-center justify-center mb-8 shadow-inner`}>
                {stepContent[currentStep].icon}
              </div>
              <h2 className="text-indigo-400 font-bold tracking-widest uppercase text-sm mb-2">Step 0{currentStep}</h2>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                {stepContent[currentStep].subtitle}
              </h1>
              <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
                {stepContent[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Vertical Stepper */}
        <div className="relative z-10 flex space-x-4 mt-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${s <= currentStep ? 'w-12 bg-indigo-500' : 'w-6 bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: THE FORM --- */}
      <div className="lg:w-3/5 bg-slate-50 relative overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-16 lg:py-24">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid gap-2">
                      <Label className="text-slate-700 font-semibold">Project Title *</Label>
                      <Input
                        placeholder="What's the name of your masterpiece?"
                        value={formData.title}
                        onChange={e => handleInputChange('title', e.target.value)}
                        className="h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-700 font-semibold">Problem Statement *</Label>
                      <Textarea
                        placeholder="Clearly describe the gap you're bridging..."
                        value={formData.problemStatement}
                        onChange={e => handleInputChange('problemStatement', e.target.value)}
                        className="min-h-[120px] rounded-2xl border-slate-200 bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-700 font-semibold">Project Summary</Label>
                      <Textarea
                        placeholder="A short, catchy description for the feed..."
                        value={formData.description}
                        onChange={e => handleInputChange('description', e.target.value)}
                        className="min-h-[100px] rounded-2xl border-slate-200 bg-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-700 font-semibold">Category *</Label>
                      <Select value={formData.category} onValueChange={(v) => v === 'create_new' ? setShowCategoryDialog(true) : handleInputChange('category', v)}>
                        <SelectTrigger className="h-14 rounded-2xl bg-white">
                          <SelectValue placeholder="Pick a domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                          <SelectItem value="create_new" className="text-indigo-600 font-bold">+ New Category</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid gap-2">
                      <Label className="text-slate-700 font-semibold">Key Goals *</Label>
                      <Textarea
                        placeholder="Goal 1: Launch MVP..."
                        value={formData.goals}
                        onChange={e => handleInputChange('goals', e.target.value)}
                        className="min-h-[120px] rounded-2xl"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-700 font-semibold">Desired Teammate Skills *</Label>
                      <div className="flex gap-2 relative">
                        <Input
                          placeholder="e.g. React, UI Design..."
                          value={skillsRequiredInput}
                          onChange={e => setSkillsRequiredInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), setFormData(p => ({ ...p, skillsRequired: [...p.skillsRequired, skillsRequiredInput] })), setSkillsRequiredInput(''))}
                          className="h-14 rounded-2xl"
                        />
                        <Button type="button" onClick={() => { if (skillsRequiredInput.trim()) { setFormData(p => ({ ...p, skillsRequired: [...p.skillsRequired, skillsRequiredInput] })); setSkillsRequiredInput(''); } }} className="h-14 px-6 rounded-2xl bg-slate-900">Add</Button>
                      </div>

                      {/* Skills Suggestions */}
                      {staticSkills.length > 0 && (
                        <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Suggested Skills</Label>
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                            {staticSkills
                              .filter(skill => {
                                const skillName = typeof skill === 'string' ? skill : skill.name;
                                return !formData.skillsRequired.includes(skillName) &&
                                  skillName.toLowerCase().includes(skillsRequiredInput.toLowerCase());
                              })
                              .slice(0, 20) // Show top 20 matches
                              .map((skill, idx) => {
                                const skillName = typeof skill === 'string' ? skill : skill.name;
                                return (
                                  <Badge
                                    key={idx}
                                    onClick={() => {
                                      setFormData(p => ({ ...p, skillsRequired: [...p.skillsRequired, skillName] }));
                                      setSkillsRequiredInput('');
                                    }}
                                    className="cursor-pointer bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all px-3 py-1.5"
                                  >
                                    + {skillName}
                                  </Badge>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">
                        {formData.skillsRequired.map((s, i) => (
                          <Badge key={i} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-sm shadow-sm gap-2">
                            {s}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData(p => ({ ...p, skillsRequired: p.skillsRequired.filter((_, index) => index !== i) }));
                              }}
                              className="hover:text-red-300 transition-colors focus:outline-none"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label className="text-slate-700 font-semibold">Max Team Size *</Label>
                        <Input type="number" value={formData.maxTeamSize} onChange={e => handleInputChange('maxTeamSize', e.target.value)} className="h-14 rounded-2xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-slate-700 font-semibold">Expected Start</Label>
                        <Input type="date" value={formData.expectedStartDate} onChange={e => handleInputChange('expectedStartDate', e.target.value)} className="h-14 rounded-2xl" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-700 font-semibold">Tech Stack</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. Node.js, Firebase..."
                          value={techStackInput}
                          onChange={e => setTechStackInput(e.target.value)}
                          className="h-14 rounded-2xl"
                        />
                        <Button type="button" onClick={() => setFormData(p => ({ ...p, techStack: [...p.techStack, techStackInput] }))} className="h-14 px-6 rounded-2xl bg-indigo-600">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.techStack.map(t => (
                          <Badge key={t} variant="secondary" className="px-4 py-2 rounded-xl">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-slate-700 font-semibold">GitHub Repository</Label>
                      <Input placeholder="https://github.com/..." value={formData.githubRepo} onChange={e => handleInputChange('githubRepo', e.target.value)} className="h-14 rounded-2xl" />
                    </div>
                  </div>
                )}

                {/* --- NAVIGATION FOOTER --- */}
                <div className="pt-10 flex items-center justify-between">
                  {currentStep > 1 ? (
                    <Button type="button" variant="ghost" onClick={handleBack} className="text-slate-500 font-bold hover:bg-slate-100 px-6 rounded-2xl h-14">
                      Back
                    </Button>
                  ) : <div />}

                  <Button
                    type={currentStep === 3 ? "submit" : "button"}
                    disabled={loading}
                    onClick={currentStep < 3 ? handleNext : undefined}
                    className={`h-14 px-10 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${currentStep === 3 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'}`}
                  >
                    {loading ? "Processing..." : currentStep === 3 ? "Publish Project" : "Continue"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- NOTIFICATIONS & DIALOGS --- */}
      <AnimatePresence>
        {(error || message) && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-8 right-8 z-50">
            <Alert className={`${message ? 'bg-indigo-600' : 'bg-red-500'} text-white border-none shadow-2xl rounded-2xl px-8 py-4`}>
              <AlertDescription className="font-bold flex items-center gap-2">
                {message ? <Sparkles className="w-5 h-5" /> : <X className="w-5 h-5" />}
                {error || message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-bold">New Category</DialogTitle></DialogHeader>
          <div className="py-4"><Input placeholder="e.g. Robotics" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="h-14 rounded-2xl" /></div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!newCategoryName.trim()) return;
              try {
                const newCat = await projectService.createProjectCategory({ name: newCategoryName });
                setProjectCategories(prev => [...prev, newCat]);
                handleInputChange('category', newCat.name);
                setShowCategoryDialog(false);
                setNewCategoryName('');
              } catch (err) {
                console.error("Failed to create category:", err);
              }
            }} className="bg-indigo-600 rounded-xl h-12 px-8">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}