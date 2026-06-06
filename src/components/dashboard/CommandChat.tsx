/**
 * Command Chat — OrbitAIX flagship redesign
 */
import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentId } from "@/lib/hermes/client";
import { AGENTS_LIST } from "@/lib/agents/index";
import { numinCore } from "@/lib/agents/index";
import { Conversations } from "@/lib/db/memory";

type Props = { agentStatuses: AgentStatus[] };
type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; agentId: AgentId; timestamp: Date; isStreaming?: boolean };
const AGENT_META = Object.fromEntries(AGENTS_LIST.map(a => [a.id, a]));

const CommandChat = ({ agentStatuses }: Props) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionId] = useState(() => `sess_${Date.now()}`);
    const [activeAgentId, setActiveAgentId] = useState<AgentId>('numin');
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Start with empty conversation — no mock data
    useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [messages]);
    useEffect(() => {
        const m = input.match(/@(aria|vance|nexus|prism|apex|numin)\b/i);
        setActiveAgentId(m ? m[1].toLowerCase() as AgentId : 'numin');
    }, [input]);

    const send = useCallback(async () => {
        if (!input.trim() || isProcessing) return;
        const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', content: input.trim(), agentId: 'numin', timestamp: new Date() };
        const aId = `a_${Date.now()}`;
        setMessages(p => [...p, userMsg, { id: aId, role: 'assistant', content: '', agentId: activeAgentId, timestamp: new Date(), isStreaming: true }]);
        setInput(''); setIsProcessing(true);
        try {
            for await (const chunk of numinCore.orchestrate(userMsg.content, sessionId)) {
                const routed = (chunk as { routedTo?: AgentId }).routedTo ?? activeAgentId;
                setMessages(p => p.map(m => m.id === aId ? { ...m, content: chunk.content, agentId: routed, isStreaming: !chunk.isDone } : m));
            }
            Conversations.create({ agent_id: activeAgentId, role: 'user', content: userMsg.content, session_id: sessionId, tags: [], pinned: false }).catch(() => { });
        } finally { setIsProcessing(false); }
    }, [input, isProcessing, activeAgentId, sessionId]);

    const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
    const agent = AGENT_META[activeAgentId];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages */}
            <div ref={scrollRef} className="scrollbar-orbit" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px 40px' }} className="animate-fadeInUp">
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }} className="animate-float">◉</div>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.03em' }}>
                            Good morning. I'm <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>NUMIN.</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>
                            Your command intelligence. Ask anything, or @mention: <span style={{ color: '#a78bfa' }}>@ARIA</span>, <span style={{ color: '#34d399' }}>@VANCE</span>, <span style={{ color: '#60a5fa' }}>@NEXUS</span>, <span style={{ color: '#fbbf24' }}>@PRISM</span>, <span style={{ color: '#f87171' }}>@APEX</span>.
                        </p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {["What's my day look like?", "Update me on the pipeline", "Show customer issues", "Full company status"].map(q => (
                                <button key={q} onClick={() => setInput(q)} className="orbit-btn orbit-btn-secondary orbit-btn-sm" style={{ fontSize: '0.78rem', padding: '9px 18px', borderRadius: 'var(--radius-md)' }}>{q}</button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map(msg => {
                    const a = AGENT_META[msg.agentId]; const isUser = msg.role === 'user';
                    return (
                        <div key={msg.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }} className="animate-fadeInUp">
                            {!isUser && (
                                <div style={{ width: 38, height: 38, borderRadius: 12, background: `${a?.color || '#C9A84C'}10`, border: `1px solid ${a?.color || '#C9A84C'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{a?.icon || '◉'}</div>
                            )}
                            <div style={{ maxWidth: '70%' }}>
                                {!isUser && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: a?.color || 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{a?.name || 'NUMIN'}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                )}
                                <div style={{
                                    padding: '14px 18px', borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                                    background: isUser ? 'rgba(201,168,76,0.08)' : 'var(--surface)',
                                    border: `1px solid ${isUser ? 'rgba(201,168,76,0.15)' : 'var(--border)'}`,
                                    fontSize: '0.9rem', lineHeight: 1.7, color: isUser ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'pre-wrap',
                                }}>
                                    {msg.content || (msg.isStreaming && (
                                        <span style={{ display: 'flex', gap: 5, alignItems: 'center', height: 18 }}>
                                            {[0, 1, 2].map(i => <span key={i} className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />)}
                                        </span>
                                    ))}
                                </div>
                                {isUser && <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', textAlign: 'right', marginTop: 4 }}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div style={{ padding: '20px 36px', borderTop: '1px solid var(--border)', background: 'rgba(5,7,9,0.8)', backdropFilter: 'blur(16px)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span className="status-dot active" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>Routing to</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: agent?.color || 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{agent?.name || 'NUMIN'}</span>
                    {activeAgentId !== 'numin' && <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>· {agent?.role}</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                        placeholder="Ask NUMIN anything… or @ARIA @VANCE @NEXUS @PRISM @APEX" rows={1} disabled={isProcessing}
                        className="orbit-input" style={{ borderRadius: 14, resize: 'none', maxHeight: 120, overflowY: 'auto', lineHeight: 1.5, padding: '13px 18px', borderColor: input.includes('@') ? `${agent?.color || 'var(--gold)'}40` : undefined }} />
                    <button onClick={send} disabled={!input.trim() || isProcessing}
                        style={{ width: 46, height: 46, borderRadius: 14, border: 'none', background: input.trim() && !isProcessing ? 'var(--gradient-gold)' : 'var(--surface)', color: input.trim() && !isProcessing ? 'var(--bg)' : 'var(--text-faint)', cursor: input.trim() && !isProcessing ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, transition: 'all 0.3s', flexShrink: 0, boxShadow: input.trim() && !isProcessing ? '0 4px 20px rgba(201,168,76,0.25)' : 'none' }}>
                        {isProcessing ? '…' : '→'}
                    </button>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginTop: 8, fontWeight: 500 }}>Enter to send · Shift+Enter for new line · @mention to route directly</div>
            </div>
        </div>
    );
};

export default CommandChat;
