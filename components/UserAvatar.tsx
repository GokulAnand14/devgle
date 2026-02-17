"use client";

import {
    User,
    Cpu,
    Codepen,
    Terminal,
    Code2,
    Globe,
    Database,
    Layers,
    Hexagon
} from "lucide-react";
import { useMemo } from "react";

interface UserAvatarProps {
    peerId?: string;
    size?: number;
    className?: string;
}

const AVATAR_COLORS = [
    { bg: "#3b42f3", text: "#ffffff" }, // Blue
    { bg: "#ff4d4d", text: "#ffffff" }, // Red
    { bg: "#00d68f", text: "#1a1a1a" }, // Green
    { bg: "#ffcc00", text: "#1a1a1a" }, // Yellow
    { bg: "#9d4edd", text: "#ffffff" }, // Purple
];

const ICONS = [
    User, Cpu, Codepen, Terminal, Code2, Globe, Database, Layers, Hexagon
];

export default function UserAvatar({ peerId, size = 48, className = "" }: UserAvatarProps) {
    const selection = useMemo(() => {
        if (!peerId) {
            return { Color: AVATAR_COLORS[0], Icon: User };
        }

        // Deterministic hash
        let hash = 0;
        for (let i = 0; i < peerId.length; i++) {
            hash = peerId.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
        const iconIndex = Math.abs(hash) % ICONS.length;

        return {
            Color: AVATAR_COLORS[colorIndex],
            Icon: ICONS[iconIndex]
        };
    }, [peerId]);

    const { Color, Icon } = selection;

    return (
        <div
            className={`user-avatar ${className}`}
            style={{
                width: size * 2.2,
                height: size * 2.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: Color.bg,
                border: `2px solid #1a1a1a`,
                color: Color.text,
                boxShadow: `4px 4px 0px #1a1a1a`,
                position: "relative",
            }}
        >
            <Icon size={size} strokeWidth={2.5} />
        </div>
    );
}

