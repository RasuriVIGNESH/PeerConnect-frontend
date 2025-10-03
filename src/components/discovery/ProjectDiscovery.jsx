import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, FolderOpen, Users, UserPlus, Eye, Send, Star } from 'lucide-react';
import projectService from '../../services/projectService';
import skillsService from '../../services/skillsService';
import { joinRequestService } from '../../services/JoinRequestService';

export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [predefinedSkills, setPredefinedSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [error, setError] = useState(null);

  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Encapsulate all loading logic into one function
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Run fetches in parallel for better performance
        await Promise.all([
          loadUserSkills(),
          loadProjectsData(),
          loadSentRequests()
        ]);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Could not load discovery data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);
  
  useEffect(() => {
    applyFilters();
  }, [projects, searchTerm]);
  
  async function loadSentRequests() {
    try {
      const response = await joinRequestService.getMyJoinRequests();
      const sentProjectIds = new Set((response || []).map(req => req.project?.id).filter(Boolean));
      setSentRequests(sentProjectIds);
    } catch (error) {
      console.error("Could not load user's sent requests:", error);
      // Non-critical error, so we don't set the main error state
    }
  }
  
  const handleJoinRequest = async () => {
    if (!selectedProject) return;
    try {
      await joinRequestService.sendJoinRequest(selectedProject.id, joinRequestMessage);
      alert('Your request to join the project has been sent!');
      setSentRequests(prev => new Set(prev).add(selectedProject.id));
      setIsModalOpen(false);
      setJoinRequestMessage('');
    } catch (error) {
      console.error('Failed to send join request:', error);
      alert(`Error: ${error.message || 'Could not send join request.'}`);
    }
  };

  async function loadProjectsData() {
    const response = await projectService.discoverProjects(0, 50);
    const projectsData = response.content || [];

    const processedProjects = projectsData.map(project => ({
      ...project,
      // V-- FIX 1: ENSURE DATA IS TRANSFORMED CORRECTLY --V
      // This correctly extracts the skill name string from each skill object.
      requiredSkills: project.projectSkills?.map(skillObj => skillObj.skill?.name).filter(Boolean) || [],
    }));

    setProjects(processedProjects);
  }
  
  async function loadUserSkills() {
    try {
      const response = await skillsService.getUserSkills();
      
      // V-- THIS IS THE FIX --V
      // Access the .data property from the response object
      const skillsData = response.data || []; 
      // ^-- END OF FIX --^

      const skillNames = skillsData.map(s => s.skill?.name).filter(Boolean);
      setUserSkills(skillNames);
    } catch (error) {
      console.error('Error loading user skills:', error);
      // Don't set a critical error, as the page can still function
    }
  }

  function applyFilters() {
    let filtered = [...projects];
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(lowercasedTerm) ||
        p.description?.toLowerCase().includes(lowercasedTerm) ||
        p.requiredSkills.some(s => s.toLowerCase().includes(lowercasedTerm))
      );
    }
    setFilteredProjects(filtered);
  }

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };
  
  if (loading) return <div className="text-center p-10">Loading projects...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Discover Projects</h1>
            <Button onClick={() => navigate('/projects/create')}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search by title, description, or skill..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => {
              const hasSentRequest = sentRequests.has(project.id);
              return (
              <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>Owned by {project.owner?.firstName} {project.owner?.lastName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                  <div className="space-y-2">
                    <Label className="text-xs">Required Skills</Label>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills.slice(0, 5).map((skill, index) => (
                        // V-- FIX 2: DEFENSIVE RENDERING TO PREVENT CRASHES --V
                        <Badge key={index} variant={userSkills.includes(skill) ? "default" : "outline"}>
                          {typeof skill === 'string' ? skill : 'Invalid Skill'}
                          {userSkills.includes(skill) && <Star className="h-3 w-3 ml-1.5" />}
                        </Badge>
                      ))}
                      {project.requiredSkills.length > 5 && <Badge variant="ghost">...</Badge>}
                    </div>
                  </div>
                </CardContent>
                <CardContent className="flex space-x-2">
                  <Button size="sm" className="flex-1" onClick={() => handleViewDetails(project)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {project.status === 'RECRUITING' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      disabled={hasSentRequest}
                      onClick={() => handleViewDetails(project)}
                    >
                      {hasSentRequest ? 'Request Sent' : <><UserPlus className="h-4 w-4 mr-2" />Request to Join</>}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )})}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <h3 className="text-lg font-semibold">No Projects Found</h3>
            <p>Try adjusting your search or check back later!</p>
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedProject?.title}</DialogTitle>
            <DialogDescription>{selectedProject?.description}</DialogDescription>
            <div className="flex items-center space-x-2 pt-2">
              <Badge variant="outline">{selectedProject?.category}</Badge>
              <Badge>{selectedProject?.status}</Badge>
            </div>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <h4 className="font-semibold">Problem Statement</h4>
            <p className="text-sm text-muted-foreground">{selectedProject?.problemStatement}</p>
            <h4 className="font-semibold">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {selectedProject?.requiredSkills.map((skill, index) => <Badge key={index} variant="secondary">{skill}</Badge>)}
            </div>
            <h4 className="font-semibold">Project Owner</h4>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedProject?.owner?.profilePicture} />
                <AvatarFallback>{selectedProject?.owner?.firstName?.charAt(0)}{selectedProject?.owner?.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{selectedProject?.owner?.firstName} {selectedProject?.owner?.lastName}</span>
            </div>
            <h4 className="font-semibold">Leave an optional message</h4>
            <Textarea 
              placeholder="Tell the project owner why you'd be a great fit..."
              value={joinRequestMessage}
              onChange={(e) => setJoinRequestMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Close</Button>
            <Button onClick={handleJoinRequest}>
              <Send className="h-4 w-4 mr-2" />
              Send Join Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}