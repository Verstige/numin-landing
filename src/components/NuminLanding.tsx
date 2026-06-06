/**
 * NuminLanding — Full OrbitAIX-faithful replication
 * Every section, animation, and visual effect mirrored.
 * Cyan → Gold, OrbitAI branding → Numin branding.
 */
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import "@/landing.css";
import ROICalculator from "./ROICalculator";
import NuminVsAI from "./NuminVsAI";
import NuminLogo from "./ui/NuminLogo";

/* ── Random star generator ── */
function StarField({ count = 160 }: { count?: number }) {
    const stars = useRef<{ x: number; y: number; r: number; delay: number; dur: number }[]>(
        Array.from({ length: count }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            r: Math.random() * 1.4 + 0.3,
            delay: Math.random() * 4,
            dur: Math.random() * 3 + 2,
        }))
    );
    return (
        <div className="stars-layer">
            {stars.current.map((s, i) => (
                <div key={i} className="star" style={{
                    left: `${s.x}%`, top: `${s.y}%`,
                    width: s.r * 2, height: s.r * 2,
                    opacity: Math.random() * 0.5 + 0.1,
                    animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
                }} />
            ))}
        </div>
    );
}

/* ── Orbit Arc ── */
function OrbitalRings() {
    return (
        <>
            <div className="orbit-arc orbit-arc-1" />
            <div className="orbit-arc orbit-arc-2" />
            <div className="orbit-arc orbit-arc-3" />
        </>
    );
}

