import React, { useState } from 'react';
import { Bell, Plus, Users, Save, Sparkles, History, Eye, EyeOff, Clock, Target, CheckSquare, Package, Flag, X, Copy, Home, FileText, ArrowLeft, Edit2, Trash2 } from 'lucide-react';

// ============================================
// MOCK DATA
// ============================================
const generateMockData = (projectId, projectMembers) => {
  const rooms = [
    {
      id: 'room-1',
      projectId,
      name: 'Frontend Development',
      description: 'UI/UX implementation and React components',
      department: 'Frontend',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      memberCount: projectMembers.length
    },
    {
      id: 'room-2',
      projectId,
      name: 'Backend Development',
      description: 'Spring Boot APIs and database design',
      department: 'Backend',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      memberCount: projectMembers.length
    },
    {
      id: 'room-3',
      projectId,
      name: 'Design & UX',
      description: 'Design system and user experience planning',
      department: 'Design',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      memberCount: projectMembers.length
    },
    {
      id: 'room-4',
      projectId,
      name: 'Testing & QA',
      description: 'Test cases and quality assurance',
      department: 'Testing',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      memberCount: projectMembers.length
    }
  ];

  const notes = {
    'room-1': [
      {
        id: 'note-1',
        roomId: 'room-1',
        title: 'Sprint Planning - Frontend',
        content: `Discussed Q4 roadmap for frontend implementation
- Need design resources by next week for component library
- Todo: Review and finalize color palette and typography
- Long-term goal: Implement dark mode across entire application
- Action: Schedule design review meeting with stakeholders
- Deadline: Complete authentication UI by November 15th
- Resource requirement: Need Figma access for all team members
- Todo: Set up Storybook for component documentation`,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        author: projectMembers[0] || { firstName: 'John', lastName: 'Doe' }
      },
      {
        id: 'note-2',
        roomId: 'room-1',
        title: 'Component Architecture Discussion',
        content: `Planning reusable component structure
- Action: Create shared component library
- Need to decide on state management approach
- Goal: Achieve 80% code reusability across modules`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        author: projectMembers[1] || { firstName: 'Jane', lastName: 'Smith' }
      }
    ],
    'room-2': [
      {
        id: 'note-3',
        roomId: 'room-2',
        title: 'API Design Meeting',
        content: `Backend architecture planning session
- Todo: Design REST API endpoints for user management
- Deadline: Complete database schema by November 10th
- Resource: Need PostgreSQL database setup on cloud
- Action: Document all API endpoints with Swagger
- Long-term goal: Implement microservices architecture
- Need to implement JWT authentication by next sprint`,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        author: projectMembers[0] || { firstName: 'John', lastName: 'Doe' }
      }
    ],
    'room-3': [
      {
        id: 'note-4',
        roomId: 'room-3',
        title: 'Design System Foundation',
        content: `Establishing design principles and guidelines
- Todo: Create design tokens for colors, spacing, and typography
- Goal: Maintain consistent user experience across all platforms
- Action: Conduct user research and usability testing
- Need design tool licenses for the entire team
- Deadline: Finalize wireframes by November 12th`,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        author: projectMembers[1] || { firstName: 'Jane', lastName: 'Smith' }
      }
    ],
    'room-4': []
  };

  return { rooms, notes };
};

// AI Mock Service
const mockAI = {
  categorize: (text) => {
    const items = text.split('\n').filter(item => item.trim().length > 10);
    return items.map((item, i) => {
      const lower = item.toLowerCase();
      let cat = 'action_item';
      if (lower.includes('deadline') || lower.includes('due') || lower.includes('by november') || lower.includes('complete by')) cat = 'deadline';
      else if (lower.includes('need') || lower.includes('resource') || lower.includes('require') || lower.includes('access')) cat = 'resource';
      else if (lower.includes('todo') || lower.includes('task') || lower.includes('to-do')) cat = 'checklist';
      else if (lower.includes('goal') || lower.includes('long-term') || lower.includes('achieve')) cat = 'goal';
      return { id: Date.now() + i, content: item, category: cat, visibility: 'team' };
    });
  },
  summarize: (tags) => {
    const counts = {};
    tags.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
    const summary = Object.entries(counts).map(([c, n]) => `${n} ${c.replace('_', ' ')}`).join(', ');
    return `Meeting Summary: Identified ${tags.length} action items including ${summary}. Key focus areas include task completion, resource allocation, and deadline management.`;
  }
};

// ============================================
// UTILITY COMPONENTS
// ============================================
const getCategoryIcon = (cat) => {
  const icons = { deadline: Clock, resource: Package, checklist: CheckSquare, goal: Target, action_item: Flag };
  const Icon = icons[cat] || FileText;
  return <Icon className="w-4 h-4" />;
};

