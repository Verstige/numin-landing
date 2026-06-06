/**
 * Hermes Agent Client — Numin AI Business Operating System
 *
 * Replaces the OpenClaw client. Connects to the local Hermes gateway
 * at localhost:18789 for chat completions and real-time agent status.
 *
 * Token is loaded from ~/.hermes/.env (HERMES_GATEWAY_TOKEN).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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

export type HermesConfig = {
    gatewayUrl: string;
    wsUrl: string;
    reconnectIntervalMs: number;
    requestTimeoutMs: number;
};

const DEFAULT_CONFIG: HermesConfig = {
    gatewayUrl: 'http://localhost:18789',
    wsUrl: 'ws://localhost:18789/ws',
    reconnectIntervalMs: 5000,
    requestTimeoutMs: 60000,
};

type StatusListener = (statuses: AgentStatus[]) => void;

function loadHermesToken(): string | null {
    // Try ~/.hermes/.env
    const envPath = resolve(process.env.HOME ?? '', '.hermes/.env');
    if (existsSync(envPath)) {
        try {
            const content = readFileSync(envPath, 'utf-8');
            const match = content.match(/HERMES_GATEWAY_TOKEN\s*=\s*([^\s\r\n]+)/);
            if (match?.[1]) return match[1];
        } catch { /* ignore */ }
    }
    return null;
}

class HermesClient {
    private config: HermesConfig;
    private ws: WebSocket | null = null;
    private connected = false;
    private statusListeners: Set<StatusListener> = new Set();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private token: string | null = null;

    constructor(config: Partial<HermesConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.token = loadHermesToken();
    }

    /** Check if Hermes gateway is reachable */
    async healthCheck(): Promise<{ ok: boolean; latencyMs?: number }> {
        try {
            const start = Date.now();
            const headers: HeadersInit = {};
            if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

            const res = await fetch(`${this.config.gatewayUrl}/health`, {
                method: 'GET',
                headers,
                signal: AbortSignal.timeout(5000),
            });
            const latencyMs = Date.now() - start;
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                return { ok: data.ok ?? true, latencyMs };
            }
            return { ok: false };
        } catch {
            return { ok: false };
        }
    }

    /** Open WebSocket for real-time agent status events */
    connect(): void {
        if (this.connected) return;
        this.teardownWs();

        try {
            const wsUrl = this.config.wsUrl;
            // Inject auth token via query param since WebSocket doesn't support headers
            const authWsUrl = this.token
                ? `${wsUrl}${wsUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(this.token)}`
                : wsUrl;
            this.ws = new WebSocket(authWsUrl);

            this.ws.onopen = () => {
                this.connected = true;
                console.log('[Numin] WebSocket connected to Hermes gateway');
                this.scheduleReconnect();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'agent_status' || data.type === 'status_update') {
                        const statuses: AgentStatus[] = Array.isArray(data.payload)
                            ? data.payload
                            : [data.payload];
                        this.statusListeners.forEach(cb => cb(statuses));
                    }
                } catch { /* ignore malformed messages */ }
            };

            this.ws.onclose = () => {
                this.connected = false;
                this.scheduleReconnect();
            };

            this.ws.onerror = () => {
                this.connected = false;
            };
        } catch { /* WebSocket not critical — polling handles status */ }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (!this.connected) this.connect();
        }, this.config.reconnectIntervalMs);
    }

    private teardownWs(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.onerror = null;
            this.ws.onmessage = null;
            this.ws.onopen = null;
            try { this.ws.close(); } catch { /* ignore */ }
            this.ws = null;
        }
    }

    disconnect(): void {
        this.teardownWs();
        this.connected = false;
    }

    /**
     * Send a message to an agent via Hermes gateway's chat completions endpoint.
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

        const AGENT_PERSONAS: Record<AgentId, string> = {
            numin: 'You are NUMIN, the command intelligence and orchestrator for this business. You coordinate the other agents and handle strategic requests.',
            aria: 'You are ARIA, the Executive Operations agent. You handle scheduling, emails, daily briefings, and executive communications.',
            vance: 'You are VANCE, the Revenue agent. You manage the sales pipeline, lead follow-up, and revenue reporting.',
            nexus: 'You are NEXUS, the Client Experience agent. You handle customer support, tickets, and NPS tracking.',
            prism: 'You are PRISM, the Growth & Marketing agent. You manage campaigns, content, and brand analytics.',
            apex: 'You are APEX, the Operations agent. You track KPIs, workflows, and operational efficiency.',
        };

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

        // Pass agentId so gateway routes to the correct agent session
        headers['X-Hermes-Agent-Id'] = agentId;

        try {
            const res = await fetch(`${this.config.gatewayUrl}/v1/chat/completions`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: 'hermes',
                    stream: true,
                    user: `numin_${agentId}_${sessionId}`,
                    messages: [
                        { role: 'system', content: AGENT_PERSONAS[agentId] },
                        { role: 'user', content },
                        ...(context
                            ? [{ role: 'system' as const, content: JSON.stringify(context) }]
                            : []),
                    ],
                }),
                signal: controller.signal,
            });

            if (!res.ok || !res.body) {
                throw new Error(`Hermes gateway returned ${res.status}`);
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
                        yield {
                            agentId,
                            sessionId,
                            content: accumulated,
                            isDone: true,
                            timestamp: new Date().toISOString(),
                        };
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices?.[0]?.delta?.content || '';
                        if (delta) {
                            accumulated += delta;
                            yield {
                                agentId,
                                sessionId,
                                content: accumulated,
                                isDone: false,
                                timestamp: new Date().toISOString(),
                            };
                        }
                    } catch { /* skip malformed chunks */ }
                }
            }

            if (accumulated) {
                yield {
                    agentId,
                    sessionId,
                    content: accumulated,
                    isDone: true,
                    timestamp: new Date().toISOString(),
                };
            }
        } finally {
            clearTimeout(timeout);
        }
    }

    /** Get agent statuses — real data from Hermes gateway or empty array */
    async getAgentStatus(): Promise<AgentStatus[]> {
        try {
            const headers: HeadersInit = {};
            if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

            const res = await fetch(`${this.config.gatewayUrl}/agents/status`, {
                headers,
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
    get isMockMode(): boolean { return false; }
}

export const hermes = new HermesClient();
export { HermesClient };
export default hermes;
