/**
 * OpenClaw Client — Numin AI Business Operating System
 *
 * Updated to use Gemini API directly for cloud deployments.
 * Falls back to OpenClaw proxy if VITE_NUMIN_PROXY_URL is configured.
 *
 * NO MOCK DATA. Real connection or clear error.
 */

export type AgentId = 'aria' | 'vance' | 'nexus' | 'prism' | 'apex' | 'numin';

export type AgentStatus = {
    id: AgentId;
    status: 'active' | 'idle' | 'processing' | 'error' | 'offline';
    currentTask: string | null;
    lastAction: string | null;
    tasksCompleted: number;
    updatedAt: string;
};

export type MessageChunk = {
    agentId: AgentId;
    sessionId: string;
    content: string;
    isDone: boolean;
    timestamp: string;
};

export type OpenClawConfig = {
    proxyBase: string;
    reconnectIntervalMs: number;
    requestTimeoutMs: number;
};

const DEFAULT_CONFIG: OpenClawConfig = {
    proxyBase: '/openclaw',   // routes through server.js proxy → real OpenClaw
    reconnectIntervalMs: 5000,
    requestTimeoutMs: 60000,
};

type StatusListener = (statuses: AgentStatus[]) => void;

class OpenClawClient {
    private config: OpenClawConfig;
    private ws: WebSocket | null = null;
    private connected = false;
    private statusListeners: Set<StatusListener> = new Set();

    constructor(config: Partial<OpenClawConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /** Check if OpenClaw gateway is reachable (via real /status endpoint on proxy) */
    async healthCheck(): Promise<{ ok: boolean; latencyMs?: number }> {
        try {
            const res = await fetch('/status', {
                signal: AbortSignal.timeout(5000),
            });
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                return { ok: data.gateway === 'connected', latencyMs: data.latencyMs };
            }
            return { ok: false };
        } catch {
            return { ok: false };
        }
    }

    /** Open WebSocket for real-time events (via proxy) */
    connect(): void {
        if (this.connected) return;
        try {
            const wsUrl = `ws://localhost:4000/openclaw/ws`;
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.connected = true;
                console.log('[Numin] WebSocket connected to OpenClaw');
            };
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'agent_status') {
                        this.statusListeners.forEach(cb => cb(data.payload));
                    }
                } catch { /* ignore */ }
            };
            this.ws.onclose = () => { this.connected = false; };
            this.ws.onerror = () => { this.connected = false; };
        } catch { /* WebSocket not critical — polling handles status */ }
    }

    disconnect(): void {
        if (this.ws) { this.ws.close(); this.ws = null; }
        this.connected = false;
    }

    /**
     * Send a message to an agent via OpenClaw's chat completions endpoint.
     * Streams the response back as chunks.
     * Throws on failure — no fake fallback.
     */
    async *sendMessage(
        agentId: AgentId,
        content: string,
        sessionId: string,
        context?: Record<string, unknown>
    ): AsyncGenerator<MessageChunk> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);

        // Map agent IDs to system prompts
        const AGENT_PERSONAS: Record<AgentId, string> = {
            numin: 'You are NUMIN, the command intelligence and orchestrator for this business. You coordinate the other agents and handle strategic requests.',
            aria: 'You are ARIA, the Executive Operations agent. You handle scheduling, emails, daily briefings, and executive communications.',
            vance: 'You are VANCE, the Revenue agent. You manage the sales pipeline, lead follow-up, and revenue reporting.',
            nexus: 'You are NEXUS, the Client Experience agent. You handle customer support, tickets, and NPS tracking.',
            prism: 'You are PRISM, the Growth & Marketing agent. You manage campaigns, content, and brand analytics.',
            apex: 'You are APEX, the Operations agent. You track KPIs, workflows, and operational efficiency.',
        };

        try {
            const res = await fetch(`${this.config.proxyBase}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-openclaw-agent-id': 'main',   // route to the main OpenClaw agent
                },
                body: JSON.stringify({
                    model: 'openclaw',   // required by OpenClaw's HTTP API
                    stream: true,
                    user: `numin_${agentId}_${sessionId}`, // stable session key per agent
                    messages: [
                        { role: 'system', content: AGENT_PERSONAS[agentId] },
                        { role: 'user', content },
                    ],
                }),
                signal: controller.signal,
            });

            if (!res.ok || !res.body) {
                throw new Error(`OpenClaw returned ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') {
                        yield { agentId, sessionId, content: accumulated, isDone: true, timestamp: new Date().toISOString() };
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta?.content || '';
                        if (delta) {
                            accumulated += delta;
                            yield { agentId, sessionId, content: accumulated, isDone: false, timestamp: new Date().toISOString() };
                        }
                    } catch { /* skip malformed chunks */ }
                }
            }

            if (accumulated) {
                yield { agentId, sessionId, content: accumulated, isDone: true, timestamp: new Date().toISOString() };
            }
        } finally {
            clearTimeout(timeout);
        }
    }

    /** Get agent statuses — real data from OpenClaw or empty array */
    async getAgentStatus(): Promise<AgentStatus[]> {
        try {
            const res = await fetch(`${this.config.proxyBase}/agents/status`, {
                signal: AbortSignal.timeout(3000),
            });
            if (res.ok) return res.json();
            return [];
        } catch {
            return [];
        }
    }

    onStatusUpdate(listener: StatusListener): () => void {
        this.statusListeners.add(listener);
        return () => this.statusListeners.delete(listener);
    }

    get isConnected(): boolean { return this.connected; }
    get isMockMode(): boolean { return false; } // never mock
}

export const openClaw = new OpenClawClient();
export { OpenClawClient };
export default openClaw;
