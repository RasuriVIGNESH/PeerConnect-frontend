import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Filter,
  Users,
  Star,
  MapPin,
  Calendar,
  GraduationCap,
  Github,
  Linkedin,
  Globe,
  UserPlus,
  MessageCircle,
  X,
  Loader2,
  Building
} from 'lucide-react';

// Import your existing services (using correct paths based on your SkillsManager.jsx)
import userService from '../../services/userService';
import skillsService from '../../services/skillsService';

export default function StudentDiscovery() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [predefinedSkills, setPredefinedSkills] = useState([]);
  const [skillCategories, setSkillCategories] = useState({});
  const [userSkills, setUserSkills] = useState([]);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedGradYear, setSelectedGradYear] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];

  const graduationYears = [2024, 2025, 2026, 2027, 2028];
  const availabilityStatuses = ['AVAILABLE', 'BUSY', 'NOT_AVAILABLE'];

  useEffect(() => {
    loadStudentsData();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, selectedSkills, selectedBranch, selectedGradYear, availabilityFilter]);

  async function loadStudentsData() {
    try {
      setLoading(true);
      setError(null);

      // Load predefined skills
      try {
        const skillsResponse = await skillsService.getPredefinedSkills();
        console.log('Skills response:', skillsResponse);
        
        if (skillsResponse?.data) {
          setPredefinedSkills(skillsResponse.data);
          // Group skills by category
          const grouped = groupSkillsByCategory(skillsResponse.data);
          setSkillCategories(grouped);
        }
      } catch (skillsError) {
        console.warn('Could not load predefined skills:', skillsError);
      }

      // Load current user's skills
      if (currentUser) {
        try {
          const userSkillsResponse = await skillsService.getUserSkills();
          console.log('User skills response:', userSkillsResponse);
          
          const currentUserSkills = userSkillsResponse?.data?.map(userSkill => 
            userSkill.skill?.name || userSkill.skillName || userSkill.name
          ) || [];
          setUserSkills(currentUserSkills);
        } catch (userSkillsError) {
          console.warn('Could not load user skills:', userSkillsError);
          setUserSkills([]);
        }
      }

      // Load users - Try discover endpoint first, fallback to search
      let studentsData = [];
      
      try {
        // Try discover endpoint first
        console.log('Attempting to discover users...');
        const discoverResponse = await userService.discoverUsers();
        console.log('Discover response:', discoverResponse);
        
        if (discoverResponse?.data?.content) {
          studentsData = discoverResponse.data.content;
        } else if (discoverResponse?.data && Array.isArray(discoverResponse.data)) {
          studentsData = discoverResponse.data;
        } else if (discoverResponse?.content) {
          studentsData = discoverResponse.content;
        }
      } catch (discoverError) {
        console.warn('Discover endpoint failed, trying search...', discoverError);
        
        try {
          // Fallback to search endpoint
          const searchResponse = await userService.searchUsers({});
          console.log('Search response:', searchResponse);
          
          if (searchResponse?.data?.content) {
            studentsData = searchResponse.data.content;
          } else if (searchResponse?.data && Array.isArray(searchResponse.data)) {
            studentsData = searchResponse.data;
          } else if (searchResponse?.content) {
            studentsData = searchResponse.content;
          }
        } catch (searchError) {
          console.error('Both discover and search failed:', searchError);
          throw new Error('Failed to load students data');
        }
      }

      // Filter out current user
      if (currentUser?.id) {
        studentsData = studentsData.filter(student => student.id !== currentUser.id);
      }

      // Calculate compatibility scores and add additional data
      const studentsWithCompatibility = studentsData.map(student => {
        const studentSkills = extractStudentSkills(student);
        
        return {
          ...student,
          compatibilityScore: calculateCompatibility(userSkills, studentSkills),
          skillCount: studentSkills.length,
          // Ensure proper field mapping
          displayName: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          profileImage: student.profileImage || student.profilePicture || student.avatar || null,
          studentSkills: studentSkills,
          collegeName: student.collage?.name
        };
      });

      // Sort by compatibility score (highest first), then by name
      studentsWithCompatibility.sort((a, b) => {
        if (b.compatibilityScore !== a.compatibilityScore) {
          return b.compatibilityScore - a.compatibilityScore;
        }
        return (a.displayName || '').localeCompare(b.displayName || '');
      });

      setStudents(studentsWithCompatibility);
      console.log('Loaded students:', studentsWithCompatibility.length);
    } catch (error) {
      console.error('Error loading students data:', error);
      setError('Failed to load students data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function extractStudentSkills(student) {
    // Handle different possible skill data structures
    if (student.skills && Array.isArray(student.skills)) {
      return student.skills.map(skill => {
        if (typeof skill === 'string') return skill;
        if (skill.skill?.name) return skill.skill.name;
        if (skill.name) return skill.name;
        if (skill.skillName) return skill.skillName;
        return '';
      }).filter(Boolean);
    }
    
    if (student.userSkills && Array.isArray(student.userSkills)) {
      return student.userSkills.map(skill => {
        if (skill.skill?.name) return skill.skill.name;
        if (skill.name) return skill.name;
        return '';
      }).filter(Boolean);
    }
    
    return [];
  }

  function calculateCompatibility(userSkills = [], studentSkills = []) {
    if (userSkills.length === 0 || studentSkills.length === 0) return 0;

    const commonSkills = userSkills.filter(skill => 
      studentSkills.some(studentSkill => 
        studentSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    const complementarySkills = studentSkills.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    );

    const commonScore = commonSkills.length * 2;
    const complementaryScore = Math.min(complementarySkills.length, 3) * 1;
    const totalPossible = Math.max(userSkills.length, studentSkills.length) * 2;

    return totalPossible > 0 ? Math.round(((commonScore + complementaryScore) / totalPossible) * 100) : 0;
  }

  function applyFilters() {
    let filtered = [...students];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        (student.displayName || '').toLowerCase().includes(term) ||
        (student.bio || '').toLowerCase().includes(term) ||
        student.studentSkills.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(student =>
        selectedSkills.some(skillName =>
          student.studentSkills.some(skill =>
            skill.toLowerCase() === skillName.toLowerCase()
          )
        )
      );
    }

    // Branch filter
    if (selectedBranch) {
      filtered = filtered.filter(student => student.branch === selectedBranch);
    }

    // Graduation year filter
    if (selectedGradYear) {
      filtered = filtered.filter(student => 
        student.graduationYear === parseInt(selectedGradYear)
      );
    }

    // Availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(student => student.availabilityStatus === availabilityFilter);
    }

    setFilteredStudents(filtered);
  }

  function groupSkillsByCategory(skills) {
    const grouped = {};
    skills.forEach(skill => {
      const category = skill.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });
    return grouped;
  }

  function handleSkillToggle(skillName) {
    setSelectedSkills(prev =>
      prev.includes(skillName)
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  }

  function clearFilters() {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedBranch('');
    setSelectedGradYear('');
    setAvailabilityFilter('');
  }

  async function handleConnectRequest(studentId, studentName) {
    try {
      // This would be implemented based on your connection/messaging system
      console.log(`Connection request sent to ${studentName} (${studentId})`);
      // You can implement actual connection logic here
      // await userService.sendConnectionRequest(studentId);
      
      // Show success message (you might want to add a toast notification)
      alert(`Connection request sent to ${studentName}!`);
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Discover Students
          </h1>
          <p className="text-muted-foreground mt-1">
            Find and connect with fellow students based on skills and interests
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, bio, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Branch Filter */}
              <div>
                <Label>Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Graduation Year Filter */}
              <div>
                <Label>Graduation Year</Label>
                <Select value={selectedGradYear} onValueChange={setSelectedGradYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Filter */}
              <div>
                <Label>Availability</Label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills Filter */}
            {Object.keys(skillCategories).length > 0 && (
              <div>
                <Label>Filter by Skills</Label>
                <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                  {Object.entries(skillCategories).map(([category, skills]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                          <div key={skill.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`skill-${skill.id}`}
                              checked={selectedSkills.includes(skill.name)}
                              onCheckedChange={() => handleSkillToggle(skill.name)}
                            />
                            <Label
                              htmlFor={`skill-${skill.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {skill.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div>
                <Label>Selected Skills:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSkills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleSkillToggle(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Found {filteredStudents.length} students
          {selectedSkills.length > 0 && ` with skills: ${selectedSkills.join(', ')}`}
        </p>
      </div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.profileImage} />
                      <AvatarFallback>
                        {(student.displayName || 'Unknown').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {student.displayName || 'Unknown User'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {student.branch || 'No Branch'}
                      </CardDescription>
                      {student.collegeName && (
                        <CardDescription className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {student.collegeName}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {/* Compatibility Score */}
                  {student.compatibilityScore > 0 && (
                    <Badge
                      variant={student.compatibilityScore >= 70 ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      {student.compatibilityScore}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Bio */}
                {student.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {student.bio}
                  </p>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>Class of {student.graduationYear || 'Unknown'}</span>
                  </div>
                  {student.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{student.location}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {student.studentSkills.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">SKILLS</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.studentSkills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {student.studentSkills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.studentSkills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(student.githubUrl || student.linkedinUrl || student.portfolioUrl) && (
                  <div className="flex gap-2">
                    {student.githubUrl && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                        <a href={student.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {student.linkedinUrl && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                        <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {student.portfolioUrl && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                        <a href={student.portfolioUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleConnectRequest(student.id, student.displayName)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find more students.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}