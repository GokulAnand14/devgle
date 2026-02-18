"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Monitor, Video, Zap, Github } from "lucide-react";
import { getPeerId } from "@/lib/peer-id";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useGunChat, ChatMessage } from "@/hooks/useGunChat";
import VideoPlayer from "@/components/VideoPlayer";
import ControlBar from "@/components/ControlBar";
import ChatPanel from "@/components/ChatPanel";
import DraggableVideo from "@/components/DraggableVideo";
import SearchingAnimation from "@/components/SearchingAnimation";
import UserAvatar from "@/components/UserAvatar";
import OnlineCounter from "@/components/OnlineCounter";

type RoomState = "pre-lobby" | "searching" | "connected";

export default function RoomPage() {
    const [roomState, setRoomState] = useState<RoomState>("pre-lobby");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [showChatToast, setShowChatToast] = useState(false);
    const [unreadMessage, setUnreadMessage] = useState<ChatMessage | null>(null);
    const [peerId, setPeerId] = useState("");
    const [isDesktop, setIsDesktop] = useState(true); // Default to true for SSR matches/desktop-first
    const lastMessageCount = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPeerId(getPeerId());

        // Handle responsive layout
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Hooks
    const media = useMediaStream();
    const webrtc = useWebRTC(peerId);
    const matchmaking = useMatchmaking();
    const chat = useGunChat(matchmaking.roomId, peerId);

    // Actions
    const handleStart = useCallback(async () => {
        const stream = await media.startMedia();
        if (stream) {
            setRoomState("searching");
            matchmaking.startSearching();
        }
    }, [media, matchmaking]);

    // Auto-open chat on connection (Desktop only)
    useEffect(() => {
        if (webrtc.connectionState === "connected" && window.innerWidth >= 1024) {
            setIsChatOpen(true);
        }
    }, [webrtc.connectionState]);

    const handleSkip = useCallback(() => {
        webrtc.disconnect();
        chat.clearMessages();
        setIsChatOpen(false);
        setCallDuration(0);
        setRoomState("searching");
        matchmaking.skip();
    }, [webrtc, chat, matchmaking]);

    const handleEndCall = useCallback(() => {
        webrtc.disconnect();
        matchmaking.stopSearching();
        media.stopMedia();
        chat.clearMessages();
        setIsChatOpen(false);
        setCallDuration(0);
        setRoomState("pre-lobby");
    }, [webrtc, matchmaking, media, chat]);

    const handleCancelSearch = useCallback(() => {
        matchmaking.stopSearching();
        media.stopMedia();
        setRoomState("pre-lobby");
    }, [matchmaking, media]);

    const handleToggleScreenShare = useCallback(async () => {
        if (media.isScreenSharing) {
            if (media.screenStream) {
                webrtc.removeLocalStream(media.screenStream);
            }
            media.stopScreenShare();
        } else {
            const screenStream = await media.startScreenShare();
            if (screenStream) {
                webrtc.addLocalStream(screenStream);
            }
        }
    }, [media, webrtc]);

    // Chat Notification Logic
    useEffect(() => {
        if (!isChatOpen && chat.messages.length > lastMessageCount.current) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            if (!lastMsg.isMine) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUnreadMessage(lastMsg);
                setShowChatToast(true);
                // Auto-hide after 5 seconds
                const timeout = setTimeout(() => setShowChatToast(false), 5000);
                return () => clearTimeout(timeout);
            }
        }
        lastMessageCount.current = chat.messages.length;
    }, [chat.messages, isChatOpen, peerId]);

    // Timer management
    useEffect(() => {
        if (webrtc.connectionState === "connected") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCallDuration(0);
            timerRef.current = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [webrtc.connectionState]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // State transitions
    useEffect(() => {
        if (matchmaking.matchState === "matched" && matchmaking.roomId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRoomState("connected");
            webrtc.connect(matchmaking.roomId, matchmaking.isInitiator, media.stream);
        }
    }, [matchmaking.matchState, matchmaking.roomId]);

    useEffect(() => {
        if (
            webrtc.connectionState === "disconnected" &&
            roomState === "connected"
        ) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            handleSkip();
        }
    }, [webrtc.connectionState]);


    // ─── PRE-LOBBY ──────────────────────────
    if (roomState === "pre-lobby") {
        return (
            <div className="pre-lobby min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center position-relative overflow-hidden">
                <div className="grid-bg" style={{ opacity: 0.5 }} />

                {/* Decorative paper stack effect */}
                <div style={{ position: 'absolute', width: 620, height: 480, background: 'white', border: 'var(--border-thick)', transform: 'rotate(-2deg)', zIndex: 0, opacity: 0.5 }} />
                <div style={{ position: 'absolute', width: 620, height: 480, background: 'white', border: 'var(--border-thick)', transform: 'rotate(1deg)', zIndex: 1, opacity: 0.8 }} />

                <div className="pre-lobby-card" style={{
                    position: 'relative',
                    zIndex: 2,
                    background: 'white',
                    border: 'var(--border-thick)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '64px 48px',
                    maxWidth: 600,
                    width: '90%',
                    textAlign: 'center'
                }}>
                    <div className="logo-badge" style={{ display: 'inline-flex', marginBottom: 32, transform: 'rotate(-2deg)' }}>
                        <span className="bolt">⚡</span>
                        <span className="logo-text">DEVGLE / ROOM</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, marginBottom: 16, letterSpacing: -2, lineHeight: 1 }}>
                        Ready to join?
                    </h1>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: 40, fontWeight: 600, maxWidth: 450, margin: '0 auto 40px' }}>
                        Connect with developers for anonymous code reviews & debugging.
                    </p>

                    <div className="pre-lobby-features" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
                        <div className="badge" style={{ background: 'white' }}>
                            <Video size={14} style={{ marginRight: 6 }} /> HD VIDEO
                        </div>
                        <div className="badge" style={{ background: 'var(--accent-cyan)', color: '#1a1a1a' }}>
                            <Monitor size={14} style={{ marginRight: 6 }} /> SCREEN SHARE
                        </div>
                        <div className="badge" style={{ background: 'var(--accent-yellow)', color: '#1a1a1a' }}>
                            <Zap size={14} style={{ marginRight: 6 }} /> MATCHMAKING
                        </div>
                    </div>

                    <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'center' }}>
                        <OnlineCounter />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
                        <button
                            className="btn btn-primary btn-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg transform hover:scale-105 transition-colors duration-300"
                            onClick={handleStart}
                            style={{
                                padding: '24px 48px',
                                fontSize: '1.5rem',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 16
                            }}
                        >
                            START MATCHMAKING <ArrowRight size={24} />
                        </button>

                        <Link href="/" style={{
                            fontWeight: 800,
                            color: 'var(--text-secondary)',
                            fontSize: '0.90rem',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            textDecoration: 'none',
                            borderBottom: 'var(--border-thin)',
                            paddingBottom: 2
                        }}>
                            ← Back to Landing Page
                        </Link>
                    </div>
                </div>
            </div>
        );
    }


    // ─── SEARCHING ──────────────────────────
    if (roomState === "searching") {
        return <SearchingAnimation onCancel={handleCancelSearch} />;
    }

    // ─── CONNECTED ──────────────────────────
    const statusText =
        webrtc.connectionState === "connected"
            ? "CONNECTED"
            : webrtc.connectionState === "connecting"
                ? "SYNCING..."
                : "OFFLINE";

    // ─── STAGE & RIBBON LOGIC ────────────────
    const remoteStreams = webrtc.remoteStreams;
    const sortedRemoteStreams = [...remoteStreams].sort((a, b) => {
        const aTracks = a.getVideoTracks()[0]?.getSettings();
        const bTracks = b.getVideoTracks()[0]?.getSettings();
        const aArea = (aTracks?.width || 0) * (aTracks?.height || 0);
        const bArea = (bTracks?.width || 0) * (bTracks?.height || 0);
        return bArea - aArea;
    });

    // Determine who is on the "Stage" vs "Ribbon"
    let stageStream = null;
    let stagePeerId = null;
    let stageLabel = "";

    const ribbonStreams: { stream: MediaStream | null; peerId: string; label: string; isVideoOff?: boolean; isScreen?: boolean }[] = [];
    let popOutStream: { stream: MediaStream; peerId: string; label: string; isVideoOff?: boolean } | null = null;

    if (sortedRemoteStreams.length > 0) {
        // Take the first one as stage (highest res/sorted)
        stageStream = sortedRemoteStreams[0];
        stagePeerId = matchmaking.remotePeerId || 'stranger';

        // Check if stage is a screen share (heuristic: track label or just by convention if we had metadata)
        // For now, let's assume if we have 2 streams from same peer, one is screen.
        // But here we might rely on the fact that we sorted by area. Screen share usually bigger.

        // Logic: If stage stream involves screen share, we want to find the OTHER stream from same peer (if exists) and Pop it out.
        // Since we don't have separate peerIds for streams easily mapped here without metadata, we'll try a heuristic:
        // If there are exactly 2 streams and one is huge (stage), the other is likely the face.

        const isScreenShare = stageStream.getVideoTracks()[0]?.label.toLowerCase().includes('screen') || sortedRemoteStreams.length > 1;

        if (isScreenShare && sortedRemoteStreams.length > 1) {
            stageLabel = "STRANGER (SCREEN)";
            // The second stream is likely the camera
            const cameraStream = sortedRemoteStreams[1];
            popOutStream = {
                stream: cameraStream,
                peerId: matchmaking.remotePeerId || 'stranger',
                label: "STRANGER",
                isVideoOff: !cameraStream.getVideoTracks()[0]?.enabled
            };

            // Add others to ribbon if any (3+)
            if (sortedRemoteStreams.length > 2) {
                sortedRemoteStreams.slice(2).forEach((s, idx) => {
                    ribbonStreams.push({
                        stream: s,
                        peerId: matchmaking.remotePeerId || 'stranger',
                        label: `STRANGER ${idx + 3}`,
                        isScreen: false,
                        isVideoOff: !s.getVideoTracks()[0]?.enabled
                    });
                });
            }
        } else {
            stageLabel = "STRANGER";
            // Normal behavior: others go to ribbon
            if (sortedRemoteStreams.length > 1) {
                sortedRemoteStreams.slice(1).forEach((s, idx) => {
                    ribbonStreams.push({
                        stream: s,
                        peerId: matchmaking.remotePeerId || 'stranger',
                        label: `STRANGER ${idx + 2}`,
                        isScreen: false,
                        isVideoOff: !s.getVideoTracks()[0]?.enabled
                    });
                });
            }
        }
    }

    // NOTE: Local User is handled via DraggableVideo now, not in Ribbon

    return (
        <div className="room-layout" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent' }}>
            <header className="room-header" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: 'var(--header-height)', borderBottom: 'var(--border-thick)', background: 'var(--bg-primary)' }}>
                <div className="room-topbar-left">
                    <Link href="/" className="logo-badge" style={{ textDecoration: 'none' }}>
                        <span className="bolt">⚡</span>
                        <span className="logo-text">Devgle</span>
                    </Link>
                    <a
                        href="https://github.com/GokulAnand14/devgle"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="desktop-only"
                        style={{ marginLeft: 24, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                    >
                        <Github size={20} />
                    </a>
                </div>

                <div className="room-topbar-center">
                    <div className="badge" style={{ background: webrtc.connectionState === 'connected' ? 'var(--accent-green)' : 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: 'var(--border-thick)', boxShadow: 'var(--shadow-sm)' }}>
                        <span className={`status-dot ${webrtc.connectionState === "connected" ? "connected" : "searching"}`} style={{ background: '#1a1a1a', width: 8, height: 8, borderRadius: '50%' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{statusText}</span>
                    </div>
                </div>

                <div className="room-topbar-right">
                    <div className="call-timer" style={{ border: 'var(--border-thick)', background: 'white', boxShadow: 'var(--shadow-sm)', padding: '8px 16px', fontWeight: 900, fontSize: '1.2rem' }}>
                        {formatTime(callDuration)}
                    </div>
                </div>
            </header >

            <main className="room-main" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div className="stage-ribbon-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

                    {/* STAGE AREA */}
                    <div className="stage-area" style={{ flex: 1, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {stageStream ? (
                            <div className="video-card paper-stack" style={{ width: '100%', height: '100%', maxWidth: 1200, maxHeight: '90%', background: 'black' }}>
                                <VideoPlayer
                                    stream={stageStream}
                                    peerId={stagePeerId || 'unknown'}
                                    label={stageLabel}
                                    objectFit="contain"
                                />
                            </div>
                        ) : (
                            <div className="video-card paper-stack" style={{ width: '100%', height: '100%', maxWidth: 800, maxHeight: 600, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, border: 'var(--border-thick)' }}>
                                <div style={{ transform: 'scale(1.5)', marginBottom: 32 }}>
                                    <UserAvatar peerId="waiting" size={80} />
                                </div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, textAlign: 'center' }}>
                                    Waiting for Peer...
                                </h2>
                                <p style={{ marginTop: 8, fontSize: '1.1rem', opacity: 0.6, fontWeight: 600 }}>The stage is empty.</p>
                            </div>
                        )}

                        {/* Tape Effect Decoration */}
                        <div className="tape-effect" style={{ top: 20, right: '20%' }} />
                    </div>

                    {/* RIBBON AREA */}
                    {ribbonStreams.length > 0 && (
                        <div className="ribbon-area" style={{ height: 180, borderTop: 'var(--border-thick)', background: 'var(--bg-tertiary)', padding: 16, display: 'flex', gap: 16, overflowX: 'auto', flexShrink: 0 }}>
                            {ribbonStreams.map((item, idx) => (
                                <div key={idx} className="video-card" style={{ minWidth: 240, height: '100%', border: 'var(--border-thick)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
                                    <VideoPlayer
                                        stream={item.stream}
                                        peerId={item.peerId}
                                        label={item.label}
                                        isVideoOff={item.isVideoOff}
                                        objectFit="cover"
                                        muted={item.peerId === peerId} // Mute local
                                        mirrored={item.peerId === peerId && !item.isScreen}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Floating Control Bar (Over Stage) */}
                    <div style={{
                        position: 'absolute',
                        bottom: ribbonStreams.length > 0 ? 196 : 32,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 100,
                        transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <ControlBar
                            isMicOn={media.isAudioEnabled}
                            isCamOn={media.isVideoEnabled}
                            isScreenSharing={media.isScreenSharing}
                            isChatOpen={isChatOpen}
                            onToggleMic={media.toggleAudio}
                            onToggleCam={media.toggleVideo}
                            onToggleScreenShare={handleToggleScreenShare}
                            onToggleChat={() => setIsChatOpen(!isChatOpen)}
                            onSkip={handleSkip}
                            onEndCall={handleEndCall}
                            // Device Switching Props
                            devices={media.devices}
                            selectedAudioDeviceId={media.selectedAudioDeviceId}
                            selectedVideoDeviceId={media.selectedVideoDeviceId}
                            onSwitchDevice={media.switchDevice}
                        />
                    </div>
                </div>

                {/* Chat Panel (Docked on Desktop, Floating Window on Mobile) */}
                <ChatPanel
                    isOpen={isChatOpen}
                    messages={chat.messages}
                    onSend={chat.sendMessage}
                    onClose={() => setIsChatOpen(false)}
                    isConnected={webrtc.connectionState === "connected"}
                    variant={isDesktop ? "docked" : "window"}
                />
            </main>

            {/* Toast for closed chat */}
            {
                showChatToast && !isChatOpen && unreadMessage && (
                    <div
                        className="chat-toast"
                        onClick={() => setIsChatOpen(true)}
                        style={{
                            position: 'fixed',
                            bottom: 100, // Higher up to not block controls
                            right: 20,
                            zIndex: 1200,
                            background: 'var(--text-primary)',
                            color: 'white',
                            padding: '12px 16px',
                            borderRadius: 8,
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                            maxWidth: 'min(300px, 90vw)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        <div style={{
                            background: 'var(--accent-green)',
                            color: 'black',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <MessageSquare size={16} strokeWidth={3} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7, marginBottom: 2 }}>New Message</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {unreadMessage.text}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Draggable Local Stream - Top Left */}
            <DraggableVideo
                stream={media.stream}
                isMuted={true}
                label="YOU"
                isVideoOff={!media.isVideoEnabled}
            // Default position in DraggableVideo is 20, 80. Leaving it as base.
            />
            {
                media.isScreenSharing && (
                    <DraggableVideo
                        stream={media.screenStream}
                        isScreen={true}
                        label="YOUR SCREEN"
                        // Position below local stream (80 + 180 + 20 = 280)
                        initialPosition={{ x: 20, y: 280 }}
                    />
                )
            }

            {/* Pop-out Remote Camera (when they are sharing screen) - Position below screen share */}
            {
                popOutStream && (
                    <DraggableVideo
                        stream={popOutStream.stream}
                        peerId={popOutStream.peerId}
                        isMuted={false}
                        label={popOutStream.label}
                        isVideoOff={popOutStream.isVideoOff}
                        initialPosition={{ x: 20, y: 480 }}
                    />
                )
            }
        </div >
    );
}

