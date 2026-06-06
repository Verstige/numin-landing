/**
 * Operations Overview — OrbitAIX flagship
 */
import { useEffect, useState } from "react";
import type { AgentStatus } from "@/lib/hermes/client";
import { AGENTS_LIST } from "@/lib/agents/index";

type Props = { agentStatuses: AgentStatus[] };

const OperationsOverview = ({ agentStatuses }: Props) => {
    const kpis: never[] = [];
    const AUTOS: never[] = [];
    const ALERTS: never[] = [];

    return (
        <div style={{ padding: '36px 40px' }}>
            <div style={{ marginBottom: 36 }}>
                <div className="orbit-eyebrow" style={{ marginBottom: 10 }}>Live Dashboard</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    Operations <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Overview</span>
                </h2>
            </div>

            {/* Alerts */}
            {ALERTS.length > 0 && (
                <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ALERTS.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #f87171' }}>
                            <span style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 700 }}>⚠</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>{a.text}</span>
                            <button className="orbit-btn orbit-btn-sm" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', padding: '6px 16px', borderRadius: 'var(--radius-pill)' }}>{a.action}</button>
                        </div>
                    ))}
                </div>
            )}

            {/* KPIs — populate as agents report real data */}
            {kpis.length === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                    {['Revenue', 'Active Leads', 'Support Tickets'].map(label => (
                        <div key={label} className="orbit-card" style={{ padding: 28, opacity: 0.4 }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 14 }}>{label}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '-0.03em' }}>—</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 10 }}>Waiting for data…</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Two-col */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="orbit-card-flat" style={{ padding: 28 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 18 }}>Live Task Queue</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {AGENTS_LIST.filter(a => a.id !== 'numin').map(agent => {
                            const s = agentStatuses.find(x => x.id === agent.id);
                            return (
                                <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                    <span className={`status-dot ${s?.status || 'idle'}`} style={{ width: 7, height: 7 }} />
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: agent.color, textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: 50 }}>{agent.name}</span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1 }}>{s?.currentTask || s?.lastAction || 'Monitoring…'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="orbit-card-flat" style={{ padding: 28 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 18 }}>Recent Automations</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: 8 }}>
                        <span style={{ fontSize: '1.4rem', opacity: 0.3 }}>◉</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center', margin: 0 }}>Activity will appear here as your agents complete tasks</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationsOverview;
