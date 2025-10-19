import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, Users, CheckCircle, Clock, Target, Settings, UserPlus, Edit3, Github, Link as LinkIcon,
  MessageSquare, Bell, Plus, Trash2, MoreVertical, Send, Search, Filter, Calendar, AlertCircle,
  UserMinus, Crown, Shield, UserCheck, UserX, Edit, Save, X, Loader2, GripVertical, Info, Package, ShieldQuestion
} from 'lucide-react';

import { projectService } from '../../services/projectService.js';
import { teamService } from '../../services/TeamService.js';
import { chatService } from '../../services/Chatservice.js';
import { notificationService } from '../../services/NotificationService.js';
import { joinRequestService } from '../../services/JoinRequestService.js';


// HELPER FUNCTIONS for styling
const getStatusColor = (status) => ({ 'PLANNING': 'bg-blue-100 text-blue-800', 'RECRUITING': 'bg-purple-100 text-purple-800', 'ACTIVE': 'bg-green-100 text-green-800', 'IN_PROGRESS': 'bg-green-100 text-green-800', 'ON_HOLD': 'bg-yellow-100 text-yellow-800', 'COMPLETED': 'bg-gray-200 text-gray-800' }[status] || 'bg-gray-100 text-gray-800');
const getPriorityColor = (priority) => ({ 'HIGH': 'text-red-600', 'MEDIUM': 'text-yellow-600', 'LOW': 'text-green-600' }[priority] || 'text-gray-600');
const getTaskStatusColor = (status) => ({ 'TODO': 'bg-gray-200 text-gray-800', 'IN_PROGRESS': 'bg-blue-200 text-blue-800', 'COMPLETED': 'bg-green-200 text-green-800', 'ON_HOLD': 'bg-yellow-200 text-yellow-800' }[status] || 'bg-gray-100 text-gray-800');
const getRoleClasses = (role) => ({'OWNER': 'bg-purple-100 text-purple-800 border-purple-300', 'ADMIN': 'bg-blue-100 text-blue-800 border-blue-300', 'MEMBER': 'bg-green-100 text-green-800 border-green-300'}[role] || 'bg-gray-100');

