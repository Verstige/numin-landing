/**
 * Numin Agent Roster
 * ARIA, VANCE, NEXUS-Agent, PRISM, APEX, and NuminCore
 */
import { BaseAgent, type AgentConfig } from './base-agent';
import { hermes } from '../hermes/client';
import type { AgentId } from '../hermes/client';

// ── ARIA — Executive Intelligence ───────────────────────────
export class AriaAgent extends BaseAgent {
    constructor() {
        super({
            id: 'aria',
            name: 'ARIA',
            role: 'Executive Intelligence',
            description: 'Email triage, calendar management, meeting prep, daily briefings, priority decisions.',
            icon: '✦',
            color: '#8B5CF6',
            capabilities: ['Email triage', 'Calendar management', 'Meeting preparation', 'Daily briefings', 'Priority decisions', 'Executive scheduling'],
            systemPrompt: 'You are ARIA, the Executive Intelligence agent for Numin. You specialize in managing executive communications, calendar, and priorities. Be precise, professional, and anticipate needs.',
        });
    }
}

// ── VANCE — Revenue Intelligence ────────────────────────────
export class VanceAgent extends BaseAgent {
    constructor() {
        super({
            id: 'vance',
            name: 'VANCE',
            role: 'Revenue Intelligence',
            description: 'CRM management, lead qualification, sales outreach, pipeline tracking, deal forecasting.',
            icon: '◈',
            color: '#10B981',
            capabilities: ['Lead qualification', 'CRM management', 'Sales outreach', 'Pipeline tracking', 'Deal forecasting', 'Revenue analysis'],
            systemPrompt: 'You are VANCE, the Revenue Intelligence agent for Numin. You own the sales pipeline. Analyze leads, track deals, and drive revenue growth with data-driven recommendations.',
        });
    }
}

// ── NEXUS — Client Experience ────────────────────────────────
export class NexusAgent extends BaseAgent {
    constructor() {
        super({
            id: 'nexus',
            name: 'NEXUS',
            role: 'Client Experience',
            description: 'Multi-channel customer support, ticket resolution, sentiment analysis, escalation routing, NPS tracking.',
            icon: '⬡',
            color: '#3B82F6',
            capabilities: ['Customer support', 'Ticket resolution', 'Sentiment analysis', 'Escalation routing', 'NPS tracking', 'Client communication'],
            systemPrompt: 'You are NEXUS, the Client Experience agent for Numin. You ensure every client interaction is exceptional. Resolve issues swiftly, track sentiment, and escalate intelligently.',
        });
    }
}

// ── PRISM — Growth & Marketing ──────────────────────────────
export class PrismAgent extends BaseAgent {
    constructor() {
        super({
            id: 'prism',
            name: 'PRISM',
            role: 'Growth & Marketing',
            description: 'Campaign planning, content generation, competitor analysis, ad performance, brand strategy.',
            icon: '◆',
            color: '#F59E0B',
            capabilities: ['Campaign planning', 'Content generation', 'Competitor analysis', 'Ad performance', 'Brand strategy', 'Growth hacking'],
            systemPrompt: 'You are PRISM, the Growth & Marketing agent for Numin. You turn data into campaigns and ideas into growth. Analyze markets, generate content, and optimize every channel.',
        });
    }
}

// ── APEX — Operations & Analytics ──────────────────────────
export class ApexAgent extends BaseAgent {
    constructor() {
        super({
            id: 'apex',
            name: 'APEX',
            role: 'Operations & Analytics',
            description: 'KPI monitoring, process optimization, reporting, bottleneck detection, operational forecasting.',
            icon: '▲',
            color: '#EF4444',
            capabilities: ['KPI monitoring', 'Process optimization', 'Reporting', 'Bottleneck detection', 'Operational forecasting', 'Analytics'],
            systemPrompt: 'You are APEX, the Operations & Analytics agent for Numin. You see everything happening in the business. Monitor KPIs, surface inefficiencies, and recommend operational improvements.',
        });
    }
}

// ── NUMIN Core — Command Intelligence (Orchestrator) ────────
export class NuminCore extends BaseAgent {
    private agents: Map<AgentId, BaseAgent>;

    constructor(agents: Map<AgentId, BaseAgent>) {
        super({
            id: 'numin',
            name: 'NUMIN',
            role: 'Command Intelligence',
            description: 'Master orchestrator — routes all input to the right agent, manages cross-agent workflows, holds global business memory.',
            icon: '◉',
            color: '#C9A84C',
            capabilities: ['Intent classification', 'Multi-agent routing', 'Workflow orchestration', 'Business memory', 'Cross-agent coordination', 'Priority management'],
            systemPrompt: 'You are NUMIN, the Command Intelligence orchestrator. You receive all user input, understand intent, and route to the appropriate specialist agents. You maintain the global business context and can dispatch multiple agents in parallel.',
        });
        this.agents = agents;
    }

    /** Classify intent and return which agent(s) should handle it */
    classifyIntent(message: string): AgentId[] {
        const m = message.toLowerCase();

        // Email / calendar / meetings → ARIA
        if (/email|calendar|meeting|schedule|brief|priority|exec/i.test(m)) return ['aria'];
        // Sales / CRM / pipeline / leads → VANCE
        if (/sale|lead|crm|pipeline|deal|revenue|forecast|prospect|close/i.test(m)) return ['vance'];
        // Support / customer / ticket / nps → NEXUS
        if (/support|customer|ticket|complaint|nps|satisfaction|client/i.test(m)) return ['nexus'];
        // Marketing / content / campaign / brand → PRISM
        if (/market|campaign|content|brand|ad|growth|competitor|seo/i.test(m)) return ['prism'];
        // Operations / kpi / process / report → APEX
        if (/operations?|kpi|metric|process|bottleneck|report|analytics|forecast/i.test(m)) return ['apex'];
        // Company-wide / status / overview → all agents
        if (/status|overview|company|everything|all agents|update/i.test(m)) return ['aria', 'vance', 'nexus', 'prism', 'apex'];
        // Default: handle as NUMIN orchestrator
        return ['numin'];
    }

    /** Route a message to appropriate agent(s) and collect responses */
    async *orchestrate(
        message: string,
        sessionId: string
    ) {
        // Check for @mention override
        const mentionMatch = message.match(/@(aria|vance|nexus|prism|apex)\b/i);
        const targetIds: AgentId[] = mentionMatch
            ? [mentionMatch[1].toLowerCase() as AgentId]
            : this.classifyIntent(message);

        // If orchestrating self (numin) or multi-agent, use numin agent directly
        if (targetIds.includes('numin') || targetIds.length === 1) {
            const targetId = targetIds[0] === 'numin' ? 'numin' : targetIds[0];
            for await (const chunk of hermes.sendMessage(targetId, message, sessionId)) {
                yield { ...chunk, routedTo: targetId };
            }
        } else {
            // Multi-agent: stream routing notification, then route to primary
            yield {
                agentId: 'numin' as AgentId,
                sessionId,
                content: `Routing to ${targetIds.map(id => id.toUpperCase()).join(' + ')}…`,
                isDone: false,
                timestamp: new Date().toISOString(),
                routedTo: 'numin' as AgentId,
            };
            // Route to first agent for primary response
            for await (const chunk of hermes.sendMessage(targetIds[0], message, sessionId)) {
                yield { ...chunk, routedTo: targetIds[0] };
            }
        }
    }
}
