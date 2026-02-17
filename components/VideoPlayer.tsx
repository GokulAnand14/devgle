import { useEffect, useRef } from "react";
import UserAvatar from "./UserAvatar";

interface VideoPlayerProps {
    stream: MediaStream | null;
    muted?: boolean;
    mirrored?: boolean;
    label?: string;
    className?: string;
    objectFit?: "cover" | "contain";
    peerId?: string;
    isVideoOff?: boolean;
    isMicMuted?: boolean;
    isPresenting?: boolean;
}

export default function VideoPlayer({
    stream,
    muted = false,
    mirrored = false,
    label,
    className = "",
    objectFit = "cover",
    peerId,
    isVideoOff = false,
    isMicMuted = false,
    isPresenting = false,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const showAvatar = !stream || isVideoOff;

    return (
        <div className={`remote-video-container ${className}`}>
            {!showAvatar ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={muted}
                    style={{
                        objectFit,
                        transform: mirrored ? "scaleX(-1)" : "none",
                    }}
                />
            ) : (
                <div className="remote-video-placeholder">
                    <UserAvatar peerId={peerId} size={className.includes('pip') ? 40 : 80} />
                    {!className.includes('pip') && <p style={{ fontWeight: 800, marginTop: 12 }}>Camera Off</p>}
                </div>
            )}

            {label && <div className="video-label">{label}</div>}

            <div className="status-badge">
                {isPresenting && <div className="badge badge-presenting">PRESENTING</div>}
                {isMicMuted && <div className="badge" style={{ background: 'var(--accent-red)', color: 'white' }}>MUTED</div>}
                {isVideoOff && !className.includes('pip') && <div className="badge">CAM OFF</div>}
            </div>
        </div>
    );
}
