"use client";

import { useState } from "react";
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    MonitorUp,
    MessageSquare,
    SkipForward,
    PhoneOff,
    ChevronUp,
    ChevronDown,
} from "lucide-react";

interface ControlBarProps {
    isMicOn: boolean;
    isCamOn: boolean;
    isScreenSharing: boolean;
    isChatOpen: boolean;
    onToggleMic: () => void;
    onToggleCam: () => void;
    onToggleScreenShare: () => void;
    onToggleChat: () => void;
    onSkip: () => void;
    onEndCall: () => void;
}

export default function ControlBar({
    isMicOn,
    isCamOn,
    isScreenSharing,
    isChatOpen,
    onToggleMic,
    onToggleCam,
    onToggleScreenShare,
    onToggleChat,
    onSkip,
    onEndCall,
}: ControlBarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`control-bar-wrapper ${isCollapsed ? "collapsed" : ""}`}>
            <button
                className="control-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? "Show Controls" : "Hide Controls"}
            >
                {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <div className="control-bar">
                <button
                    className={`btn btn-icon ${!isMicOn ? "off" : ""}`}
                    onClick={onToggleMic}
                    title={isMicOn ? "Mute Mic" : "Unmute Mic"}
                >
                    {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
                </button>

                <button
                    className={`btn btn-icon ${!isCamOn ? "off" : ""}`}
                    onClick={onToggleCam}
                    title={isCamOn ? "Turn Camera Off" : "Turn Camera On"}
                >
                    {isCamOn ? <VideoIcon size={22} /> : <VideoOff size={22} />}
                </button>

                <button
                    className={`btn btn-icon ${isScreenSharing ? "active" : ""}`}
                    onClick={onToggleScreenShare}
                    title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                >
                    <MonitorUp size={22} />
                </button>

                <button
                    className={`btn btn-icon ${isChatOpen ? "active" : ""}`}
                    onClick={onToggleChat}
                    title={isChatOpen ? "Close Chat" : "Open Chat"}
                >
                    <MessageSquare size={22} />
                </button>

                <div className="control-divider" />

                <button
                    className="btn btn-warning"
                    onClick={onSkip}
                    title="Skip to next developer"
                >
                    <SkipForward size={20} />
                    <span>Skip</span>
                </button>

                <button
                    className="btn btn-danger"
                    onClick={onEndCall}
                    title="End this call"
                >
                    <PhoneOff size={20} />
                    <span>End</span>
                </button>
            </div>
        </div>
    );
}

