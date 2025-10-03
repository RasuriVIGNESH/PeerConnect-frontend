import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Plus, Users, Calendar, ArrowLeft, Settings, Eye, Edit3, Trash2, Search, Filter, CheckCircle, Clock, User, X, AlertTriangle } from 'lucide-react';
import { projectService } from '../../services/projectService.js';

// Enhanced Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, projectTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 mb-3">
              Are you sure you want to delete <strong>"{projectTitle}"</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm font-medium">⚠️ This action cannot be undone</p>
              <p className="text-red-700 text-sm mt-1">
                All project data, tasks, and member information will be permanently removed.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MyProjects() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    projectId: null,
    projectTitle: '',
    loading: false
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    loadMyProjects();
  }, []);

  const loadMyProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectService.getMyProjects(0, 50);
      const projectsData = response?.content || [];
      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading my projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced delete function with modal
  const handleDeleteProject = (projectId, projectTitle) => {
    setDeleteModal({
      isOpen: true,
      projectId,
      projectTitle,
      loading: false
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      setError('');
      
      await projectService.deleteProject(deleteModal.projectId);
      setMessage('Project deleted successfully');
      await loadMyProjects();
      
      setDeleteModal({
        isOpen: false,
        projectId: null,
        projectTitle: '',
        loading: false
      });
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const closeDeleteModal = () => {
    if (!deleteModal.loading) {
      setDeleteModal({
        isOpen: false,
        projectId: null,
        projectTitle: '',
        loading: false
      });
    }
  };

  const getFilteredProjects = () => {
    return projects.filter(project => {
      // Search filter
      if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !project.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter && statusFilter !== 'ALL' && project.status !== statusFilter) {
        return false;
      }

      // Role filter
      if (roleFilter && roleFilter !== 'ALL') {
        const isOwner = project.owner?.id === userProfile?.id;
        if (roleFilter === 'OWNER' && !isOwner) return false;
        if (roleFilter === 'MEMBER' && isOwner) return false;
      }

      return true;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserRole = (project) => {
    if (project.owner?.id === userProfile?.id) {
      return 'Owner';
    }
    const userMember = project.members?.find(member => member.user?.id === userProfile?.id);
    return userMember?.role || 'Member';
  };

  const isProjectOwner = (project) => {
    return project.owner?.id === userProfile?.id;
  };

  const clearMessage = () => {
    setMessage('');
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your projects...</p>
          <p className="text-sm text-gray-500">Fetching your amazing work...</p>
        </div>
      </div>
    );
  }

  const filteredProjects = getFilteredProjects();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="h-8 w-8 mr-3 text-blue-600" />
                My Projects
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and track your project portfolio • {projects.length} total projects
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/projects/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Messages */}
        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200 shadow-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {message}
              <button onClick={clearMessage} className="ml-2 text-green-600 hover:text-green-800 font-medium">×</button>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200 shadow-sm">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <button onClick={clearMessage} className="ml-2 text-red-600 hover:text-red-800 font-medium">×</button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Search and Filters */}
        <Card className="mb-8 shadow-sm border-gray-200">
          <CardHeader className="bg-gray-80 border-b border-gray-200 h-3">
            <CardTitle className="flex items-center text-gray-800 ">
              <Search className="h-5 w-5 mr-2 text-gray-600" />
              Search & Filter Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-gray-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32 border-gray-300">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || statusFilter || roleFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setRoleFilter('');
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Display */}
        {filteredProjects.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="text-center py-16">
              <div className="text-gray-400 mb-6">
                <FolderOpen className="h-20 w-20 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {projects.length === 0 
                  ? 'Start your journey by creating your first project and collaborating with amazing people'
                  : 'Try adjusting your search terms or filter criteria to find what you\'re looking for'
                }
              </p>
              {projects.length === 0 && (
                <Link to="/projects/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <Card key={project.id} className="hover:shadow-lg transition-all duration-200 border-gray-200 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-3 truncate" title={project.title}>
                        {project.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`${getStatusColor(project.status)} text-xs font-medium`} variant="outline">
                          {project.status?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getUserRole(project)}
                        </Badge>
                      </div>
                    </div>
                    
                    {isProjectOwner(project) && (
                      <div className="flex space-x-1 ml-2">
                        <Link to={`/projects/${project.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                            <Edit3 className="h-4 w-4 text-gray-600" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id, project.title)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {project.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{project.currentTeamSize || 0}/{project.maxTeamSize || '∞'}</span>
                    </div>
                    
                    {project.owner && (
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2 text-green-500" />
                        <span className="truncate" title={`${project.owner.firstName} ${project.owner.lastName}`}>
                          {project.owner.firstName} {project.owner.lastName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Required Skills */}
                  {project.requiredSkills && project.requiredSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.requiredSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-300">
                            {skill.name || skill}
                          </Badge>
                        ))}
                        {project.requiredSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-300">
                            +{project.requiredSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full border-gray-300 hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    
                    <Link to={`/projects/${project.id}/tasks`} className="flex-1">
                        {/* <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Tasks
                        </Button> */}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        projectTitle={deleteModal.projectTitle}
        loading={deleteModal.loading}
      />
    </div>
  );
}