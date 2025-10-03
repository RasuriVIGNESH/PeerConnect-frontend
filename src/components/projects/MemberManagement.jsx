import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  UserPlus, 
  Users, 
  Mail, 
  User,
  Settings,
  Trash2,
  Crown,
  Shield,
  Calendar
} from 'lucide-react';
import { projectService } from '../../services/enhanced-project-service';

export default function MemberManagement() {
  const { projectId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Add member dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'MEMBER',
    message: ''
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

      const [projectData, membersData, invitationsData] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getProjectMembers(projectId),
        projectService.getProjectInvitations(projectId).catch(() => [])
      ]);

      setProject(projectData);
      setMembers(Array.isArray(membersData) ? membersData : membersData?.content || []);
      setInvitations(Array.isArray(invitationsData) ? invitationsData : invitationsData?.content || []);
    } catch (err) {
      console.error('Error loading project data:', err);
      setError(err.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    try {
      setError('');
      
      if (!inviteForm.email.trim()) {
        setError('Email is required');
        return;
      }

      const invitationData = {
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        message: inviteForm.message.trim() || undefined
      };

      await projectService.sendInvitation(projectId, invitationData);
      setMessage('Invitation sent successfully!');
      
      setShowAddDialog(false);
      setInviteForm({
        email: '',
        role: 'MEMBER',
        message: ''
      });
      
      await loadProjectData();
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err.message || 'Failed to send invitation');
    }
  };

  const handleRemoveMember = async (member) => {
    if (member.user.id === userProfile?.id) {
      if (!window.confirm('Are you sure you want to leave this project?')) return;
    } else {
      if (!window.confirm(`Are you sure you want to remove ${member.user.firstName} ${member.user.lastName} from this project?`)) return;
    }

    try {
      setError('');
      
      if (member.user.id === userProfile?.id) {
        await projectService.leaveProject(projectId);
        navigate('/projects/my');
        return;
      } else {
        await projectService.removeMember(projectId, member.id);
        setMessage('Member removed successfully');
        await loadProjectData();
      }
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      setError('');
      await projectService.updateMemberRole(projectId, memberId, newRole);
      setMessage('Member role updated successfully');
      await loadProjectData();
    } catch (err) {
      console.error('Error updating member role:', err);
      setError(err.message || 'Failed to update member role');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'OWNER': return <Crown className="h-4 w-4" />;
      case 'ADMIN': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'MEMBER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvitationStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isProjectOwner = () => {
    return project?.owner?.id === userProfile?.id;
  };

  const canManageMember = (member) => {
    if (!isProjectOwner()) return false;
    if (member.user.id === userProfile?.id) return false; // Can't manage yourself
    if (member.role === 'OWNER') return false; // Can't manage other owners
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!isProjectOwner()) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              You don't have permission to manage team members for this project.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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
                Team Management - {project?.title}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage team members and invitations
              </p>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this project
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(value) => setInviteForm({...inviteForm, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Input
                      id="message"
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                      placeholder="Add a personal message..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendInvitation} disabled={!inviteForm.email.trim()}>
                      Send Invitation
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

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold">{members.length}</div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold">
                    {invitations.filter(inv => inv.status === 'PENDING').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Invites</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold">
                    {project?.maxTeamSize || '∞'}
                  </div>
                  <div className="text-sm text-gray-600">Max Team Size</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Current Members ({members.length})
              </CardTitle>
              <CardDescription>
                Active team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No team members yet
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.user.firstName?.charAt(0)}{member.user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {member.user.firstName} {member.user.lastName}
                            {member.user.id === userProfile?.id && (
                              <span className="text-sm text-gray-500 ml-2">(You)</span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {member.user.branch} • Class of {member.user.graduationYear}
                          </p>
                          <div className="flex items-center mt-1">
                            <Badge className={getRoleColor(member.role)} variant="outline">
                              <span className="flex items-center">
                                {getRoleIcon(member.role)}
                                <span className="ml-1">{member.role}</span>
                              </span>
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {canManageMember(member) && (
                        <div className="flex items-center space-x-2">
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateRole(member.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {member.user.id === userProfile?.id && !isProjectOwner() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Leave Project
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Invitations ({invitations.length})
              </CardTitle>
              <CardDescription>
                Sent invitations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No invitations sent yet
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map(invitation => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{invitation.email}</h4>
                        <p className="text-sm text-gray-600">
                          Role: {invitation.role} • 
                          Sent {new Date(invitation.createdAt).toLocaleDateString()}
                        </p>
                        {invitation.message && (
                          <p className="text-sm text-gray-500 mt-1">
                            "{invitation.message}"
                          </p>
                        )}
                      </div>

                      <Badge 
                        className={getInvitationStatusColor(invitation.status)}
                        variant="outline"
                      >
                        {invitation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}