// ==================================
// 1. NOTIFICATIONS COMPONENT
// ==================================
function NotificationsPanel({ onUpdate }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({ page: 0, size: 20 });
            setNotifications(response.data?.content || response.data || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarkAsRead = async (id) => { await notificationService.markAsRead(id); fetchData(); onUpdate(); };
    const handleMarkAllAsRead = async () => { await notificationService.markAllAsRead(); fetchData(); onUpdate(); };
    const handleDelete = async (id) => { await notificationService.deleteNotification(id); fetchData(); onUpdate(); };

    return (
        <div className="w-80">
            <div className="p-4 border-b flex justify-between items-center"><h4 className="font-semibold">Notifications</h4><Button variant="link" className="p-0 h-auto text-xs" onClick={handleMarkAllAsRead}>Mark all as read</Button></div>
            {loading ? <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div> :
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? <p className="p-4 text-sm text-gray-500">No new notifications.</p> :
                        notifications.map(n => (
                            <div key={n.id} className={`p-3 border-b flex items-start gap-3 hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                                <div className="flex-shrink-0 pt-1">{!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}</div>
                                <div className="flex-grow"><p className="text-sm">{n.message}</p><p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p></div>
                                <div className="flex items-center">
                                    {!n.isRead && <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleMarkAsRead(n.id)}><CheckCircle className="h-4 w-4" /></Button>}
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500 hover:text-red-500" onClick={() => handleDelete(n.id)}><X className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            }
        </div>
    );
}

// ==================================
// 2. PROJECT OVERVIEW COMPONENT
// ==================================
function ProjectOverview({ project, tasks, members }) {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card><CardContent className="p-4"><Users className="h-5 w-5 text-blue-600 mb-2" /><div className="text-2xl font-bold">{project.currentTeamSize}</div><p className="text-sm text-gray-600">Team Members</p></CardContent></Card>
                <Card><CardContent className="p-4"><CheckCircle className="h-5 w-5 text-green-600 mb-2" /><div className="text-2xl font-bold">{completedTasks}</div><p className="text-sm text-gray-600">Completed Tasks</p></CardContent></Card>
                <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-orange-600 mb-2" /><div className="text-2xl font-bold">{tasks.length}</div><p className="text-sm text-gray-600">Total Tasks</p></CardContent></Card>
                <Card><CardContent className="p-4"><Target className="h-5 w-5 text-purple-600 mb-2" /><div className="text-2xl font-bold">{progress}%</div><p className="text-sm text-gray-600">Progress</p></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card><CardHeader><CardTitle>About Project</CardTitle></CardHeader><CardContent className="text-sm text-gray-700 whitespace-pre-wrap">{project.description}</CardContent></Card>
                    <Card><CardHeader><CardTitle>Goals</CardTitle></CardHeader><CardContent className="text-sm text-gray-700 whitespace-pre-wrap">{project.goals}</CardContent></Card>
                </div>
                <div className="space-y-6">
                    <Card><CardHeader><CardTitle>Project Info</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div><span className="font-semibold text-gray-500">Owner:</span> <span className="text-gray-800">{`${project.owner?.firstName} ${project.owner?.lastName}`}</span></div>
                            <div><span className="font-semibold text-gray-500">Category:</span> <span className="text-gray-800">{project.category?.replace('_', ' ')}</span></div>
                            {project.githubRepo && <a href={project.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline"><Github className="h-4 w-4 mr-2" />GitHub Repo</a>}
                            {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline"><LinkIcon className="h-4 w-4 mr-2" />Demo URL</a>}
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle>Tech Stack</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {project.requiredSkills?.map(s => <Badge key={s.id || s.skill.name} variant="secondary">{s.skill.name}</Badge>)}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ==================================
// 3. TASK MANAGEMENT COMPONENT
// ==================================
function TaskManagement({ projectId, members, initialTasks, userRole, onUpdate }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    
    const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedToId: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', estimatedHours: '', actualHours: '' });

    useEffect(() => { setTasks(initialTasks) }, [initialTasks]);

    const handleEditClick = (task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title || '',
            description: task.description || '',
            assignedToId: task.assignedToId || '',
            status: task.status || 'TODO',
            priority: task.priority || 'MEDIUM',
            dueDate: task.dueDate || '',
            estimatedHours: task.estimatedHours || '',
            actualHours: task.actualHours || ''
        });
        setShowTaskDialog(true);
    };
    
    const handleSaveTask = async () => {
        try {
            const requestData = { ...taskForm, assignedToId: taskForm.assignedToId || null, dueDate: taskForm.dueDate || null, estimatedHours: taskForm.estimatedHours ? parseInt(taskForm.estimatedHours) : null, actualHours: taskForm.actualHours ? parseInt(taskForm.actualHours) : null };
            if (editingTask) {
                await projectService.updateTask(projectId, editingTask.id, requestData);
            } else {
                await projectService.createTask(projectId, requestData);
            }
            setShowTaskDialog(false);
            setEditingTask(null);
            onUpdate();
        } catch (error) {
            console.error("Failed to save task:", error);
            alert(`Error: ${error.message}`);
        }
    };
    
    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await projectService.deleteTask(projectId, taskId);
            onUpdate();
        }
    };

    const handleToggleCompletion = async (task) => {
        const requestData = { completed: task.status !== 'COMPLETED' };
        await projectService.toggleTaskCompletion(projectId, task.id, requestData);
        onUpdate();
    };
    
    const canManage = userRole === 'OWNER' || userRole === 'ADMIN';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Tasks</CardTitle>
                <CardDescription>Manage all tasks for this project.</CardDescription>
            </CardHeader>
            <CardContent>
                {canManage && (
                     <div className="flex justify-end mb-4">
                        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                            <DialogTrigger asChild><Button onClick={() => { setEditingTask(null); setTaskForm({ title: '', description: '', assignedToId: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', estimatedHours: '', actualHours: '' }); }}><Plus className="h-4 w-4 mr-2" />Add Task</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div><Label>Title</Label><Input value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} /></div>
                                    <div><Label>Description</Label><Textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>Assign To</Label>
                                            <Select value={taskForm.assignedToId} onValueChange={v => setTaskForm({...taskForm, assignedToId: v})}><SelectTrigger><SelectValue placeholder="Unassigned"/></SelectTrigger>
                                                <SelectContent>{members.map(m => <SelectItem key={m.user.id} value={m.user.id}>{`${m.user.firstName} ${m.user.lastName}`}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div><Label>Priority</Label>
                                            <Select value={taskForm.priority} onValueChange={v => setTaskForm({...taskForm, priority: v})}><SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent><SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HIGH">High</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                         <div><Label>Due Date</Label><Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} /></div>
                                        <div><Label>Estimated Hours</Label><Input type="number" value={taskForm.estimatedHours} onChange={e => setTaskForm({...taskForm, estimatedHours: e.target.value})} /></div>
                                    </div>
                                </div>
                                <DialogFooter><Button onClick={handleSaveTask}>Save Task</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                <div className="border rounded-md">
                    {tasks.length > 0 ? tasks.map(task => (
                        <div key={task.id} className="flex items-center p-3 border-b last:border-b-0 gap-3">
                             <Checkbox checked={task.status === 'COMPLETED'} onCheckedChange={() => handleToggleCompletion(task)} />
                            <div className="flex-grow">
                                <p className={`font-semibold ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>{task.title}</p>
                                <p className="text-sm text-gray-600">{task.description}</p>
                            </div>
                            <div className="flex items-center gap-4 w-60">
                                <div className="text-sm flex items-center gap-2">
                                    <Avatar className="h-6 w-6"><AvatarFallback>{task.assignedToName ? task.assignedToName.split(' ').map(n=>n[0]).join('') : 'U'}</AvatarFallback></Avatar>
                                    {task.assignedToName || 'Unassigned'}
                                </div>
                                <Badge variant="outline" className={getTaskStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                                <span className={getPriorityColor(task.priority)} title={task.priority}><GripVertical className="h-5 w-5" /></span>
                            </div>
                            {canManage && 
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(task)}><Edit3 className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            }
                        </div>
                    )) : <p className="p-4 text-center text-gray-500">No tasks have been created yet.</p>}
                </div>
            </CardContent>
        </Card>
    )
}

// ==================================
// 4. TEAM MANAGEMENT COMPONENT
// ==================================
function TeamManagement({ project, members, invitations, joinRequests, userRole, onUpdate }) {
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [inviteForm, setInviteForm] = useState({ invitedUserId: '', message: '', role: 'MEMBER' });

    const handleSendInvitation = async () => { await teamService.inviteUserToProject(project.id, inviteForm); setShowInviteDialog(false); onUpdate(); };
    const handleUpdateRole = async (memberId, role) => { await teamService.updateMemberRole(project.id, memberId, { role }); onUpdate(); };
    const handleRemoveMember = async (memberId) => { if(window.confirm('Are you sure?')) { await teamService.removeMemberFromProject(project.id, memberId); onUpdate(); } };
    const handleAcceptJoinRequest = async (requestId) => { await joinRequestService.acceptJoinRequest(requestId); onUpdate(); };
    const handleRejectJoinRequest = async (requestId) => { await joinRequestService.rejectJoinRequest(requestId); onUpdate(); };
    const handleCancelInvitation = async (invitationId) => { await teamService.cancelInvitation(invitationId); onUpdate(); };
    
    const canManage = userRole === 'OWNER' || userRole === 'ADMIN';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Team Members ({project.currentTeamSize}/{project.maxTeamSize || '∞'})</span>
                         {canManage && (
                            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                <DialogTrigger asChild><Button><UserPlus className="h-4 w-4 mr-2" />Invite Members</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Invite a New Member</DialogTitle></DialogHeader>
                                    <p className="text-center p-8">User search/selection UI would go here.</p>
                                    <DialogFooter><Button onClick={handleSendInvitation}>Send Invitation</Button></DialogFooter>
                                </DialogContent>
                            </Dialog>
                         )}
                    </CardTitle>
                    <CardDescription>Manage current project members and their roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                            <div className="flex items-center gap-3">
                                <Avatar><AvatarImage src={member.user.profilePictureUrl} /><AvatarFallback>{member.user.firstName[0]}{member.user.lastName[0]}</AvatarFallback></Avatar>
                                <div>
                                    <p className="font-semibold">{`${member.user.firstName} ${member.user.lastName}`}</p>
                                    <Badge className={getRoleClasses(member.role)}>{member.role}</Badge>
                                </div>
                            </div>
                            {userRole === 'OWNER' && member.role !== 'OWNER' && (
                                <div className="flex items-center gap-2">
                                    <Select value={member.role} onValueChange={(v) => handleUpdateRole(member.id, v)}>
                                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="MEMBER">Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveMember(member.id)}><UserMinus className="h-4 w-4" /></Button>
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {canManage && 
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Pending Invitations ({invitations.filter(i=>i.status === 'PENDING').length})</CardTitle></CardHeader>
                        <CardContent>
                            {invitations.filter(i=>i.status === 'PENDING').map(inv => (
                                <div key={inv.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                                    <div>
                                        <p className="text-sm font-medium">{inv.invitedUser.email}</p>
                                        <p className="text-xs text-gray-500">Invited as {inv.role} on {new Date(inv.invitedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500" onClick={() => handleCancelInvitation(inv.id)}><X className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Join Requests ({joinRequests.length})</CardTitle></CardHeader>
                        <CardContent>
                            {joinRequests.map(req => (
                                <div key={req.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                                    <div>
                                        <p className="font-medium">{`${req.user.firstName} ${req.user.lastName}`}</p>
                                        <p className="text-sm text-gray-600 italic">"{req.message}"</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleAcceptJoinRequest(req.id)}><UserCheck className="h-4 w-4"/></Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleRejectJoinRequest(req.id)}><UserX className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            }
        </div>
    )
}

// ==================================
// 5. PROJECT CHAT COMPONENT
// ==================================
function ProjectChat({ projectId, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const endOfMessagesRef = useRef(null);
    
    const fetchMessages = useCallback(async () => {
        const response = await chatService.getProjectMessages(projectId);
        setMessages((response.data?.content || response.data || []).reverse());
    }, [projectId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);
    
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const requestData = { content: input };
        await chatService.sendMessage(projectId, requestData);
        setInput('');
        fetchMessages();
    };

    return (
        <Card className="h-[60vh] flex flex-col">
            <CardHeader><CardTitle>Team Chat</CardTitle></CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender.id === currentUser.id ? 'justify-end' : ''}`}>
                         {msg.sender.id !== currentUser.id && <Avatar className="h-8 w-8"><AvatarImage src={msg.sender.profilePictureUrl}/><AvatarFallback>{msg.sender.firstName[0]}</AvatarFallback></Avatar>}
                        <div className={`rounded-lg p-3 max-w-md ${msg.sender.id === currentUser.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 opacity-75 ${msg.sender.id === currentUser.id ? 'text-right' : 'text-left'}`}>{new Date(msg.sentAt).toLocaleTimeString()}</p>
                        </div>
                         {msg.sender.id === currentUser.id && <Avatar className="h-8 w-8"><AvatarImage src={currentUser.profilePictureUrl}/><AvatarFallback>{currentUser.firstName[0]}</AvatarFallback></Avatar>}
                    </div>
                ))}
                 <div ref={endOfMessagesRef} />
            </CardContent>
            <div className="p-4 border-t flex gap-2">
                <Input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." />
                <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
            </div>
        </Card>
    );
}

// ==================================
// 6. PROJECT SETTINGS COMPONENT
// ==================================
function ProjectSettings({ project, onUpdate }) {
    const [form, setForm] = useState({ title: project.title || '', description: project.description || '', category: project.category || '', maxTeamSize: project.maxTeamSize || 2, status: project.status || 'RECRUITING', expectedStartDate: project.expectedStartDate || '', expectedEndDate: project.expectedEndDate || '', requirements: project.requirements || '', goals: project.goals || '', problemStatement: project.problemStatement || '', objectives: project.objectives || '', techStack: project.techStackList || [], githubRepo: project.githubRepo || '', demoUrl: project.demoUrl || '' });
    const navigate = useNavigate();

    const handleSave = async () => { await projectService.updateProject(project.id, form); onUpdate(); alert("Project updated!"); };
    const handleDelete = async () => { if (window.prompt('To confirm, type the project title: ' + project.title) === project.title) { await projectService.deleteProject(project.id); alert("Project deleted."); navigate('/projects/my-projects'); } else { alert("Title did not match. Deletion cancelled."); } };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Update your project's public information.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div><Label>Project Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                    <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={5}/></div>
                     <div><Label>Category</Label>
                        <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="WEB_DEVELOPMENT">Web Development</SelectItem><SelectItem value="MOBILE_APP">Mobile App</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                </CardContent>
            </Card>
            <Card className="border-red-500 bg-red-50/50">
                <CardHeader><CardTitle className="text-red-600">Danger Zone</CardTitle><CardDescription>These actions are permanent and cannot be undone.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 border border-red-200 rounded-md">
                        <div><p className="font-semibold">Delete Project</p><p className="text-sm text-gray-600">This will permanently delete the project and all its data.</p></div>
                        <Button variant="destructive" onClick={handleDelete}>Delete Project</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


// ==================================
// 7. MAIN PROJECT PAGE COMPONENT
// ==================================
export default function ProjectPage() {
    const { projectId } = useParams();
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    
    const loadData = useCallback(async () => {
        if (!projectId) return;
        try {
            // First, get the project and members to determine user role
            const [projRes, membersRes] = await Promise.all([
                projectService.getProject(projectId),
                projectService.getProjectMembers(projectId),
            ]);

            setProject(projRes.data || projRes || null);
            const membersData = membersRes.data?.content || membersRes.data || [];
            setMembers(membersData);

            // Determine if current user is owner
            const currentUserMemberInfo = membersData.find(m => m.user.id === userProfile?.id);
            const isOwner = (projRes.data || projRes)?.owner?.id === userProfile?.id;

            // Load additional data based on user role
            const additionalCalls = [
                projectService.getProjectTasks(projectId),
                notificationService.getUnreadCount(),
            ];

            // Only load owner-specific data if user is owner
            if (isOwner) {
                additionalCalls.push(
                    teamService.getProjectInvitations(projectId),
                    joinRequestService.getProjectJoinRequests(projectId)
                );
            }

            const [tasksRes, unreadRes, ...ownerData] = await Promise.all(additionalCalls);

            setTasks(tasksRes.data?.content || tasksRes.data || []);
            setUnreadNotifs(unreadRes.data || 0);

            // Set owner-specific data only if user is owner
            if (isOwner && ownerData.length >= 2) {
                setInvitations(ownerData[0]?.data?.content || ownerData[0]?.data || []);
                setJoinRequests(ownerData[1]?.data?.content || ownerData[1]?.data || []);
            } else {
                setInvitations([]);
                setJoinRequests([]);
            }

        } catch (err) {
            setError(err.message || 'Failed to load project data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId, userProfile?.id]);
    
    useEffect(() => {
        setLoading(true);
        loadData();
    }, [loadData, projectId]);
    
    const currentUserMemberInfo = members.find(m => m.user.id === userProfile?.id);
    const isOwner = project?.owner?.id === userProfile?.id;
    let userRole = null;
    if (isOwner) {
        userRole = "Lead";
    } else if (currentUserMemberInfo) {
        userRole = "Member";
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /><p className="ml-4 text-lg">Loading Project...</p></div>;
    if (error) return <div className="p-8"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;
    if (!project) return <div className="p-8"><Alert><AlertTitle>Project Not Found</AlertTitle><AlertDescription>The requested project could not be found.</AlertDescription></Alert></div>;

    // Use the backend role for canManage logic, but display "Lead" or "Member"
    const backendRole = isOwner ? 'OWNER' : currentUserMemberInfo?.role;

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                 <header className="mb-6">
                    <Button variant="ghost" onClick={() => navigate('/projects/my-projects')} className="mb-4 text-gray-600"><ArrowLeft className="h-4 w-4 mr-2" />Back to My Projects</Button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge className={getStatusColor(project.status)}>{project.status?.replace('_', ' ')}</Badge>
                                {userRole && <Badge className={getRoleClasses(backendRole)}>{userRole}</Badge>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadNotifs}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <NotificationsPanel onUpdate={loadData} />
                                </PopoverContent>
                            </Popover>
                            {isOwner && <Button variant="outline" size="icon" onClick={() => setActiveTab('settings')}><Settings className="h-5 w-5" /></Button>}
                        </div>
                    </div>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 md:grid-cols-5">
                        <TabsTrigger value="overview"><Info className="h-4 w-4 mr-2"/>Overview</TabsTrigger>
                        <TabsTrigger value="tasks"><Package className="h-4 w-4 mr-2"/>Tasks</TabsTrigger>
                        <TabsTrigger value="team"><Users className="h-4 w-4 mr-2"/>Team</TabsTrigger>
                        <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-2"/>Chat</TabsTrigger>
                        {isOwner && <TabsTrigger value="settings" className="hidden md:flex"><ShieldQuestion className="h-4 w-4 mr-2"/>Settings</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="overview" className="mt-6"><ProjectOverview project={project} tasks={tasks} members={members} /></TabsContent>
                    <TabsContent value="tasks" className="mt-6"><TaskManagement projectId={projectId} members={members} initialTasks={tasks} userRole={backendRole} onUpdate={loadData} /></TabsContent>
                    <TabsContent value="team" className="mt-6"><TeamManagement project={project} members={members} invitations={invitations} joinRequests={joinRequests} userRole={backendRole} onUpdate={loadData} /></TabsContent>
                    <TabsContent value="chat" className="mt-6"><ProjectChat projectId={projectId} currentUser={userProfile} /></TabsContent>
                    {isOwner && <TabsContent value="settings" className="mt-6"><ProjectSettings project={project} onUpdate={loadData} /></TabsContent>}
                </Tabs>
            </div>
        </div>
    );
}

