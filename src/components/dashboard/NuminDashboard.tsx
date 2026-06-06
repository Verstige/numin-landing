/**
 * Numin Dashboard — Flagship Shell
 * Live connection to Numin AI engine
 * Mock mode only activates explicitly (demo/landing page use)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import AgentHub from "./AgentHub";
import CommandChat from "./CommandChat";
import MemoryTimeline from "./MemoryTimeline";
import OperationsOverview from "./OperationsOverview";
import IntegrationsPanel from "./IntegrationsPanel";
import BusinessProfile from "./BusinessProfile";
import FinancialsView from "./FinancialsView";
import { hermes } from "@/lib/hermes/client";
import type { AgentStatus } from "@/lib/hermes/client";

type DashboardView = 'command' | 'agents' | 'memory' | 'operations' | 'financials' | 'integrations' | 'settings';

const NAV: { id: DashboardView; label: string; icon: string }[] = [
    { id: 'command', label: 'Command', icon: '◉' },
    { id: 'agents', label: 'Agent Hub', icon: '⬡' },
    { id: 'memory', label: 'Memory', icon: '◈' },
    { id: 'operations', label: 'Operations', icon: '▲' },
    { id: 'financials', label: 'Financials', icon: '◇' },
    { id: 'integrations', label: 'Integrations', icon: '✦' },
    { id: 'settings', label: 'Settings', icon: '◆' },
];

const SUBTITLES: Record<DashboardView, string> = {
    command: 'Talk to NUMIN — your command intelligence',
    agents: 'Real-time status for all 6 agents',
    memory: 'Conversation history & business memory',
    operations: 'KPIs, task queue, and automations',
    financials: 'Revenue, expenses, profit, and cash flow',
    integrations: 'Connected tools and data flows',
    settings: 'Business profile and agent configuration',
};

const NuminDashboard = () => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [view, setView] = useState<DashboardView>('command');
    const [statuses, setStatuses] = useState<AgentStatus[]>([]);
    const [health, setHealth] = useState<'checking' | 'ok' | 'offline'>('checking');
    const [latencyMs, setLatencyMs] = useState<number | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // User display info from Clerk
    const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || 'User';
    const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
    const companyName = (user?.unsafeMetadata?.company as string) || (user?.organizationMemberships?.[0]?.organization?.name) || 'Your Business';

    const checkHealth = useCallback(async () => {
        try {
            const { ok, latencyMs: ms } = await hermes.healthCheck();
            setHealth(ok ? 'ok' : 'offline');
            if (ms !== undefined) setLatencyMs(ms);
            if (ok) {
                hermes.getAgentStatus().then(setStatuses);
                hermes.connect();
            }
        } catch {
            setHealth('offline');
        }
        // Always retry in background regardless — never block the dashboard
        retryRef.current = setTimeout(() => setRetryCount(c => c + 1), 15000);
    }, [retryCount]);

    useEffect(() => {
        checkHealth();
        return () => { if (retryRef.current) clearTimeout(retryRef.current); };
    }, [retryCount]);

    useEffect(() => {
        if (health !== 'ok') return;
        const iv = setInterval(() => hermes.getAgentStatus().then(setStatuses), 30000);
        return () => { clearInterval(iv); hermes.disconnect(); };
    }, [health]);

    const onlineCount = statuses.filter(s => s.status !== 'offline').length;

    const Content = useCallback(() => {
        switch (view) {
            case 'command': return <CommandChat agentStatuses={statuses} />;
            case 'agents': return <AgentHub agentStatuses={statuses} />;
            case 'memory': return <MemoryTimeline />;
            case 'operations': return <OperationsOverview agentStatuses={statuses} />;
            case 'financials': return <FinancialsView />;
            case 'integrations': return <IntegrationsPanel />;
            case 'settings': return <BusinessProfile />;
        }
    }, [view, statuses]);

    // ── Dashboard always loads — connection status shown inline in sidebar ──
    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', overflow: 'hidden' }}>

            {/* ── Sidebar ── */}
            <aside style={{ width: 248, minWidth: 248, background: 'var(--bg-elevated)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
                {/* Logo */}
                <div style={{ padding: '0 22px 22px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        numin<span style={{ color: 'var(--gold)' }}>.</span>
                    </div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>AI Business OS</div>
                </div>

                {/* System status indicators */}
                <div style={{ padding: '0 14px', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {/* 1 — Numin system */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <span className="status-dot active" style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Numin</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: '#34d399', fontWeight: 600 }}>Online</span>
                    </div>
                    {/* 2 — Gateway connection (real check via /status) */}
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: health !== 'ok' ? 'pointer' : 'default' }}
                        onClick={() => health !== 'ok' && setRetryCount(c => c + 1)}
                        title={health !== 'ok' ? 'Click to retry connection' : `Latency: ${latencyMs}ms`}
                    >
                        <span className={`status-dot ${health === 'ok' ? 'active' : health === 'checking' ? 'processing' : 'error'}`} style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gateway</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 600, color: health === 'ok' ? '#34d399' : health === 'checking' ? 'var(--gold)' : '#f87171' }}>
                            {health === 'ok' ? (latencyMs ? `${latencyMs}ms` : 'Live') : health === 'checking' ? '…' : 'Retry ↺'}
                        </span>
                    </div>
                    {/* 3 — AI Engine */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <span className={`status-dot ${health === 'ok' ? 'active' : 'processing'}`} style={{ width: 6, height: 6 }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Engine</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 600, color: health === 'ok' ? '#34d399' : 'var(--gold)' }}>
                            {health === 'ok' ? 'Ready' : 'Starting…'}
                        </span>
                    </div>
                </div>

                {/* Nav items */}
                <nav style={{ padding: '8px 10px', flex: 1 }}>
                    {NAV.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`orbit-nav-item ${view === item.id ? 'active' : ''}`}
                            style={{ width: '100%', marginBottom: 2, textAlign: 'left', fontFamily: "'Inter', sans-serif" }}
                        >
                            <span style={{ fontSize: '0.9rem', opacity: 0.75, width: 20, textAlign: 'center' }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Agent activity footer */}
                <div style={{ padding: '18px 22px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Active Agents</div>
                    {statuses.slice(0, 3).map(a => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span className={`status-dot ${a.status}`} style={{ width: 6, height: 6 }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{a.id}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: 'var(--text-faint)' }}>
                                {a.status === 'active' ? '●' : a.status === 'processing' ? '…' : '○'}
                            </span>
                        </div>
                    ))}
                    <div style={{ marginTop: 12, fontSize: '0.68rem', fontWeight: 600, color: 'var(--gold)', opacity: 0.8 }}>
                        {onlineCount} agents online
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <header className="orbit-glass" style={{ padding: '16px 36px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                            {NAV.find(n => n.id === view)?.label}
                        </h1>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 400 }}>{SUBTITLES[view]}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{companyName}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{displayName}</div>
                        </div>
                        <button
                            onClick={() => signOut({ redirectUrl: '/' })}
                            title="Sign out"
                            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-subtle)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold)', cursor: 'pointer' }}
                        >
                            {initials}
                        </button>
                    </div>
                </header>

                <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar-orbit">
                    <Content />
                </div>
            </main>
        </div>
    );
};

export default NuminDashboard;
