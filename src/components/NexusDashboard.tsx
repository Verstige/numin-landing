import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Workflow, 
  FileText, 
  Plug, 
  BarChart3,
  Settings,
  Play,
  Activity,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  Zap,
  Database,
  Globe,
  Shield,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import AgentManager from './AgentManager';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowExecutionConsole from './WorkflowExecutionConsole';
import { AIAgent, Workflow as WorkflowType, APIConnector } from '@/types/nexus';
import { agentManager } from '@/lib/agent-manager';

interface NexusDashboardProps {
  className?: string;
}

export default function NexusDashboard({ className }: NexusDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [connectors, setConnectors] = useState<APIConnector[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [workflowExecutions, setWorkflowExecutions] = useState<Map<string, any>>(new Map());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const allAgents = await agentManager.getAllAgents();
      setAgents(allAgents);
      
      // TODO: Load workflows and connectors
      // const allWorkflows = await workflowManager.getAllWorkflows();
      // const allConnectors = await connectorManager.getAllConnectors();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async (workflow: WorkflowType) => {
    try {
      console.log('Saving workflow:', workflow);
      
      // Add to local workflows state
      const existingIndex = workflows.findIndex(w => w.id === workflow.id);
      if (existingIndex >= 0) {
        const updatedWorkflows = [...workflows];
        updatedWorkflows[existingIndex] = workflow;
        setWorkflows(updatedWorkflows);
      } else {
        setWorkflows([...workflows, workflow]);
      }
      
      // TODO: Save to database
      // await workflowManager.saveWorkflow(workflow);
      
      console.log('Workflow saved successfully');
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      console.log('Executing workflow:', workflowId);
      
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) {
        console.error('Workflow not found:', workflowId);
        return;
      }

      // Create execution context
      const executionId = `exec_${Date.now()}`;
      const execution = {
        id: executionId,
        workflowId,
        workflowName: workflow.name,
        status: 'running',
        startTime: new Date(),
        currentNode: null,
        results: {},
        errors: [],
        logs: [
          {
            id: `log_${Date.now()}`,
            timestamp: new Date(),
            type: 'info',
            message: `Starting workflow execution: ${workflow.name}`,
            details: { workflowId, nodeCount: workflow.nodes.length }
          }
        ]
      };

      setWorkflowExecutions(prev => new Map(prev).set(executionId, execution));

      // Execute workflow nodes
      await executeWorkflowNodes(workflow, executionId);
      
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };

  const executeWorkflowNodes = async (workflow: WorkflowType, executionId: string) => {
    try {
      const execution = workflowExecutions.get(executionId);
      if (!execution) return;

      // Find the start node (trigger node)
      const startNode = workflow.nodes.find(node => node.type === 'trigger');
      if (!startNode) {
        throw new Error('No trigger node found in workflow');
      }

      // Execute nodes in sequence
      await executeNode(startNode, workflow, executionId);
      
    } catch (error) {
      console.error('Error executing workflow nodes:', error);
      updateExecutionStatus(executionId, 'failed', { error: error.message });
    }
  };

  const executeNode = async (node: any, workflow: WorkflowType, executionId: string) => {
    try {
      console.log(`Executing node: ${node.type} - ${node.data.label}`);
      
      // Add log entry for node start
      addExecutionLog(executionId, {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date(),
        type: 'info',
        message: `Starting execution of ${node.type} node: ${node.data.label}`,
        nodeId: node.id,
        nodeType: node.type,
        agentName: node.data.label.includes(':') ? node.data.label.split(':')[0].trim() : undefined
      });
      
      updateExecutionStatus(executionId, 'running', { currentNode: node.id });
      
      let result: any = null;

      switch (node.type) {
        case 'trigger':
          result = { triggered: true, timestamp: new Date() };
          break;
          
        case 'agent-action':
          result = await executeAgentAction(node, executionId);
          break;
          
        case 'api-call':
          result = await executeAPICall(node, executionId);
          break;
          
        case 'condition':
          result = await executeCondition(node, executionId);
          break;
          
        case 'delay':
          result = await executeDelay(node, executionId);
          break;
          
        case 'function':
          result = await executeFunction(node, executionId);
          break;
          
        case 'merge':
          result = await executeMerge(node, workflow, executionId);
          break;
          
        case 'split':
          result = await executeSplit(node, workflow, executionId);
          break;
          
        case 'end':
          result = { completed: true, timestamp: new Date() };
          updateExecutionStatus(executionId, 'completed', { completed: true });
          return;
          
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Store result and add completion log
      const currentExecution = workflowExecutions.get(executionId);
      if (currentExecution) {
        currentExecution.results[node.id] = result;
        
        // Add completion log
        addExecutionLog(executionId, {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: new Date(),
          type: 'success',
          message: `Completed ${node.type} node: ${node.data.label}`,
          nodeId: node.id,
          nodeType: node.type,
          details: result
        });
        
        setWorkflowExecutions(prev => new Map(prev).set(executionId, currentExecution));
      }

      // Find next nodes to execute
      const nextNodes = getNextNodes(node.id, workflow);
      
      // Execute next nodes
      for (const nextNode of nextNodes) {
        await executeNode(nextNode, workflow, executionId);
      }
      
    } catch (error) {
      console.error(`Error executing node ${node.id}:`, error);
      
      // Add error log
      addExecutionLog(executionId, {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date(),
        type: 'error',
        message: `Error in ${node.type} node: ${error.message}`,
        nodeId: node.id,
        nodeType: node.type,
        details: { error: error.message, stack: error.stack }
      });
      
      updateExecutionStatus(executionId, 'failed', { 
        error: error.message, 
        failedNode: node.id 
      });
    }
  };

  const executeAgentAction = async (node: any, executionId: string) => {
    try {
      const agentName = node.data.label.split(':')[0]?.trim();
      const action = node.data.label.split(':')[1]?.trim() || 'Execute task';
      
      console.log(`Executing agent action: ${agentName} - ${action}`);
      
      // Add agent action start log
      addExecutionLog(executionId, {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date(),
        type: 'info',
        message: `Calling AI agent ${agentName} to ${action}`,
        nodeId: node.id,
        nodeType: 'agent-action',
        agentName: agentName,
        details: { action }
      });
      
      // Find the agent
      const agent = agents.find(a => a.name.toLowerCase().includes(agentName.toLowerCase()));
      if (!agent) {
        throw new Error(`Agent not found: ${agentName}`);
      }

      // Simulate agent execution with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      const result = {
        agentId: agent.id,
        agentName: agent.name,
        action: action,
        status: 'completed',
        result: `Agent ${agent.name} successfully executed: ${action}`,
        timestamp: new Date(),
        duration: `${(1500 + Math.random() * 1000).toFixed(0)}ms`
      };

      // Add agent action completion log
      addExecutionLog(executionId, {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date(),
        type: 'success',
        message: `AI agent ${agentName} completed: ${action}`,
        nodeId: node.id,
        nodeType: 'agent-action',
        agentName: agentName,
        details: result
      });

      return result;
    } catch (error) {
      console.error('Error executing agent action:', error);
      throw error;
    }
  };

  const executeAPICall = async (node: any, executionId: string) => {
    try {
      console.log(`Executing API call: ${node.data.label}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        endpoint: node.data.label,
        status: 'success',
        response: `API call to ${node.data.label} completed successfully`,
        timestamp: new Date()
      };

      return result;
    } catch (error) {
      console.error('Error executing API call:', error);
      throw error;
    }
  };

  const executeCondition = async (node: any, executionId: string) => {
    try {
      console.log(`Evaluating condition: ${node.data.label}`);
      
      // Simple condition evaluation (in real implementation, this would be more sophisticated)
      const condition = node.data.label;
      let result = false;
      
      if (condition.includes('>')) {
        const [left, right] = condition.split('>');
        result = parseInt(left.trim()) > parseInt(right.trim().replace('?', '').trim());
      } else if (condition.includes('Priority Level')) {
        result = Math.random() > 0.5; // Random for demo
      } else if (condition.includes('Payment Valid')) {
        result = Math.random() > 0.3; // Random for demo
      } else {
        result = Math.random() > 0.5; // Default random
      }
      
      return {
        condition: condition,
        result: result,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error executing condition:', error);
      throw error;
    }
  };

  const executeDelay = async (node: any, executionId: string) => {
    try {
      console.log(`Executing delay: ${node.data.label}`);
      
      // Extract delay time (simplified)
      const delayText = node.data.label;
      let delayMs = 1000; // Default 1 second
      
      if (delayText.includes('1 Hour')) {
        delayMs = 1000; // 1 second for demo (would be 3600000 in production)
      } else if (delayText.includes('24 Hours')) {
        delayMs = 2000; // 2 seconds for demo (would be 86400000 in production)
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      return {
        delay: delayText,
        completed: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error executing delay:', error);
      throw error;
    }
  };

  const executeFunction = async (node: any, executionId: string) => {
    try {
      console.log(`Executing function: ${node.data.label}`);
      
      // Simulate function execution
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        function: node.data.label,
        result: `Function ${node.data.label} executed successfully`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error executing function:', error);
      throw error;
    }
  };

  const executeMerge = async (node: any, workflow: WorkflowType, executionId: string) => {
    try {
      console.log(`Executing merge: ${node.data.label}`);
      
      // Collect results from all incoming paths
      const incomingNodes = workflow.edges
        .filter(edge => edge.target === node.id)
        .map(edge => workflow.nodes.find(n => n.id === edge.source))
        .filter(Boolean);
      
      const results = incomingNodes.map(incomingNode => ({
        nodeId: incomingNode.id,
        result: `Merged from ${incomingNode.data.label}`
      }));
      
      return {
        merge: node.data.label,
        mergedResults: results,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error executing merge:', error);
      throw error;
    }
  };

  const executeSplit = async (node: any, workflow: WorkflowType, executionId: string) => {
    try {
      console.log(`Executing split: ${node.data.label}`);
      
      // Find outgoing nodes
      const outgoingEdges = workflow.edges.filter(edge => edge.source === node.id);
      
      return {
        split: node.data.label,
        paths: outgoingEdges.length,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error executing split:', error);
      throw error;
    }
  };

  const getNextNodes = (nodeId: string, workflow: WorkflowType) => {
    const outgoingEdges = workflow.edges.filter(edge => edge.source === nodeId);
    return outgoingEdges.map(edge => 
      workflow.nodes.find(node => node.id === edge.target)
    ).filter(Boolean);
  };

  const updateExecutionStatus = (executionId: string, status: string, data: any = {}) => {
    const execution = workflowExecutions.get(executionId);
    if (execution) {
      execution.status = status;
      execution.endTime = new Date();
      Object.assign(execution, data);
      setWorkflowExecutions(prev => new Map(prev).set(executionId, execution));
    }
  };

  const addExecutionLog = (executionId: string, logEntry: any) => {
    const execution = workflowExecutions.get(executionId);
    if (execution) {
      execution.logs = [...execution.logs, logEntry];
      setWorkflowExecutions(prev => new Map(prev).set(executionId, execution));
    }
  };

  const clearExecutions = () => {
    setWorkflowExecutions(new Map());
  };

  const clearExecutionLogs = (executionId: string) => {
    const execution = workflowExecutions.get(executionId);
    if (execution) {
      execution.logs = [];
      setWorkflowExecutions(prev => new Map(prev).set(executionId, execution));
    }
  };

  const stopExecution = (executionId: string) => {
    const execution = workflowExecutions.get(executionId);
    if (execution) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push('Execution stopped by user');
      addExecutionLog(executionId, {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date(),
        type: 'error',
        message: 'Execution stopped by user',
        details: { stoppedBy: 'user' }
      });
      setWorkflowExecutions(prev => new Map(prev).set(executionId, execution));
    }
  };


  const getOverviewMetrics = () => {
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalInteractions = agents.reduce((sum, agent) => sum + agent.metrics.totalInteractions, 0);
    const successRate = agents.length > 0 
      ? agents.reduce((sum, agent) => sum + agent.metrics.successfulTasks, 0) / 
        agents.reduce((sum, agent) => sum + agent.metrics.totalInteractions, 0) * 100
      : 0;
    const avgResponseTime = agents.length > 0
      ? agents.reduce((sum, agent) => sum + agent.metrics.averageResponseTime, 0) / agents.length
      : 0;

    return {
      activeAgents,
      totalInteractions,
      successRate: Math.round(successRate),
      avgResponseTime: Math.round(avgResponseTime)
    };
  };

  const getRecentActivity = () => {
    // Mock recent activity - in real app, this would come from the database
    return [
      {
        id: '1',
        type: 'agent_created',
        message: 'Aurora agent was created',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        icon: <Bot className="w-4 h-4" />
      },
      {
        id: '2',
        type: 'workflow_executed',
        message: 'Lead qualification workflow completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        icon: <Workflow className="w-4 h-4" />
      },
      {
        id: '3',
        type: 'integration_connected',
        message: 'Slack integration connected',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        icon: <Plug className="w-4 h-4" />
      },
      {
        id: '4',
        type: 'agent_interaction',
        message: 'Vega processed 5 new leads',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        icon: <Mail className="w-4 h-4" />
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const metrics = getOverviewMetrics();
  const recentActivity = getRecentActivity();

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'agents',
      label: 'Active Agents',
      icon: <Bot className="w-5 h-5" />,
      badge: agents.filter(a => a.status === 'active').length
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: <Workflow className="w-5 h-5" />,
      badge: workflows.length
    },
    {
      id: 'console',
      label: 'Live Console',
      icon: <Activity className="w-5 h-5" />,
      badge: workflowExecutions.size,
      highlight: workflowExecutions.size > 0
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Plug className="w-5 h-5" />,
      badge: connectors.length
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      badge: null
    }
  ];

  return (
    <div className={`flex h-screen bg-background ${className}`}>
      {/* Sidebar Navigation */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-foreground">Nexus AI</h2>
                <p className="text-xs text-muted-foreground">Business Suite</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-2 space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start h-12 ${sidebarCollapsed ? 'px-2' : 'px-3'} ${
                item.highlight ? 'border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`${item.highlight ? 'text-blue-500' : ''}`}>
                  {item.icon}
                </div>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== null && item.badge > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setActiveTab('agents')}
          >
            <Plus className="w-4 h-4 mr-2" />
            {!sidebarCollapsed && 'Create Agent'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Header */}
        <div className="p-6 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {navigationItems.find(item => item.id === activeTab)?.label || 'Nexus AI'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === 'overview' && 'Manage your AI agents, workflows, and business automation'}
                {activeTab === 'agents' && 'Create and manage your AI agents'}
                {activeTab === 'workflows' && 'Build and execute automated workflows'}
                {activeTab === 'console' && 'Monitor workflow executions in real-time'}
                {activeTab === 'templates' && 'Browse pre-built workflow templates'}
                {activeTab === 'integrations' && 'Connect external services and APIs'}
                {activeTab === 'reports' && 'View analytics and performance reports'}
                {activeTab === 'settings' && 'Configure your Nexus AI platform'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeAgents}</div>
                <p className="text-xs text-muted-foreground">
                  {agents.length - metrics.activeAgents} inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalInteractions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +2% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  -5% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get started with your AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => setActiveTab('agents')}
                >
                  <Bot className="w-6 h-6 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Create Agent</div>
                    <div className="text-sm text-muted-foreground">Set up a new AI agent</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => setActiveTab('workflows')}
                >
                  <Workflow className="w-6 h-6 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Build Workflow</div>
                    <div className="text-sm text-muted-foreground">Create automation workflow</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => setActiveTab('console')}
                >
                  <Activity className="w-6 h-6 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">Live Console</div>
                    <div className="text-sm text-muted-foreground">
                      Monitor workflow executions
                      {workflowExecutions.size > 0 && (
                        <span className="ml-1 text-blue-500 font-semibold">
                          ({workflowExecutions.size} active)
                        </span>
                      )}
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across your AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Status</CardTitle>
                <CardDescription>
                  Current status of your AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'active' ? 'bg-green-500' : 
                          agent.status === 'inactive' ? 'bg-gray-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{agent.metrics.totalInteractions}</p>
                        <p className="text-xs text-muted-foreground">interactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <AgentManager 
                onAgentSelect={setSelectedAgent}
                selectedAgentId={selectedAgent?.id}
              />
            </div>
          )}

          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Workflow className="w-6 h-6 text-green-500" />
                Workflow Builder
              </h2>
              <p className="text-muted-foreground">
                Create and customize your own workflows with drag-and-drop nodes
              </p>
            </div>
            <Button
              onClick={() => setActiveTab('console')}
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              <Activity className="w-4 h-4 mr-2" />
              View Live Console
            </Button>
          </div>

          <WorkflowBuilder 
            onSave={handleSaveWorkflow}
            onExecute={handleExecuteWorkflow}
              />
            </div>
          )}

          {/* Live Console Tab */}
          {activeTab === 'console' && (
            <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-500" />
                Live Workflow Console
              </h2>
              <p className="text-muted-foreground">
                Monitor and debug workflow executions in real-time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  // Create and run a demo workflow
                  const demoWorkflow = {
                    id: `demo_workflow_${Date.now()}`,
                    name: 'Live Demo Workflow',
                    description: 'A demo workflow to showcase live execution',
                    nodes: [
                      { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'Demo Trigger' }, config: {} },
                      { id: 'agent-1', type: 'agent-action', position: { x: 300, y: 100 }, data: { label: 'Vega: Analyze Demo Data' }, config: {} },
                      { id: 'condition-1', type: 'condition', position: { x: 500, y: 100 }, data: { label: 'Demo Condition > 50?' }, config: {} },
                      { id: 'agent-2', type: 'agent-action', position: { x: 700, y: 100 }, data: { label: 'Aurora: Send Demo Notification' }, config: {} },
                      { id: 'end-1', type: 'end', position: { x: 900, y: 100 }, data: { label: 'Demo Complete' }, config: {} }
                    ],
                    edges: [
                      { id: 'e1', source: 'trigger-1', target: 'agent-1', type: 'default' },
                      { id: 'e2', source: 'agent-1', target: 'condition-1', type: 'default' },
                      { id: 'e3', source: 'condition-1', target: 'agent-2', type: 'default' },
                      { id: 'e4', source: 'agent-2', target: 'end-1', type: 'default' }
                    ],
                    triggers: [],
                    status: 'draft',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: 'current-user',
                    executions: []
                  };
                  setWorkflows(prev => [...prev, demoWorkflow]);
                  handleExecuteWorkflow(demoWorkflow.id);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Live Demo
              </Button>
            </div>
          </div>

          <WorkflowExecutionConsole
            executions={workflowExecutions}
            onClearExecutions={clearExecutions}
            onClearLogs={clearExecutionLogs}
            onStopExecution={stopExecution}
            />
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Template Library</h3>
            <p className="text-muted-foreground mb-4">
              Pre-built workflow templates for common business processes
            </p>
            <Button>Browse Templates</Button>
          </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
          <div className="text-center py-12">
            <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Integrations</h3>
            <p className="text-muted-foreground mb-4">
              Connect your favorite business tools and services
            </p>
            <Button>Connect Service</Button>
          </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-muted-foreground mb-4">
              Detailed insights into your AI agents' performance
            </p>
            <Button>Generate Report</Button>
          </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground mb-4">
              Configure your Nexus AI platform preferences
            </p>
            <Button>Open Settings</Button>
          </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
