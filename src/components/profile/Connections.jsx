import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  ArrowLeft,
  MessageCircle,
  UserPlus,
  Mail,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';

export default function Connections() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading connections
    // Replace this with actual API call
    setTimeout(() => {
      setConnections([
        // Mock data - replace with actual API data
        // {
        //   id: 1,
        //   firstName: "Sarah",
        //   lastName: "Johnson",
        //   email: "sarah.j@university.edu",
        //   bio: "CS student passionate about AI and machine learning",
        //   profilePicture: null,
        //   college: "Tech University",
        //   year: "Junior",
        //   skills: ["Python", "React", "Machine Learning", "Data Science"],
        //   socialLinks: {
        //     github: "sarahj",
        //     linkedin: "sarah-johnson",
        //     website: "sarahjohnson.dev"
        //   },
        //   connectionDate: "2024-01-15",
        //   mutualConnections: 5,
        //   isOnline: true
        // },
        // {
        //   id: 2,
        //   firstName: "Alex",
        //   lastName: "Chen",
        //   email: "alex.chen@university.edu",
        //   bio: "Full-stack developer and UI/UX enthusiast",
        //   profilePicture: null,
        //   college: "Tech University",
        //   year: "Senior",
        //   skills: ["JavaScript", "Node.js", "UI/UX Design", "MongoDB"],
        //   socialLinks: {
        //     github: "alexchen",
        //     linkedin: "alex-chen-dev"
        //   },
        //   connectionDate: "2024-02-03",
        //   mutualConnections: 8,
        //   isOnline: false
        // },
        // {
        //   id: 3,
        //   firstName: "Maya",
        //   lastName: "Patel",
        //   email: "maya.p@university.edu",
        //   bio: "Data scientist working on sustainability projects",
        //   profilePicture: null,
        //   college: "Green University",
        //   year: "Graduate",
        //   skills: ["Python", "R", "Data Visualization", "Environmental Science"],
        //   socialLinks: {
        //     linkedin: "maya-patel-data"
        //   },
        //   connectionDate: "2024-01-28",
        //   mutualConnections: 3,
        //   isOnline: true
        // }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredConnections = connections.filter(connection =>
    `${connection.firstName} ${connection.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    connection.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Connections</h1>
                <p className="text-sm text-gray-600">
                  {connections.length} connection{connections.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Link to="/discover/students">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Find New Connections
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Connections List */}
          <div className="flex-1">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search connections by name, skill, or college..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredConnections.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No matching connections' : 'No connections yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'Start connecting with students who share your interests'
                    }
                  </p>
                  {!searchTerm && (
                    <Link to="/discover/students">
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Discover Students
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredConnections.map((connection) => (
                  <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          {connection.profilePicture ? (
                            <img
                              src={connection.profilePicture}
                              alt={`${connection.firstName} ${connection.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {getInitials(connection.firstName, connection.lastName)}
                            </div>
                          )}
                          {connection.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">
                            {connection.firstName} {connection.lastName}
                          </CardTitle>
                          <CardDescription>
                            {connection.year} at {connection.college}
                          </CardDescription>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {connection.bio}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Skills */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {connection.skills.slice(0, 4).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {connection.skills.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{connection.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {connection.socialLinks.github && (
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Github className="h-4 w-4" />
                              </Button>
                            )}
                            {connection.socialLinks.linkedin && (
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Linkedin className="h-4 w-4" />
                              </Button>
                            )}
                            {connection.socialLinks.website && (
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Globe className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                            <Button size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>

                        {/* Connection Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>Connected on {new Date(connection.connectionDate).toLocaleDateString()}</span>
                          <span>{connection.mutualConnections} mutual connections</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/discover/students" className="w-full">
                  <Button className="w-full justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find New Connections
                  </Button>
                </Link>
                <Link to="/discover/projects" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Join Projects
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Network Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Connections</span>
                    <span className="font-medium">{connections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Online Now</span>
                    <span className="font-medium text-green-600">
                      {connections.filter(c => c.isOnline).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">New This Month</span>
                    <span className="font-medium">
                      {connections.filter(c => {
                        const connectionDate = new Date(c.connectionDate);
                        const now = new Date();
                        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                        return connectionDate > monthAgo;
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Popular Skills</CardTitle>
                <CardDescription>In your network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Calculate popular skills from connections */}
                  {['Python', 'React', 'JavaScript', 'Machine Learning', 'UI/UX Design']
                    .map((skill, index) => (
                      <div key={skill} className="flex justify-between items-center">
                        <span className="text-sm">{skill}</span>
                        <Badge variant="secondary" className="text-xs">
                          {connections.filter(c => c.skills.includes(skill)).length}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}