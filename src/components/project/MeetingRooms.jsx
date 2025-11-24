import React, { useState, useEffect, useRef } from "react";
import { Bell, Plus, Users, Save, Sparkles, History, Eye, EyeOff, Clock, Target, CheckSquare, Package, Flag, X, FileText, ArrowLeft, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { meetingRoomService } from '../../services/MeetingRoomService';
import { useAuth } from '@/contexts/AuthContext'; // To get current user
import StickyNotes from './StickyNotes';

// ============================================
// UTILITY COMPONENTS
// ============================================
const getCategoryIcon = (cat) => {
    // ... (utility function from previous version)
};

const getCategoryColor = (cat) => {
    // ... (utility function from previous version)
};

const RoomCard = ({ room, onClick, onDelete, isProjectLead }) => (
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
                {isProjectLead && (
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

const NoteCard = ({ note, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{note.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{note.author?.firstName} {note.author?.lastName}</span>
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
// NOTE EDITOR COMPONENT
// ============================================
const NoteEditor = ({ note, onBack, onSave, editorContent, setEditorContent }) => {
    const [noteTitle, setNoteTitle] = useState(note.title);

    // Sticky notes state: in-memory mock (you can load/save to backend via meetingRoomService)
    const [stickies, setStickies] = useState([
        // mock example
        { id: 'sticky-1', x: 20, y: 20, w: 200, h: 140, text: 'Action: assign API', color: '#FFEB3B' },
        { id: 'sticky-2', x: 240, y: 40, w: 200, h: 120, text: 'Design: header tweak', color: '#BBDEFB' },
    ]);

    // container rect ref to clamp drag values
    const containerRef = useRef(null);
    const containerRectRef = useRef(null);

    // measure container for drag boundaries
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const updateRect = () => {
            const r = el.getBoundingClientRect();
            // store simple object with left/top/width/height for easier serialization and to avoid DOM objects in child
            containerRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
        };
        updateRect();
        window.addEventListener('resize', updateRect);
        // also update when scrolled
        window.addEventListener('scroll', updateRect, true);
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, []);

    const handleSave = () => {
        // For demo we just pass the note content and stickies to onSave.
        // In real app: call meetingRoomService.saveNote(note.id, { content: editorContent, stickies });
        onSave(note.id, noteTitle, editorContent, stickies);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                <Save className="w-5 h-5" />Save
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* NOTE EDITOR CONTAINER (relative so sticky layer can position absolute inside) */}
                <div ref={containerRef} className="relative bg-white rounded-lg border border-gray-200 p-6" style={{ minHeight: 520 }}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>

                    {/* The main textarea */}
                    <textarea
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        placeholder="Type your meeting notes here..."
                    />

                    {/* Sticky notes overlay */}
                    <StickyNotes
                        notes={stickies}
                        onChange={(newNotes) => setStickies(newNotes)}
                        containerRectRef={containerRectRef}
                    />
                </div>
            </main>
        </div>
    );
};

// ============================================
// MAIN MEETING ROOMS COMPONENT
// ============================================
export default function MeetingRooms({ projectId, projectName, projectMembers, isProjectLead }) {
    const { userProfile } = useAuth();

    const [view, setView] = useState('rooms'); // 'rooms' | 'notes' | 'editor'
    const [currentRoom, setCurrentRoom] = useState(null);
    const [currentNote, setCurrentNote] = useState(null);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [roomForm, setRoomForm] = useState({ name: '', description: '', department: '' });

    const [rooms, setRooms] = useState([]);
    const [allNotes, setAllNotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Editor state
    const [editorContent, setEditorContent] = useState('');

    const isMember = isProjectLead || projectMembers?.some(member => String(member.user?.id) === String(userProfile?.id));

    // Fetch all rooms for the project
    const loadRooms = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await meetingRoomService.getMeetingRooms(projectId);
            setRooms(response.data || []);
        } catch (err) {
            setError('Failed to load meeting rooms.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
    }, [projectId]);

    const handleCreateRoom = async () => {
        if (!roomForm.name.trim()) return;
        try {
            await meetingRoomService.createMeetingRoom(projectId, roomForm);
            setShowRoomModal(false);
            setRoomForm({ name: '', description: '', department: '' });
            loadRooms(); // Refresh the list
        } catch (err) {
            alert('Failed to create room.');
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await meetingRoomService.deleteMeetingRoom(roomId);
                loadRooms(); // Refresh list
            } catch (err) {
                alert('Failed to delete room.');
            }
        }
    };

    const openRoom = async (room) => {
        setCurrentRoom(room);
        try {
            const response = await meetingRoomService.getNotes(room.id);
            setAllNotes(prev => ({ ...prev, [room.id]: response.data || [] }));
        } catch (err) {
            console.error("Failed to load notes for room", err);
            setAllNotes(prev => ({ ...prev, [room.id]: [] }));
        }
        setView('notes');
    };

    const createNote = async () => {
        try {
            const response = await meetingRoomService.createNote(currentRoom.id, { title: 'Untitled', content: '' });
            const newNote = response.data;
            setAllNotes(prev => ({ ...prev, [currentRoom.id]: [...(prev[currentRoom.id] || []), newNote] }));
            setCurrentNote(newNote);
            setEditorContent('');
            setView('editor');
        } catch (err) {
            alert('Failed to create new note.');
        }
    };

    const openNote = (note) => {
        setCurrentNote(note);
        setEditorContent(note.content);
        setView('editor');
    };

    const handleSaveNote = async (noteId, title, content) => {
        try {
            const response = await meetingRoomService.updateNote(noteId, { title, content });
            const updatedNote = response.data;

            setAllNotes(prev => {
                const updatedNotes = (prev[currentRoom.id] || []).map(n => n.id === noteId ? updatedNote : n);
                return { ...prev, [currentRoom.id]: updatedNotes };
            });
            alert("Note saved!");
            setView('notes');
        } catch (err) {
            alert('Failed to save note.');
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }

    if (error) {
        return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    }

    // Rooms View
    if (view === 'rooms') {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* DEBUG BANNER */}
                <div className="bg-yellow-100 p-4 text-xs font-mono border-b border-yellow-300 text-yellow-900 overflow-auto max-h-40">
                    <p><strong>DEBUG INFO:</strong></p>
                    <p>isProjectLead (prop): {String(isProjectLead)}</p>
                    <p>userProfile ID: {userProfile?.id}</p>
                    <p>userProfile Email: {userProfile?.email}</p>
                    <p>isMember (calculated): {String(isMember)}</p>
                    <p>Project Members Count: {projectMembers?.length}</p>
                    <p>First Member ID: {projectMembers?.[0]?.user?.id}</p>
                </div>
                <header className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Meeting Rooms</h1>
                                    <p className="text-sm text-gray-600">{projectName}</p>
                                </div>
                            </div>
                            {isMember && (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowRoomModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                    >
                                        <Plus className="w-5 h-5" />Create Room
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Collaboration Rooms</h2>
                        <div className="text-sm text-gray-600">
                            {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}
                        </div>
                    </div>

                    {rooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map(room => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    onClick={() => openRoom(room)}
                                    onDelete={handleDeleteRoom}
                                    isProjectLead={isProjectLead}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg border border-dashed">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No rooms yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new room.</p>
                        </div>
                    )}
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
                                <button onClick={() => { setView('rooms'); setCurrentRoom(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{currentRoom.name}</h1>
                                    <p className="text-sm text-gray-600">{currentRoom.description}</p>
                                </div>
                            </div>
                            <button onClick={createNote} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
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
                            <button onClick={createNote} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
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
                editorContent={editorContent}
                setEditorContent={setEditorContent}
            />
        );
    }

    return null;
}

