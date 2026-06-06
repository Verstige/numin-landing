/**
 * Admin Portal — OrbitAIX flagship
 */
import { useState } from "react";
import NuminLogo from "../ui/NuminLogo";

type ClientStatus = 'active' | 'onboarding' | 'inactive';
type Client = { id: string; company: string; contact: string; status: ClientStatus; plan: string; since: string; agentsActive: number; mrr: number };

const MC: Client[] = [
    { id: '1', company: 'Acme Corp', contact: 'james@acmecorp.com', status: 'active', plan: 'Full Stack', since: 'Jan 2025', agentsActive: 6, mrr: 1500 },
    { id: '2', company: 'Summit Retail', contact: 'ceo@summitretail.com', status: 'onboarding', plan: 'Full Stack', since: 'Feb 2025', agentsActive: 3, mrr: 1500 },
    { id: '3', company: 'BluWave SaaS', contact: 'ops@bluwave.io', status: 'active', plan: 'Full Stack', since: 'Dec 2024', agentsActive: 6, mrr: 1500 },
    { id: '4', company: 'HealthTech Corp', contact: 'it@healthtech.com', status: 'inactive', plan: 'Full Stack', since: 'Nov 2024', agentsActive: 0, mrr: 0 },
];
const SC: Record<ClientStatus, string> = { active: '#34d399', onboarding: '#fbbf24', inactive: '#5c6178' };

type SalesRep = { id: string; name: string; region: string; salesThisMonth: number; };
const REPS: SalesRep[] = [
    { id: '1', name: 'Marcus Sterling', region: 'North America', salesThisMonth: 3 },
    { id: '2', name: 'Elena Rostova', region: 'Europe', salesThisMonth: 1 },
    { id: '3', name: 'Julian Vance', region: 'APAC', salesThisMonth: 2 },
];

const TIERS = {
    starter: { name: 'Starter', price: 499, macCost: 600, setupCost: 499, hwName: 'Mac Mini M2' },
    growth: { name: 'Growth', price: 2499, macCost: 1299, setupCost: 2499, hwName: 'Mac mini M2 16GB' },
    professional: { name: 'Professional', price: 4999, macCost: 1699, setupCost: 4999, hwName: 'Mac mini M4 Pro' },
    scale: { name: 'Scale', price: 9999, macCost: 1999, setupCost: 9999, hwName: 'Mac mini M4 Pro 24GB' },
    enterprise: { name: 'Enterprise', price: 24999, macCost: 6000, setupCost: 24999, hwName: '3x Mac mini M4 Max' }
};

type TierKey = keyof typeof TIERS;
const COMM_RATE = 0.40;

type Task = { id: string; label: string; done: boolean };
type ClientTasks = Record<string, Task[]>;

const DEFAULT_TASKS: Task[] = [
    { id: 't1', label: 'Initial needs assessment call', done: false },
    { id: 't2', label: 'Hardware order confirmed', done: false },
    { id: 't3', label: 'Network infrastructure review', done: false },
    { id: 't4', label: 'Admin accounts provisioned', done: false },
    { id: 't5', label: 'Agent configuration complete', done: false },
    { id: 't6', label: 'User training scheduled', done: false },
    { id: 't7', label: 'Go-live checklist reviewed', done: false },
    { id: 't8', label: '30-day follow-up scheduled', done: false },
];

type Resolution = { id: string; client: string; subject: string; priority: 'low' | 'medium' | 'high'; status: 'open' | 'pending' | 'resolved'; created: string; assignee: string };
const RESOLUTIONS: Resolution[] = [
    { id: 'r1', client: 'Acme Corp', subject: 'Agent memory leak on macOS 14.6', priority: 'high', status: 'open', created: 'May 10, 2026', assignee: 'Marcus Sterling' },
    { id: 'r2', client: 'Summit Retail', subject: 'POS integration returning 502 errors', priority: 'high', status: 'pending', created: 'May 9, 2026', assignee: 'Elena Rostova' },
    { id: 'r3', client: 'BluWave SaaS', subject: 'Scheduled reports not delivering', priority: 'medium', status: 'open', created: 'May 8, 2026', assignee: 'Julian Vance' },
    { id: 'r4', client: 'Acme Corp', subject: 'Admin panel slow load times', priority: 'low', status: 'resolved', created: 'May 5, 2026', assignee: 'Marcus Sterling' },
];
const RP_COLORS: Record<Resolution['priority'], string> = { low: '#6b7280', medium: '#fbbf24', high: '#f87171' };
const RS_COLORS: Record<Resolution['status'], string> = { open: '#f87171', pending: '#fbbf24', resolved: '#34d399' };

