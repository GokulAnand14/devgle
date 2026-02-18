import { useState, useEffect, useRef } from "react";
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    MonitorUp,
    MessageSquare,
    SkipForward,
    PhoneOff,
    MoreHorizontal,
    ChevronUp,
    ChevronDown
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
    const [isMobile, setIsMobile] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', checkMobile);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Common Buttons
    const MicBtn = (
        <button
            className={`btn btn-icon ${!isMicOn ? "off" : ""}`}
            onClick={onToggleMic}
            aria-label={isMicOn ? "Mute Mic" : "Unmute Mic"}
            data-tooltip={isMicOn ? "Mute" : "Unmute"}
        >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
    );

    const CamBtn = (
        <button
            className={`btn btn-icon ${!isCamOn ? "off" : ""}`}
            onClick={onToggleCam}
            aria-label={isCamOn ? "Stop Video" : "Start Video"}
            data-tooltip={isCamOn ? "Stop Camera" : "Start Camera"}
        >
            {isCamOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
        </button>
    );

    const ScreenBtn = (
        <button
            className={`btn btn-icon ${isScreenSharing ? "active" : ""}`}
            onClick={onToggleScreenShare}
            aria-label={isScreenSharing ? "Stop Sharing" : "Share Screen"}
            data-tooltip={isScreenSharing ? "Stop Share" : "Share Screen"}
        >
            <MonitorUp size={24} />
        </button>
    );

    const ChatBtn = (
        <button
            className={`btn btn-icon ${isChatOpen ? "active" : ""}`}
            onClick={onToggleChat}
            aria-label={isChatOpen ? "Close Chat" : "Open Chat"}
            data-tooltip={isChatOpen ? "Close Chat" : "Chat"}
        >
            <MessageSquare size={24} />
        </button>
    );

    const SkipBtn = (
        <button
            className="btn btn-warning icon-only"
            onClick={onSkip}
            aria-label="Skip to next"
            data-tooltip="Skip"
        >
            <SkipForward size={24} />
        </button>
    );

    const EndBtn = (
        <button
            className="btn btn-danger icon-only"
            onClick={onEndCall}
            aria-label="End Call"
            data-tooltip="End Call"
        >
            <PhoneOff size={24} />
        </button>
    );

    return (
        <div className={`control-bar-wrapper ${isCollapsed ? "collapsed" : ""}`}>
            <button
                className="control-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? "Show Controls" : "Hide Controls"}
                data-tooltip={isCollapsed ? "Expand" : "Collapse"}
            >
                {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {/* OVERFLOW MENU FOR MOBILE */}
            {showMoreMenu && (
                <div ref={menuRef} className="more-menu" style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 16,
                    background: 'var(--bg-secondary)', // Should match theme
                    border: 'var(--border-thick)',
                    padding: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: 140,
                    zIndex: 2000
                }}>
                    {/* Menu Items */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {ScreenBtn}
                        {ChatBtn}
                    </div>
                </div>
            )}

            <div className="control-bar">
                {/* Always Show Main Controls */}
                {MicBtn}
                {CamBtn}

                {/* Desktop: Show All inline */}
                {!isMobile && (
                    <>
                        {ScreenBtn}
                        {ChatBtn}
                        <div className="control-divider" />
                    </>
                )}

                {/* Mobile: Show 'More' Button */}
                {isMobile && (
                    <button
                        className={`btn btn-icon ${showMoreMenu ? "active" : ""}`}
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        aria-label="More Options"
                        data-tooltip="More"
                    >
                        <MoreHorizontal size={24} />
                    </button>
                )}

                {SkipBtn}
                {EndBtn}
            </div>
        </div>
    );
}

