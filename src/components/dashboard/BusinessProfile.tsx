/**
 * Business Profile & Settings — OrbitAIX flagship
 */
import { useState } from "react";
import { AGENTS_LIST } from "@/lib/agents/index";

const BusinessProfile = () => {
    const [profile, setProfile] = useState({ name: 'Acme Corp', industry: 'Technology', size: '51-200', timezone: 'America/New_York' });

    return (
        <div style={{ padding: '36px 40px', maxWidth: 800 }}>
            <div style={{ marginBottom: 36 }}>
                <div className="orbit-eyebrow" style={{ marginBottom: 10 }}>Configuration</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    Business <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Profile</span>
                </h2>
            </div>

            {/* Company info */}
            <div className="orbit-card-flat" style={{ padding: 32, marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 20 }}>Company Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[{ label: 'Company Name', key: 'name' }, { label: 'Industry', key: 'industry' }, { label: 'Team Size', key: 'size' }, { label: 'Timezone', key: 'timezone' }].map(f => (
                        <div key={f.key}>
                            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{f.label}</label>
                            <input value={profile[f.key as keyof typeof profile]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} className="orbit-input" />
                        </div>
                    ))}
                </div>
                <button className="orbit-btn orbit-btn-primary orbit-btn-sm" style={{ marginTop: 24 }}>Save Changes</button>
            </div>

            {/* Account */}
            <div className="orbit-card-flat" style={{ padding: 32, marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 20 }}>Account</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Plan</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pro</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '3px 8px', background: 'var(--gradient-gold)', borderRadius: 20, color: '#000' }}>Active</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Billing Cycle</label>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Monthly</div>
                    </div>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span className="status-dot active" style={{ width: 8, height: 8 }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Orgo Machine</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Connected · v2.4.1 · Last sync: Just now</div>
                </div>
                <button className="orbit-btn orbit-btn-secondary orbit-btn-sm">Manage Subscription</button>
            </div>

            {/* Agent toggles */}
            <div className="orbit-card-flat" style={{ padding: 32, marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 20 }}>Agent Configuration</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {AGENTS_LIST.map(a => (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${a.color}10`, border: `1px solid ${a.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{a.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{a.name}</div>
                                <div style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)' }}>{a.role}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>Active</span>
                                <div style={{ width: 42, height: 24, borderRadius: 12, background: 'rgba(201,168,76,0.15)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', padding: '2px 3px', cursor: 'pointer' }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--gradient-gold)', marginLeft: 'auto', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* OpenClaw */}
            <div className="orbit-card-flat" style={{ padding: 32 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: 20 }}>OpenClaw Connection</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 18 }}>
                    <span className="status-dot idle" style={{ width: 8, height: 8 }} />
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>OpenClaw AI Engine</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>http://localhost:3000 · Mock mode active</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Engine URL</label>
                        <input defaultValue="http://localhost:3000" className="orbit-input" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>WebSocket</label>
                        <input defaultValue="ws://localhost:3000/ws" className="orbit-input" />
                    </div>
                </div>
                <button className="orbit-btn orbit-btn-secondary orbit-btn-sm" style={{ marginTop: 18 }}>Test Connection</button>
            </div>
        </div>
    );
};

export default BusinessProfile;
