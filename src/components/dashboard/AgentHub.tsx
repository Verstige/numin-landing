/**
 * Agent Hub — OrbitAIX flagship redesign
 */
import { useState } from "react";
import type { AgentStatus } from "@/lib/hermes/client";
import { AGENTS_LIST } from "@/lib/agents/index";

type Props = { agentStatuses: AgentStatus[] };
const SL: Record<string, string> = { active: 'Active', idle: 'Idle', processing: 'Processing', error: 'Error', offline: 'Offline' };

const AgentHub = ({ agentStatuses }: Props) => {
    const [expanded, setExpanded] = useState<string | null>(null);
    const gs = (id: string) => agentStatuses.find(s => s.id === id);

    return (
        <div style={{ padding: '36px 40px' }}>
            <div style={{ marginBottom: 36 }}>
                <div className="orbit-eyebrow" style={{ marginBottom: 10 }}>Intelligence Layer</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                    Agent <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Hub</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Real-time status and activity for your AI team</p>
            </div>

            {/* NUMIN orchestrator card */}
            {(() => {
                const s = gs('numin');
                return (
                    <div onClick={() => setExpanded(expanded === 'numin' ? null : 'numin')} className="orbit-card-glow" style={{ padding: '32px 36px', marginBottom: 24, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>◉</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>NUMIN</h3>
                                    <span className="orbit-badge" style={{ fontSize: '0.58rem' }}>Master Orchestrator</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                                        <span className={`status-dot ${s?.status || 'active'}`} />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>{SL[s?.status || 'active']}</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>Routes all input, classifies intent, coordinates cross-agent workflows, holds global business memory.</p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s?.tasksCompleted ?? 247}</div>
                                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tasks</div>
                            </div>
                        </div>
                        {expanded === 'numin' && (
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }} className="animate-fadeInUp">
                                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Current Activity</div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {['Routing @VANCE pipeline update', 'Preparing morning briefing', 'Monitoring all 5 specialists'].map(t => (
                                        <span key={t} style={{ padding: '7px 16px', background: 'var(--gold-subtle)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Specialist grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {AGENTS_LIST.filter(a => a.id !== 'numin').map(agent => {
                    const s = gs(agent.id); const isExp = expanded === agent.id;
                    return (
                        <div key={agent.id} onClick={() => setExpanded(isExp ? null : agent.id)} className="orbit-card" style={{ padding: 30, cursor: 'pointer', borderColor: isExp ? `${agent.color}30` : undefined }}>
                            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 75% 15%, ${agent.color}06, transparent 55%)`, pointerEvents: 'none', borderRadius: 'var(--radius-lg)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
                                    <div style={{ width: 50, height: 50, borderRadius: 14, background: `${agent.color}10`, border: `1px solid ${agent.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0 }}>{agent.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>{agent.name}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
                                                <span className={`status-dot ${s?.status || 'idle'}`} style={{ width: 7, height: 7 }} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-muted)' }}>{SL[s?.status || 'idle']}</span>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: agent.color }}>{agent.role}</div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 18 }}>{agent.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{s?.tasksCompleted ?? Math.floor(Math.random() * 150 + 30)}</span>
                                        <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>tasks</span>
                                    </div>
                                    <span className="orbit-badge" style={{ fontSize: '0.58rem', padding: '3px 10px' }}>{agent.role.split(' & ')[0].split(' ')[0]}</span>
                                </div>
                                {isExp && (
                                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }} className="animate-fadeInUp">
                                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Last Action</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)', lineHeight: 1.6, border: '1px solid var(--border)' }}>
                                            {s?.lastAction || 'Completed scheduled analysis and updated memory.'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AgentHub;
