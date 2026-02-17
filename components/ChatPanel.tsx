"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquareOff } from "lucide-react";

interface Message {
    id: string;
    text: string;
    isMine: boolean;
    timestamp: number;
}

interface ChatPanelProps {
    isOpen: boolean;
    messages: Message[];
    onSend: (text: string) => void;
    onClose: () => void;
}

export default function ChatPanel({
    isOpen,
    messages,
    onSend,
    onClose,
}: ChatPanelProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSend(input.trim());
            setInput("");
        }
    };

    return (
        <div className={`chat-panel paper-stack ${isOpen ? "open" : ""}`}>
            <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="logo-badge" style={{ padding: 4, transform: 'none', border: 'var(--border-thin)', background: 'var(--accent-blue)', color: 'white' }}>
                        <Send size={14} />
                    </div>
                    <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.85rem' }}>Stranger</span>
                </div>
                <button className="btn btn-icon btn-sm" onClick={onClose} style={{ width: 28, height: 28 }}>
                    <X size={16} />
                </button>
            </div>

            <div className="chat-messages" style={{ background: 'var(--bg-primary)', backgroundImage: 'radial-gradient(var(--bg-tertiary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                {messages.length === 0 ? (
                    <div className="chat-empty-state" style={{ padding: 40 }}>
                        <div style={{ opacity: 0.1, marginBottom: 20 }}>
                            <MessageSquareOff size={64} />
                        </div>
                        <p style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>Quiet here...</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Be the first to say something!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message ${msg.isMine ? "mine" : "theirs"}`}
                        >
                            <span className="sender" style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>{msg.isMine ? "You" : "Stranger"}</span>
                            <div className="text" style={{ border: 'var(--border-thick)', boxShadow: 'var(--shadow-sm)' }}>{msg.text}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend} style={{ borderTop: 'var(--border-thick)', background: 'white', padding: 16 }}>
                <div className="chat-input-wrapper">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Say something..."
                        className="chat-input"
                        style={{ border: 'var(--border-thick)', background: 'var(--bg-secondary)', fontWeight: 600 }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="btn btn-primary"
                        style={{ padding: 0, height: 44, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
