"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, User, MessageSquare, Monitor, Video, Zap } from "lucide-react";
import { getPeerId, getShortId } from "@/lib/peer-id";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useGunChat, ChatMessage } from "@/hooks/useGunChat";
import VideoPlayer from "@/components/VideoPlayer";
import ControlBar from "@/components/ControlBar";
import ChatPanel from "@/components/ChatPanel";
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
    const lastMessageCount = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setPeerId(getPeerId());
    }, []);

    // Hooks
    const media = useMediaStream();
    const webrtc = useWebRTC(peerId);
    const matchmaking = useMatchmaking();
    const chat = useGunChat(matchmaking.roomId, peerId);

    // Chat Notification Logic
    useEffect(() => {
        if (!isChatOpen && chat.messages.length > lastMessageCount.current) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            if (!lastMsg.isMine) {
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
            setRoomState("connected");
            webrtc.connect(matchmaking.roomId, matchmaking.isInitiator, media.stream);
        }
    }, [matchmaking.matchState, matchmaking.roomId]);

    useEffect(() => {
        if (
            webrtc.connectionState === "disconnected" &&
            roomState === "connected"
        ) {
            handleSkip();
        }
    }, [webrtc.connectionState]);

    // Actions
    const handleStart = useCallback(async () => {
        const stream = await media.startMedia();
        if (stream) {
            setRoomState("searching");
            matchmaking.startSearching();
        }
    }, [media, matchmaking]);

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

    // ─── PRE-LOBBY ──────────────────────────
    if (roomState === "pre-lobby") {
        return (
            <div className="pre-lobby" style={{ background: 'var(--bg-primary)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
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
                            className="btn btn-primary btn-lg"
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

    // Sort streams: put presumed screen share first if there are two
    const remoteStreams = webrtc.remoteStreams;
    const sortedRemoteStreams = [...remoteStreams].sort((a, b) => {
        // Simple heuristic: higher resolution or later stream is usually screen
        const aTracks = a.getVideoTracks()[0]?.getSettings();
        const bTracks = b.getVideoTracks()[0]?.getSettings();
        const aArea = (aTracks?.width || 0) * (aTracks?.height || 0);
        const bArea = (bTracks?.width || 0) * (bTracks?.height || 0);
        return bArea - aArea;
    });

    return (
        <div className="room-layout">
            <div className="grid-bg" />
            <header className="room-header">
                <div className="room-topbar-left">
                    <Link href="/" className="logo-badge">
                        <span className="bolt">⚡</span>
                        <span className="logo-text">Devgle</span>
                    </Link>
                </div>

                <div className="room-topbar-center">
                    <div className="badge" style={{ background: webrtc.connectionState === 'connected' ? 'var(--accent-green)' : 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`status-dot ${webrtc.connectionState === "connected" ? "connected" : "searching"}`} style={{ background: '#1a1a1a' }} />
                        <span>{statusText}</span>
                    </div>
                </div>

                <div className="room-topbar-right">
                    <div className="call-timer" style={{ border: 'var(--border-thick)', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
                        {formatTime(callDuration)}
                    </div>
                </div>

            </header>

            <main className={`room-main ${isChatOpen ? "chat-open" : "chat-closed"}`}>
                <div className="video-viewport">
                    <div className="video-grid" style={{
                        gridTemplateColumns: sortedRemoteStreams.length <= 1 ? '1fr' : 'repeat(auto-fit, minmax(450px, 1fr))',
                        gridTemplateRows: sortedRemoteStreams.length > 2 ? '1fr' : '1fr', // Simplify rows
                        alignItems: 'center', // Vertically center content
                        justifyItems: 'center', // Horizontally center content
                        maxWidth: sortedRemoteStreams.length <= 1 ? '1200px' : '100%', // Constrain single video width
                        margin: '0 auto', // Center the grid itself
                        paddingBottom: 100,
                    }}>
                        {/* Remote streams */}
                        {sortedRemoteStreams.length === 0 ? (
                            <div className="video-card paper-stack" style={{ background: 'white' }}>
                                <div className="remote-video-placeholder">
                                    <UserAvatar peerId={matchmaking.remotePeerId || 'stranger'} size={120} />
                                    <p style={{ fontWeight: 900, marginTop: 32, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: 4 }}>
                                        Establishing Link...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            sortedRemoteStreams.map((stream, idx) => (
                                <div key={stream.id} className="video-card paper-stack">
                                    <VideoPlayer
                                        stream={stream}
                                        peerId={matchmaking.remotePeerId || 'stranger'}
                                        isVideoOff={false}
                                        objectFit={idx === 0 && sortedRemoteStreams.length > 1 ? "contain" : "cover"}
                                        label={idx === 0 && sortedRemoteStreams.length > 1 ? "STRANGER (SCREEN)" : "STRANGER"}
                                    />
                                </div>
                            ))
                        )}

                        {/* Local PiP View (Floating) */}
                        <div className="local-video-pip shadow-lg paper-stack" style={{ bottom: 120, right: 24, width: 280, height: 180, zIndex: 1100 }}>
                            <VideoPlayer
                                stream={media.stream}
                                peerId={peerId}
                                isVideoOff={!media.isVideoEnabled}
                                muted={true}
                                mirrored={true}
                                label="YOU (CAM)"
                                className="pip"
                            />
                        </div>

                        {/* Local Screen Share View (Floating) */}
                        {media.isScreenSharing && (
                            <div className="local-video-pip shadow-lg paper-stack" style={{ bottom: 120, left: 24, width: 280, height: 180, zIndex: 1100 }}>
                                <VideoPlayer
                                    stream={media.screenStream}
                                    peerId={peerId}
                                    isVideoOff={false}
                                    muted={true}
                                    label="YOU (SCREEN)"
                                    className="pip"
                                />
                            </div>
                        )}
                    </div>

                    {/* Chat Toast */}
                    {showChatToast && !isChatOpen && unreadMessage && (
                        <div className="chat-toast shadow-lg paper-stack" onClick={() => setIsChatOpen(true)} style={{ zIndex: 1200 }}>
                            <div className="icon" style={{ background: 'var(--accent-blue)', color: 'white' }}>
                                <MessageSquare size={18} />
                            </div>
                            <div className="content">
                                <div className="name" style={{ fontWeight: 900, color: 'var(--accent-blue)' }}>NEW MESSAGE</div>
                                <div className="text" style={{ fontWeight: 600 }}>{unreadMessage.text}</div>
                            </div>
                        </div>
                    )}

                    {/* Control Bar */}
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
                    />
                </div>

                <ChatPanel
                    isOpen={isChatOpen}
                    messages={chat.messages}
                    onSend={chat.sendMessage}
                    onClose={() => setIsChatOpen(false)}
                />
            </main>
        </div>
    );
}

