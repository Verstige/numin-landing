// Cross-Agent Communication and Coordination System
// This system enables Nova to coordinate between all AI agents

import { aiAgentIntegration } from './ai-agent-integration';
import { agentSyncSystem } from './agent-sync-system';
import { CrossAgentMessage, AgentAction } from './ai-agent-integration';

export interface CoordinationTask {
  id: string;
  title: string;
  description: string;
  complexity: 'simple' | 'moderate' | 'complex';
  domains: string[];
  dataTypes: string[];
  actions: string[];
  assignedAgents: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  dependencies: string[];
  results: CoordinationResult[];
}

export interface CoordinationResult {
  agentId: string;
  agentName: string;
  task: string;
  result: any;
  timestamp: Date;
  status: 'success' | 'error' | 'partial';
}

export interface AgentCapability {
  agentId: string;
  name: string;
  role: string;
  skills: string[];
  specializations: string[];
  permissions: string[];
  currentWorkload: number;
  availability: 'available' | 'busy' | 'offline';
  strengths: string[];
  weaknesses: string[];
  collaborationPreferences: string[];
}

export interface CoordinationStrategy {
  type: 'sequential' | 'parallel' | 'collaborative' | 'hierarchical';
  description: string;
  agentRoles: {
    [agentId: string]: {
      role: 'primary' | 'secondary' | 'support' | 'oversight';
      tasks: string[];
      dependencies: string[];
    };
  };
  communicationFlow: {
    from: string;
    to: string;
    message: string;
    timing: 'immediate' | 'on-completion' | 'on-failure' | 'periodic';
  }[];
}

export class CrossAgentCoordinator {
  private static instance: CrossAgentCoordinator;
  private activeTasks: Map<string, CoordinationTask> = new Map();
  private agentCapabilities: Map<string, AgentCapability> = new Map();
  private communicationHistory: CrossAgentMessage[] = [];

  private constructor() {
    this.initializeAgentCapabilities();
  }

  public static getInstance(): CrossAgentCoordinator {
    if (!CrossAgentCoordinator.instance) {
      CrossAgentCoordinator.instance = new CrossAgentCoordinator();
    }
    return CrossAgentCoordinator.instance;
  }

  // Initialize agent capabilities database
  private initializeAgentCapabilities(): void {
    const capabilities: AgentCapability[] = [
      {
        agentId: 'aurora',
        name: 'Aurora',
        role: 'Executive Assistant',
        skills: ['Project Management', 'Schedule Coordination', 'Email Management', 'Task Delegation', 'Executive Reporting', 'Strategic Planning'],
        specializations: ['Executive Operations', 'Strategic Planning', 'Resource Optimization', 'Cross-Department Coordination'],
        permissions: ['projects', 'emails', 'tasks', 'calendar', 'notes', 'analytics', 'team'],
        currentWorkload: 65,
        availability: 'available',
        strengths: ['Strategic thinking', 'Cross-functional coordination', 'Executive communication'],
        weaknesses: ['Technical implementation', 'Data analysis'],
        collaborationPreferences: ['titan', 'orion', 'vega']
      },
      {
        agentId: 'vega',
        name: 'Vega',
        role: 'Sales Representative',
        skills: ['Lead Qualification', 'CRM Management', 'Sales Automation', 'Pipeline Analysis', 'Client Relationship Management'],
        specializations: ['Sales Operations', 'Lead Generation', 'Revenue Growth', 'Customer Acquisition'],
        permissions: ['crm', 'emails', 'sales_analytics', 'contacts'],
        currentWorkload: 45,
        availability: 'available',
        strengths: ['Sales strategy', 'Lead conversion', 'Client relationships'],
        weaknesses: ['Technical support', 'Content creation'],
        collaborationPreferences: ['orion', 'luma', 'aurora']
      },
      {
        agentId: 'luma',
        name: 'Luma',
        role: 'Customer Support',
        skills: ['Support Ticket Management', 'Email Response Automation', 'Issue Resolution', 'Knowledge Management'],
        specializations: ['Customer Service', 'Issue Resolution', 'Knowledge Management', 'Customer Satisfaction'],
        permissions: ['emails', 'crm', 'support_analytics', 'knowledge_base'],
        currentWorkload: 30,
        availability: 'available',
        strengths: ['Customer empathy', 'Problem solving', 'Knowledge management'],
        weaknesses: ['Sales strategy', 'Technical implementation'],
        collaborationPreferences: ['vega', 'titan', 'aurora']
      },
      {
        agentId: 'orion',
        name: 'Orion',
        role: 'Marketing Strategist',
        skills: ['Content Strategy', 'Campaign Planning', 'Social Media Management', 'SEO', 'Brand Management'],
        specializations: ['Marketing Strategy', 'Content Creation', 'Campaign Management', 'Brand Development'],
        permissions: ['projects', 'emails', 'marketing_analytics', 'content', 'campaigns'],
        currentWorkload: 80,
        availability: 'busy',
        strengths: ['Creative strategy', 'Content creation', 'Brand development'],
        weaknesses: ['Technical support', 'Sales processes'],
        collaborationPreferences: ['vega', 'aurora', 'titan']
      },
      {
        agentId: 'titan',
        name: 'Titan',
        role: 'Operations Manager',
        skills: ['Operational Efficiency', 'Resource Management', 'Process Optimization', 'KPI Monitoring', 'System Integration'],
        specializations: ['Operations Management', 'Process Optimization', 'Performance Monitoring', 'System Efficiency'],
        permissions: ['all_systems', 'analytics', 'process_management', 'performance'],
        currentWorkload: 55,
        availability: 'available',
        strengths: ['Process optimization', 'Data analysis', 'System integration'],
        weaknesses: ['Creative tasks', 'Customer-facing activities'],
        collaborationPreferences: ['aurora', 'orion', 'luma']
      }
    ];

    capabilities.forEach(capability => {
      this.agentCapabilities.set(capability.agentId, capability);
    });
  }