const getCategoryColor = (cat) => {
  const colors = {
    deadline: 'bg-red-100 text-red-700 border-red-300',
    resource: 'bg-blue-100 text-blue-700 border-blue-300',
    checklist: 'bg-green-100 text-green-700 border-green-300',
    goal: 'bg-purple-100 text-purple-700 border-purple-300',
    action_item: 'bg-orange-100 text-orange-700 border-orange-300'
  };
  return colors[cat] || 'bg-gray-100 text-gray-700 border-gray-300';
};

// ============================================
// ROOM CARD COMPONENT
// ============================================
const RoomCard = ({ room, onClick, onDelete }) => (
  <div 
    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
        <Users className="w-6 h-6 text-indigo-600" />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          {room.memberCount}
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(room.id);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-opacity"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900">{room.name}</h3>
    <p className="text-sm text-gray-600 mb-3">{room.description}</p>
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">
        {new Date(room.createdAt).toLocaleDateString()}
      </span>
      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
        {room.department}
      </span>
    </div>
  </div>
);

// ============================================
// NOTE CARD COMPONENT
// ============================================
const NoteCard = ({ note, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{note.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{note.author.firstName} {note.author.lastName}</span>
          <span>•</span>
          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">{note.content}</p>
      </div>
      <FileText className="w-6 h-6 text-gray-400 flex-shrink-0" />
    </div>
  </div>
);

// ============================================
// TAGS LIST COMPONENT
// ============================================
const TagsList = ({ tags, tagVisibility, setTagVisibility, onToggleVisibility }) => {
  const filteredTags = tags.filter(t => 
    tagVisibility === 'personal' ? t.visibility === 'personal' : t.visibility === 'team'
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setTagVisibility('team')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              tagVisibility === 'team' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />Team
          </button>
          <button 
            onClick={() => setTagVisibility('personal')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              tagVisibility === 'personal' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <EyeOff className="w-4 h-4 inline mr-1" />Personal
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tags yet. Click Categorize!</p>
        ) : (
          filteredTags.map(tag => (
            <div key={tag.id} className={`p-3 rounded-lg border ${getCategoryColor(tag.category)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(tag.category)}
                  <span className="font-medium text-xs uppercase">{tag.category.replace('_', ' ')}</span>
                </div>
                <button 
                  onClick={() => onToggleVisibility(tag.id, tag.visibility === 'team' ? 'personal' : 'team')}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  {tag.visibility === 'team' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm">{tag.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================
// NOTE EDITOR COMPONENT
// ============================================
const NoteEditor = ({ 
  note, 
  onBack, 
  onSave, 
  currentUser,
  editorContent,
  setEditorContent,
  tags,
  setTags,
  tagVisibility,
  setTagVisibility,
  summary,
  setSummary,
  versions,
  showHistory,
  setShowHistory
}) => {
  const [noteTitle, setNoteTitle] = useState(note.title);

  const handleCategorize = () => {
    if (!editorContent.trim()) return;
    const result = mockAI.categorize(editorContent);
    setTags(result);
  };

  const handleSummary = () => {
    if (tags.length === 0) return;
    const result = mockAI.summarize(tags);
    setSummary(result);
  };

  const handleSave = () => {
    onSave(noteTitle);
  };

  const toggleVis = (tagId, newVis) => {
    setTags(prev => prev.map(t => t.id === tagId ? { ...t, visibility: newVis } : t));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <input 
                type="text" 
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="text-2xl font-bold border-none focus:outline-none bg-transparent flex-1 text-gray-900"
                placeholder="Untitled Note"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <History className="w-5 h-5" />History
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Save className="w-5 h-5" />Save
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              <button 
                onClick={handleCategorize}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Sparkles className="w-5 h-5" />
                Categorize
              </button>
            </div>
            <textarea 
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Type your meeting notes here..."
            />
          </div>

          <div className="space-y-6">
            <TagsList 
              tags={tags}
              tagVisibility={tagVisibility}
              setTagVisibility={setTagVisibility}
              onToggleVisibility={toggleVis}
            />

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button 
                onClick={handleSummary}
                disabled={tags.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Sparkles className="w-5 h-5" />
                AI Summary
              </button>
              {summary && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Summary</h3>
                  <p className="text-sm text-purple-800">{summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Version History</h3>
                <button onClick={() => setShowHistory(false)}>
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                {versions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No versions saved yet</p>
                ) : (
                  versions.map(v => (
                    <div key={v.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{v.user}</span>
                        <span className="text-sm text-gray-500">{new Date(v.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{v.tags.length} tags</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ============================================
// MAIN MEETING ROOMS COMPONENT
// ============================================
export default function MeetingRooms({ projectId, projectName, currentUser, projectMembers = [] }) {
  const [view, setView] = useState('rooms'); // 'rooms' | 'notes' | 'editor'
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', description: '', department: '' });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Initialize mock data
  const mockData = generateMockData(projectId, projectMembers);
  const [rooms, setRooms] = useState(mockData.rooms);
  const [allNotes, setAllNotes] = useState(mockData.notes);
  
  // Editor state
  const [editorContent, setEditorContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagVisibility, setTagVisibility] = useState('team');
  const [summary, setSummary] = useState('');
  const [versions, setVersions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const addNotif = (title, msg) => {
    setNotifications(prev => [
      { id: Date.now(), title, message: msg, timestamp: new Date().toISOString(), isRead: false },
      ...prev
    ]);
  };

  const handleCreateRoom = () => {
    if (!roomForm.name.trim()) return;
    
    const newRoom = {
      id: `room-${Date.now()}`,
      projectId,
      name: roomForm.name,
      description: roomForm.description,
      department: roomForm.department || 'General',
      createdAt: new Date().toISOString(),
      memberCount: projectMembers.length
    };
    
    setRooms(prev => [...prev, newRoom]);
    setAllNotes(prev => ({ ...prev, [newRoom.id]: [] }));
    setShowRoomModal(false);
    setRoomForm({ name: '', description: '', department: '' });
    addNotif('Room Created', newRoom.name);
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const roomToDelete = rooms.find(r => r.id === roomId);
      setRooms(prev => prev.filter(r => r.id !== roomId));
      setAllNotes(prev => {
        const updated = { ...prev };
        delete updated[roomId];
        return updated;
      });
      if(roomToDelete) addNotif('Room Deleted', roomToDelete.name);
    }
  };

  const openRoom = (room) => {
    setCurrentRoom(room);
    setView('notes');
  };

  const createNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      roomId: currentRoom.id,
      title: 'Untitled',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser
    };
    
    setCurrentNote(newNote);
    setEditorContent('');
    setTags([]);
    setSummary('');
    setView('editor');
  };

  const openNote = (note) => {
    setCurrentNote(note);
    setEditorContent(note.content);
    setTags([]);
    setSummary('');
    setView('editor');
  };

  const handleSaveNote = (title) => {
    const updatedNote = {
      ...currentNote,
      title,
      content: editorContent,
      updatedAt: new Date().toISOString()
    };

    setAllNotes(prev => {
      const roomNotes = prev[currentRoom.id] || [];
      const existingIndex = roomNotes.findIndex(n => n.id === currentNote.id);
      
      if (existingIndex >= 0) {
        roomNotes[existingIndex] = updatedNote;
      } else {
        roomNotes.push(updatedNote);
      }
      
      return { ...prev, [currentRoom.id]: roomNotes };
    });

    const version = {
      id: Date.now().toString(),
      content: editorContent,
      tags: [...tags],
      timestamp: new Date().toISOString(),
      user: `${currentUser.firstName} ${currentUser.lastName}`
    };
    setVersions(prev => [version, ...prev]);
    addNotif('Saved', 'Note saved successfully');
  };

  // Rooms View
  if (view === 'rooms') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Meeting Rooms</h1>
                  <p className="text-sm text-gray-600">{projectName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <button 
                  onClick={() => setShowRoomModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />Create Room
                </button>
              </div>
            </div>
          </div>
        </header>

        {showNotifications && (
          <div className="fixed top-20 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))}
                  >
                    <div className="font-medium text-gray-900">{n.title}</div>
                    <div className="text-sm text-gray-600">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Collaboration Rooms</h2>
            <div className="text-sm text-gray-600">
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onClick={() => openRoom(room)}
                onDelete={handleDeleteRoom}
              />
            ))}
          </div>
        </main>

        {showRoomModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Create New Room</h3>
                <button onClick={() => setShowRoomModal(false)}>
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                  <input 
                    type="text" 
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Backend Planning"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input 
                    type="text" 
                    value={roomForm.department}
                    onChange={(e) => setRoomForm({ ...roomForm, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Frontend, Backend, Design"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Brief description of this room's purpose"
                  />
                </div>
                <button 
                  onClick={handleCreateRoom}
                  disabled={!roomForm.name.trim()}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Notes List View
  if (view === 'notes' && currentRoom) {
    const roomNotes = allNotes[currentRoom.id] || [];
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setView('rooms'); setCurrentRoom(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentRoom.name}</h1>
                  <p className="text-sm text-gray-600">{currentRoom.description}</p>
                </div>
              </div>
              <button 
                onClick={createNote}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />New Note
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Meeting Notes</h2>
          {roomNotes.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-600 mb-6">Create your first meeting note to get started</p>
              <button 
                onClick={createNote}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />Create Note
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {roomNotes.map(note => (
                <NoteCard key={note.id} note={note} onClick={() => openNote(note)} />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Editor View
  if (view === 'editor' && currentNote) {
    return (
      <NoteEditor 
        note={currentNote}
        onBack={() => setView('notes')}
        onSave={handleSaveNote}
        currentUser={currentUser}
        editorContent={editorContent}
        setEditorContent={setEditorContent}
        tags={tags}
        setTags={setTags}
        tagVisibility={tagVisibility}
        setTagVisibility={setTagVisibility}
        summary={summary}
        setSummary={setSummary}
        versions={versions}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />
    );
  }

  return null;
}
