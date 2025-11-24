import React, { useState, useEffect } from 'react';
import { skillsService } from '../../services/skillsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Users, BookOpen, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e'];

const SkillCard = ({ skill, index }) => (
  <Card 
    className="group hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
    style={{
      animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
    }}
  >
    <CardHeader>
      <div className="flex items-start justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          {skill.name}
        </CardTitle>
      </div>
    </CardHeader>
    
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary" 
          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0"
        >
          {skill.category.replace(/_/g, ' ')}
        </Badge>
        
        {skill.users && (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span className="font-medium">{skill.users}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const StatCard = ({ icon: Icon, label, value, delay }) => (
  <Card 
    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    style={{
      animation: `fadeInUp 0.4s ease-out ${delay}s both`
    }}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Icon className="w-7 h-7 text-gray-700 dark:text-gray-300" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function SkillDiscovery() {
  const [skills, setSkills] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [cats, popular] = await Promise.all([
          skillsService.getSkillCategories(),
          skillsService.getPopularSkills()
        ]);
        setCategories(cats.data || []);
        setPopularSkills(popular.data?.content || []);
        setSkills(popular.data?.content || []);
      } catch (err) {
        setError('Failed to load initial skill data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm && selectedCategory === 'all') {
      setSkills(popularSkills);
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (selectedCategory !== 'all') {
        const response = await skillsService.getSkillsByCategory(selectedCategory);
        let filteredSkills = response.data?.content || [];
        
        if (searchTerm) {
          filteredSkills = filteredSkills.filter(skill => 
            skill.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setSkills(filteredSkills);
      } else if (searchTerm) {
        const response = await skillsService.searchSkills(searchTerm);
        setSkills(response.data?.content || []);
      }
    } catch (err) {
      setError('Failed to perform search.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    setError('');
    try {
      if (category === 'all') {
        setSkills(popularSkills);
      } else {
        const response = await skillsService.getSkillsByCategory(category);
        let filteredSkills = response.data?.content || [];
        
        if (searchTerm) {
          filteredSkills = filteredSkills.filter(skill => 
            skill.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setSkills(filteredSkills);
      }
    } catch (err) {
      setError(`Failed to load skills for ${category}.`);
    } finally {
      setLoading(false);
    }
  };

  const chartData = popularSkills.slice(0, 8).map((skill, index) => ({
    name: skill.name,
    users: skill.users || 0,
    color: COLORS[index % COLORS.length]
  }));

  const totalUsers = popularSkills.reduce((sum, skill) => sum + (skill.users || 0), 0);
  const totalSkills = popularSkills.length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{payload[0].value} users</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <h1 className="text-4xl font-bold mb-2 text-sky-500">
            Discover Skills
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore trending skills and what others are learning
          </p>
        </div>

        {/* Search Bar with Category Filter */}
        <Card 
          className="mb-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          style={{ animation: 'fadeInUp 0.4s ease-out 0.4s both' }}
        >
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-10 border-gray-300 dark:border-gray-600 focus:border-gray-500"
                />
              </div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48 h-10 border-gray-300 dark:border-gray-600">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSearch}
                className="h-10 px-6 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white"
              >
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chart Section with Stats */}
        {chartData.length > 0 && (
          <Card className="mb-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Skill Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({  percent }) => ` (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="users"
                        animationDuration={800}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => `${value} `}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-col gap-6 lg:w-64">
                  <Card className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Popular Skills</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalSkills}</p>
                        </div>
                        <div className="w-14 h-14 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                          <TrendingUp className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Learners</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</p>
                        </div>
                        <div className="w-14 h-14 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                          <Users className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Grid */}
        {/* <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            {selectedCategory !== 'all' 
              ? `${selectedCategory.replace(/_/g, ' ')} Skills` 
              : 'All Skills'
            } ({skills.length})
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
            </div>
          ) : skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill, index) => (
                <SkillCard key={skill.id} skill={skill} index={index} />
              ))}
            </div>
          ) : (
            <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  No skills found. Try a different search term or category.
                </p>
              </CardContent>
            </Card>
          )}
        </div> */}

        {error && (
          <Card className="mt-6 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6">
              <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}