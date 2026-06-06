/**
 * Onboarding Memory Seeder
 * Seeds agent memory with company context after onboarding completes.
 */
import { MemorySystem } from '@/lib/memory-system';
import type { AgentId } from '@/lib/hermes/client';
import { AGENTS_LIST } from '@/lib/agents/index';

export interface OnboardingData {
  company: {
    name: string;
    industry: string;
    size: string;
    timezone: string;
  };
  tools: string[];
}

const TOOL_AGENT_MAP: Record<string, AgentId> = {
  gmail: 'aria',
  calendar: 'aria',
  hubspot: 'vance',
  slack: 'nexus',
  stripe: 'apex',
  notion: 'prism',
};

const AGENT_ROLES: Record<AgentId, string> = {
  aria: 'Executive Intelligence',
  vance: 'Revenue Intelligence',
  nexus: 'Client Experience',
  prism: 'Growth & Marketing',
  apex: 'Operations & Analytics',
  numin: 'Command Intelligence',
};

/**
 * Seed agent memory with onboarding context for all agents.
 */
export async function seedOnboardingMemory(data: OnboardingData): Promise<void> {
  const memorySystem = MemorySystem.getInstance();
  const { company, tools } = data;

  // Seed company context as high-importance vector memories per agent
  const companyContext = `Company: ${company.name || 'Unknown'}. Industry: ${company.industry || 'Unspecified'}. Team size: ${company.size || 'Unknown'}. Timezone: ${company.timezone}.`;

  // Seed NUMIN (orchestrator) with full company context
  await memorySystem.addVectorMemory(
    'numin',
    companyContext,
    'onboarding',
    0.9,
    ['company', 'onboarding', 'setup'],
    { companyName: company.name, industry: company.industry }
  );

  // Seed each specialist agent with relevant context
  for (const agent of AGENTS_LIST) {
    if (agent.id === 'numin') continue; // Already seeded above

    // Agent identity and role
    await memorySystem.addVectorMemory(
      agent.id,
      `I am ${agent.name}, specializing in ${AGENT_ROLES[agent.id]}. ${agent.description}`,
      'onboarding',
      0.8,
      ['identity', 'role', 'onboarding']
    );

    // Company context for all agents
    await memorySystem.addVectorMemory(
      agent.id,
      `My company's name is ${company.name || 'the company'}. We operate in ${company.industry || 'an unspecified'} industry.`,
      'onboarding',
      0.7,
      ['company', 'context']
    );

    // Tool connections for relevant agents
    const agentTools = tools.filter(t => TOOL_AGENT_MAP[t] === agent.id);
    if (agentTools.length > 0) {
      await memorySystem.addVectorMemory(
        agent.id,
        `I have access to: ${agentTools.join(', ')}. These tools are connected and ready for use.`,
        'onboarding',
        0.8,
        ['tools', 'integrations', ...agentTools]
      );
    }
  }

  // Seed onboarding completion memory for all agents
  const completionMemory = `${company.name || 'The company'} completed onboarding. ${tools.length} tools connected: ${tools.join(', ') || 'none'}. 6 agents initialized. All data stored on-device.`;

  for (const agent of AGENTS_LIST) {
    await memorySystem.addConversationMemory(
      agent.id,
      'system',
      `Onboarding complete. ${completionMemory}`,
      'high',
      ['onboarding', 'setup', 'initialized'],
      { companyName: company.name, toolsConnected: tools.length }
    );
  }
}

/**
 * Clear onboarding seed data (useful for re-onboarding).
 */
export async function clearOnboardingMemory(): Promise<void> {
  const memorySystem = MemorySystem.getInstance();

  for (const agent of AGENTS_LIST) {
    await memorySystem.clearAgentMemory(agent.id, 'all');
  }
}