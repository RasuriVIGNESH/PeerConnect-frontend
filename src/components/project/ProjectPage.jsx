// src/components/project/ProjectPage.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Icons
import {
  ArrowLeft, Users, CheckCircle, Clock, Target, Settings, Edit3, Github,
  Link as LinkIcon, AlertCircle, Crown, Code, ExternalLink, Award,
  TrendingUp, ShieldCheck, Mail, UserPlus, Plus, Trash2, Calendar,
  Circle, Send, Loader2, Shield, UserX, MessageSquare, Save, XCircle, Ban
} from 'lucide-react';

// Services
import { projectService } from '../../services/projectService.js';
import { chatService } from '../../services/Chatservice.js';
import { joinRequestService } from '../../services/JoinRequestService.js';

// Helper Functions
const getStatusColor = (status) => ({
  'PLANNING': 'bg-blue-100 text-blue-800', 'RECRUITING': 'bg-purple-100 text-purple-800',
  'ACTIVE': 'bg-green-100 text-green-800', 'IN_PROGRESS': 'bg-green-100 text-green-800',
  'ON_HOLD': 'bg-yellow-100 text-yellow-800', 'COMPLETED': 'bg-gray-200 text-gray-800'
}[status] || 'bg-gray-100 text-gray-800');

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Handle both array and string date formats
  const date = new Date(Array.isArray(dateString) ? dateString.join('-') : dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ===================================================================================
//                                TASK MANAGEMENT
// ===================================================================================
function TaskManagement({ projectId, isProjectLead, project }) {
  const { userProfile } = useAuth(); // Get current user's profile
  const [tasks, setTasks] = useState([]);
  const [assignableMembers, setAssignableMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', assignedToId: '',
    priority: 'MEDIUM', status: 'TODO', dueDate: '', estimatedHours: ''
  });

  const loadData = async () => {
    try {
      setLoading(true); setError('');
      const [tasksData, membersRes] = await Promise.all([
        projectService.getProjectTasks(projectId),
        projectService.getProjectMembers(projectId)
      ]);
      setTasks(tasksData || []);
      const members = membersRes.data?.content || membersRes.data || [];
      const projectLead = project?.lead;
      let finalAssignableMembers = [...members];
      if (projectLead && !members.some(m => m.user.id === projectLead.id)) {
        finalAssignableMembers.unshift({ user: projectLead, role: 'Lead' });
      }
      setAssignableMembers(finalAssignableMembers);
    } catch (err) {
      setError('Failed to load tasks and members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [projectId, project]);

  const handleOpenDialog = (task = null) => {
    setEditingTask(task);
    if (task) {
      setTaskForm({
        title: task.title || '',
        description: task.description || '',
        assignedToId: task.assignedToId || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || ''
      });
    } else {
      setTaskForm({
        title: '', description: '', assignedToId: '',
        priority: 'MEDIUM', status: 'TODO', dueDate: '', estimatedHours: ''
      });
    }
    setShowTaskDialog(true);
  };

  const handleSaveTask = async () => {
    try {
      const creating = !editingTask;
      let payload;

      if (creating) {
        // Everyone can create tasks and assign them to any team member
        payload = {
          ...taskForm,
          assignedToId: taskForm.assignedToId || null,
          estimatedHours: taskForm.estimatedHours ? parseInt(taskForm.estimatedHours, 10) : null,
        };
        await projectService.createTask(projectId, payload);
      } else {
        // Editing: leads can edit all fields; members can update status
        if (isProjectLead) {
          payload = {
            ...taskForm,
            assignedToId: taskForm.assignedToId || null,
            estimatedHours: taskForm.estimatedHours ? parseInt(taskForm.estimatedHours, 10) : null,
          };
        } else {
          payload = { status: taskForm.status };
        }
        await projectService.updateTask(projectId, editingTask.id, payload);
      }
      setShowTaskDialog(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await projectService.deleteTask(projectId, taskId);
        loadData();
      } catch (err) {
        setError('Failed to delete task.');
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Project Tasks</CardTitle>
          <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Create Task</Button>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-3">
            {tasks.length > 0 ? tasks.map(task => {
              const isAssignedToCurrentUser = task.assignedToId === userProfile.id;
              const canEdit = isProjectLead || isAssignedToCurrentUser;

              return (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.assignedToName || 'Unassigned'} • Due: {formatDate(task.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{task.priority}</Badge>
                    <Badge variant="secondary">{task.status.replace('_', ' ')}</Badge>
                    {/* Show edit button if user is lead OR task is assigned to them */}
                    {canEdit && (
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(task)}><Edit3 className="h-4 w-4" /></Button>
                    )}
                    {/* Only lead can delete tasks */}
                    {isProjectLead && (
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
              );
            }) : <p className="text-center text-gray-500 py-4">No tasks created yet.</p>}
          </div>
        </CardContent>
      </Card>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {editingTask
              ? (isProjectLead
                ? 'Update any details for this task.'
                : 'You can update the status. Other fields are restricted to the lead.')
              : 'Create a task and assign it to any team member.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/** When creating a task, all users can edit full fields; when editing, only leads can edit full fields */}
          <Input placeholder="Title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} disabled={!!editingTask && !isProjectLead} />
          <Textarea placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} disabled={!!editingTask && !isProjectLead} />
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Assign To</Label><Select onValueChange={value => setTaskForm({ ...taskForm, assignedToId: value })} value={taskForm.assignedToId} disabled={!!editingTask && !isProjectLead}><SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger><SelectContent>{assignableMembers.map(m => <SelectItem key={m.user.id} value={m.user.id}>{m.user.firstName} {m.user.lastName}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Priority</Label><Select onValueChange={value => setTaskForm({ ...taskForm, priority: value })} value={taskForm.priority} disabled={!!editingTask && !isProjectLead}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HIGH">High</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* The status field is always enabled for editing */}
            <div><Label>Status</Label><Select onValueChange={value => setTaskForm({ ...taskForm, status: value })} value={taskForm.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TODO">To Do</SelectItem><SelectItem value="IN_PROGRESS">In Progress</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem></SelectContent></Select></div>
            <div><Label>Estimated Hours</Label><Input type="number" placeholder="e.g., 8" value={taskForm.estimatedHours} onChange={e => setTaskForm({ ...taskForm, estimatedHours: e.target.value })} disabled={!!editingTask && !isProjectLead} /></div>
          </div>
          <div><Label>Due Date</Label><Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} disabled={!!editingTask && !isProjectLead} /></div>
        </div>
        <DialogFooter><Button onClick={handleSaveTask}>Save Changes</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// Helper to get profile image source
const getProfileImage = (user) => {
  if (!user) return null;
  if (user.profilePictureUrl) return user.profilePictureUrl;
  if (user.profileImage) return user.profileImage;
  if (user.profilePhoto) {
    // If it's a URL (http/https), return it as is
    if (user.profilePhoto.startsWith('http')) return user.profilePhoto;

    // If it's a base64 string
    return user.profilePhoto.startsWith('data:image')
      ? user.profilePhoto
      : `data:image/png;base64,${user.profilePhoto}`;
  }
  return null;
};

// ===================================================================================
//                                TEAM MANAGEMENT
// ===================================================================================
function MemberManagement({ projectId, isProjectLead, project }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMembersAndLead = async () => {
      try {
        setLoading(true);
        const res = await projectService.getProjectMembers(projectId);
        const projectMembers = res.data?.content || res.data || [];

        const lead = project?.lead;
        let allTeamMembers = [...projectMembers];

        // Check if the lead is already in the members list
        const leadIsAlreadyMember = projectMembers.some(member => member.user.id === lead.id);

        if (lead && !leadIsAlreadyMember) {
          // Add the lead to the start of the array if they aren't listed
          allTeamMembers.unshift({
            id: `lead-${lead.id}`, // Create a unique key for the lead
            user: lead,
            role: 'Lead'
          });
        } else if (lead && leadIsAlreadyMember) {
          // Ensure the lead's role is correctly labeled if they are in the list
          const leadInList = allTeamMembers.find(member => member.user.id === lead.id);
          if (leadInList) leadInList.role = 'Lead';
        }

        setMembers(allTeamMembers);
      } catch (error) {
        console.error("Failed to load members", error);
      } finally {
        setLoading(false);
      }
    };

    if (project) {
      loadMembersAndLead();
    }
  }, [projectId, project]);

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await projectService.removeMember(projectId, memberId);
        // Manually filter out the removed member to refresh the UI instantly
        setMembers(prevMembers => prevMembers.filter(m => m.id !== memberId));
      }
      catch (error) { alert("Failed to remove member."); }
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members ({members.length})</CardTitle>
        <Button onClick={() => navigate(`/projects/${projectId}/invite`)}><UserPlus className="mr-2 h-4 w-4" />Add Members</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={getProfileImage(member.user)} />
                  <AvatarFallback>{member.user.firstName?.[0]}{member.user.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{member.user.firstName} {member.user.lastName}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              {isProjectLead && member.role !== 'Lead' && (
                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleRemoveMember(member.id)}>
                  <UserX className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ===================================================================================
//                                PROJECT CHAT
// ===================================================================================
function ProjectChat({ projectId }) {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const latestMessageTimestamp = useRef(new Date().toISOString());

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await chatService.getProjectMessages(projectId, 0, 50);
        const fetchedMessages = (res.data?.content || res.data || []).reverse();
        setMessages(fetchedMessages);
        if (fetchedMessages.length > 0) {
          latestMessageTimestamp.current = fetchedMessages[fetchedMessages.length - 1].sentAt;
        }
      } catch (error) { console.error("Failed to load chat history", error); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, [projectId]);

  // Polling for new messages
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await chatService.getMessagesAfter(projectId, latestMessageTimestamp.current);
        const newMessages = res.data || [];
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          latestMessageTimestamp.current = newMessages[newMessages.length - 1].sentAt;
        }
      } catch (error) { console.error("Polling error", error); }
    }, 5000);
    return () => clearInterval(poll);
  }, [projectId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      try {
        await chatService.sendMessage(projectId, messageInput);
        setMessageInput('');
        // Fetch immediately after sending for responsiveness
        const res = await chatService.getMessagesAfter(projectId, latestMessageTimestamp.current);
        const newMessages = res.data || [];
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          latestMessageTimestamp.current = newMessages[newMessages.length - 1].sentAt;
        }
      } catch (error) { alert("Failed to send message."); }
    }
  };

  return (
    <Card className="h-[600px] flex flex-col"><CardHeader><CardTitle>Team Chat</CardTitle></CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender.id === userProfile.id ? 'justify-end' : 'justify-start'}`}>
              {msg.sender.id !== userProfile.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getProfileImage(msg.sender)} />
                  <AvatarFallback>{msg.sender.firstName?.[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className={`p-3 rounded-lg max-w-sm ${msg.sender.id === userProfile.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                <p className="font-semibold text-sm">{msg.sender.firstName}</p>
                <p className="text-sm mt-1">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </CardContent>
      <div className="p-4 border-t flex items-center gap-2">
        <Input
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={handleSendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

// ===================================================================================
//                                 PROJECT MANAGE TAB
// ===================================================================================
function ProjectManage({ project, onRefresh }) {
  return (
    <Tabs defaultValue="requests">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="requests">Join Requests</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="requests"><ProjectRequests requests={project.projectJoinRequests || []} onRefresh={onRefresh} /></TabsContent>
      <TabsContent value="settings"><ProjectSettings projectId={project.id} /></TabsContent>
    </Tabs>
  );
}

function ProjectRequests({ requests, onRefresh }) {
  const [processingId, setProcessingId] = useState(null);

  // --- 1. Split requests into pending and past ---
  const { pendingRequests, pastRequests } = useMemo(() => {
    const pending = [];
    const past = [];

    // Ensure requests is an array before filtering
    (requests || []).forEach(req => {
      if (req.status === 'PENDING') {
        pending.push(req);
      } else {
        past.push(req);
      }
    });

    return { pendingRequests: pending, pastRequests: past };
  }, [requests]);

  const handleResponse = async (requestId, action) => {
    setProcessingId(requestId);
    try {
      if (action === 'accept') {
        await joinRequestService.acceptJoinRequest(requestId);
      } else {
        await joinRequestService.rejectJoinRequest(requestId);
      }
      onRefresh();
    } catch (error) {
      alert(`Failed to ${action} request.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Requests</CardTitle>
        <CardDescription>Review and respond to requests from students to join your project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6"> {/* Added space for separation */}

        {/* --- 2. Render Pending Requests --- */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-800">Pending ({pendingRequests.length})</h3>
          {pendingRequests.length > 0 ? (
            pendingRequests.map(req => (
              <div key={req.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{req.user.firstName} {req.user.lastName}</p>
                  <p className="text-sm text-gray-500">{req.user.branch} • Class of {req.user.graduationYear}</p>
                  {req.message && <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded">"{req.message}"</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleResponse(req.id, 'reject')} disabled={processingId === req.id}>
                    {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
                  </Button>
                  <Button size="sm" onClick={() => handleResponse(req.id, 'accept')} disabled={processingId === req.id}>
                    {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No pending join requests.</p>
          )}
        </div>

        {/* --- 3. Render Past Requests (History) --- */}
        {pastRequests.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-800">History ({pastRequests.length})</h3>
            {pastRequests.map(req => (
              <div key={req.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 opacity-80">
                <div>
                  <p className="font-semibold">{req.user.firstName} {req.user.lastName}</p>
                  <p className="text-sm text-gray-500">{req.user.branch} • Class of {req.user.graduationYear}</p>
                </div>
                <div className="flex-shrink-0">
                  <Badge
                    className={
                      req.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }
                    variant="outline"
                  >
                    {req.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}

function ProjectEdit({ project, onProjectUpdate }) {
  const [form, setForm] = useState({ title: '', description: '', category: '', maxTeamSize: '', problemStatement: '', goals: '', objectives: '', techStack: '', githubRepo: '', demoUrl: '' });

  useEffect(() => {
    setForm({
      title: project.title || '', description: project.description || '', category: (project.category?.name || project.category || ''),
      maxTeamSize: project.maxTeamSize || '', problemStatement: project.problemStatement || '',
      goals: project.goals || '', objectives: project.objectives || '',
      techStack: (project.techStackList || []).join(', '), githubRepo: project.githubRepo || '', demoUrl: project.demoUrl || ''
    });
  }, [project]);

  const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, techStack: form.techStack.split(',').map(s => s.trim()), maxTeamSize: Number(form.maxTeamSize) };
      const res = await projectService.updateProject(project.id, payload);
      alert("Project updated successfully!");
      onProjectUpdate(res.data);
    } catch (error) { alert("Failed to update project."); }
  };

  return (
    <Card><CardHeader><CardTitle>Edit Project Details</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="title">Title</Label><Input id="title" value={form.title} onChange={handleChange} /></div>
            <div><Label htmlFor="category">Category</Label><Input id="category" value={form.category} onChange={handleChange} /></div>
          </div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" value={form.description} onChange={handleChange} /></div>
          <div><Label htmlFor="problemStatement">Problem Statement</Label><Textarea id="problemStatement" value={form.problemStatement} onChange={handleChange} /></div>
          <div><Label htmlFor="goals">Goals</Label><Textarea id="goals" value={form.goals} onChange={handleChange} /></div>
          <div><Label htmlFor="techStack">Tech Stack (comma-separated)</Label><Input id="techStack" value={form.techStack} onChange={handleChange} /></div>
          <div><Label htmlFor="githubRepo">GitHub Repository</Label><Input id="githubRepo" value={form.githubRepo} onChange={handleChange} /></div>
          <Button type="submit"><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProjectSettings({ projectId }) {
  const navigate = useNavigate();
  const handleDelete = async () => {
    try { await projectService.deleteProject(projectId); alert("Project deleted successfully."); navigate('/projects/my-projects'); }
    catch (error) { alert("Failed to delete project."); }
  };

  return (
    <Card className="border-red-500"><CardHeader><CardTitle>Project Settings</CardTitle></CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div><h3 className="font-semibold">Delete Project</h3><p className="text-sm text-gray-600">This action is irreversible and will permanently delete the project.</p></div>
          <Dialog><DialogTrigger asChild><Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Are you absolutely sure?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
              <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}


// ===================================================================================
//                                MAIN PROJECT PAGE
// ===================================================================================
export default function ProjectPage() {
  const { projectId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for in-page editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProject(projectId);
      setProject(response);
    } catch (err) {
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // When project data loads or editing is cancelled, populate the edit form state
  useEffect(() => {
    if (project) {
      setEditForm({
        title: project.title || '',
        description: project.description || '',
        category: project.category?.name || project.category || '',
        status: project.status || 'RECRUITING', // Add status to form
        maxTeamSize: project.maxTeamSize || '',
        problemStatement: project.problemStatement || '',
        goals: project.goals || '',
        objectives: project.objectives || '',
        techStackList: (project.techStackList || []).join(', '),
        projectSkills: (project.requiredSkills || project.projectSkills || []).map(ps => ps.skill.name).join(', '),
        githubRepo: project.githubRepo || '',
        demoUrl: project.demoUrl || ''
      });
    }
  }, [project, isEditing]); // Rerun when isEditing changes to reset form on cancel

  const handleFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const payload = {
        ...editForm,
        techStack: editForm.techStackList.split(',').map(s => s.trim()).filter(Boolean),
        projectSkills: editForm.projectSkills.split(',').map(s => s.trim()).filter(Boolean),
        maxTeamSize: Number(editForm.maxTeamSize)
      };
      delete payload.techStackList;

      await projectService.updateProject(project.id, payload);
      setIsEditing(false);
      await loadProjectData();
    } catch (err) {
      setError('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading && !isEditing) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-blue-600" /></div>;
  if (error || !project) return <div className="flex h-screen items-center justify-center"><Alert variant="destructive" className="max-w-md"><AlertCircle className="h-4 w-4" /><AlertDescription>{error || 'Project not found.'}</AlertDescription></Alert></div>;

  const isProjectLead = project.lead?.id === userProfile?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- HEADER --- */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects/my-projects')} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back to My Projects</Button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <Input id="title" value={editForm.title} onChange={handleFormChange} className="text-4xl font-bold h-auto p-0 border-b focus-visible:ring-0" />
              ) : (
                <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
              )}
              <div className="flex items-center gap-3 flex-wrap mt-2">
                {isEditing ? (
                  <Select value={editForm.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECRUITING">Recruiting</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(project.status)}>{project.status?.replace('_', ' ')}</Badge>
                )}
                <Badge variant="outline">{project.category?.name || project.category}</Badge>
              </div>
            </div>
            {/* --- ACTION BUTTONS --- */}
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/rooms`)}><Users className="w-4 h-4 mr-2" />Meeting Rooms</Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${projectId}/invite`)}><UserPlus className="w-4 h-4 mr-2" />Invite</Button>
              {isProjectLead && !isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit3 className="w-4 h-4 mr-2" />Edit</Button>
                </>
              )}
              {isProjectLead && isEditing && (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveChanges} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className={`grid w-full ${isProjectLead ? 'grid-cols-5' : 'grid-cols-4'}`}><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="tasks">Tasks</TabsTrigger><TabsTrigger value="team">Team</TabsTrigger><TabsTrigger value="chat">Chat</TabsTrigger>{isProjectLead && <TabsTrigger value="manage">Manage</TabsTrigger>}</TabsList>

          {/* --- OVERVIEW TAB --- */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card><CardHeader><CardTitle>Description</CardTitle></CardHeader><CardContent>{isEditing ? <Textarea id="description" value={editForm.description} onChange={handleFormChange} rows={5} /> : <p className="text-gray-700 leading-relaxed">{project.description}</p>}</CardContent></Card>
                <Card><CardHeader><CardTitle>Problem Statement</CardTitle></CardHeader><CardContent>{isEditing ? <Textarea id="problemStatement" value={editForm.problemStatement} onChange={handleFormChange} rows={3} /> : <p className="text-gray-700">{project.problemStatement}</p>}</CardContent></Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card><CardHeader><CardTitle>Goals</CardTitle></CardHeader><CardContent>{isEditing ? <Textarea id="goals" value={editForm.goals} onChange={handleFormChange} rows={3} /> : <p className="text-gray-700">{project.goals}</p>}</CardContent></Card>
                  <Card>
                    <CardHeader><CardTitle>Objectives</CardTitle></CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea id="objectives" value={editForm.objectives} onChange={handleFormChange} rows={4} placeholder="Separate objectives with a comma" />
                      ) : (
                        project.objectives?.includes(',') ? (
                          <ul className="space-y-2">
                            {project.objectives.split(',').map((obj, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700">{obj.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">{project.objectives}</p>
                        )
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="lg:col-span-1 space-y-6">
                <Card><CardHeader><CardTitle>Team Size</CardTitle></CardHeader><CardContent>{isEditing ? <Input id="maxTeamSize" type="number" value={editForm.maxTeamSize} onChange={handleFormChange} /> : <p className="text-2xl font-bold">{project.currentTeamSize + 1} / {project.maxTeamSize}</p>}</CardContent></Card>
                <Card><CardHeader><CardTitle>Tech Stack</CardTitle></CardHeader><CardContent>{isEditing ? <Input id="techStackList" placeholder="Comma-separated" value={editForm.techStackList} onChange={handleFormChange} /> : <div className="flex flex-wrap gap-2">{(project.techStackList || []).map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}</div>}</CardContent></Card>
                <Card><CardHeader><CardTitle>Required Skills</CardTitle></CardHeader><CardContent>{isEditing ? <Input id="projectSkills" placeholder="Comma-separated" value={editForm.projectSkills} onChange={handleFormChange} /> : <div className="flex flex-wrap gap-2">{(project.requiredSkills || project.projectSkills || []).map((ps, idx) => <Badge key={ps.id || idx} variant="secondary">{ps.skill.name}</Badge>)}</div>}</CardContent></Card>
                <Card><CardHeader><CardTitle>Links</CardTitle></CardHeader><CardContent className="space-y-2">{isEditing ? <><Input id="githubRepo" placeholder="GitHub URL" value={editForm.githubRepo} onChange={handleFormChange} /><Input id="demoUrl" placeholder="Demo URL" value={editForm.demoUrl} onChange={handleFormChange} /></> : <>{project.githubRepo && <a href={project.githubRepo} target="_blank" rel="noopener noreferrer">GitHub</a>}{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>}</>}</CardContent></Card>
                {/* {project.lead && <Card><CardHeader><CardTitle>Project Lead</CardTitle></CardHeader><CardContent><h3>{project.lead.firstName} {project.lead.lastName}</h3><p className="text-sm text-gray-500">{project.lead.branch}</p></CardContent></Card>} */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks"><TaskManagement projectId={projectId} isProjectLead={isProjectLead} project={project} /></TabsContent>
          <TabsContent value="team"><MemberManagement projectId={projectId} isProjectLead={isProjectLead} project={project} /></TabsContent>
          <TabsContent value="chat"><ProjectChat projectId={projectId} /></TabsContent>
          {isProjectLead && (<TabsContent value="manage"><ProjectManage project={project} onRefresh={loadProjectData} /></TabsContent>)}
        </Tabs>
      </div>
    </div>
  );
}
