import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Calendar, 
  User, 
  Clock,
  AlertTriangle,
  ArrowLeft 
} from 'lucide-react';
import { projectService } from '../../services/projectService.js';

export default function TaskManagement() {
  const { projectId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Task creation/editing state
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedToId: '',
    priority: 'MEDIUM',
    status: 'RECRUITING',
    dueDate: '',
    estimatedHours: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load project details, tasks, and members in parallel
      const [projectData, tasksData, membersData] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getProjectTasks(projectId),
        projectService.getProjectMembers(projectId)
      ]);

      setProject(projectData);
      setTasks(Array.isArray(tasksData) ? tasksData : tasksData?.content || []);
      setMembers(Array.isArray(membersData) ? membersData : membersData?.content || []);
    } catch (err) {
      console.error('Error loading project data:', err);
      setError(err.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      setError('');
      
      const taskData = {
        ...taskForm,
        assignedToId: taskForm.assignedToId || null,
        estimatedHours: taskForm.estimatedHours ? parseInt(taskForm.estimatedHours) : null,
        dueDate: taskForm.dueDate || null
      };

      if (editingTask) {
        await projectService.updateTask(projectId, editingTask.id, taskData);
        setMessage('Task updated successfully');
      } else {
        await projectService.createTask(projectId, taskData);
        setMessage('Task created successfully');
      }

      setShowTaskDialog(false);
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        assignedToId: '',
        priority: 'MEDIUM',
        status: 'RECRUITING',
        dueDate: '',
        estimatedHours: ''
      });
      
      await loadProjectData();
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.message || 'Failed to save task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assignedToId: task.assignedToId || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || '',
      estimatedHours: task.estimatedHours?.toString() || ''
    });
    setShowTaskDialog(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      setError('');
      await projectService.deleteTask(projectId, taskId);
      setMessage('Task deleted successfully');
      await loadProjectData();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleToggleTask = async (task) => {
    try {
      setError('');
      const newStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      await projectService.updateTask(projectId, task.id, { status: newStatus });
      setMessage('Task status updated');
      await loadProjectData();
    } catch (err) {
      console.error('Error toggling task:', err);
      setError(err.message || 'Failed to update task status');
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignedTo && task.assignedToId !== filters.assignedTo) return false;
      return true;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RECRUITING': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
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

  const isProjectOwner = () => {
    return project?.owner?.id === userProfile?.id;
  };

  const canEditTask = (task) => {
    return isProjectOwner() || task.assignedToId === userProfile?.id || task.createdById === userProfile?.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tasks - {project?.title}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track project tasks
              </p>
            </div>

            <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTask ? 'Update task details' : 'Add a new task to the project'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      placeholder="Describe the task"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignedTo">Assign To</Label>
                      <Select
                        value={taskForm.assignedToId}
                        onValueChange={(value) => setTaskForm({...taskForm, assignedToId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {members.map(member => (
                            <SelectItem key={member.user.id} value={member.user.id}>
                              {member.user.firstName} {member.user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={taskForm.priority}
                        onValueChange={(value) => setTaskForm({...taskForm, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={taskForm.status}
                        onValueChange={(value) => setTaskForm({...taskForm, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RECRUITING">Recruiting</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        id="estimatedHours"
                        type="number"
                        value={taskForm.estimatedHours}
                        onChange={(e) => setTaskForm({...taskForm, estimatedHours: e.target.value})}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateTask}
                      disabled={!taskForm.title.trim()}
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({...filters, status: value})}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="RECRUITING">Recruiting</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters({...filters, priority: value})}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assigned To</Label>
                <Select
                  value={filters.assignedTo}
                  onValueChange={(value) => setFilters({...filters, assignedTo: value})}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All members</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map(member => (
                      <SelectItem key={member.user.id} value={member.user.id}>
                        {member.user.firstName} {member.user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-4">
                {tasks.length === 0 
                  ? "Get started by creating your first task"
                  : "No tasks match the current filters"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map(task => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                      >
                        {task.status === 'COMPLETED' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <CardTitle className={`text-base ${
                        task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''
                      }`}>
                        {task.title}
                      </CardTitle>
                    </div>
                    
                    {canEditTask(task) && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 mt-2">
                    <Badge className={getStatusColor(task.status)} variant="outline">
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)} variant="outline">
                      {task.priority}
                    </Badge>
                    {task.overdue && (
                      <Badge className="bg-red-100 text-red-800" variant="outline">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-500">
                    {task.assignedToName && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Assigned to: {task.assignedToName}
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {task.estimatedHours && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Est. {task.estimatedHours}h
                        {task.actualHours && ` / Actual: ${task.actualHours}h`}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 pt-2">
                      Created by: {task.createdByName}
                      <br />
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}