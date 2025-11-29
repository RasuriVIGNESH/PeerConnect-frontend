import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Users,
  UserPlus,
  Eye,
  Calendar,
  Loader2,
  Target,
  CheckCircle2,
  Send,
  Briefcase,
  TrendingUp,
  Filter,
  X
} from 'lucide-react';

import projectService from '../../services/projectService';
import skillsService from '../../services/skillsService';
import { joinRequestService } from '../../services/JoinRequestService';

export default function ProjectDiscovery() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterByCollege, setFilterByCollege] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (filterByCollege && currentUser.collegeId) {
          const collegeProjects = await projectService.getProjectsByCollege(currentUser.collegeId);
          setProjects(collegeProjects.data || []);
        } else {
          await loadProjectsData();
        }
        await loadSentRequests();
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
  }, [currentUser, filterByCollege]);

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
    }
  }

  const handleJoinRequest = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      await joinRequestService.sendJoinRequest(selectedProject.id, joinRequestMessage);
      setSentRequests(prev => new Set(prev).add(selectedProject.id));
      setIsModalOpen(false);
      setJoinRequestMessage('');
    } catch (error) {
      console.error('Failed to send join request:', error);
      alert(`Error: ${error.message || 'Could not send join request.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'RECRUITING': 'bg-green-500/10 text-green-700 border-green-500/20',
      'IN_PROGRESS': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      'COMPLETED': 'bg-gray-500/10 text-gray-700 border-gray-500/20',
      'ON_HOLD': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
    };
    return colors[status] || colors['RECRUITING'];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-muted-foreground text-lg">Discovering amazing projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
          Discover Projects
        </h1>
        <p className="text-muted-foreground text-lg">
          Find exciting projects that match your skills and interests
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or skill..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
          </Badge>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="college-filter"
              checked={filterByCollege}
              onChange={(e) => setFilterByCollege(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="college-filter" className="text-sm font-medium text-gray-700">
              Projects from My College
            </label>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-foreground mb-2">No Projects Found</p>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new projects!'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {project.categoryName}
                  </Badge>
                  <Badge className={`${getStatusColor(project.status)} border`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-4 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {project.requiredSkills && project.requiredSkills.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">Required Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.requiredSkills.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/20">
                          {skill}
                        </Badge>
                      ))}
                      {project.requiredSkills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.requiredSkills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {project.currentTeamSize + 1}/{project.maxTeamSize}
                    </span>
                  </div>
                  {project.lead && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {project.lead.profilePictureUrl ? (
                          <AvatarImage src={project.lead.profilePictureUrl} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {project.lead.firstName?.[0]}{project.lead.lastName?.[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate">
                        {project.lead.firstName} {project.lead.lastName}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 bg-muted/30 border-t p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewDetails(project)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={sentRequests.has(project.id)}
                  onClick={() => handleViewDetails(project)}
                >
                  {sentRequests.has(project.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Requested
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold mb-2">{selectedProject.title}</DialogTitle>
                    <DialogDescription className="text-base">{selectedProject.description}</DialogDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {selectedProject.categoryName}
                  </Badge>
                  <Badge className={`${getStatusColor(selectedProject.status)} border`}>
                    {selectedProject.status.replace('_', ' ')}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {selectedProject.goals && (
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">Goals</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedProject.goals}</p>
                  </div>
                )}



                {selectedProject.requiredSkills && selectedProject.requiredSkills.length > 0 && (
                  <div>
                    <div className="font-semibold text-foreground mb-2">Required Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.requiredSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-8 text-sm bg-muted/30 rounded-lg p-4 border">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Team Size</div>
                      <div className="font-semibold">{selectedProject.currentTeamSize + 1}/{selectedProject.maxTeamSize}</div>
                    </div>
                  </div>
                  {selectedProject.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Created</div>
                        <div className="font-semibold">
                          {new Date(selectedProject.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedProject.lead && (
                  <div className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg p-4 border">
                    <div className="font-semibold text-foreground mb-3">Project Lead</div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        {selectedProject.lead.profilePictureUrl ? (
                          <AvatarImage src={selectedProject.lead.profilePictureUrl} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {selectedProject.lead.firstName?.[0]}{selectedProject.lead.lastName?.[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">
                          {selectedProject.lead.firstName} {selectedProject.lead.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedProject.lead.branch}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Class of {selectedProject.lead.graduationYear}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!sentRequests.has(selectedProject.id) && (
                  <div>
                    <label className="font-semibold text-foreground block mb-2">
                      Message to Project Lead
                      <span className="text-xs text-muted-foreground font-normal ml-2">(Optional)</span>
                    </label>
                    <Textarea
                      placeholder="Tell the project lead why you'd be a great fit for this project..."
                      value={joinRequestMessage}
                      onChange={e => setJoinRequestMessage(e.target.value)}
                      className="resize-none"
                      rows={4}
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                {!sentRequests.has(selectedProject.id) ? (
                  <Button onClick={handleJoinRequest} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Join Request
                      </>
                    )}
                  </Button>
                ) : (
                  <Button disabled>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Request Sent
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}