"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Github } from "lucide-react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Logo */}
                <Link href="/" className="logo-badge" style={{ zIndex: 102, position: 'relative' }}>
                    <span className="bolt">⚡</span>
                    <span className="logo-text">Devgle</span>
                </Link>

                {/* Desktop Links */}
                <div className="navbar-links desktop-only">
                    <a href="#features" style={{ fontWeight: 800, textTransform: 'uppercase' }}>Features</a>
                    <a href="#how-it-works" style={{ fontWeight: 800, textTransform: 'uppercase' }}>How it works</a>
                </div>

                {/* Desktop CTA */}
                <div className="navbar-cta desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link href="/room" className="btn btn-primary btn-sm" style={{ paddingRight: '20px' }}>
                        Launch App <ArrowRight size={16} style={{ marginLeft: 8 }} />
                    </Link>
                    <a
                        href="https://github.com/GokulAnand14/devgle"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-primary)', opacity: 0.8, transition: 'opacity 0.2s', display: 'flex' }}
                        aria-label="View on GitHub"
                    >
                        <Github size={24} />
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle mobile-only"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: 102,
                        position: 'relative',
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    aria-label="Toggle Menu"
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-links">
                        <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
                        <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it works</a>
                        <Link href="/room" className="btn btn-primary mobile-cta" onClick={() => setIsMenuOpen(false)}>
                            Launch App <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </nav >
    );
}