const AdminPortal = () => {
    const [sel, setSel] = useState<Client | null>(null);
    const [tasks, setTasks] = useState<ClientTasks>({
        '1': DEFAULT_TASKS.map(t => ({ ...t, done: true })),
        '2': DEFAULT_TASKS.map((t, i) => ({ ...t, done: i < 4 })),
        '3': DEFAULT_TASKS.map((t, i) => ({ ...t, done: i < 6 })),
        '4': DEFAULT_TASKS.map(t => ({ ...t, done: false })),
    });
    const [view, setView] = useState<'deployments' | 'commissions' | 'resolution'>('deployments');
    const [activeTier, setActiveTier] = useState<TierKey>('professional');
    const totalMRR = MC.reduce((s, c) => s + c.mrr, 0);

    const activeTierData = TIERS[activeTier];
    const netProfit = activeTierData.price - activeTierData.macCost - activeTierData.setupCost;
    const commPerSale = netProfit * COMM_RATE;

    const toggleTask = (clientId: string, taskId: string) => {
        setTasks(prev => ({
            ...prev,
            [clientId]: (prev[clientId] || DEFAULT_TASKS).map(t =>
                t.id === taskId ? { ...t, done: !t.done } : t
            )
        }));
    };

    const selTasks = sel ? (tasks[sel.id] || DEFAULT_TASKS) : [];
    const selDone = selTasks.filter(t => t.done).length;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)' }}>
            <header className="orbit-glass" style={{ padding: '18px 44px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <NuminLogo scale={0.8} />
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 8 }}>Admin Portal</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="status-dot active" /><span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>Internal Access</span></div>
            </header>

            <div style={{ padding: '44px 48px' }}>
                <div className="orbit-eyebrow" style={{ marginBottom: 10 }}>Command Center</div>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.03em' }}>
                    Numin <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Administration</span>
                </h1>

                <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border)', marginBottom: 36 }}>
                    <button onClick={() => setView('deployments')} style={{ background: 'none', border: 'none', padding: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 600, color: view === 'deployments' ? 'var(--gold)' : 'var(--text-faint)', borderBottom: view === 'deployments' ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" }}>Client Deployments</button>
                    <button onClick={() => setView('commissions')} style={{ background: 'none', border: 'none', padding: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 600, color: view === 'commissions' ? 'var(--gold)' : 'var(--text-faint)', borderBottom: view === 'commissions' ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" }}>Sales & Commissions</button>
                    <button onClick={() => setView('resolution')} style={{ background: 'none', border: 'none', padding: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 600, color: view === 'resolution' ? 'var(--gold)' : 'var(--text-faint)', borderBottom: view === 'resolution' ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" }}>Resolution Center</button>
                </div>

                {view === 'deployments' ? (
                    <>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
                            {[{ label: 'Total Clients', value: MC.length }, { label: 'Active', value: MC.filter(c => c.status === 'active').length }, { label: 'Revenue', value: `$${totalMRR.toLocaleString()}` }, { label: 'Onboarding', value: MC.filter(c => c.status === 'onboarding').length }].map(s => (
                                <div key={s.label} className="orbit-card" style={{ padding: 24 }}>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 380px' : '1fr', gap: 20 }}>
                            <div className="orbit-card-flat" style={{ overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Company', 'Contact', 'Status', 'Agents', 'MRR', 'Since', ''].map(h => (
                                            <th key={h} style={{ padding: '14px 22px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)' }}>{h}</th>
                                        ))}
                                    </tr></thead>
                                    <tbody>{MC.map((c, i) => (
                                        <tr key={c.id} onClick={() => setSel(c)} style={{ borderBottom: i < MC.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer', background: sel?.id === c.id ? 'var(--gold-subtle)' : 'transparent', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px 22px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{c.company}</td>
                                            <td style={{ padding: '16px 22px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.contact}</td>
                                            <td style={{ padding: '16px 22px' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className={`status-dot ${c.status === 'active' ? 'active' : c.status === 'onboarding' ? 'processing' : 'idle'}`} style={{ width: 6, height: 6 }} /><span style={{ fontSize: '0.72rem', fontWeight: 500, color: SC[c.status], textTransform: 'capitalize' }}>{c.status}</span></span></td>
                                            <td style={{ padding: '16px 22px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.agentsActive}/6</td>
                                            <td style={{ padding: '16px 22px', fontSize: '1rem', fontWeight: 700, color: c.mrr > 0 ? 'var(--text-primary)' : 'var(--text-faint)' }}>{c.mrr > 0 ? `$${c.mrr}/mo` : '—'}</td>
                                            <td style={{ padding: '16px 22px', fontSize: '0.75rem', color: 'var(--text-faint)' }}>{c.since}</td>
                                            <td style={{ padding: '16px 22px' }}><button onClick={e => { e.stopPropagation(); setSel(c); }} className="orbit-btn orbit-btn-sm" style={{ background: 'var(--gold-subtle)', border: '1px solid var(--border-gold)', color: 'var(--gold-light)', padding: '5px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Manage →</button></td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>

                            {sel && (
                                <div className="orbit-card-glow" style={{ padding: 28, position: 'relative' }}>
                                    <button onClick={() => setSel(null)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.02em' }}>{sel.company}</h3>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: SC[sel.status], textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 28 }}>{sel.status}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {[{ l: 'Primary Contact', v: sel.contact }, { l: 'Plan', v: sel.plan }, { l: 'Since', v: sel.since }, { l: 'Agents', v: `${sel.agentsActive} of 6` }, { l: 'Revenue', v: sel.mrr > 0 ? `$${sel.mrr}/month` : 'None' }].map(d => (
                                            <div key={d.l}><div style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{d.l}</div><div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{d.v}</div></div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Onboarding Checklist</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: selDone === selTasks.length ? 'var(--green-400)' : 'var(--text-muted)' }}>{selDone}/{selTasks.length}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {selTasks.map(t => (
                                                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={t.done}
                                                        onChange={() => toggleTask(sel.id, t.id)}
                                                        style={{ accentColor: 'var(--gold)', width: 14, height: 14, cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '0.78rem', color: t.done ? 'var(--text-faint)' : 'var(--text-secondary)', textDecoration: t.done ? 'line-through' : 'none', transition: 'all 0.2s' }}>{t.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <button className="orbit-btn orbit-btn-primary orbit-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>Remote Configuration</button>
                                        <button className="orbit-btn orbit-btn-secondary orbit-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>View Activity Log</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : view === 'resolution' ? (
                    <div style={{ animation: 'fade-in 0.4s ease-out' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                            {[
                                { label: 'Open Issues', value: RESOLUTIONS.filter(r => r.status === 'open').length, color: 'var(--red-400, #f87171)' },
                                { label: 'Pending', value: RESOLUTIONS.filter(r => r.status === 'pending').length, color: 'var(--yellow-400, #fbbf24)' },
                                { label: 'Resolved (MTD)', value: RESOLUTIONS.filter(r => r.status === 'resolved').length, color: 'var(--green-400, #34d399)' },
                            ].map(s => (
                                <div key={s.label} className="orbit-card" style={{ padding: 24 }}>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ fontSize: '2.2rem', fontWeight: 900, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="orbit-card-flat" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                        {['Client', 'Subject', 'Priority', 'Status', 'Created', 'Assigned To', ''].map(h => (
                                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {RESOLUTIONS.map((r, i) => (
                                        <tr key={r.id} style={{ borderBottom: i < RESOLUTIONS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                            <td style={{ padding: '16px 20px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.client}</td>
                                            <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 280 }}>{r.subject}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: RP_COLORS[r.priority], background: `${RP_COLORS[r.priority]}18`, padding: '3px 8px', borderRadius: 'var(--radius-pill)' }}>{r.priority}</span>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: RS_COLORS[r.status], flexShrink: 0 }} />
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: RS_COLORS[r.status], textTransform: 'capitalize' }}>{r.status}</span>
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px', fontSize: '0.78rem', color: 'var(--text-faint)' }}>{r.created}</td>
                                            <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.assignee}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <button className="orbit-btn orbit-btn-sm" style={{ background: 'var(--gold-subtle)', border: '1px solid var(--border-gold)', color: 'var(--gold-light)', padding: '5px 14px', borderRadius: 'var(--radius-pill)', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                                                    {r.status === 'resolved' ? 'Review' : r.status === 'pending' ? 'Update' : 'Take'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="orbit-card-flat" style={{ marginTop: 24, padding: 32, display: 'flex', flexDirection: 'column', gap: 20, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>SLA Thresholds</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                                {[
                                    { label: 'Critical (P1)', desc: 'Hardware failure, full system outage', sla: '4 business hours', color: '#f87171' },
                                    { label: 'High (P2)', desc: 'Agent degradation, integration failures', sla: '8 business hours', color: '#fbbf24' },
                                    { label: 'Medium (P3)', desc: 'UI bugs, minor performance issues', sla: '3 business days', color: '#6b7280' },
                                ].map(s => (
                                    <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.label}</span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gold)', marginTop: 4 }}>Target: {s.sla}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ animation: 'fade-in 0.4s ease-out' }}>

                        {/* Tier Selection Tabs */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                            {(Object.keys(TIERS) as TierKey[]).map(key => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTier(key)}
                                    style={{
                                        background: activeTier === key ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                                        color: activeTier === key ? '#050707' : 'var(--text-faint)',
                                        border: activeTier === key ? '1px solid var(--gold)' : '1px solid var(--border)',
                                        padding: '8px 20px',
                                        borderRadius: 'var(--radius-pill)',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontFamily: "'Inter', sans-serif"
                                    }}
                                >
                                    {TIERS[key].name} Plan
                                </button>
                            ))}
                        </div>

                        {/* Commissions Math Breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 36 }}>
                            <div className="orbit-card" style={{ padding: '24px 20px', border: '1px solid var(--border-gold)', background: 'var(--gold-subtle)' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>System Price</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>${activeTierData.price.toLocaleString()}</div>
                            </div>
                            <div className="orbit-card-flat" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0.8 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Less: Hardware</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '-0.02em' }}>-${activeTierData.macCost.toLocaleString()}</div>
                            </div>
                            <div className="orbit-card-flat" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0.8 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Less: Setup Base</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '-0.02em' }}>-${activeTierData.setupCost.toLocaleString()}</div>
                            </div>
                            <div className="orbit-card" style={{ padding: '24px 20px', borderLeft: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Net Profit Basis</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>${netProfit.toLocaleString()}</div>
                            </div>
                            <div className="orbit-card-glow" style={{ padding: '24px 20px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Commission (40%)</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>${commPerSale.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="orbit-card-flat" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                        {['Sales Executive', 'Region', 'Monthly Units', 'Gross Revenue', 'Hardware/Setup Deduct', 'Net Recognized', 'Earned Commission'].map(h => (
                                            <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {REPS.map((r, i) => {
                                        const gross = r.salesThisMonth * activeTierData.price;
                                        const deduct = r.salesThisMonth * (activeTierData.macCost + activeTierData.setupCost);
                                        const net = r.salesThisMonth * netProfit;
                                        const earnings = r.salesThisMonth * commPerSale;

                                        return (
                                            <tr key={r.id} style={{ borderBottom: i < REPS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                                <td style={{ padding: '20px 24px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{r.name}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.region}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{r.salesThisMonth} <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 400 }}>({activeTierData.name})</span></td>
                                                <td style={{ padding: '20px 24px', fontSize: '0.95rem', color: 'var(--text-faint)' }}>${gross.toLocaleString()}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '0.95rem', color: 'var(--text-faint)' }}>-${deduct.toLocaleString()}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>${net.toLocaleString()}</td>
                                                <td style={{ padding: '20px 24px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-light)' }}>${earnings.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Commissions Structure Explanation */}
                        <div className="orbit-card-flat" style={{ marginTop: 32, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                                    How Our Commission Structure Works
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 800 }}>
                                    Numin believes in rewarding our sales executives with an industry-leading commission rate designed for top-tier talent. This structure ensures fairness, transparency, and high earning potential by splitting the true net profit after initial fulfillment costs are covered. The figures below reflect the <strong style={{ color: 'var(--gold-light)' }}>{activeTierData.name} tier</strong> mechanics.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {activeTierData.name} Breakdown
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>1</div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Price (${activeTierData.price.toLocaleString()})</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>The standard upfront price paid by the client for the Numin AI Business Operating System.</div>
                                            </div>
                                        </li>
                                        <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>2</div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Hardware Deduction (-${activeTierData.macCost.toLocaleString()})</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>The cost of the dedicated {activeTierData.hwName} required to run the local sovereign AI agents.</div>
                                            </div>
                                        </li>
                                        <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>3</div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Setup Base Deduction (-${activeTierData.setupCost.toLocaleString()})</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>The cost of engineering time required to program, configure, and ship the bespoke system.</div>
                                            </div>
                                        </li>
                                        <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold-subtle)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>4</div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gold-light)' }}>Industry-Leading 40% Commission</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>The sales executive earns a flat 40% of the remaining Net Profit (${netProfit.toLocaleString()}), resulting in an immediate ${commPerSale.toLocaleString()} payout per {activeTierData.name} package sold.</div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="orbit-glass" style={{ padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        The Numin Advantage
                                    </h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        Unlike traditional SaaS companies that offer 10-15% commission on the ARR over 12 months, Numin pays out a massive <strong style={{ color: 'var(--text-primary)' }}>40% of the true net hardware/software margin upfront.</strong>
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        A high-performing Numin executive selling just 4 systems a month (1 per week) earns massive upfront capital independent of base salary, recurring MRR bonuses, or implementation upsells.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPortal;
