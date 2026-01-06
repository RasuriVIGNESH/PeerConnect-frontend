import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FolderOpen, Plus, Users, Calendar, ArrowLeft, Settings, Eye, Edit3,
  Trash2, Search, Filter, CheckCircle, Clock, User, X, AlertTriangle,
  Target, Briefcase, GraduationCap, Mail, ShieldCheck, CalendarDays
} from 'lucide-react';
import { projectService } from '../../services/projectService.js';

// Enhanced Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, projectTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to delete <span className="font-semibold">"{projectTitle}"</span>?
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            ⚠️ This action cannot be undone. All project data, tasks, and member information will be permanently removed.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MyProjects = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [categories, setCategories] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, project: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMyProjects();
    fetchCategories();
  }, [currentUser]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, statusFilter, categoryFilter]);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getMyProjects();
      setProjects(response.content || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await projectService.getProjectCategories();
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Error fetching project categories:', err);
      // Don't set error state here to avoid blocking the main UI if categories fail to load
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(project => project.category === categoryFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleDeleteClick = (project) => {
    setDeleteModal({ isOpen: true, project });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.project) return;

    try {
      setDeleteLoading(true);
      await projectService.deleteProject(deleteModal.project.id);
      setProjects(prev => prev.filter(p => p.id !== deleteModal.project.id));
      setDeleteModal({ isOpen: false, project: null });
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      RECRUITING: 'bg-green-100 text-green-800 border-green-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <div>
            <p className="text-lg font-semibold text-gray-700">Loading your projects...</p>
            <p className="text-sm text-gray-500">Fetching your amazing work...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <FolderOpen className="w-10 h-10 text-blue-600" />
                My Projects
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and track your project portfolio • {projects.length} total projects
              </p>
            </div>
            <Button
              onClick={() => navigate('/projects/create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Project
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-md border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="RECRUITING">Recruiting</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((category, idx) => (
                    <SelectItem key={category.id || idx} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="text-center py-16 shadow-lg border-gray-200">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FolderOpen className="w-12 h-16 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {projects.length === 0 ? 'No Projects Yet' : 'No Projects Found'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {projects.length === 0
                      ? 'Start your journey by creating your first project and collaborating with amazing people'
                      : 'Try adjusting your search terms or filter criteria to find what you\'re looking for'}
                  </p>
                </div>
                {projects.length === 0 && (
                  <Button
                    onClick={() => navigate('/projects/create')}
                    className="mt-4 gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Project
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-xl transition-all duration-300 border-gray-200 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getStatusColor(project.status)} border`}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          {project.categoryName}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-auto">
                          {getTimeAgo(project.createdAt)}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </CardTitle>
                      {/* <CardDescription className="mt-2 text-gray-600 line-clamp-2">
                        {project.description}
                      </CardDescription> */}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-3">

                  {/* Team Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        <span className="font-semibold text-gray-900">{project.currentTeamSize + 1}</span>
                        /{project.maxTeamSize} members
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Created {getTimeAgo(project.createdAt)}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Project Timeline</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Start Date</p>
                        <p className="text-gray-900 font-medium">{formatDate(project.expectedStartDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs mb-1">End Date</p>
                        <p className="text-gray-900 font-medium">{formatDate(project.expectedEndDate)}</p>
                      </div>
                    </div>
                  </div>



                  {/* Team Lead Info */}
                  {project.lead && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">
                                {project.lead.firstName} {project.lead.lastName}
                              </p>
                              {project.lead.verified && (
                                <ShieldCheck className="w-4 h-4 text-blue-600" title="Verified User" />
                              )}
                              {project.lead.collegeVerified && (
                                <Badge className="bg-green-100 text-green-800 text-xs py-0 px-1.5">
                                  College Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">Project Lead</p>
                            {/* <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                <span>{project.lead.branch}</span>
                              </div>
                              <span>•</span>
                              <span>Class of {project.lead.graduationYear}</span>
                            </div> */}
                            {project.lead.email && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{project.lead.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, project: null })}
        onConfirm={handleDeleteConfirm}
        projectTitle={deleteModal.project?.title}
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyProjects;