  // Analyze query and determine coordination strategy
  public analyzeQuery(query: string): {
    complexity: 'simple' | 'moderate' | 'complex';
    domains: string[];
    dataTypes: string[];
    actions: string[];
    recommendedAgents: string[];
    strategy: CoordinationStrategy;
  } {
    const queryLower = query.toLowerCase();
    
    // Domain detection
    const domains: string[] = [];
    const recommendedAgents: string[] = [];
    
    if (queryLower.includes('sales') || queryLower.includes('lead') || queryLower.includes('deal')) {
      domains.push('sales');
      recommendedAgents.push('vega');
    }
    if (queryLower.includes('marketing') || queryLower.includes('campaign') || queryLower.includes('content')) {
      domains.push('marketing');
      recommendedAgents.push('orion');
    }
    if (queryLower.includes('support') || queryLower.includes('customer') || queryLower.includes('issue')) {
      domains.push('support');
      recommendedAgents.push('luma');
    }
    if (queryLower.includes('operation') || queryLower.includes('process') || queryLower.includes('efficiency')) {
      domains.push('operations');
      recommendedAgents.push('titan');
    }
    if (queryLower.includes('executive') || queryLower.includes('strategy') || queryLower.includes('coordinate')) {
      domains.push('executive');
      recommendedAgents.push('aurora');
    }

    // Data type recognition
    const dataTypes: string[] = [];
    if (queryLower.includes('project')) dataTypes.push('projects');
    if (queryLower.includes('email')) dataTypes.push('emails');
    if (queryLower.includes('crm') || queryLower.includes('contact')) dataTypes.push('crm');
    if (queryLower.includes('task')) dataTypes.push('tasks');
    if (queryLower.includes('team')) dataTypes.push('team');
    if (queryLower.includes('note')) dataTypes.push('notes');
    if (queryLower.includes('calendar') || queryLower.includes('schedule')) dataTypes.push('calendar');

    // Action classification
    const actions: string[] = [];
    if (queryLower.includes('create') || queryLower.includes('new')) actions.push('create');
    if (queryLower.includes('update') || queryLower.includes('modify')) actions.push('update');
    if (queryLower.includes('analyze') || queryLower.includes('review')) actions.push('analyze');
    if (queryLower.includes('schedule') || queryLower.includes('plan')) actions.push('schedule');
    if (queryLower.includes('coordinate') || queryLower.includes('collaborate')) actions.push('coordinate');

    // Complexity assessment
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (domains.length > 2 || recommendedAgents.length > 2) {
      complexity = 'complex';
    } else if (domains.length > 1 || recommendedAgents.length > 1) {
      complexity = 'moderate';
    }

    // Determine coordination strategy
    const strategy = this.determineCoordinationStrategy(domains, recommendedAgents, complexity);

    return {
      complexity,
      domains,
      dataTypes,
      actions,
      recommendedAgents,
      strategy
    };
  }

