/**
 * Integrations Panel — OrbitAIX flagship
 * Data-driven with live status via api.ts
 */

import { useEffect, useState, useCallback } from 'react';
import {
    fetchIntegrations,
    fetchDataFlowStats,
    connectIntegration,
    disconnectIntegration,
    onIntegrationUpdate,
    type Integration,
    type DataFlowStats,
} from '../../lib/integrations/api';

const IntegrationsPanel = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [stats, setStats] = useState<DataFlowStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [integrationsData, statsData] = await Promise.all([
                fetchIntegrations(),
                fetchDataFlowStats(),
            ]);
            setIntegrations(integrationsData);
            setStats(statsData);
            setError(null);
        } catch (err) {
            setError('Failed to load integrations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const unsubscribe = onIntegrationUpdate(setIntegrations, 5000);
        return unsubscribe;
    }, []);

    const handleConnect = async (id: string) => {
        setActionInProgress(id);
        setError(null);
        try {
            await connectIntegration(id);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleDisconnect = async (id: string) => {
        setActionInProgress(id);
        setError(null);
        try {
            await disconnectIntegration(id);
            await loadData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Disconnect failed');
        } finally {
            setActionInProgress(null);
        }
    };

    return (
        <div style={{ padding: '36px 40px' }}>
            <div style={{ marginBottom: 36 }}>
                <div className="orbit-eyebrow" style={{ marginBottom: 10 }}>Data Flows</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    Integrations <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Panel</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8 }}>Connect your tools so your agents can access real business data.</p>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.82rem', color: '#f87171' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading integrations…</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {integrations.map(i => (
                        <div key={i.id} className="orbit-card" style={{ padding: 28 }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${i.color}10`, border: `1px solid ${i.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{i.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>{i.name}</h4>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
                                                <span className={`status-dot ${i.status === 'connected' || i.status === 'syncing' ? 'active' : 'idle'}`} style={{ width: 6, height: 6 }} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: i.status === 'connected' ? '#34d399' : i.status === 'syncing' ? '#60a5fa' : 'var(--text-faint)', textTransform: 'capitalize' }}>
                                                    {i.status === 'syncing' ? 'Syncing…' : i.status}
                                                </span>
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Used by {i.agent}</div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 18 }}>{i.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-faint)' }}>
                                        Last sync: <span style={{ color: 'var(--text-secondary)' }}>{i.lastSync ?? 'Never'}</span>
                                    </div>
                                    <button
                                        className="orbit-btn orbit-btn-sm"
                                        disabled={actionInProgress === i.id}
                                        onClick={() => i.status === 'connected' ? handleDisconnect(i.id) : handleConnect(i.id)}
                                        style={{
                                            padding: '7px 20px',
                                            borderRadius: 'var(--radius-pill)',
                                            border: i.status === 'connected' ? '1px solid rgba(248,113,113,0.25)' : '1px solid var(--border-gold)',
                                            background: i.status === 'connected' ? 'rgba(248,113,113,0.04)' : 'var(--gold-subtle)',
                                            color: i.status === 'connected' ? '#f87171' : 'var(--gold-light)',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            cursor: actionInProgress === i.id ? 'wait' : 'pointer',
                                            fontFamily: "'Inter', sans-serif",
                                            opacity: actionInProgress === i.id ? 0.6 : 1,
                                        }}
                                    >
                                        {actionInProgress === i.id ? 'Please wait…' : i.status === 'connected' ? 'Disconnect' : 'Connect →'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Data flow stats */}
            <div className="orbit-card-flat" style={{ padding: 32, marginTop: 24 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 20 }}>Data Flow Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                        { label: 'Emails Processed Today', value: stats?.emailsProcessedToday ?? '—', icon: '📧' },
                        { label: 'CRM Records Updated', value: stats?.crmRecordsUpdated ?? '—', icon: '🎯' },
                        { label: 'Calendar Events Managed', value: stats?.calendarEventsManaged ?? '—', icon: '📅' },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', padding: 24, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{s.icon}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: 6 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsPanel;
