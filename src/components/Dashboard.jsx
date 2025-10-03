import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRequests } from '../contexts/RequestContext'; // <-- 1. IMPORT useRequests HOOK
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FolderOpen, 
  TrendingUp, 
  LogOut, 
  Plus,
  Menu,
  Bell,
  User,
  Mail,
  Sparkles,
  BookOpen
} from 'lucide-react';
// Note: Unused imports were removed for cleanliness

export default function Dashboard() {
  const { currentUser, userProfile, logout } = useAuth();
  const { pendingCount } = useRequests(); // <-- 2. GET PENDING COUNT FROM CONTEXT
  const [projectConunt, setProjectCount]=useState(0);
  const [skillCount, setSkillCount]=useState(0);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Mock notifications data - replace with actual API call
  const notifications = [
    { id: 1, text: "🎉 New project invitation received from Sarah", time: "2 min ago", unread: true },
    { id: 2, text: "⭐ Your project 'AI Chatbot' was featured", time: "1 hour ago", unread: true },
    { id: 3, text: "🤝 Connection request from Alex accepted", time: "3 hours ago", unread: false },
    { id: 4, text: "📚 New skill badge earned: React Expert", time: "1 day ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Quick Actions - Only the 5 requested features
  const quickActions = [
    {
      title: "Start New Project",
      description: "Begin your next collaboration",
      icon: <Plus className="h-6 w-6" />,
      onClick: () => navigate('/projects/create'),
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
      hoverGradient: "hover:from-pink-600 hover:to-rose-600"
    },
    {
      title: "Browse Projects",
      description: "Join exciting initiatives",
      icon: <BookOpen className="h-6 w-6" />,
      onClick: () => navigate('/discover/projects'),
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-500",
      hoverGradient: "hover:from-cyan-600 hover:to-blue-600"
    }
  ];

  // Main Stats - Only the 3 requested features
  const stats = [
    {
      title: "My Projects",
      value: projectConunt, // Backend integration
      icon: <FolderOpen className="h-5 w-5" />,
      description: "Active collaborations",
      onClick: () => navigate('/projects/my-projects'),
      gradient: "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600",
      lightBg: "bg-violet-50",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: "+3 this month",
      trendColor: "text-violet-600"
    },
    {
      title: "Connections",
      value: userProfile?.connectionCount || "0", // Backend integration
      icon: <Users className="h-5 w-5" />,
      description: "Students in network",
      onClick: () => navigate('/connections'),
      gradient: "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500",
      lightBg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+12 new",
      trendColor: "text-blue-600"
    },
    {
      title: "Skills",
      value: skillCount, // Backend integration
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Verified abilities",
      onClick: () => navigate('/skills'),
      gradient: "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600",
      lightBg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: "+2 earned",
      trendColor: "text-emerald-600"
    }
  ];

  // Backend integration for notifications
  useEffect(() => {
    // Fetch notifications from backend
    const fetchNotifications = async () => {
      try {
       
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                PeerConnect
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {userProfile?.isCollegeVerified && (
                  <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              
              {/* Profile Image */}
              <Link to="/profile">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 hover:scale-105 ring-2 ring-white/50">
                  {userProfile?.profileImage ? (
                    <img 
                      src={userProfile.profileImage} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
              </Link>

              {/* Menu Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 py-2 z-50">
                    {/* // V-- 3. UPDATED BUTTON JSX --V */}
                    <button
                      onClick={() => {
                        navigate('/requests');
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center justify-between transition-all duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>Requests</span>
                      </div>
                      {pendingCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {pendingCount}
                        </span>
                      )}
                    </button>
                    {/* // ^-- END OF UPDATED BUTTON --^ */}
                    <button
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 flex items-center space-x-2 text-red-600 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Notification */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{userProfile?.firstName || currentUser?.email?.split('@')[0] || "User"}</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Ready to create something amazing today? ✨
            </p>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-l-2 transition-all duration-200 ${
                        notification.unread ? 'border-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50' : 'border-transparent'
                      }`}
                    >
                      <p className="text-sm text-gray-900">{notification.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Only Start New Project and Browse Projects */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 hover:scale-105 border-0 overflow-hidden group"
                onClick={action.onClick}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${action.gradient} ${action.hoverGradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <div className="text-white">
                      {action.icon}
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Stats Grid - My Projects, Connections, Skills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 hover:scale-105 border-0 shadow-lg overflow-hidden group"
              onClick={stat.onClick}
            >
              <div className={`h-1 ${stat.gradient}`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <div className={`p-2 ${stat.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <div className={stat.iconColor}>
                      {stat.icon}
                    </div>
                  </div>
                  {stat.title === "My Projects" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2 hover:bg-purple-100 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/projects/create');
                      }}
                    >
                      <Plus className="h-3 w-3 text-purple-600" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <p className="text-xs text-gray-500 mb-2">{stat.description}</p>
                <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${stat.lightBg} ${stat.trendColor}`}>
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Exit PeerConnect?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to sign out of the app?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogout}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                >
                  Yes, Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdowns */}
      {(showMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
}