  // Determine the best coordination strategy
  private determineCoordinationStrategy(
    domains: string[],
    agents: string[],
    complexity: string
  ): CoordinationStrategy {
    
    if (complexity === 'simple') {
      return {
        type: 'sequential',
        description: 'Single agent handles the task with minimal coordination',
        agentRoles: {
          [agents[0]]: {
            role: 'primary',
            tasks: ['Execute main task', 'Provide status updates'],
            dependencies: []
          }
        },
        communicationFlow: []
      };
    }

    if (complexity === 'moderate') {
      return {
        type: 'collaborative',
        description: 'Two agents collaborate with shared responsibilities',
        agentRoles: {
          [agents[0]]: {
            role: 'primary',
            tasks: ['Lead execution', 'Coordinate with secondary agent'],
            dependencies: [agents[1]]
          },
          [agents[1]]: {
            role: 'secondary',
            tasks: ['Support primary agent', 'Handle specialized tasks'],
            dependencies: []
          }
        },
        communicationFlow: [
          {
            from: agents[0],
            to: agents[1],
            message: 'Task coordination and handoff',
            timing: 'immediate'
          }
        ]
      };
    }

    // Complex coordination
    if (domains.includes('executive')) {
      return {
        type: 'hierarchical',
        description: 'Aurora coordinates multiple agents with executive oversight',
        agentRoles: {
          'aurora': {
            role: 'oversight',
            tasks: ['Coordinate overall strategy', 'Monitor progress', 'Make executive decisions'],
            dependencies: agents.filter(a => a !== 'aurora')
          },
          ...agents.filter(a => a !== 'aurora').reduce((roles, agent) => {
            roles[agent] = {
              role: 'primary',
              tasks: ['Execute specialized tasks', 'Report to Aurora'],
              dependencies: ['aurora']
            };
            return roles;
          }, {} as any)
        },
        communicationFlow: [
          {
            from: 'aurora',
            to: agents[0],
            message: 'Initial task delegation and strategy',
            timing: 'immediate'
          },
          {
            from: agents[0],
            to: 'aurora',
            message: 'Progress updates and status reports',
            timing: 'periodic'
          }
        ]
      };
    }

    // Default collaborative strategy for complex tasks
    return {
      type: 'collaborative',
      description: 'Multiple agents collaborate with shared responsibilities',
      agentRoles: agents.reduce((roles, agent, index) => {
        roles[agent] = {
          role: index === 0 ? 'primary' : 'secondary',
          tasks: index === 0 ? ['Lead coordination', 'Manage workflow'] : ['Execute specialized tasks', 'Support primary agent'],
          dependencies: index === 0 ? agents.slice(1) : [agents[0]]
        };
        return roles;
      }, {} as any),
      communicationFlow: [
        {
          from: agents[0],
          to: agents[1],
          message: 'Task coordination and workflow management',
          timing: 'immediate'
        },
        {
          from: agents[1],
          to: agents[0],
          message: 'Status updates and results',
          timing: 'on-completion'
        }
      ]
    };
  }

  // Create and execute coordination task
  public async createCoordinationTask(
    query: string,
    analysis: any
  ): Promise<CoordinationTask> {
    const taskId = `task-${Date.now()}`;
    
    const task: CoordinationTask = {
      id: taskId,
      title: this.generateTaskTitle(query, analysis.domains),
      description: query,
      complexity: analysis.complexity,
      domains: analysis.domains,
      dataTypes: analysis.dataTypes,
      actions: analysis.actions,
      assignedAgents: analysis.recommendedAgents,
      status: 'pending',
      priority: this.determinePriority(analysis),
      createdAt: new Date(),
      updatedAt: new Date(),
      dependencies: [],
      results: []
    };

    this.activeTasks.set(taskId, task);
    
    // Execute the coordination strategy
    await this.executeCoordinationStrategy(task, analysis.strategy);
    
    return task;
  }

