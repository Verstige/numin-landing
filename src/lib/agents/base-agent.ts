/**
 * Numin Agent System — Base Agent
 * All 6 agents (ARIA, VANCE, NEXUS, PRISM, APEX, NUMIN) extend this.
 */
import { hermes } from "../hermes/client";
import type { AgentId } from "../hermes/client";
import type { ConversationEntry } from '../db/memory';

export type AgentStatus = 'active' | 'idle' | 'processing' | 'error' | 'offline';

export type AgentCapability = string;

export type AgentConfig = {
    id: AgentId;
    name: string;
    role: string;
    description: string;
    icon: string;
    color: string;         // CSS color for accent
    capabilities: AgentCapability[];
    systemPrompt?: string;
};

export abstract class BaseAgent {
    readonly id: AgentId;
    readonly name: string;
    readonly role: string;
    readonly description: string;
    readonly icon: string;
    readonly color: string;
    readonly capabilities: AgentCapability[];

    protected _status: AgentStatus = 'idle';
    protected _memory: ConversationEntry[] = [];
    protected _currentTask: string | null = null;
    protected _tasksCompleted = 0;

    constructor(config: AgentConfig) {
        this.id = config.id;
        this.name = config.name;
        this.role = config.role;
        this.description = config.description;
        this.icon = config.icon;
        this.color = config.color;
        this.capabilities = config.capabilities;
    }

    /** Send a message to this agent and get a streaming response */
    async *execute(
        message: string,
        sessionId: string,
        context?: Record<string, unknown>
    ) {
        this._status = 'processing';
        this._currentTask = message.slice(0, 60) + (message.length > 60 ? '…' : '');
        try {
            for await (const chunk of hermes.sendMessage(this.id, message, sessionId, context)) {
                yield chunk;
            }
            this._tasksCompleted++;
        } finally {
            this._status = 'active';
            this._currentTask = null;
        }
    }

    async getHistory(sessionId?: string): Promise<ConversationEntry[]> {
        return this._memory.filter(m => !sessionId || m.session_id === sessionId);
    }

    updateMemory(entry: ConversationEntry): void {
        this._memory.push(entry);
        // Keep last 200 in-memory
        if (this._memory.length > 200) this._memory = this._memory.slice(-200);
    }

    setStatus(status: AgentStatus): void { this._status = status; }

    getStatus(): {
        id: AgentId; name: string; status: AgentStatus;
        currentTask: string | null; tasksCompleted: number;
    } {
        return {
            id: this.id,
            name: this.name,
            status: this._status,
            currentTask: this._currentTask,
            tasksCompleted: this._tasksCompleted,
        };
    }
}
