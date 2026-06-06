// Agent Sync System - Real-time synchronization for AI agents
// This system provides real-time data synchronization between agents and workspace

import { AIAgent } from '@/types/nexus';
import { agentManager } from './agent-manager';
import { UserDataSnapshot } from './nova-data-access';

export class AgentSyncSystem {
  private static instance: AgentSyncSystem;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncedSnapshot: UserDataSnapshot | null = null;
  private activeConnections: Map<string, boolean> = new Map();

  private constructor() {}

  public static getInstance(): AgentSyncSystem {
    if (!AgentSyncSystem.instance) {
      AgentSyncSystem.instance = new AgentSyncSystem();
    }
    return AgentSyncSystem.instance;
  }

  // Start real-time synchronization
  public startSync(fetchDataCallback: () => Promise<UserDataSnapshot>, intervalMs: number = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      console.log('🔄 AgentSyncSystem: Fetching latest workspace data...');
      try {
        const currentSnapshot = await fetchDataCallback();
        await this.processSnapshot(currentSnapshot);
      } catch (error) {
        console.error('❌ AgentSyncSystem: Failed to fetch data:', error);
      }
    }, intervalMs);

    console.log(`✅ AgentSyncSystem: Started real-time sync every ${intervalMs / 1000} seconds.`);
  }

  // Stop synchronization
  public stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 AgentSyncSystem: Stopped real-time sync.');
    }
  }

  // Process data snapshot and notify agents
  private async processSnapshot(currentSnapshot: UserDataSnapshot) {
    if (!this.lastSyncedSnapshot) {
      console.log('🆕 AgentSyncSystem: Initial data snapshot received.');
      await this.notifyAllAgents('Initial workspace data loaded. Ready to assist.');
    } else {
      console.log('🔍 AgentSyncSystem: Detecting changes...');
      const changes = this.detectChanges(this.lastSyncedSnapshot, currentSnapshot);
      if (changes.length > 0) {
        const changeSummary = `Workspace changes detected: ${changes.join(', ')}.`;
        await this.notifyAllAgents(changeSummary);
      } else {
        console.log('ℹ️ AgentSyncSystem: No significant changes detected.');
      }
    }
    this.lastSyncedSnapshot = currentSnapshot;
  }

  // Detect changes between snapshots
  private detectChanges(oldSnapshot: UserDataSnapshot, newSnapshot: UserDataSnapshot): string[] {
    const detected: string[] = [];

    // Project changes
    if (oldSnapshot.projects.length !== newSnapshot.projects.length) {
      const change = newSnapshot.projects.length > oldSnapshot.projects.length ? 'added' : 'removed';
      detected.push(`${Math.abs(newSnapshot.projects.length - oldSnapshot.projects.length)} projects ${change}`);
    }

    // Task changes
    if (oldSnapshot.tasks.length !== newSnapshot.tasks.length) {
      const change = newSnapshot.tasks.length > oldSnapshot.tasks.length ? 'added' : 'removed';
      detected.push(`${Math.abs(newSnapshot.tasks.length - oldSnapshot.tasks.length)} tasks ${change}`);
    }

    // Email changes
    if (newSnapshot.emails.length > oldSnapshot.emails.length) {
      const newEmails = newSnapshot.emails.length - oldSnapshot.emails.length;
      detected.push(`${newEmails} new emails received`);
    }

    // CRM changes
    if (newSnapshot.crm.contacts.length !== oldSnapshot.crm.contacts.length ||
        newSnapshot.crm.deals.length !== oldSnapshot.crm.deals.length) {
      detected.push('CRM data updated');
    }

    // Team changes
    if (oldSnapshot.teamMembers.length !== newSnapshot.teamMembers.length) {
      const change = newSnapshot.teamMembers.length > oldSnapshot.teamMembers.length ? 'added' : 'removed';
      detected.push(`${Math.abs(newSnapshot.teamMembers.length - oldSnapshot.teamMembers.length)} team members ${change}`);
    }

    // Notes changes
    if (oldSnapshot.notes.length !== newSnapshot.notes.length) {
      const change = newSnapshot.notes.length > oldSnapshot.notes.length ? 'added' : 'removed';
      detected.push(`${Math.abs(newSnapshot.notes.length - oldSnapshot.notes.length)} notes ${change}`);
    }

    // Activities changes
    if (newSnapshot.activities.length > oldSnapshot.activities.length) {
      const newActivities = newSnapshot.activities.length - oldSnapshot.activities.length;
      detected.push(`${newActivities} new activities recorded`);
    }

    return detected;
  }

  // Notify all agents of changes
  private async notifyAllAgents(message: string) {
    try {
      const allAgents = await agentManager.getAllAgents();
      const notifications = allAgents.map(async (agent) => {
        try {
          await agentManager.sendAgentMessage(agent.id, message);
          console.log(`✅ Notified agent ${agent.name}: ${message}`);
        } catch (error) {
          console.error(`❌ Failed to notify agent ${agent.name}:`, error);
        }
      });

      await Promise.all(notifications);
    } catch (error) {
      console.error('❌ Failed to notify agents:', error);
    }
  }

  // Get sync status
  public getSyncStatus() {
    return {
      isActive: this.syncInterval !== null,
      lastSync: this.lastSyncedSnapshot?.timestamp || null,
      totalConnections: this.activeConnections.size,
      activeAgents: Array.from(this.activeConnections.entries())
        .filter(([_, isActive]) => isActive)
        .map(([agentId, _]) => agentId)
    };
  }

  // Connect agent to sync system
  public connectAgent(agentId: string) {
    this.activeConnections.set(agentId, true);
    console.log(`🔗 Agent ${agentId} connected to sync system`);
  }

  // Disconnect agent from sync system
  public disconnectAgent(agentId: string) {
    this.activeConnections.set(agentId, false);
    console.log(`🔌 Agent ${agentId} disconnected from sync system`);
  }

  // Force sync (manual trigger)
  public async forceSync(fetchDataCallback: () => Promise<UserDataSnapshot>) {
    console.log('🔄 AgentSyncSystem: Manual sync triggered');
    const currentSnapshot = await fetchDataCallback();
    await this.processSnapshot(currentSnapshot);
  }

  // Get change summary for specific agent
  public getChangeSummaryForAgent(agentId: string): string {
    // This would return agent-specific change summaries
    return `Agent ${agentId} change summary: Recent workspace updates detected.`;
  }

  // Subscribe to specific data types
  public subscribeToDataType(agentId: string, dataType: string) {
    console.log(`📊 Agent ${agentId} subscribed to ${dataType} changes`);
    // Implementation would track subscriptions and notify only relevant agents
  }

  // Unsubscribe from data types
  public unsubscribeFromDataType(agentId: string, dataType: string) {
    console.log(`📊 Agent ${agentId} unsubscribed from ${dataType} changes`);
  }
}

// Export singleton instance
export const agentSyncSystem = AgentSyncSystem.getInstance();