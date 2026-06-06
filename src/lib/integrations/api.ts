/**
 * Integrations API — data layer for live status
 */

export type IntegrationStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface Integration {
    id: string;
    name: string;
    icon: string;
    status: IntegrationStatus;
    lastSync: string | null;
    agent: string;
    color: string;
    description: string;
}

export interface DataFlowStats {
    emailsProcessedToday: number;
    crmRecordsUpdated: number;
    calendarEventsManaged: number;
}

// In-memory store for demo; replace with real API calls
let _integrations: Integration[] = [
    { id: 'gmail', name: 'Gmail', icon: '📧', status: 'disconnected', lastSync: null, agent: 'ARIA', color: '#5c6178', description: 'Email monitoring, triage, and automated responses' },
    { id: 'calendar', name: 'Google Calendar', icon: '📅', status: 'disconnected', lastSync: null, agent: 'ARIA', color: '#5c6178', description: 'Meeting scheduling, availability management, briefings' },
    { id: 'slack', name: 'Slack', icon: '💬', status: 'disconnected', lastSync: null, agent: 'NEXUS', color: '#5c6178', description: 'Team communication monitoring and automated alerts' },
    { id: 'hubspot', name: 'HubSpot CRM', icon: '🎯', status: 'disconnected', lastSync: null, agent: 'VANCE', color: '#5c6178', description: 'Lead tracking, deal pipeline, contact management' },
    { id: 'stripe', name: 'Stripe', icon: '💳', status: 'disconnected', lastSync: null, agent: 'APEX', color: '#5c6178', description: 'Revenue tracking, invoice management, payment monitoring' },
    { id: 'notion', name: 'Notion', icon: '📋', status: 'disconnected', lastSync: null, agent: 'PRISM', color: '#5c6178', description: 'Knowledge base, content planning, documentation sync' },
];

const _stats: DataFlowStats = {
    emailsProcessedToday: 0,
    crmRecordsUpdated: 0,
    calendarEventsManaged: 0,
};

/** Simulate a short network delay */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Fetch all integrations with live status */
export async function fetchIntegrations(): Promise<Integration[]> {
    await delay(200);
    // In production: return fetch('/api/integrations').then(r => r.json());
    return structuredClone(_integrations);
}

/** Fetch data flow statistics */
export async function fetchDataFlowStats(): Promise<DataFlowStats> {
    await delay(150);
    // In production: return fetch('/api/integrations/stats').then(r => r.json());
    return { ..._stats };
}

/** Connect an integration */
export async function connectIntegration(id: string): Promise<Integration> {
    await delay(600);
    const integration = _integrations.find(i => i.id === id);
    if (!integration) throw new Error(`Integration ${id} not found`);
    if (integration.status === 'connected') throw new Error('Already connected');

    integration.status = 'syncing';
    // Simulate sync completing after a short delay
    setTimeout(() => {
        integration.status = 'connected';
        integration.lastSync = new Date().toLocaleString();
    }, 2000);

    return structuredClone(integration);
}

/** Disconnect an integration */
export async function disconnectIntegration(id: string): Promise<Integration> {
    await delay(400);
    const integration = _integrations.find(i => i.id === id);
    if (!integration) throw new Error(`Integration ${id} not found`);
    if (integration.status === 'disconnected') throw new Error('Not connected');

    integration.status = 'disconnected';
    integration.lastSync = null;

    return structuredClone(integration);
}

/** Poll function — subscribe to live updates */
export function onIntegrationUpdate(callback: (integrations: Integration[]) => void, intervalMs = 5000): () => void {
    const id = setInterval(async () => {
        const data = await fetchIntegrations();
        callback(data);
    }, intervalMs);
    return () => clearInterval(id);
}
