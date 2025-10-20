// src/components/projects/InviteMembers.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, UserPlus, Check, ArrowLeft, Loader2 } from 'lucide-react';
import userService from '../../services/userService';
import { projectService } from '../../services/projectService'; // Ensure this path is correct

export default function InviteMembers() {
  const { projectId } = useParams();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState([]); // Track invited users

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all discoverable users and current project members simultaneously
        const [usersResponse, membersResponse] = await Promise.all([
          userService.discoverUsers(),
          projectService.getProjectMembers(projectId)
        ]);

        const allStudents = usersResponse?.data?.content || usersResponse?.data || [];
        const currentMembers = membersResponse?.data || [];
        const memberIds = new Set(currentMembers.map(member => member.user.id));
        
        // Also add the Lead to the set of users not to show
        const projectDetails = await projectService.getProject(projectId);
        if (projectDetails?.Lead?.id) {
            memberIds.add(projectDetails.Lead.id);
        }

        // Filter out the current user, the project Lead, and any existing members
        const availableStudents = allStudents.filter(student => !memberIds.has(student.id));

        const processedStudents = availableStudents.map(student => ({
          ...student,
          displayName: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          profileImage: student.profileImage || student.profilePicture || student.avatar || null,
          studentSkills: student.skills?.map(s => s.name || s) || [],
        }));

        setStudents(processedStudents);
        setFilteredStudents(processedStudents);

      } catch (err) {
        console.error('Error loading data for invitations:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadData();
    }
  }, [projectId, userProfile]);

  useEffect(() => {
    let filtered = [...students];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = students.filter(student =>
        (student.displayName || '').toLowerCase().includes(term) ||
        student.studentSkills.some(skill => skill.toLowerCase().includes(term))
      );
    }
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleInvite = async (student) => {
    try {
      const invitationData = {
        invitedUserId: student.id,
        role: 'MEMBER', // 👈 Add this line
        message: `You are invited to join the project!` // You can also include a message
      };
      
      await projectService.sendInvitation(projectId, invitationData);
      
      // Add studentId to the invited list to update the UI
      setInvitedUserIds(prev => [...prev, student.id]);
      alert(`Invitation sent to ${student.displayName}!`);

    } catch (err) {
      console.error('Failed to send invitation:', err);
      alert(`Error: ${err.message || 'Could not send invitation.'}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="mt-2 text-muted-foreground">Loading students to invite...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Link to={`/projects/${projectId}`} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          Invite Members
        </h1>
        <p className="text-muted-foreground mt-1">
          Search for students and send them an invitation to join your project.
        </p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredStudents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <Card key={student.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.profileImage} />
                    <AvatarFallback>
                      {(student.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.displayName}</CardTitle>
                    <CardDescription>{student.branch || 'No Branch'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {student.bio || 'No bio available.'}
                </p>
                {student.studentSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {student.studentSkills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                    {student.studentSkills.length > 4 && (
                      <Badge variant="outline" className="text-xs">+{student.studentSkills.length - 4} more</Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <div className="p-4 pt-0">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleInvite(student)}
                  disabled={invitedUserIds.includes(student.id)}
                >
                  {invitedUserIds.includes(student.id) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Invited
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No students found</h3>
            <p className="text-muted-foreground">All eligible students are already on your team or none matched your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}