  // Execute coordination strategy
  private async executeCoordinationStrategy(
    task: CoordinationTask,
    strategy: CoordinationStrategy
  ): Promise<void> {
    try {
      task.status = 'in-progress';
      
      // Send initial coordination messages
      for (const flow of strategy.communicationFlow) {
        await this.sendCrossAgentMessage(
          flow.from,
          flow.to,
          flow.message,
          `Coordination for task: ${task.title}`,
          'medium',
          { taskId: task.id, strategy: strategy.type }
        );
      }

      // Execute agent tasks based on strategy
      if (strategy.type === 'sequential') {
        await this.executeSequentialStrategy(task, strategy);
      } else if (strategy.type === 'parallel') {
        await this.executeParallelStrategy(task, strategy);
      } else if (strategy.type === 'collaborative') {
        await this.executeCollaborativeStrategy(task, strategy);
      } else if (strategy.type === 'hierarchical') {
        await this.executeHierarchicalStrategy(task, strategy);
      }

      task.status = 'completed';
      task.updatedAt = new Date();
      
    } catch (error) {
      task.status = 'failed';
      task.updatedAt = new Date();
      console.error('Coordination strategy execution failed:', error);
    }
  }

  // Execute sequential coordination
  private async executeSequentialStrategy(
    task: CoordinationTask,
    strategy: CoordinationStrategy
  ): Promise<void> {
    const primaryAgent = Object.keys(strategy.agentRoles).find(
      agentId => strategy.agentRoles[agentId].role === 'primary'
    );
    
    if (primaryAgent) {
      const result = await this.executeAgentTask(primaryAgent, task, strategy.agentRoles[primaryAgent].tasks);
      task.results.push(result);
    }
  }

  // Execute parallel coordination
  private async executeParallelStrategy(
    task: CoordinationTask,
    strategy: CoordinationStrategy
  ): Promise<void> {
    const agentTasks = Object.entries(strategy.agentRoles).map(async ([agentId, role]) => {
      const result = await this.executeAgentTask(agentId, task, role.tasks);
      return result;
    });

    const results = await Promise.all(agentTasks);
    task.results.push(...results);
  }

  // Execute collaborative coordination
  private async executeCollaborativeStrategy(
    task: CoordinationTask,
    strategy: CoordinationStrategy
  ): Promise<void> {
    // Primary agent starts the coordination
    const primaryAgent = Object.keys(strategy.agentRoles).find(
      agentId => strategy.agentRoles[agentId].role === 'primary'
    );
    
    if (primaryAgent) {
      const primaryResult = await this.executeAgentTask(primaryAgent, task, strategy.agentRoles[primaryAgent].tasks);
      task.results.push(primaryResult);
      
      // Secondary agents support based on primary results
      const secondaryAgents = Object.keys(strategy.agentRoles).filter(
        agentId => strategy.agentRoles[agentId].role === 'secondary'
      );
      
      for (const agentId of secondaryAgents) {
        const result = await this.executeAgentTask(agentId, task, strategy.agentRoles[agentId].tasks);
        task.results.push(result);
      }
    }
  }

  // Execute hierarchical coordination
  private async executeHierarchicalStrategy(
    task: CoordinationTask,
    strategy: CoordinationStrategy
  ): Promise<void> {
    // Aurora (executive oversight) coordinates the workflow
    const oversightAgent = Object.keys(strategy.agentRoles).find(
      agentId => strategy.agentRoles[agentId].role === 'oversight'
    );
    
    if (oversightAgent) {
      const oversightResult = await this.executeAgentTask(oversightAgent, task, strategy.agentRoles[oversightAgent].tasks);
      task.results.push(oversightResult);
      
      // Other agents execute their specialized tasks
      const executionAgents = Object.keys(strategy.agentRoles).filter(
        agentId => strategy.agentRoles[agentId].role === 'primary'
      );
      
      for (const agentId of executionAgents) {
        const result = await this.executeAgentTask(agentId, task, strategy.agentRoles[agentId].tasks);
        task.results.push(result);
      }
    }
  }

