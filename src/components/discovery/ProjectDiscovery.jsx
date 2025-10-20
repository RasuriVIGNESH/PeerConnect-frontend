import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, Users, UserPlus, Eye, Calendar } from 'lucide-react';

import projectService from '../../services/projectService';
import skillsService from '../../services/skillsService';
import { joinRequestService } from '../../services/JoinRequestService';

export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch sent join requests by this user
  async function loadSentRequests() {
    try {
      const response = await joinRequestService.getMyJoinRequests();
      const sentProjectIds = new Set((response || []).map(req => req.project?.id).filter(Boolean));
      setSentRequests(sentProjectIds);
    } catch (error) {
      console.error("Could not load user's sent requests:", error);
      // Non-critical error
    }
  }

  // Handle join request sending
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

  // Fetch projects and transform skills field
  async function loadProjectsData() {
    const response = await projectService.discoverProjects(0, 50);
    const projectsData = response.content || [];
    const processedProjects = projectsData.map(project => ({
      ...project,
      requiredSkills: (project.projectSkills || [])
        .map(skillObj => skillObj.skill?.name)
        .filter(Boolean) || [],
    }));
    setProjects(processedProjects);
  }

  // Fetch user skills list for personalization/filter suggestions (optional use)
  async function loadUserSkills() {
    try {
      const response = await skillsService.getUserSkills();
      const skillsData = response.data || [];
      const skillNames = skillsData.map(s => s.skill?.name).filter(Boolean);
      setUserSkills(skillNames);
    } catch (error) {
      console.error('Error loading user skills:', error);
    }
  }

  // Main search/filter algorithm
  function applyFilters() {
    let filtered = [...projects];
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(lowercasedTerm) ||
        (p.description && p.description.toLowerCase().includes(lowercasedTerm)) ||
        (p.requiredSkills || []).some(s => s.toLowerCase().includes(lowercasedTerm))
      );
    }
    setFilteredProjects(filtered);
  }

  // Modal pop up to show project details
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-gray-500 border-t-transparent rounded-full mb-4" />
        <span className="text-gray-500">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        <b>Error:</b> {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Discover Projects</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search by title, description, or skill"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-60"
            startIcon={<Search />}
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-gray-500 mb-2">No Projects Found</p>
          <p className="text-gray-400">Try adjusting your search or check back later!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="shadow-md p-4 flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge>{project.category}</Badge>
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mt-2 text-gray-600 line-clamp-2">{project.description}</p>
                <div className="mt-2">
                  <span className="font-semibold text-gray-800">Required Skills: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {project.requiredSkills.length > 0
                      ? project.requiredSkills.map((skill, idx) =>
                          <Badge key={idx} className="bg-blue-100 text-blue-900">{skill}</Badge>
                        )
                      : <span className="text-sm text-gray-400">None specified</span>
                    }
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <Users className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-sm text-gray-700">{project.currentTeamSize}/{project.maxTeamSize} members</span>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-4 pt-0 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(project)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  disabled={sentRequests.has(project.id)}
                  onClick={() => handleViewDetails(project)}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  {sentRequests.has(project.id) ? 'Requested' : 'Join'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedProject.title}</DialogTitle>
                <div className="text-gray-500 mb-2">{selectedProject.description}</div>
                <div className="flex gap-2 mt-1 mb-3">
                  <Badge>{selectedProject.category}</Badge>
                  <Badge variant="secondary">{selectedProject.status}</Badge>
                </div>
                <div>
                  <span className="font-semibold">Problem Statement:</span>
                  <p className="text-gray-700 mt-1">{selectedProject.problemStatement || 'Not specified'}</p>
                </div>
                <div className="mt-3">
                  <span className="font-semibold">Goals:</span>
                  <p className="text-gray-700 mt-1">{selectedProject.goals || 'Not specified'}</p>
                </div>
                <div className="mt-3">
                  <span className="font-semibold">Requirements:</span>
                  <p className="text-gray-700 mt-1">{selectedProject.requirements || 'Not specified'}</p>
                </div>
                <div className="mt-3">
                  <span className="font-semibold">Required Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProject.requiredSkills.length > 0
                      ? selectedProject.requiredSkills.map((skill, idx) =>
                          <Badge key={idx} className="bg-blue-100 text-blue-900">{skill}</Badge>
                        )
                      : <span className="text-sm text-gray-400">None specified</span>
                    }
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-semibold">Timeline:</span>
                  <p className="text-gray-600 text-sm">
                    {selectedProject.expectedStartDate} → {selectedProject.expectedEndDate}
                  </p>
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  <span className="font-semibold">Project Lead:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-8 h-8">
                      {selectedProject.lead?.profilePictureUrl
                        ? <AvatarImage src={selectedProject.lead.profilePictureUrl} alt="Lead Avatar" />
                        : <AvatarFallback>
                            {selectedProject.lead?.firstName?.[0]}
                            {selectedProject.lead?.lastName?.[0]}
                          </AvatarFallback>
                      }
                    </Avatar>
                    <div>
                      <span className="font-medium">
                        {selectedProject.lead?.firstName} {selectedProject.lead?.lastName}
                      </span>
                      <span className="ml-2 text-xs text-gray-600">
                        ({selectedProject.lead?.branch}, Class of {selectedProject.lead?.graduationYear})
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <label className="font-semibold">Leave an optional message</label>
                <Textarea
                  placeholder="Tell the project lead why you'd be a great fit..."
                  value={joinRequestMessage}
                  onChange={e => setJoinRequestMessage(e.target.value)}
                  className="mt-1"
                />
              </div>
              <DialogFooter className="mt-2 flex justify-between">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                <Button onClick={handleJoinRequest}>Send Join Request</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
