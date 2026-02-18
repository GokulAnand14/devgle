"use client";

import { useState, ReactNode } from "react";
import { Move, X, Minimize2, Maximize2 } from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";

interface DraggableWindowProps {
    title: string;
    children: ReactNode;
    initialPosition?: { x: number; y: number };
    initialSize?: { width: number; height: number };
    onClose?: () => void;
    isOpen: boolean;
    headerColor?: string;
}

export default function DraggableWindow({
    title,
    children,
    initialPosition = { x: 20, y: 20 },
    initialSize = { width: 320, height: 480 },
    onClose,
    isOpen,
    headerColor = 'var(--accent-blue)'
}: DraggableWindowProps) {
    const { position, isDragging, handleMouseDown, handleTouchStart, elementRef } = useDraggable({
        initialPosition
    });

    const [isMinimized, setIsMinimized] = useState(false);

    if (!isOpen) return null;

    return (
        <div
            ref={elementRef}
            className="draggable-window paper-stack"
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                width: isMinimized ? 'auto' : initialSize.width,
                height: isMinimized ? 48 : initialSize.height,
                minWidth: isMinimized ? 200 : 200,
                zIndex: 3000,
                background: isMinimized ? 'white' : 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: 'var(--border-thick)',
                borderRadius: isMinimized ? 50 : 0,
                display: 'flex',
                flexDirection: 'column',
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isDragging ? '12px 12px 0px rgba(0,0,0,0.2)' : (isMinimized ? '0 8px 0px rgba(0,0,0,0.1)' : 'var(--shadow-lg)'),
                touchAction: 'none',
                overflow: 'hidden'
            }}
        >
            {/* Header / Handle */}
            <div
                className="window-header"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{
                    height: isMinimized ? 48 : 40,
                    background: isMinimized ? 'transparent' : headerColor,
                    color: isMinimized ? 'inherit' : 'white',
                    borderBottom: isMinimized ? 'none' : 'var(--border-thick)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMinimized ? '0 20px' : '0 12px',
                    cursor: 'grab',
                    flexShrink: 0,
                    userSelect: 'none',
                    width: '100%'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Move size={14} />
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>{title}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginLeft: isMinimized ? 16 : 0 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="btn-icon-sm"
                        style={{ color: isMinimized ? 'inherit' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </button>
                    {onClose && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="btn-icon-sm"
                            style={{ color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="window-content" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
