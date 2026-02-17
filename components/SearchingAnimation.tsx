"use client";

import { Search } from "lucide-react";

const tips = [
    "💡 Share your screen to get code reviews",
    "🎯 Skip anytime — no pressure",
    "🔒 Fully anonymous, no data stored",
    "🌐 Powered by Nostr + WebRTC",
];

interface SearchingAnimationProps {
    onCancel: () => void;
}

export default function SearchingAnimation({
    onCancel,
}: SearchingAnimationProps) {
    const tip = tips[Math.floor(Math.random() * tips.length)];

    return (
        <div className="searching-screen" style={{ background: 'var(--bg-primary)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div className="search-pulse" style={{ marginBottom: 48 }}>
                <div className="logo-badge" style={{ padding: 32, boxShadow: '8px 8px 0px var(--accent-blue)', borderRadius: 0 }}>
                    <Search size={48} strokeWidth={3} className="bolt" style={{ filter: 'none' }} />
                </div>
            </div>

            <h2 className="searching-text" style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900, marginBottom: 16, textAlign: 'center' }}>
                Hunting for Devs...
            </h2>
            <p className="searching-subtitle" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 48, textAlign: 'center' }}>
                Scanning Nostr relays for available connections.
            </p>

            <div className="search-tips" style={{
                maxWidth: 500,
                background: 'var(--accent-yellow)',
                color: 'var(--text-primary)',
                border: 'var(--border-thick)',
                boxShadow: 'var(--shadow-sm)',
                fontWeight: 700,
                padding: '24px 32px',
                transform: 'rotate(-1deg)',
                textAlign: 'center',
                fontSize: '1.1rem'
            }}>
                <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>Expert Tip</span>
                {tip}
            </div>

            <div style={{ marginTop: 64 }}>
                <button className="btn btn-secondary" onClick={onCancel} style={{ padding: '16px 32px' }}>
                    Cancel Request
                </button>
            </div>
        </div>
    );
}


