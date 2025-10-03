import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { joinRequestService } from '../../services/JoinRequestService.js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Users, CheckCircle, Clock, Target, Settings, UserPlus, User, Edit3, Github, Link as LinkIcon
} from 'lucide-react';
import { projectService } from '../../services/projectService.js';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinRequestStatus, setJoinRequestStatus] = useState(null); 

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError('');
  
      const [projectResponse, tasksResponse, membersResponse] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getProjectTasks(projectId),
        projectService.getProjectMembers(projectId)
      ]);
  
      // This new logic handles both cases:
      // 1. If the service returns the full { success, data } object, it extracts .data
      // 2. If the service returns the data directly, it uses it as is.
      setProject(projectResponse.data || projectResponse || null);
      setTasks(tasksResponse.data || tasksResponse || []);
      setMembers(membersResponse.data || membersResponse || []);
  
    } catch (err) {
      console.error('Error loading project:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load project details.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendJoinRequest = async () => {
    if (!project) return;
    try {
      const message = prompt("Include an optional message with your request:");
      if (message === null) return; // User cancelled prompt
      
      await joinRequestService.sendJoinRequest(project.id, message);
      alert("Join request sent successfully!");
      setJoinRequestStatus('PENDING'); // Update UI
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'RECRUITING': return 'bg-purple-100 text-purple-800';
      case 'ACTIVE':
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority) => {
      switch (priority) {
        case 'HIGH': return 'bg-red-100 text-red-800';
        case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
        case 'LOW': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
  };

  const isProjectOwner = () => project?.owner?.id === userProfile?.id;
  const isProjectMember = () => members.some(member => member.user?.id === userProfile?.id);
  const getUserRole = () => {
    if (isProjectOwner()) return 'Owner';
    const userMember = members.find(member => member.user?.id === userProfile?.id);
    return userMember?.role || null;
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Project...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent>
            <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
            <Button onClick={() => navigate('/dashboard')} className="mt-4 w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{project?.title}</h1>
                        <div className="flex items-center space-x-3 mt-2">
                            <Badge className={getStatusColor(project?.status)}>{project?.status?.replace('_', ' ')}</Badge>
                            {getUserRole() && <Badge variant="secondary">{getUserRole()}</Badge>}
                            <span className="text-sm text-gray-500">Created {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                    </div>
                </div>
                <div> {/* <-- A container for action buttons */}
          {!isProjectOwner() && !isProjectMember() && project?.status === 'RECRUITING' && (
            joinRequestStatus === 'PENDING' ? (
              <Button disabled>Request Pending</Button>
            ) : (
              <Button onClick={handleSendJoinRequest}><UserPlus className="h-4 w-4 mr-2" />Send Join Request</Button>
            )
          )}
        </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card><CardContent className="p-4"><Users className="h-5 w-5 text-blue-600 mb-2" /><div className="text-2xl font-bold">{members.length}</div><div className="text-sm text-gray-600">Team Members</div></CardContent></Card>
                <Card><CardContent className="p-4"><CheckCircle className="h-5 w-5 text-green-600 mb-2" /><div className="text-2xl font-bold">{completedTasks}</div><div className="text-sm text-gray-600">Completed Tasks</div></CardContent></Card>
                <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-orange-600 mb-2" /><div className="text-2xl font-bold">{totalTasks}</div><div className="text-sm text-gray-600">Total Tasks</div></CardContent></Card>
                <Card><CardContent className="p-4"><Target className="h-5 w-5 text-purple-600 mb-2" /><div className="text-2xl font-bold">{Math.round(taskProgress)}%</div><div className="text-sm text-gray-600">Progress</div></CardContent></Card>
            </div>
            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks ({totalTasks})</TabsTrigger>
                    <TabsTrigger value="team">Team ({members.length})</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card><CardHeader><CardTitle>About This Project</CardTitle></CardHeader><CardContent><p className="text-gray-700 whitespace-pre-wrap">{project?.description}</p></CardContent></Card>
                            <Card><CardHeader><CardTitle>Goals</CardTitle></CardHeader><CardContent><p className="text-gray-700 whitespace-pre-wrap">{project?.goals}</p></CardContent></Card>
                            <Card><CardHeader><CardTitle>Requirements</CardTitle></CardHeader><CardContent><p className="text-gray-700 whitespace-pre-wrap">{project?.requirements}</p></CardContent></Card>
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Project Info</CardTitle></CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div><span className="font-medium text-gray-500">Owner:</span> <span className="text-gray-800">{project?.owner?.firstName} {project?.owner?.lastName}</span></div>
                                    <div><span className="font-medium text-gray-500">Category:</span> <span className="text-gray-800">{project?.category?.replace('_', ' ')}</span></div>
                                    {project?.githubRepo && <div><a href={project.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline"><Github className="h-4 w-4 mr-2" />GitHub Repo</a></div>}
                                    {project?.demoUrl && <div><a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline"><LinkIcon className="h-4 w-4 mr-2" />Demo URL</a></div>}
                                </CardContent>
                            </Card>
                            {project?.projectSkills?.length > 0 && (
                                <Card>
                                    <CardHeader><CardTitle>Tech Stack</CardTitle></CardHeader>
                                    <CardContent className="flex flex-wrap gap-2">
                                        {project.projectSkills.map((skillInfo) => (
                                            <Badge key={skillInfo.id} variant="secondary">{skillInfo.skill.name}</Badge>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="tasks" className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Project Tasks</h3>
                        <Link to={`/projects/${projectId}/tasks`}><Button><CheckCircle className="h-4 w-4 mr-2" />Manage Tasks</Button></Link>
                    </div>
                    {tasks.length === 0 ? (<Card><CardContent className="text-center py-12"><p>No tasks created yet.</p></CardContent></Card>) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{tasks.map(task => (<Card key={task.id}><CardHeader className="pb-3"><CardTitle className="text-base">{task.title}</CardTitle><div className="flex space-x-2"><Badge className={getStatusColor(task.status)} variant="outline">{task.status.replace('_', ' ')}</Badge><Badge className={getPriorityColor(task.priority)} variant="outline">{task.priority}</Badge></div></CardHeader><CardContent className="pt-0"><p className="text-sm text-gray-600 mb-3">{task.description}</p></CardContent></Card>))}</div>
                    )}
                </TabsContent>
                <TabsContent value="team" className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Team Members</h3>
                        {isProjectOwner() && (
            <Link to={`/projects/${projectId}/invite`}>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                </Button>
            </Link>
        )}
                    </div>
                    {members.length === 0 ? (<Card><CardContent className="text-center py-12"><p>No team members yet.</p></CardContent></Card>) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{members.map(member => (<Card key={member.id}><CardContent className="p-4 flex items-center space-x-3"><div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><span className="font-medium">{member.user?.firstName?.charAt(0)}{member.user?.lastName?.charAt(0)}</span></div><div><h4 className="font-medium">{member.user?.firstName} {member.user?.lastName}</h4><Badge variant="secondary" className="mt-1">{member.role}</Badge></div></CardContent></Card>))}</div>
                    )}
                </TabsContent>
                <TabsContent value="details" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card><CardHeader><CardTitle>Project Timeline</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><span className="font-medium text-gray-500">Created:</span> <span className="text-gray-800">{project?.createdAt ? new Date(project.createdAt).toLocaleString() : 'N/A'}</span></div><div><span className="font-medium text-gray-500">Last Updated:</span> <span className="text-gray-800">{project?.updatedAt ? new Date(project.updatedAt).toLocaleString() : 'N/A'}</span></div><div><span className="font-medium text-gray-500">Expected Start:</span> <span className="text-gray-800">{project?.expectedStartDate ? new Date(project.expectedStartDate).toLocaleDateString() : 'N/A'}</span></div><div><span className="font-medium text-gray-500">Expected End:</span> <span className="text-gray-800">{project?.expectedEndDate ? new Date(project.expectedEndDate).toLocaleDateString() : 'N/A'}</span></div></CardContent></Card>
                        <Card><CardHeader><CardTitle>Project Settings</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><span className="font-medium text-gray-500">Status:</span> <Badge className={getStatusColor(project?.status)}>{project?.status?.replace('_', ' ')}</Badge></div><div><span className="font-medium text-gray-500">Team Size Limit:</span> <span className="text-gray-800">{project?.maxTeamSize || 'Unlimited'}</span></div><div><span className="font-medium text-gray-500">Current Team:</span> <span className="text-gray-800">{members.length} members</span></div></CardContent></Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}