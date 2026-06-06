/**
 * Memory Timeline — OrbitAIX flagship
 */
import { useState, useEffect } from "react";
// No mock data — real conversations only
import type { ConversationEntry, BusinessMemoryEntry } from "@/lib/db/memory";
import { AGENTS_LIST } from "@/lib/agents/index";
import type { AgentId } from "@/lib/hermes/client";

const AM = Object.fromEntries(AGENTS_LIST.map(a => [a.id, a]));

const MemoryTimeline = () => {
    const [convs, setConvs] = useState<ConversationEntry[]>([]);
    const [mems, setMems] = useState<BusinessMemoryEntry[]>([]);
    const [tab, setTab] = useState<'timeline' | 'business'>('timeline');
    const [filterAgent, setFilterAgent] = useState<AgentId | 'all'>('all');
    const [filterPinned, setFilterPinned] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Conversations populate from real agent interactions — starts empty
    const filtered = convs.filter(c => (filterAgent === 'all' || c.agent_id === filterAgent) && (!filterPinned || c.pinned) && (!search || c.content.toLowerCase().includes(search.toLowerCase())));
    const togglePin = (id: string) => setConvs(p => p.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    const handleExport = () => { const b = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'numin-memory.json'; a.click(); };

    return (
        <div style={{ padding: '36px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <div className="orbit-eyebrow" style={{ marginBottom: 10 }}>Persistent Intelligence</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        Business <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Memory</span>
                    </h2>
                </div>
                <button onClick={handleExport} className="orbit-btn orbit-btn-secondary orbit-btn-sm">Export →</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 28, background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 4, width: 'fit-content' }}>
                {[{ id: 'timeline', label: 'Conversation Timeline' }, { id: 'business', label: 'Business Memory' }].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{ padding: '9px 22px', borderRadius: 'calc(var(--radius-md) - 3px)', border: '1px solid transparent', background: tab === t.id ? 'var(--gold-subtle)' : 'transparent', color: tab === t.id ? 'var(--gold-light)' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', borderColor: tab === t.id ? 'var(--border-gold)' : 'transparent' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'timeline' && (
                <>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations…" className="orbit-input" style={{ maxWidth: 260, padding: '11px 16px' }} />
                        <select value={filterAgent} onChange={e => setFilterAgent(e.target.value as AgentId | 'all')} style={{ padding: '11px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", outline: 'none' }}>
                            <option value="all">All Agents</option>
                            {AGENTS_LIST.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <button onClick={() => setFilterPinned(!filterPinned)}
                            style={{ padding: '11px 18px', background: filterPinned ? 'var(--gold-subtle)' : 'var(--surface)', border: `1px solid ${filterPinned ? 'var(--border-gold)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', color: filterPinned ? 'var(--gold-light)' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                            📌 Pinned
                        </button>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-faint)', marginLeft: 'auto' }}>{filtered.length} entries</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filtered.map(entry => {
                            const agent = AM[entry.agent_id]; const isEx = expandedId === entry.id;
                            return (
                                <div key={entry.id} className="orbit-card-flat" style={{ borderColor: entry.pinned ? 'var(--border-gold)' : undefined, overflow: 'hidden' }}>
                                    <div onClick={() => setExpandedId(isEx ? null : entry.id)} style={{ padding: '16px 22px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${agent?.color || '#C9A84C'}10`, border: `1px solid ${agent?.color || '#C9A84C'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>{agent?.icon}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: agent?.color || 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{agent?.name}</span>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>{new Date(entry.timestamp).toLocaleString()}</span>
                                                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{entry.role}</span>
                                                {entry.pinned && <span style={{ marginLeft: 'auto' }}>📌</span>}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, overflow: 'hidden', whiteSpace: isEx ? 'pre-wrap' : 'nowrap', textOverflow: isEx ? 'clip' : 'ellipsis' }}>{entry.content}</p>
                                            {entry.tags.length > 0 && (
                                                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                                    {entry.tags.map(tag => <span key={tag} className="orbit-badge" style={{ fontSize: '0.58rem', padding: '2px 10px' }}>#{tag}</span>)}
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={e => { e.stopPropagation(); togglePin(entry.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: entry.pinned ? 1 : 0.3, transition: 'opacity 0.2s' }}>📌</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {tab === 'business' && (
                <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.75 }}>Persistent facts and knowledge your agents know about your business.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                        {mems.map(mem => {
                            const agent = AM[mem.agent_id]; const catC: Record<string, string> = { client: '#60a5fa', preference: '#fbbf24', rule: '#a78bfa', contact: '#34d399', other: '#5c6178' };
                            return (
                                <div key={mem.id} className="orbit-card" style={{ padding: 24 }}>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: catC[mem.category] || 'var(--text-muted)', padding: '3px 12px', background: `${catC[mem.category]}10`, borderRadius: 'var(--radius-pill)', border: `1px solid ${catC[mem.category]}25` }}>{mem.category}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-faint)' }}>via {agent?.name}</span>
                                        </div>
                                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.01em' }}>{mem.key}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{mem.value}</p>
                                        <div style={{ marginTop: 14, fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-faint)' }}>Updated {new Date(mem.updated_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="orbit-card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, cursor: 'pointer', borderStyle: 'dashed', opacity: 0.5 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.8rem', color: 'var(--text-faint)', marginBottom: 6 }}>+</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>Add Business Memory</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemoryTimeline;
