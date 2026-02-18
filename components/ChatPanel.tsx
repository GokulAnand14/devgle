import { useState, useRef, useEffect } from "react";
import { Send, MessageSquareOff, X, MessageSquare } from "lucide-react";
import DraggableWindow from "./DraggableWindow";

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
    isConnected?: boolean;
    variant?: "window" | "docked";
}

// Extracted Content Component
function ChatContent({ messages, input, setInput, handleSend, isConnected, messagesEndRef }: {
    messages: Message[];
    input: string;
    setInput: (s: string) => void;
    handleSend: (e: React.FormEvent) => void;
    isConnected: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div className="chat-panel-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
            {/* Sub-Header Info (Connection Status) */}
            <div style={{ padding: '8px 12px', borderBottom: 'var(--border-thick)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="logo-badge" style={{ padding: 4, transform: 'none', border: 'var(--border-thin)', background: 'white', color: 'black' }}>
                    <Send size={12} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.7 }}>CONNECTED WITH STRANGER</span>
            </div>

            <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-primary)', backgroundImage: 'radial-gradient(var(--bg-tertiary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                {messages.length === 0 ? (
                    <div className="chat-empty-state" style={{ padding: 40, textAlign: 'center', marginTop: 40 }}>
                        <div style={{ opacity: 0.1, marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
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
                            style={{ alignSelf: msg.isMine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
                        >
                            <span className="sender" style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: 4, display: 'block', textAlign: msg.isMine ? 'right' : 'left', opacity: 0.5 }}>{msg.isMine ? "You" : "Stranger"}</span>
                            <div className="text" style={{
                                border: 'var(--border-thick)',
                                boxShadow: 'var(--shadow-sm)',
                                padding: '8px 12px',
                                background: msg.isMine ? 'var(--accent-yellow)' : 'white',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}>{msg.text}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend} style={{ borderTop: 'var(--border-thick)', background: 'white', padding: 16 }}>
                <div className="chat-input-wrapper" style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isConnected ? "Say something..." : "Chat disabled (Offline)"}
                        className="chat-input"
                        disabled={!isConnected}
                        style={{
                            flex: 1,
                            border: 'var(--border-thick)',
                            background: isConnected ? 'var(--bg-secondary)' : '#eee',
                            fontWeight: 600,
                            cursor: isConnected ? 'text' : 'not-allowed',
                            padding: '0 12px',
                            height: 44,
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="btn btn-primary"
                        style={{
                            padding: 0,
                            height: 44,
                            width: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--text-primary)',
                            color: 'white',
                            border: 'none',
                            cursor: input.trim() ? 'pointer' : 'default',
                            opacity: input.trim() ? 1 : 0.5
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function ChatPanel({
    isOpen,
    messages,
    onSend,
    onClose,
    isConnected = true,
    variant = "window"
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

    // Shared content prop
    const content = (
        <ChatContent
            messages={messages}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            isConnected={isConnected}
            messagesEndRef={messagesEndRef}
        />
    );

    if (variant === "docked") {
        if (!isOpen) return null;
        return (
            <div
                className="chat-panel docked"
                style={{
                    width: 'var(--chat-width)', // Use global variable (380px)
                    height: '100%',
                    borderLeft: 'var(--border-thick)',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0, // Don't shrink
                    position: 'relative',
                    zIndex: 20
                }}
            >
                {/* Custom Docked Header */}
                <div style={{
                    height: 48,
                    background: 'var(--accent-blue)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    borderBottom: 'var(--border-thick)',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MessageSquare size={16} />
                        <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>LIVE CHAT</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon-sm"
                        style={{ color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none' }}
                    >
                        <X size={18} />
                    </button>
                </div>
                {content}
            </div>
        );
    }

    // Default: Floating Window
    return (
        <DraggableWindow
            isOpen={isOpen}
            onClose={onClose}
            title="LIVE CHAT"
            initialPosition={{ x: window.innerWidth - 420, y: 100 }}
            initialSize={{ width: 380, height: 600 }}
            headerColor="var(--accent-blue)"
        >
            {content}
        </DraggableWindow>
    );
}