  // Execute individual agent task
  private async executeAgentTask(
    agentId: string,
    task: CoordinationTask,
    tasks: string[]
  ): Promise<CoordinationResult> {
    try {
      // Simulate agent task execution
      const agentCapability = this.agentCapabilities.get(agentId);
      if (!agentCapability) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // Create agent action
      const action: AgentAction = {
        type: 'analyze',
        target: task.dataTypes[0] || 'projects',
        data: {
          taskId: task.id,
          tasks: tasks,
          context: task.description
        },
        agentId: agentId,
        timestamp: new Date()
      };

      // Execute the action
      const result = await aiAgentIntegration.executeAgentAction(action);

      return {
        agentId,
        agentName: agentCapability.name,
        task: tasks.join(', '),
        result,
        timestamp: new Date(),
        status: 'success'
      };

    } catch (error) {
      return {
        agentId,
        agentName: this.agentCapabilities.get(agentId)?.name || agentId,
        task: tasks.join(', '),
        result: { error: error.message },
        timestamp: new Date(),
        status: 'error'
      };
    }
  }

  // Send cross-agent message
  private async sendCrossAgentMessage(
    fromAgent: string,
    toAgent: string,
    message: string,
    context: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    data?: any
  ): Promise<void> {
    await aiAgentIntegration.sendCrossAgentMessage(fromAgent, toAgent, message, context, priority, data);
    
    const crossAgentMessage: CrossAgentMessage = {
      fromAgent,
      toAgent,
      message,
      context,
      timestamp: new Date(),
      priority,
      data
    };
    
    this.communicationHistory.push(crossAgentMessage);
  }

  // Generate task title
  private generateTaskTitle(query: string, domains: string[]): string {
    if (domains.length === 1) {
      return `${domains[0].charAt(0).toUpperCase() + domains[0].slice(1)} Task`;
    } else if (domains.length > 1) {
      return `Multi-Domain ${domains.length} Agent Coordination`;
    } else {
      return 'General Task Coordination';
    }
  }

  // Determine task priority
  private determinePriority(analysis: any): 'low' | 'medium' | 'high' | 'urgent' {
    if (analysis.domains.includes('executive') || analysis.complexity === 'complex') {
      return 'high';
    } else if (analysis.domains.length > 1) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Get agent capabilities
  public getAgentCapabilities(): AgentCapability[] {
    return Array.from(this.agentCapabilities.values());
  }

  // Get active tasks
  public getActiveTasks(): CoordinationTask[] {
    return Array.from(this.activeTasks.values());
  }

  // Get communication history
  public getCommunicationHistory(): CrossAgentMessage[] {
    return this.communicationHistory;
  }

  // Get coordination insights
  public getCoordinationInsights(): any {
    const tasks = this.getActiveTasks();
    const agents = this.getAgentCapabilities();
    
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      activeAgents: agents.filter(a => a.availability === 'available').length,
      averageWorkload: agents.reduce((sum, a) => sum + a.currentWorkload, 0) / agents.length,
      coordinationEfficiency: this.calculateCoordinationEfficiency(),
      topCollaborations: this.getTopCollaborations()
    };
  }

  // Calculate coordination efficiency
  private calculateCoordinationEfficiency(): number {
    const tasks = this.getActiveTasks();
    if (tasks.length === 0) return 100;
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    
    return Math.round(((completedTasks - failedTasks) / tasks.length) * 100);
  }

  // Get top agent collaborations
  private getTopCollaborations(): { agents: string[], count: number }[] {
    const collaborations = new Map<string, number>();
    
    this.communicationHistory.forEach(msg => {
      const key = [msg.fromAgent, msg.toAgent].sort().join('-');
      collaborations.set(key, (collaborations.get(key) || 0) + 1);
    });
    
    return Array.from(collaborations.entries())
      .map(([agents, count]) => ({ agents: agents.split('-'), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

// Export singleton instance
export const crossAgentCoordinator = CrossAgentCoordinator.getInstance();