/* ── Dashboard Preview Mock ── */
function DashboardMock({ compact = false }: { compact?: boolean }) {
    const h = compact ? 340 : 520;
    return (
        <div style={{ display: 'flex', height: h, fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar */}
            <div style={{ width: 220, background: '#080b10', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '20px 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '0 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 12 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f7f9fc', letterSpacing: '-0.02em' }}>
                        numin<span style={{ color: '#C9A84C' }}>.</span>
                    </div>
                    <div style={{ fontSize: '0.55rem', color: '#55657a', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Your Personal AI hub</div>
                </div>
                {[
                    { icon: '▦', label: 'Dashboard', active: true },
                    { icon: '◈', label: 'Command', active: false },
                    { icon: '⬡', label: 'Agent Hub', active: false },
                    { icon: '✦', label: 'Integrations', active: false },
                    { icon: '▲', label: 'Operations', active: false },
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', margin: '1px 8px', borderRadius: 8, background: item.active ? 'rgba(201,168,76,0.07)' : 'transparent', borderLeft: `2px solid ${item.active ? '#C9A84C' : 'transparent'}`, fontSize: '0.75rem', color: item.active ? '#E8D5A3' : '#55657a', fontWeight: item.active ? 600 : 400 }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{item.icon}</span>
                        {item.label}
                    </div>
                ))}
                {!compact && (
                    <div style={{ marginTop: 16, padding: '0 14px' }}>
                        <div style={{ fontSize: '0.55rem', color: '#3a3f52', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Agents</div>
                        {['ARIA', 'VANCE', 'NEXUS', 'PRISM'].map(a => (
                            <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', fontSize: '0.65rem', color: '#55657a' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', boxShadow: '0 0 6px rgba(201,168,76,0.5)' }} />
                                {a}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main area */}
            <div style={{ flex: 1, background: '#050707', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top bar */}
                <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ flex: 1, background: '#0c0f14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px', fontSize: '0.72rem', color: '#3a3f52' }}>
                        Search agents, memory, insights…
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {['◎', '↻', '✦'].map(ic => (
                            <div key={ic} style={{ width: 30, height: 30, borderRadius: 8, background: '#0c0f14', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#55657a' }}>{ic}</div>
                        ))}
                    </div>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 700, color: '#C9A84C' }}>U</div>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Chat / content */}
                    <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Greeting card */}
                        <div style={{ background: '#0c0f14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #C9A84C30, #3e9cff20)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>◉</div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f7f9fc' }}>Good morning. Ready to run.</div>
                                <div style={{ fontSize: '0.72rem', color: '#55657a', marginTop: 2 }}>3 priority items · 6 agents online · All systems operational</div>
                            </div>
                        </div>

                        {/* Smart schedule */}
                        <div style={{ background: '#0c0f14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#C9A84C' }}>◈ Command Chat</span>
                                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                                    {['@ARIA', '@VANCE', '@NEXUS'].map(t => <span key={t} style={{ fontSize: '0.58rem', color: '#55657a', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 6 }}>{t}</span>)}
                                </div>
                            </div>
                            {[
                                { time: '8:00 AM', task: 'Morning briefing from NUMIN', tag: 'Optimized', tagColor: '#34f5c5' },
                                { time: '9:30 AM', task: 'VANCE: 3 deals closing this week', tag: 'High', tagColor: '#C9A84C' },
                                { time: '11:00 AM', task: 'NEXUS: 4 support tickets resolved', tag: 'Done', tagColor: '#34d399' },
                            ].map(row => (
                                <div key={row.time} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 4, background: 'rgba(255,255,255,0.02)' }}>
                                    <span style={{ fontSize: '0.62rem', color: '#3a3f52', minWidth: 56 }}>{row.time}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#acb5c4', flex: 1 }}>{row.task}</span>
                                    <span style={{ fontSize: '0.55rem', fontWeight: 600, color: row.tagColor, background: `${row.tagColor}15`, border: `1px solid ${row.tagColor}25`, padding: '2px 8px', borderRadius: 90 }}>{row.tag}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right panel — insights */}
                    {!compact && (
                        <div style={{ width: 260, borderLeft: '1px solid rgba(255,255,255,0.04)', padding: '20px 18px', background: '#050707', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                                ▦ Insights
                                <span style={{ fontSize: '0.52rem', background: 'rgba(52,245,197,0.1)', border: '1px solid rgba(52,245,197,0.2)', color: '#34f5c5', padding: '1px 6px', borderRadius: 90, marginLeft: 'auto' }}>Peak</span>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: '0.62rem', color: '#55657a', marginBottom: 6 }}>Daily ops score</div>
                                <div style={{ height: 4, background: '#0c0f14', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ width: '89%', height: '100%', background: 'linear-gradient(90deg, #C9A84C, #f0d078)', borderRadius: 2 }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                    <span style={{ fontSize: '0.6rem', color: '#3a3f52' }}>Daily ops score</span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f7f9fc' }}>89/100</span>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                                {[{ label: 'Tasks today', val: '12' }, { label: 'This week', val: '4.5h' }].map(s => (
                                    <div key={s.label} style={{ background: '#0c0f14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 12px' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f7f9fc', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.val}</div>
                                        <div style={{ fontSize: '0.58rem', color: '#55657a', marginTop: 4 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: '#0c0f14', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px' }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#acb5c4', marginBottom: 8 }}>Agent Activity</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
                                    {[40, 65, 55, 80, 90, 70, 85].map((h, i) => (
                                        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '2px 2px 0 0', background: i === 4 ? 'linear-gradient(180deg, #C9A84C, #E8D5A3)' : 'rgba(201,168,76,0.15)' }} />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.5rem', color: '#3a3f52' }}>{d}</span>)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════
   MAIN LANDING COMPONENT
══════════════════════════════ */
export default function NuminLanding() {
    const isMobile = useIsMobile();
    const [activeAudience, setActiveAudience] = useState(0);
    const audiences = ['Founders', 'Operators', 'Builders', 'Agencies', 'Freelancers'];

    useEffect(() => {
        const iv = setInterval(() => setActiveAudience(a => (a + 1) % audiences.length), 2200);
        return () => clearInterval(iv);
    }, []);

    return (
        <div style={{ background: '#050707', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#acb5c4', overflowX: 'hidden' }}>

            {/* ── NAV ── */}
            <nav className="lp-nav">
                <NuminLogo scale={1} className="lp-nav-logo" href="/" />
                <ul className="lp-nav-links">
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li><a href="#intelligence">Core Intelligence</a></li>
                    <li><a href="#why-numin">Why Numin</a></li>
                    <li><a href="#vs-ai">vs ChatGPT</a></li>
                    <li><a href="#calculator">Calculator</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                </ul>
                <div className="lp-nav-actions">
                    <Link to="/auth" className="btn-nav-signin">Sign In</Link>
                    <Link to="/get-started" className="btn-nav-cta">Get Started</Link>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="lp-hero">
                <StarField count={240} />
                <div className="hero-nebula" />
                <div className="hero-grid-overlay" />
                <OrbitalRings />

                {/* Floating ambient orbs */}
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />
                <div className="hero-orb hero-orb-3" />

                {/* Floating planet orb */}
                <div className="planet planet-small animate-float-planet" />

                {/* Extra small orbs */}
                <div style={{
                    position: 'absolute', width: 48, height: 48, borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, rgba(201,168,76,0.3), #0c1a3a)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    boxShadow: '0 0 20px rgba(201,168,76,0.12)',
                    left: '18%', top: '28%',
                    animation: 'float-planet 8s ease-in-out infinite 2s',
                    pointerEvents: 'none', zIndex: 1,
                }} />
                <div style={{
                    position: 'absolute', width: 28, height: 28, borderRadius: '50%',
                    background: 'radial-gradient(circle at 40% 40%, #1e3560, #050707)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    right: '20%', top: '42%',
                    animation: 'float-planet 11s ease-in-out infinite 4s',
                    pointerEvents: 'none', zIndex: 1,
                }} />

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Badge chip */}
                    <div className="hero-badge animate-reveal">
                        <div className="hero-badge-dot">N</div>
                        AI Business Operating System
                    </div>

                    {/* Hero headline */}
                    <h1 style={{
                        fontSize: 'clamp(3.2rem, 7vw, 6.2rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.06,
                        color: '#f7f9fc',
                        maxWidth: 920,
                        margin: '0 auto 28px',
                        animation: 'hero-word-pop 1s cubic-bezier(0.16,1,0.3,1) both 0.1s',
                    }}>
                        Your business runs on{' '}
                        <span className="text-shimmer">numinous</span>{' '}
                        intelligence.
                    </h1>

                    {/* Subheading */}
                    <p className="lp-hero-sub animate-reveal animate-reveal-d2" style={{ maxWidth: 580 }}>
                        Numin deploys six AI agents on-site at your company. They handle operations, sales, support, and communications — 24/7, all on your own hardware.
                    </p>

                    {/* CTA Buttons */}
                    <div className="lp-hero-btns animate-reveal animate-reveal-d2">
                        <Link to="/get-started" className="btn-primary-hero">
                            Request Access <span>→</span>
                        </Link>
                        <a href="#how-it-works" className="btn-ghost-hero">
                            <span style={{ fontSize: '0.7rem' }}>▶</span> See How It Works
                        </a>
                    </div>

                    {/* Live agent status strip */}
                    <div className="agent-strip">
                        <span className="agent-strip-label">Live agents</span>
                        {[
                            { name: 'ARIA', status: 'active', task: 'Briefing' },
                            { name: 'VANCE', status: 'active', task: '3 deals' },
                            { name: 'NEXUS', status: 'active', task: 'Support' },
                            { name: 'PRISM', status: 'idle', task: 'Standby' },
                            { name: 'APEX', status: 'active', task: 'KPIs' },
                            { name: 'NUMIN', status: 'active', task: 'Command' },
                        ].map(agent => (
                            <div key={agent.name} className="agent-pill">
                                <div className={`agent-pill-dot ${agent.status}`} />
                                <span style={{ color: agent.status === 'active' ? '#acb5c4' : '#3a3f52', fontWeight: 600 }}>{agent.name}</span>
                                <span style={{ color: '#3a3f52', fontSize: '0.62rem' }}>· {agent.task}</span>
                            </div>
                        ))}
                    </div>

                    {/* Social proof micro-line */}
                    <div style={{
                        display: isMobile ? 'grid' : 'flex',
                        gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : undefined,
                        alignItems: 'center', gap: isMobile ? 8 : 20,
                        marginTop: 36, opacity: 0,
                        animation: 'reveal-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards 0.8s',
                    }}>
                        {[
                            { val: '6', label: 'AI Agents' },
                            { val: '24/7', label: 'Always On' },
                            { val: '10 days', label: 'To Deploy' },
                            { val: '100%', label: 'Your Hardware' },
                        ].map((stat, i) => (
                            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: isMobile ? 'center' : undefined }}>
                                {i > 0 && !isMobile && <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }} />}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f7f9fc', letterSpacing: '-0.02em', animation: 'counter-pulse 3s ease-in-out infinite', animationDelay: `${i * 0.4}s` }}>{stat.val}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#3a3f52', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard preview */}
                <div className="lp-dashboard-preview animate-reveal animate-reveal-d3">
                    <DashboardMock />
                </div>
            </section>

            {/* ── "DESIGNED FOR" AUDIENCE SECTION ── */}
            <section id="designed-for" className="audience-section" style={{ position: 'relative' }}>
                <StarField count={60} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 className="audience-heading">
                        Designed For{' '}
                        <span className="cyan" style={{ display: 'inline-block' }}>
                            {audiences[activeAudience]}
                        </span>
                    </h2>

                    {/* Audience planet visual — central orb with particle ring, exactly like OrbitAIX */}
                    <div className="audience-planet-wrap">
                        {/* Particle ring */}
                        <svg width="100%" height="100%" viewBox="0 0 860 420" style={{ position: 'absolute', inset: 0 }}>
                            <ellipse cx="430" cy="410" rx="340" ry="90" fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="1" />
                            <ellipse cx="430" cy="410" rx="220" ry="60" fill="none" stroke="rgba(62,156,255,0.06)" strokeWidth="1" />
                            {/* Particle dots on ring */}
                            {Array.from({ length: 32 }).map((_, i) => {
                                const angle = (i / 32) * Math.PI;
                                const x = 430 + Math.cos(angle - Math.PI / 2) * 320;
                                const y = 410 + Math.sin(angle - Math.PI / 2) * 82;
                                return <circle key={i} cx={x} cy={y} r={Math.random() * 1.5 + 0.5} fill="rgba(52,245,197,0.4)" />;
                            })}
                        </svg>
                        {/* Central globe */}
                        <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #1e4a7e, #0a1a3a)', border: '1.5px solid rgba(62,156,255,0.3)', boxShadow: '0 0 60px rgba(62,156,255,0.25)', left: '50%', top: '15%', transform: 'translateX(-50%)', animation: 'float-planet 5s ease-in-out infinite' }} />
                    </div>

                    {/* Audience tags row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 860, margin: '-20px auto 0' }}>
                        {['Creators', 'Founders', 'Freelancers', 'Builders'].map((tag, i) => (
                            <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: i === 1 ? '#f7f9fc' : '#55657a', fontWeight: i === 1 ? 500 : 400 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 1 ? '#C9A84C' : '#3a3f52', animation: i === 1 ? 'pulse-dot 2s ease-in-out infinite' : 'none' }} />
                                {tag}
                            </div>
                        ))}
                    </div>

                    <p className="audience-footer-text" style={{ marginTop: 64 }}>
                        And any company that feels <span className="dim">overwhelmed by operations.</span>
                    </p>
                </div>
            </section>

            {/* ── ADVANTAGE — "Less chaos. More focus." ── */}
            <section id="why-numin" className="advantage-section" style={{ background: 'linear-gradient(180deg, #050707 0%, #080b10 50%, #050707 100%)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <p className="advantage-eyebrow">◈ The Numin Advantage</p>
                    <h2 className="advantage-heading">
                        Less chaos. <span className="dim">Less overwhelm.</span>
                    </h2>
                    <p className="advantage-body-text">
                        Numin handles the operational thinking for you — so your team stays free for the work that actually matters.
                    </p>

                    <div className="advantage-cards-row" style={{ flexWrap: 'wrap' }}>
                        {[
                            { icon: '✦', title: 'Less planning', bullets: ['Auto-generates daily ops briefs', 'Routes tasks to the right agent', 'No meetings to coordinate AI'], color: '#C9A84C' },
                            { icon: '▼', title: 'Less overwhelm', bullets: ['Unified command interface', 'All context in one place', 'Agents handle the noise'], color: '#60a5fa' },
                            { icon: '▲', title: 'More focus', bullets: ['Your team works on real problems', 'AI handles repetitive tasks', 'Clear daily priorities'], color: '#34d399' },
                        ].map(card => (
                            <div key={card.title} className="advantage-card" style={{ flex: 1, minWidth: 240 }}>
                                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 70% 10%, ${card.color}06, transparent 60%)`, pointerEvents: 'none', borderRadius: 20 }} />
                                <div className="icon-wrap" style={{ background: `${card.color}10`, border: `1px solid ${card.color}20`, color: card.color }}>{card.icon}</div>
                                <div className="card-bullet" style={{ marginTop: 6 }}>
                                    <span style={{ fontSize: '0.95rem', color: '#f7f9fc', fontWeight: 600 }}>{card.title}</span>
                                </div>
                                {card.bullets.map(b => (
                                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: '#acb5c4' }}>
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: card.color, flexShrink: 0 }} />
                                        {b}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <p className="advantage-tagline">
                        <span className="bright">Numin</span> handles the thinking for you — so your mind stays free for <span className="bright">real work.</span>
                    </p>
                </div>
            </section>

            {/* ── BENTO GRID — "Goodbye to Daily Chaos" ── */}
            <section id="intelligence" className="bento-section">
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <p className="bento-eyebrow">◉ Deep Intelligence Breakdown</p>
                    <h2 className="bento-heading">Goodbye to <span style={{ color: 'rgba(247,249,252,0.35)', fontWeight: 300 }}>Daily</span> Chaos</h2>
                    <p className="bento-sub">Six agents. Every function covered. All on your hardware.</p>

                    <div className="bento-grid">
                        {/* Cell 1 — Command Chat (large) */}
                        <div className="bento-cell bento-cell-large">
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 10%, rgba(201,168,76,0.06), transparent 60%)', pointerEvents: 'none', borderRadius: 20 }} />
                            <div className="bento-icon-wrap" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.12)' }}>⬡</div>
                            <h3 className="bento-title">NUMIN <span>Command</span></h3>
                            <p className="bento-desc">The brain of your operation. Route tasks, ask questions, and get briefings — all in one intelligent conversation.</p>
                            <div className="bento-mock">
                                {[
                                    { time: '8:00 AM', task: 'Morning ops brief compiled', tag: 'Optimized' },
                                    { time: '9:30 AM', task: 'VANCE: 3 deals closing', tag: 'High' },
                                    { time: '11:00 AM', task: 'APEX: Report ready', tag: 'Optimized' },
                                ].map(row => (
                                    <div key={row.time} className="bento-mock-row">
                                        <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#C9A84C', flexShrink: 0 }}>N</div>
                                        <span style={{ fontSize: '0.6rem', color: '#3a3f52', minWidth: 52 }}>{row.time}</span>
                                        <span style={{ flex: 1, fontSize: '0.72rem' }}>{row.task}</span>
                                        <span className="badge-optimized">{row.tag}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cell 2 — ARIA */}
                        <div className="bento-cell bento-cell-top-right">
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 10%, rgba(167,139,250,0.07), transparent 60%)', pointerEvents: 'none', borderRadius: 20 }} />
                            <div className="bento-icon-wrap" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.12)' }}>✦</div>
                            <h3 className="bento-title">ARIA <span>Assistant</span></h3>
                            <p className="bento-desc">Write naturally. ARIA triages email, schedules meetings, and drafts responses automatically.</p>
                            <div className="bento-check-list">
                                {['Email triage & response drafts', 'Calendar management & blocks', 'Meeting summaries & follow-ups'].map(i => (
                                    <div key={i} className="bento-check-item">{i}</div>
                                ))}
                            </div>
                        </div>

                        {/* Cell 3 — Focus / APEX */}
                        <div className="bento-cell bento-cell-bottom-left">
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 80%, rgba(248,113,113,0.06), transparent 60%)', pointerEvents: 'none', borderRadius: 20 }} />
                            <div className="bento-icon-wrap" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.12)' }}>▲</div>
                            <h3 className="bento-title">APEX <span>Operations</span></h3>
                            <p className="bento-desc">Tracks KPIs, generates reports, and monitors your business health in real time.</p>
                            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                                <div className="timer-mock" style={{ borderColor: 'rgba(248,113,113,0.2)', boxShadow: '0 0 40px rgba(248,113,113,0.06)' }}>
                                    <div className="time">89</div>
                                    <div className="label">Ops Score</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="mini-stats">
                                        <div className="mini-stat">
                                            <div className="mini-stat-val">12</div>
                                            <div className="mini-stat-lbl">Tasks today</div>
                                        </div>
                                        <div className="mini-stat">
                                            <div className="mini-stat-val">4.5h</div>
                                            <div className="mini-stat-lbl">Automated</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cell 4 — VANCE + PRISM */}
                        <div className="bento-cell bento-cell-bottom-right">
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 80%, rgba(96,165,250,0.07), transparent 60%)', pointerEvents: 'none', borderRadius: 20 }} />
                            <div className="bento-icon-wrap" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.12)' }}>◈</div>
                            <h3 className="bento-title">VANCE <span style={{ color: 'rgba(247,249,252,0.45)', fontWeight: 300 }}>& PRISM</span></h3>
                            <p className="bento-desc">Sales intelligence meets marketing execution. Pipeline tracking and content, unified.</p>
                            <div className="bar-chart" style={{ marginTop: 20 }}>
                                {[0.4, 0.65, 0.5, 0.8, 0.9, 0.7, 0.85, 0.6, 0.75, 0.95].map((h, i) => (
                                    <div key={i} className={`bar ${i > 6 ? 'active' : ''}`} style={{ height: `${h * 100}%`, opacity: i > 6 ? 1 : 0.4 }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                <span style={{ fontSize: '0.6rem', color: '#3a3f52' }}>Task Completion</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34d399' }}>↑ 18% vs last week</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VS AI EDUCATION SECTION ── */}
            <NuminVsAI />

            {/* ── DASHBOARD SHOWCASE — "Everything in one place" ── */}
            <section id="how-it-works" className="dashboard-section" style={{ background: '#050707' }}>
                <div className="dashboard-section-inner">
                    <h2 className="dashboard-showcase-heading">
                        Everything you need — <span className="dim">in one clean</span> dashboard.
                    </h2>
                    <p className="dashboard-showcase-sub">
                        Your agents, conversations, KPIs, integrations, and command chat — all in a single calm workspace. No more switching between 6 different apps.
                    </p>
                </div>
                <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 52px' }}>
                    <div className="dashboard-full-card">
                        <DashboardMock compact={false} />
                    </div>
                </div>
            </section>

            {/* ── ROI CALCULATOR ── */}
            <ROICalculator />

            {/* ── PRICING ── */}
            <section id="pricing" style={{ background: 'linear-gradient(180deg, #050707 0%, #080b10 60%, #050707 100%)', padding: isMobile ? '72px 20px' : '100px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                            Pricing
                        </p>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700, color: '#f7f9fc', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
                            One system.{' '}
                            <span style={{ color: 'rgba(247,249,252,0.35)', fontWeight: 300, fontStyle: 'italic' }}>Four levels</span>{' '}
                            of power.
                        </h2>
                        <p style={{ fontSize: '0.95rem', color: '#55657a', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
                            Every plan includes your dedicated AI agents, the Numin command dashboard, and full onboarding support.
                        </p>
                    </div>

                    {/* 2×2 Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 16 : 20 }}>

                        {/* ESSENTIAL */}
                        {[
                            {
                                id: 'starter', tier: 'Starter', name: 'Starter', tagline: '"The full Numin experience, day one"',
                                setup: '499', monthly: '49',
                                hardware: '🖥  Mac mini M2 — pre-configured & shipped',
                                agents: ['◉ NUMIN', '✦ ARIA'],
                                features: [
                                    '2 AI Agents — ARIA (Executive) + NUMIN (Command)',
                                    'Mac mini M2 pre-configured & delivered',
                                    'Email triage & Calendar management',
                                    'Daily briefings & priority sorting',
                                    '6-month conversation memory',
                                    'Unlimited AI tasks',
                                    '1-hour onboarding call',
                                    'Email support (48hr response)',
                                    'Data stays on your hardware — always',
                                ],
                                missing: ['Custom agent training'],
                                featured: false, premium: false,
                                cta: 'Get Started',
                            },
                            {
                                id: 'growth', tier: 'Growth', name: 'Growth', tagline: '"Your AI operations team"',
                                setup: '2,499', monthly: '149',
                                hardware: '🖥  Mac mini M2 (16GB) — pre-configured & shipped',
                                agents: ['◉ NUMIN', '✦ ARIA', '⬡ NEXUS', '◆ PRISM'],
                                features: [
                                    '4 AI Agents — ARIA, NEXUS, PRISM + NUMIN',
                                    'Mac mini M2 16GB pre-configured & delivered',
                                    'Email, Calendar, CRM & Slack integrations',
                                    'Customer support automation (NEXUS)',
                                    'Marketing content & campaigns (PRISM)',
                                    'Full 1-year conversation memory bank',
                                    'Unlimited AI tasks',
                                    '2-hour white-glove onboarding',
                                    'Priority support (24hr response)',
                                ],
                                missing: [],
                                featured: false, premium: false,
                                cta: 'Get Started',
                            },
                            {
                                id: 'professional', tier: 'Professional', name: 'Professional', tagline: '"Your full AI executive team"',
                                setup: '4,999', monthly: '299',
                                hardware: '🖥  Mac mini M4 Pro — premium pre-configured unit',
                                agents: ['◉ NUMIN', '✦ ARIA', '◈ VANCE', '⬡ NEXUS', '◆ PRISM', '▲ APEX'],
                                features: [
                                    'All 6 AI Agents — full executive fleet',
                                    'Mac mini M4 Pro pre-configured & delivered',
                                    'All integrations unlocked',
                                    'Sales pipeline automation (VANCE)',
                                    'Live KPI monitoring & reporting (APEX)',
                                    'Custom agent training on your business',
                                    'Unlimited memory — never expires',
                                    'Custom workflows built for your operations',
                                    'Dedicated success manager',
                                    '4-hour onboarding + weekly check-ins (30 days)',
                                ],
                                missing: [],
                                featured: true, premium: false,
                                cta: 'Get Started',
                            },
                            {
                                id: 'scale', tier: 'Scale', name: 'Scale', tagline: '"Maximum power for growing teams"',
                                setup: '9,999', monthly: '399',
                                hardware: '🖥  Mac mini M4 Pro (24GB) — enterprise pre-configured',
                                agents: ['◉ NUMIN', '✦ ARIA', '◈ VANCE', '⬡ NEXUS', '◆ PRISM', '▲ APEX', '+ Custom'],
                                features: [
                                    'Everything in Professional',
                                    'Custom workflows built for your operations',
                                    'Advanced integrations & API access',
                                    'Priority agent training on your business',
                                    'Dedicated success manager + weekly check-ins',
                                    'Enhanced security & compliance tools',
                                    '6-hour onboarding + priority setup',
                                ],
                                missing: [],
                                featured: false, premium: false,
                                cta: 'Get Started',
                            },
                            {
                                id: 'enterprise', tier: 'Enterprise', name: 'Enterprise', tagline: '"Replace entire departments with intelligence"',
                                setup: '24,999', monthly: '3,997',
                                hardware: '🖥  Mac mini M4 Max × up to 3 locations',
                                agents: ['◉ NUMIN', '✦ ARIA', '◈ VANCE', '⬡ NEXUS', '◆ PRISM', '▲ APEX', '+ Custom'],
                                features: [
                                    'Everything in Scale',
                                    'Multi-location deployment (up to 3 sites)',
                                    'Custom branded agent names & personas',
                                    'Private dedicated AI — not shared infrastructure',
                                    'Custom integrations built for your tools',
                                    'On-site setup & full team training',
                                    '24/7 priority support line',
                                    'Quarterly business strategy reviews',
                                    'First access to new agents as released',
                                    'White-label option available',
                                ],
                                missing: [],
                                featured: false, premium: true,
                                cta: 'Contact Sales',
                            },
                        ].map(plan => (
                            <div key={plan.name} style={{
                                position: 'relative',
                                background: plan.featured
                                    ? 'linear-gradient(160deg, rgba(201,168,76,0.1) 0%, #0c0f14 60%)'
                                    : plan.premium
                                        ? 'linear-gradient(160deg, rgba(201,168,76,0.07) 0%, rgba(59,47,107,0.08) 100%)'
                                        : '#0c0f14',
                                border: plan.featured
                                    ? '1px solid rgba(201,168,76,0.45)'
                                    : plan.premium
                                        ? '1px solid rgba(201,168,76,0.35)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 20,
                                padding: '36px 40px',
                                transition: 'transform 0.3s, border-color 0.3s',
                            }}>
                                {/* Badge */}
                                {(plan.featured || plan.premium) && (
                                    <div style={{
                                        position: 'absolute', top: 22, right: 22,
                                        fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        background: plan.featured ? '#C9A84C' : 'transparent',
                                        color: plan.featured ? '#050707' : '#E8D5A3',
                                        border: plan.premium ? '1px solid rgba(201,168,76,0.4)' : 'none',
                                        padding: '4px 14px', borderRadius: 100,
                                    }}>
                                        {plan.featured ? 'Best Value' : 'Full Power'}
                                    </div>
                                )}

                                {/* Tier label */}
                                <p style={{ fontSize: '0.62rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6, fontWeight: 600 }}>◦ {plan.tier}</p>
                                {/* Name */}
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f7f9fc', letterSpacing: '-0.02em', marginBottom: 4 }}>{plan.name}</h3>
                                {/* Tagline */}
                                <p style={{ fontSize: '0.78rem', color: '#3a3f52', fontStyle: 'italic', marginBottom: 20 }}>{plan.tagline}</p>

                                {/* Price */}
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 4 }}>
                                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '3rem', fontWeight: 800, color: '#f7f9fc', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 300, verticalAlign: 'super' }}>$</span>{plan.setup}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#C9A84C', fontWeight: 600, paddingBottom: 8 }}>+ ${plan.monthly}/mo</span>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#3a3f52', marginBottom: plan.hardware ? 16 : 20 }}>one-time setup · then monthly subscription</p>

                                {/* Hardware badge */}
                                {plan.hardware && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10, padding: '8px 14px', marginBottom: 20, fontSize: '0.75rem', color: '#E8D5A3' }}>
                                        {plan.hardware}
                                    </div>
                                )}

                                {/* Agent badges */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                                    {plan.agents.map(a => (
                                        <span key={a} style={{ fontSize: '0.6rem', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.04)', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.08em', fontWeight: 500 }}>{a}</span>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: plan.featured ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)', marginBottom: 20 }} />

                                {/* Features */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                    {plan.features.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.8rem', color: '#acb5c4', lineHeight: 1.5 }}>
                                            <span style={{ color: '#C9A84C', flexShrink: 0, marginTop: 1 }}>✓</span>
                                            {f}
                                        </div>
                                    ))}
                                    {plan.missing.map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.8rem', color: '#2a2f3a', lineHeight: 1.5 }}>
                                            <span style={{ flexShrink: 0, marginTop: 1 }}>—</span>
                                            {f}
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <Link to={plan.cta === 'Contact Sales' ? '/get-started?tier=enterprise' : `/get-started?tier=${plan.id || plan.name.toLowerCase()}`} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    marginTop: 28, padding: '13px 0', borderRadius: 10, width: '100%',
                                    fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.04em',
                                    background: plan.featured ? '#C9A84C' : 'transparent',
                                    color: plan.featured ? '#050707' : '#C9A84C',
                                    border: plan.featured ? 'none' : '1px solid rgba(201,168,76,0.3)',
                                    transition: 'all 0.2s',
                                }}>
                                    {plan.cta} →
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Value anchor */}
                    {/* Comparison callout */}
                    <div style={{
                        margin: '48px auto 0', maxWidth: 680,
                        background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)',
                        borderRadius: 16, padding: isMobile ? '24px 20px' : '28px 36px',
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
                        gap: isMobile ? 16 : 24, alignItems: 'center',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: '#3a3f52', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8, fontWeight: 600 }}>Without Numin</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444', letterSpacing: '-0.03em' }}>$180K+</div>
                            <div style={{ fontSize: '0.72rem', color: '#55657a', marginTop: 4 }}>avg. annual cost of one mid-level ops hire</div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#3a3f52' }}>vs</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: '#3a3f52', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8, fontWeight: 600 }}>Professional Plan</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399', letterSpacing: '-0.03em' }}>$33,9K</div>
                            <div style={{ fontSize: '0.72rem', color: '#55657a', marginTop: 4 }}>full year · 6 agents · never calls in sick</div>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: '#3a3f52', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.9 }}>
                        Every plan ships with Mac hardware included. Plug in. Power on. Your team is ready.
                    </p>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <StarField count={80} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                        One-time setup · cancel subscription anytime
                    </div>
                    <h2 className="cta-heading">
                        Start your best day — every day.
                    </h2>
                    <p className="cta-sub">Your AI team is standing by. All data stays on your hardware.</p>
                    <Link to="/get-started" className="btn-primary-hero" style={{ display: 'inline-flex' }}>
                        Request Access →
                    </Link>
                    <p className="cta-note">Starting at $499 · Mac hardware included in every plan · Operational in 10 days</p>
                </div>

                {/* CTA planet visual — exact OrbitAIX replica */}
                <div className="cta-planet-wrap">
                    <div className="cta-arc" style={{ width: 1200, height: 1200, bottom: -820 }} />
                    <div className="cta-arc" style={{ width: 920, height: 920, bottom: -640 }} />
                    <div className="cta-arc" style={{ width: 640, height: 640, bottom: -460 }} />
                    <div className="cta-planet-main" />
                    <div className="cta-planet-small" />
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <div style={{ marginBottom: 20 }}>
                    <NuminLogo scale={1.2} />
                </div>
                <nav className="lp-footer-links">
                    <Link to="/auth">Sign In</Link>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#intelligence">Intelligence</a>
                    <a href="#why-numin">Why Numin</a>
                </nav>
                <div className="lp-footer-social">
                    {['𝕏', 'f', '◎', 'in'].map(icon => (
                        <a key={icon} href="#" className="social-icon">{icon}</a>
                    ))}
                </div>
            </footer>
            <div className="lp-footer-bottom">
                © 2025 Numin. AI Business Operating System. Built for business, designed for calm.
            </div>
        </div>
    );
}
