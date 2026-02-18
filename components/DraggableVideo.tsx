"use client";

import { useDraggable } from "@/hooks/useDraggable";
import { useResizable } from "@/hooks/useResizable";
import { Move, Maximize2, Minimize2 } from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import UserAvatar from "./UserAvatar";
import { useEffect, useState } from "react";

interface DraggableVideoProps {
    stream: MediaStream | null;
    isScreen?: boolean;
    isMuted?: boolean;
    label?: string;
    onToggleMinimize?: () => void;
    peerId?: string;
    isVideoOff?: boolean;
    initialPosition?: { x: number; y: number };
}

export default function DraggableVideo({
    stream,
    isScreen = false,
    isMuted = true,
    label = "YOU",
    peerId = "local",
    isVideoOff = false,
    initialPosition = { x: 20, y: 80 }
}: DraggableVideoProps) {
    const { position, isDragging, handleMouseDown, handleTouchStart, elementRef } = useDraggable({
        initialPosition
    });

    const { size, isResizing, resizeHandleProps } = useResizable({
        initialSize: { width: 320, height: 180 },
        minSize: { width: 160, height: 90 },
        maxSize: { width: 640, height: 360 },
        aspectRatio: true
    });

    const [isVideoActive, setIsVideoActive] = useState(!isVideoOff);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (isVideoOff) {
            setIsVideoActive(false);
            return;
        }

        if (!stream) {
            setIsVideoActive(false);
            return;
        }
        const videoTrack = stream.getVideoTracks()[0];
        setIsVideoActive(!!videoTrack && videoTrack.enabled);

        const handleTrackEnded = () => setIsVideoActive(false);
        const handleTrackMute = () => setIsVideoActive(false);
        const handleTrackUnmute = () => setIsVideoActive(true);

        if (videoTrack) {
            videoTrack.addEventListener("ended", handleTrackEnded);
            videoTrack.addEventListener("mute", handleTrackMute);
            videoTrack.addEventListener("unmute", handleTrackUnmute);
        }

        // Also check regularly as some browser events are flaky
        const interval = setInterval(() => {
            const track = stream.getVideoTracks()[0];
            setIsVideoActive(!!track && track.enabled && track.readyState === 'live');
        }, 1000);

        return () => {
            if (videoTrack) {
                videoTrack.removeEventListener("ended", handleTrackEnded);
                videoTrack.removeEventListener("mute", handleTrackMute);
                videoTrack.removeEventListener("unmute", handleTrackUnmute);
            }
            clearInterval(interval);
        };
    }, [stream, isVideoOff]);


    if (!stream) return null;

    return (
        <div
            ref={elementRef}
            className="draggable-video paper-stack"
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                width: isMinimized ? 'auto' : size.width,
                height: isMinimized ? 32 : size.height,
                minWidth: isMinimized ? 120 : 160,
                zIndex: isDragging || isResizing ? 'var(--z-dragging)' : 'var(--z-floating)',
                cursor: isDragging ? 'grabbing' : 'default',
                background: isMinimized ? 'white' : 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: 'var(--border-thick)',
                borderRadius: isMinimized ? 50 : 0,
                transition: isDragging || isResizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isDragging ? '12px 12px 0px rgba(0,0,0,0.2)' : (isMinimized ? '0 8px 0px rgba(0,0,0,0.1)' : 'var(--shadow-lg)'),
                touchAction: 'none', // Important for touch dragging
                overflow: 'hidden'
            }}
        >
            <div
                className="drag-handle"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{
                    height: isMinimized ? 44 : 24,
                    background: isMinimized ? 'transparent' : 'var(--accent-yellow)',
                    borderBottom: isMinimized ? 'none' : 'var(--border-thick)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMinimized ? '0 12px' : '0 8px',
                    cursor: 'grab',
                    gap: 8
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>{label}</span>
                    {/* Indicator dot if minimized */}
                    {isMinimized && <div style={{ width: 6, height: 6, borderRadius: '50%', background: isVideoActive ? 'var(--accent-green)' : 'red' }} />}
                </div>

                <div className="actions" style={{ display: 'flex', gap: 4 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                        {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                    </button>
                    <Move size={12} />
                </div>
            </div>
            {!isMinimized && (
                <div className="video-content" style={{ height: 'calc(100% - 24px)', overflow: 'hidden', position: 'relative', background: 'var(--bg-secondary)' }}>
                    {isVideoActive ? (
                        <VideoPlayer
                            stream={stream}
                            muted={isMuted}
                            peerId={peerId}
                            label=""
                            objectFit="cover"
                            mirrored={!isScreen && peerId === 'local'}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserAvatar peerId={peerId} size={48} />
                        </div>
                    )}
                </div>
            )}
            {/* Resize Handle (only when not minimized) */}
            {!isMinimized && (
                <div
                    {...resizeHandleProps}
                    className="resize-handle"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 24,
                        height: 24,
                        cursor: 'nwse-resize',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'end',
                        padding: 4
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12H0L12 0V12Z" fill="currentColor" fillOpacity="0.5" />
                    </svg>
                </div>
            )}
        </div>
    );
}
