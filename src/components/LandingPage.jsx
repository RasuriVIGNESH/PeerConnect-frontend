import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Lightbulb, Trophy, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Skill-Based Matching",
      description: "Connect with students who have complementary skills for your projects"
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Project Collaboration",
      description: "Create and manage projects with built-in task management and team coordination"
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-purple-600" />,
      title: "Skills Analytics",
      description: "Discover which skills are in demand and plan your learning journey"
    },
    {
      icon: <Trophy className="h-8 w-8 text-orange-600" />,
      title: "Achievement System",
      description: "Earn badges and recognition for your contributions and skill development"
    }
  ];

  const benefits = [
    "Find teammates with complementary skills",
    "Showcase your projects and achievements",
    "Discover trending skills in your field",
    "Build your professional network early",
    "Collaborate on real-world projects",
    "Get peer feedback and skill ratings"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">PeerConnect</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect. Collaborate. <span className="text-blue-600">Create.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate platform for college students to form teams, share skills, 
            and build amazing projects together. Find your perfect project partners 
            based on complementary skills and shared interests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Join PeerConnect
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              PeerConnect provides all the tools you need to find teammates, 
              manage projects, and grow your skills.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why choose PeerConnect?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of students who are already using PeerConnect to 
                build amazing projects and advance their careers.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-6">
                Create your account today and start connecting with talented 
                students from your college and beyond.
              </p>
              <Link to="/register">
                <Button size="lg" className="w-full">
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Free to join • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">PeerConnect</h3>
            <p className="text-gray-400 mb-6">
              Connecting college students for better collaboration
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/login" className="text-gray-400 hover:text-white">
                Sign In
              </Link>
              <Link to="/register" className="text-gray-400 hover:text-white">
                Sign Up
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400 text-sm">
                © 2024 PeerConnect. Built for students, by students.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

