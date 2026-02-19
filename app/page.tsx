import Link from "next/link";
import {
  Video,
  Mic,
  Monitor,
  ShieldOff,
  Globe2,
  Zap,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import OnlineCounter from "@/components/OnlineCounter";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: <Video size={22} />,
    title: "Video Chat",
    desc: "Ultra-high-definition P2P streaming with minimal latency and optimized bandwidth.",
  },
  {
    icon: <Mic size={22} />,
    title: "Voice Chat",
    desc: "Crystal clear audio with built-in echo cancellation and noise suppression.",
  },
  {
    icon: <Monitor size={22} />,
    title: "Screen Sharing",
    desc: "Seamlessly share your IDE or browser. Perfect for collaborative debugging.",
  },
  {
    icon: <ShieldOff size={22} />,
    title: "100% Anonymous",
    desc: "No accounts, no email, no tracking. Your identity stays completely private.",
  },
  {
    icon: <Globe2 size={22} />,
    title: "Decentralized",
    desc: "Direct browser-to-browser communication via WebRTC. No central server.",
  },
  {
    icon: <Zap size={22} />,
    title: "Instant Connect",
    desc: "Zero waiting rooms. Click and match with a developer instantly. No friction.",
  },
];

const steps = [
  {
    num: "01",
    title: "Click Start",
    desc: "No sign-up needed. You get an anonymous identity instantly.",
  },
  {
    num: "02",
    title: "Get Matched",
    desc: "Our P2P matchmaking pairs you with an active developer.",
  },
  {
    num: "03",
    title: "Share & Chat",
    desc: "Use video, voice, screen share and text chat. Skip anytime.",
  },
];

export default function Home() {
  return (
    <>
      <div className="grid-bg" />

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <OnlineCounter />

          <div className="hero-badge" style={{ background: 'var(--accent-yellow)', transform: 'rotate(-1deg)', padding: '10px 20px', fontSize: '1rem' }}>
            <Zap size={18} style={{ marginRight: 8 }} />
            <span style={{ fontWeight: 900 }}>PEER-TO-PEER · NO SERVER · ZERO DATA</span>
          </div>

          <h1 style={{ marginBottom: 32, fontSize: 'clamp(3.5rem, 10vw, 6rem)' }}>
            Meet Devs.
            <br />
            <span className="highlight" style={{ background: 'var(--accent-green)', color: '#1a1a1a', border: 'var(--border-thick)', padding: '0 20px', borderRadius: 0 }}>
              Show Your Code.
            </span>
          </h1>

          <p className="hero-subtitle" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-secondary)', maxWidth: 700 }}>
            The anonymous video chat for builders. Get feedback, review code, or just chill with developers around the globe.
          </p>

          <div className="hero-actions" style={{ gap: 24, marginBottom: 40 }}>
            <Link href="/room" className="btn btn-primary btn-lg" style={{ padding: '24px 48px', fontSize: '1.2rem' }}>
              CONNECT NOW <ArrowRight size={22} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg" style={{ padding: '24px 48px', fontSize: '1.2rem' }}>
              SEE HOW <ChevronDown size={22} />
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a href="https://www.producthunt.com/products/devgle?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-devgle" target="_blank" rel="noopener noreferrer">
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1081840&theme=light&t=1771489482664"
                alt="Devgle - Omegle for Developers | Product Hunt"
                style={{ width: 250, height: 54 }}
                width="250"
                height="54"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features" style={{ padding: '120px 24px', background: 'var(--bg-primary)' }}>
        <div className="section-header" style={{ marginBottom: 80, textAlign: 'center' }}>
          <div className="badge" style={{ background: 'var(--accent-blue)', color: 'white', border: 'var(--border-thick)', marginBottom: 24 }}>CORE FEATURES</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: -1 }}>Built for Devs.</h2>
          <p className="section-desc" style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)', maxWidth: 600, margin: '16px auto 0' }}>
            High-performance features for engineers who value privacy and speed.
          </p>
        </div>

        <div className="features-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {features.map((f, i) => (
            <div className="feature-card" key={i} style={{
              background: 'white',
              padding: 40,
              border: 'var(--border-thick)',
              boxShadow: '8px 8px 0px #1a1a1a',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: 'default'
            }}>
              <div className="feature-icon" style={{
                background: AVATAR_COLORS[i % AVATAR_COLORS.length].bg,
                color: AVATAR_COLORS[i % AVATAR_COLORS.length].text,
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'var(--border-thick)',
                marginBottom: 24,
                boxShadow: 'var(--shadow-sm)'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works" style={{ background: 'var(--bg-secondary)', borderTop: 'var(--border-thick)', borderBottom: 'var(--border-thick)', padding: '120px 24px' }}>
        <div className="section-header" style={{ marginBottom: 80, textAlign: 'center' }}>
          <div className="badge" style={{ background: 'var(--accent-red)', color: 'white', border: 'var(--border-thick)', marginBottom: 24 }}>WORKFLOW</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: -1 }}>Zero Friction Connection</h2>
        </div>

        <div className="steps-container" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64 }}>
          {steps.map((s, i) => (
            <div className="step-item" key={i} style={{
              background: 'white',
              padding: '60px 40px 40px',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow-flat)',
              position: 'relative'
            }}>
              <div className="step-number" style={{
                position: 'absolute',
                top: -40,
                left: 20,
                fontSize: '8rem',
                fontWeight: 900,
                color: 'var(--accent-blue)',
                opacity: 0.1,
                lineHeight: 1,
                pointerEvents: 'none'
              }}>{s.num}</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 16, position: 'relative' }}>{s.title}</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.6, position: 'relative' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ padding: '160px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: 24, letterSpacing: -2 }}>
            Ready to match?
          </h2>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 48 }}>
            No emails. No passwords. Just two developers and a camera.
          </p>
          <Link href="/room" className="btn btn-primary btn-lg" style={{ padding: '24px 64px', fontSize: '1.5rem' }}>
            START CONNECTING <Zap size={24} style={{ marginLeft: 12 }} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '80px 24px', borderTop: '4px solid var(--accent-blue)' }}>
        <div className="logo-badge" style={{ display: 'inline-flex', marginBottom: 24 }}>
          <span className="bolt">⚡</span>
          <span className="logo-text">Devgle</span>
        </div>
        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
          Built with Open Source Tech:{" "}
          <a href="https://github.com/nicedoc/trystero" target="_blank" rel="noopener" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
            Trystero
          </a>{" "}
          &{" "}
          <a href="https://webrtc.org" target="_blank" rel="noopener" style={{ color: 'var(--accent-green)', textDecoration: 'underline' }}>
            WebRTC
          </a>
        </p>
      </footer>
    </>
  );
}

const AVATAR_COLORS = [
  { bg: "#3b42f3", text: "#ffffff" }, // Blue
  { bg: "#ff4d4d", text: "#ffffff" }, // Red
  { bg: "#00d68f", text: "#1a1a1a" }, // Green
  { bg: "#ffcc00", text: "#1a1a1a" }, // Yellow
  { bg: "#9d4edd", text: "#ffffff" }, // Purple
  { bg: "#00d1ff", text: "#1a1a1a" }, // Cyan
];

