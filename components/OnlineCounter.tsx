"use client";

import { useOnlineCount } from "@/hooks/useOnlineCount";
import { Users } from "lucide-react";

export default function OnlineCounter() {
    const { onlineCount } = useOnlineCount();

    return (
        <div className="hero-badge" style={{ background: 'var(--accent-green)', color: 'var(--text-primary)', marginBottom: 24, transform: 'rotate(1deg)' }}>
            <div className="status-dot connected" style={{ marginRight: 8, background: 'var(--text-primary)' }} />
            <Users size={16} style={{ marginRight: 4 }} />
            <span style={{ fontWeight: 900, marginRight: 4 }}>{onlineCount}</span>
            <span style={{ opacity: 0.8, fontWeight: 500 }}>developers online</span>
        </div>
    );
}

