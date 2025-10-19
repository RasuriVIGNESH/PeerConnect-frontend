import React, { useState, useEffect } from 'react';
import { skillsService } from '../../services/skillsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Zap, Tag } from 'lucide-react';

const SkillCard = ({ skill }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="text-lg">{skill.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <Badge variant="secondary">{skill.category}</Badge>
    </CardContent>
  </Card>
);

export default function SkillDiscovery() {
  const [skills, setSkills] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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
      } catch (err) {
        setError('Failed to load initial skill data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setError('');
    try {
      const response = await skillsService.searchSkills(searchTerm);
      setSkills(response.data?.content || []);
    } catch (err) {
      setError('Failed to perform search.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    setError('');
    try {
      const response = await skillsService.getSkillsByCategory(category);
      setSkills(response.data?.content || []);
    } catch (err) {
      setError(`Failed to load skills for ${category}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Discover Skills</h1>
      
      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Search for skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" /> Search</Button>
      </div>

      <Tabs defaultValue="popular">
        <TabsList>
          <TabsTrigger value="popular"><Zap className="h-4 w-4 mr-2" />Popular Skills</TabsTrigger>
          <TabsTrigger value="categories"><Tag className="h-4 w-4 mr-2" />Browse by Category</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => handleCategorySelect(category)}
              >
                {category.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
          {loading && <p>Loading skills...</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </TabsContent>
      </Tabs>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
