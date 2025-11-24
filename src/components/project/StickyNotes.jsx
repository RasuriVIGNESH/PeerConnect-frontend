// src/components/project/StickyNotes.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Improved StickyNotes UI
 *
 * Props:
 * - notes: [{ id, x, y, w, h, text, color, pinned, minimized, title }]
 * - onChange(notes) - callback for parent to persist
 *
 * UX:
 * - Header with a small handle (drag anywhere) and title
 * - Pin (keeps on top), Minimize (collapse to small card)
 * - Resize by dragging bottom-right corner
 * - Bring to front when clicked
 * - Uses viewport (fixed) coordinates, rendered via portal so notes can move outside the editor
 */

const DEFAULT_COLORS = ['#FFEB3B', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#E1BEE7', '#FFE0B2'];

export default function StickyNotes({ notes = [], onChange }) {
    const [localNotes, setLocalNotes] = useState(notes || []);
    const draggingRef = useRef(null);
    const resizingRef = useRef(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const zCounterRef = useRef(10000); // z-index counter to bring notes to front
    const containerRef = useRef(null);

    useEffect(() => setLocalNotes(notes || []), [notes]);

    useEffect(() => {
        // create container for portal once
        if (!document.getElementById('sticky-portal-root')) {
            const el = document.createElement('div');
            el.id = 'sticky-portal-root';
            document.body.appendChild(el);
        }
        containerRef.current = document.getElementById('sticky-portal-root');
    }, []);

    const pushChange = (newNotes) => {
        setLocalNotes(newNotes);
        if (onChange) onChange(newNotes);
    };

    const addSticky = () => {
        const id = `sticky-${Date.now()}`;
        const x = Math.max(20, window.innerWidth / 4);
        const y = Math.max(20, window.innerHeight / 6);
        const newNote = {
            id,
            x,
            y,
            w: 240,
            h: 160,
            text: 'New note…',
            color: DEFAULT_COLORS[0],
            pinned: false,
            minimized: false,
            title: 'Quick note'
        };
        pushChange([...(localNotes || []), { ...newNote, z: ++zCounterRef.current }]);
    };

    const removeSticky = (id) => {
        pushChange(localNotes.filter(n => n.id !== id));
    };

    const startDrag = (e, id) => {
        e.stopPropagation();
        draggingRef.current = id;
        const el = e.currentTarget.closest('[data-sticky-id]');
        const rect = el.getBoundingClientRect();
        offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        // ensure top z
        bringToFront(id);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    };

    const onDrag = (e) => {
        const id = draggingRef.current;
        if (!id) return;
        const note = localNotes.find(n => n.id === id);
        if (!note) return;
        const newX = e.clientX - offsetRef.current.x;
        const newY = e.clientY - offsetRef.current.y;
        setLocalNotes(prev => prev.map(n => n.id === id ? { ...n, x: newX, y: newY } : n));
    };

    const stopDrag = () => {
        if (!draggingRef.current) return;
        if (onChange) onChange(localNotes);
        draggingRef.current = null;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
    };

    const startResize = (e, id) => {
        e.stopPropagation();
        resizingRef.current = id;
        const el = e.currentTarget.closest('[data-sticky-id]');
        const rect = el.getBoundingClientRect();
        offsetRef.current = { startW: rect.width, startH: rect.height, startX: e.clientX, startY: e.clientY };
        bringToFront(id);
        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', stopResize);
    };

    const onResize = (e) => {
        const id = resizingRef.current;
        if (!id) return;
        const note = localNotes.find(n => n.id === id);
        if (!note) return;
        const dx = e.clientX - offsetRef.current.startX;
        const dy = e.clientY - offsetRef.current.startY;
        const newW = Math.max(120, offsetRef.current.startW + dx);
        const newH = Math.max(80, offsetRef.current.startH + dy);
        setLocalNotes(prev => prev.map(n => n.id === id ? { ...n, w: newW, h: newH } : n));
    };

    const stopResize = () => {
        if (!resizingRef.current) return;
        if (onChange) onChange(localNotes);
        resizingRef.current = null;
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
    };

    const updateText = (id, text) => {
        const updated = localNotes.map(n => n.id === id ? { ...n, text } : n);
        pushChange(updated);
    };

    const updateTitle = (id, title) => {
        const updated = localNotes.map(n => n.id === id ? { ...n, title } : n);
        pushChange(updated);
    };

    const changeColor = (id, color) => {
        const updated = localNotes.map(n => n.id === id ? { ...n, color } : n);
        pushChange(updated);
    };

    const toggleMinimize = (id) => {
        const updated = localNotes.map(n => n.id === id ? { ...n, minimized: !n.minimized } : n);
        pushChange(updated);
    };

    const togglePin = (id) => {
        const updated = localNotes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
        pushChange(updated);
    };

    const bringToFront = (id) => {
        zCounterRef.current += 1;
        const updated = localNotes.map(n => n.id === id ? { ...n, z: zCounterRef.current } : n);
        setLocalNotes(updated);
    };

    // Small utility styles for nicer UI
    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        cursor: 'grab',
        userSelect: 'none',
    };

    const portalContent = (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999 }}>
            {/* Add Sticky floating button */}
            <div style={{ position: 'fixed', top: 14, right: 14, pointerEvents: 'auto', zIndex: 100000 }}>
                <button
                    onClick={addSticky}
                    style={{
                        padding: '10px 14px',
                        background: 'linear-gradient(90deg,#6b46c1,#8b5cf6)',
                        color: 'white',
                        borderRadius: 12,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        boxShadow: '0 8px 28px rgba(99,102,241,0.18)'
                    }}
                    title="Add sticky"
                >
                    + Sticky
                </button>
            </div>

            {localNotes.map(note => {
                const isMin = !!note.minimized;
                const z = note.z || 10000;
                return (
                    <div
                        key={note.id}
                        data-sticky-id={note.id}
                        onMouseDown={() => bringToFront(note.id)}
                        style={{
                            position: 'fixed',
                            left: note.x,
                            top: note.y,
                            width: note.w,
                            height: isMin ? 48 : note.h,
                            background: note.color || '#FFEB3B',
                            zIndex: z,
                            boxShadow: '0 12px 34px rgba(15,23,42,0.12)',
                            borderRadius: 12,
                            pointerEvents: 'auto',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'box-shadow 150ms, transform 120ms',
                            transformOrigin: 'center center'
                        }}
                    >
                        {/* Header (drag handle) */}
                        <div
                            style={{
                                ...headerStyle,
                                background: 'rgba(255,255,255,0.18)',
                                backdropFilter: 'blur(6px)',
                                justifyContent: 'space-between',
                                borderBottom: isMin ? 'none' : '1px solid rgba(0,0,0,0.06)'
                            }}
                            onMouseDown={(e) => startDrag(e, note.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 10, height: 10, borderRadius: 3,
                                    background: 'rgba(0,0,0,0.08)'
                                }} title="drag handle" />
                                <input
                                    value={note.title || ''}
                                    onChange={(e) => updateTitle(note.id, e.target.value)}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        outline: 'none',
                                        width: 130,
                                        color: 'rgba(0,0,0,0.8)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                                    title={note.pinned ? 'Unpin' : 'Pin'}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        padding: 6,
                                        borderRadius: 6
                                    }}
                                >
                                    {note.pinned ? '📌' : '📍'}
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleMinimize(note.id); }}
                                    title={isMin ? 'Expand' : 'Minimize'}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                                >
                                    {isMin ? '▣' : '━'}
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); removeSticky(note.id); }}
                                    title="Delete"
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, borderRadius: 6 }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        {!isMin && (
                            <div style={{ flex: 1, display: 'flex', padding: 10, gap: 8 }}>
                                <textarea
                                    value={note.text}
                                    onChange={(e) => updateText(note.id, e.target.value)}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        outline: 'none',
                                        resize: 'none',
                                        background: 'transparent',
                                        fontSize: 13,
                                        fontFamily: 'inherit',
                                        color: 'rgba(0,0,0,0.85)'
                                    }}
                                />

                                {/* color palette */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {DEFAULT_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={(e) => { e.stopPropagation(); changeColor(note.id, c); }}
                                            style={{
                                                width: 28, height: 22, borderRadius: 6, border: '1px solid rgba(0,0,0,0.06)',
                                                background: c, cursor: 'pointer'
                                            }}
                                            title="Change color"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resize handle */}
                        {!isMin && (
                            <div
                                onMouseDown={(e) => startResize(e, note.id)}
                                style={{
                                    width: 18,
                                    height: 18,
                                    position: 'absolute',
                                    right: 8,
                                    bottom: 8,
                                    borderRadius: 4,
                                    cursor: 'nwse-resize',
                                    background: 'rgba(0,0,0,0.06)'
                                }}
                                title="Resize"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );

    return containerRef.current ? createPortal(portalContent, containerRef.current) : null;
}
