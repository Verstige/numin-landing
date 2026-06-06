/**
 * Numin Agent Registry
 * Exports all agent instances and the central registry.
 */
import { AriaAgent, VanceAgent, NexusAgent, PrismAgent, ApexAgent, NuminCore } from './agents';
import type { AgentId } from '../hermes/client';
import type { BaseAgent } from './base-agent';

// Instantiate all specialist agents
const aria = new AriaAgent();
const vance = new VanceAgent();
const nexus = new NexusAgent();
const prism = new PrismAgent();
const apex = new ApexAgent();

// Build registry map (without numin self-reference)
const specialistMap = new Map<AgentId, BaseAgent>([
    ['aria', aria],
    ['vance', vance],
    ['nexus', nexus],
    ['prism', prism],
    ['apex', apex],
]);

// Orchestrator
const numinCore = new NuminCore(specialistMap);

// Full agent registry
export const AGENT_REGISTRY = new Map<AgentId, BaseAgent>([
    ...specialistMap,
    ['numin', numinCore],
]);

// Named exports
export { aria, vance, nexus, prism, apex, numinCore };
export { AriaAgent, VanceAgent, NexusAgent, PrismAgent, ApexAgent, NuminCore };

// Agent metadata array for UI rendering
export const AGENTS_LIST = [
    { id: 'aria' as AgentId, name: 'ARIA', role: 'Executive Intelligence', icon: '✦', color: '#8B5CF6', description: 'Email triage, calendar management, meeting prep, daily briefings, priority decisions.' },
    { id: 'vance' as AgentId, name: 'VANCE', role: 'Revenue Intelligence', icon: '◈', color: '#10B981', description: 'CRM management, lead qualification, sales outreach, pipeline tracking, deal forecasting.' },
    { id: 'nexus' as AgentId, name: 'NEXUS', role: 'Client Experience', icon: '⬡', color: '#3B82F6', description: 'Multi-channel support, ticket resolution, sentiment analysis, NPS tracking.' },
    { id: 'prism' as AgentId, name: 'PRISM', role: 'Growth & Marketing', icon: '◆', color: '#F59E0B', description: 'Campaign planning, content generation, competitor analysis, ad performance.' },
    { id: 'apex' as AgentId, name: 'APEX', role: 'Operations & Analytics', icon: '▲', color: '#EF4444', description: 'KPI monitoring, process optimization, bottleneck detection, operational forecasting.' },
    { id: 'numin' as AgentId, name: 'NUMIN', role: 'Command Intelligence', icon: '◉', color: '#C9A84C', description: 'Master orchestrator — routes all input, manages cross-agent workflows, holds global business memory.' },
] as const;

export type AgentMeta = typeof AGENTS_LIST[number];
