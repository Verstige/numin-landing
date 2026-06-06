// Integrated AI Agents Interface
// This component provides a unified interface for interacting with all AI agents

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  MessageSquare, 
  Activity, 
  Users, 
  Mail, 
  Calendar,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Zap,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Target,
  Crown,
  Lightbulb,
  Gauge
} from 'lucide-react';
import { aiAgentIntegration } from '@/lib/ai-agent-integration';
import { agentSyncSystem } from '@/lib/agent-sync-system';
import { AIAgent, AgentRole } from '@/types/nexus';
import { AgentWorkspaceContext, CrossAgentMessage } from '@/lib/ai-agent-integration';

interface IntegratedAIAgentsProps {
  className?: string;
}

export default function IntegratedAIAgents({ className }: IntegratedAIAgentsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [agentContexts, setAgentContexts] = useState<Map<string, AgentWorkspaceContext>>(new Map());
  const [crossAgentMessages, setCrossAgentMessages] = useState<CrossAgentMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);

  // Initialize agents on component mount
  useEffect(() => {
    initializeAgents();
    
    // Update sync stats every 10 seconds
    const statsInterval = setInterval(() => {
      setSyncStats(agentSyncSystem.getSyncStatistics());
    }, 10000);

    return () => clearInterval(statsInterval);
  }, []);

  const initializeAgents = async () => {
    try {
      await aiAgentIntegration.initializeAgents();
      const allAgents = aiAgentIntegration.getAllAgents();
      setAgents(allAgents);
      
      // Get contexts for each agent
      const contexts = new Map<string, AgentWorkspaceContext>();
      for (const agent of allAgents) {
        const context = aiAgentIntegration.getAgentContext(agent.id);
        if (context) {
          contexts.set(agent.id, context);
        }
      }
      setAgentContexts(contexts);
      
      setIsInitialized(true);
      console.log('✅ AI agents initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI agents:', error);
    }
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'aurora': return <Crown className="w-5 h-5" />;
      case 'vega': return <TrendingUp className="w-5 h-5" />;
      case 'luma': return <Users className="w-5 h-5" />;
      case 'orion': return <Target className="w-5 h-5" />;
      case 'titan': return <Gauge className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const getAgentColor = (agentId: string) => {
    switch (agentId) {
      case 'aurora': return 'text-purple-600 dark:text-purple-400';
      case 'vega': return 'text-blue-600 dark:text-blue-400';
      case 'luma': return 'text-green-600 dark:text-green-400';
      case 'orion': return 'text-orange-600 dark:text-orange-400';
      case 'titan': return 'text-slate-600 dark:text-slate-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getAgentDescription = (agentId: string) => {
    switch (agentId) {
      case 'aurora': return 'Executive Assistant with full workspace access';
      case 'vega': return 'Sales Representative specializing in CRM and lead management';
      case 'luma': return 'Customer Support Specialist with email and CRM access';
      case 'orion': return 'Marketing Strategist with comprehensive project and analytics access';
      case 'titan': return 'Operations Manager with full workspace oversight';
      default: return 'AI Agent with workspace integration';
    }
  };

  const getAgentCapabilities = (agentId: string) => {
    const context = agentContexts.get(agentId);
    if (!context) return [];

    const capabilities = [];
    
    if (context.permissions.canReadProjects) capabilities.push('Projects');
    if (context.permissions.canReadEmails) capabilities.push('Emails');
    if (context.permissions.canReadCRM) capabilities.push('CRM');
    if (context.permissions.canReadTasks) capabilities.push('Tasks');
    if (context.permissions.canReadTeam) capabilities.push('Team');
    if (context.permissions.canReadNotes) capabilities.push('Notes');
    if (context.permissions.canReadCalendar) capabilities.push('Calendar');
    
    return capabilities;
  };

  const getAgentStats = (agentId: string) => {
    const context = agentContexts.get(agentId);
    if (!context) return { projects: 0, tasks: 0, emails: 0, team: 0 };

    return {
      projects: context.userData.projects.length,
      tasks: context.userData.tasks.length,
      emails: context.userData.emails.length,
      team: context.userData.teamMembers.length
    };
  };

  const handleAgentAction = async (agentId: string, action: string) => {
    try {
      console.log(`🚀 Executing ${action} for agent ${agentId}`);
      // Implement agent actions here
    } catch (error) {
      console.error(`❌ Failed to execute action for agent ${agentId}:`, error);
    }
  };

  const refreshAgentData = async () => {
    try {
      await aiAgentIntegration.updateAgentContexts();
      const allAgents = aiAgentIntegration.getAllAgents();
      setAgents(allAgents);
      
      // Update contexts
      const contexts = new Map<string, AgentWorkspaceContext>();
      for (const agent of allAgents) {
        const context = aiAgentIntegration.getAgentContext(agent.id);
        if (context) {
          contexts.set(agent.id, context);
        }
      }
      setAgentContexts(contexts);
      
      console.log('✅ Agent data refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh agent data:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Integrated AI Agents</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your AI agents are now fully integrated with your workspace. They can access and learn from all your projects, 
          emails, CRM data, tasks, team information, and more to provide intelligent assistance.
        </p>
      </div>

      {/* Sync Status */}
      {syncStats && (
        <Card className="bg-chatgpt-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Synchronization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{agents.length}</div>
                <div className="text-sm text-muted-foreground">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{syncStats.processedEventsCount}</div>
                <div className="text-sm text-muted-foreground">Events Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{syncStats.eventQueueLength}</div>
                <div className="text-sm text-muted-foreground">Pending Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{syncStats.agentEventHistoryCount}</div>
                <div className="text-sm text-muted-foreground">Agent Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Agent Overview</TabsTrigger>
          <TabsTrigger value="communication">Cross-Agent Communication</TabsTrigger>
          <TabsTrigger value="analytics">Agent Analytics</TabsTrigger>
        </TabsList>

        {/* Agent Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Active AI Agents</h2>
            <Button onClick={refreshAgentData} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => {
              const stats = getAgentStats(agent.id);
              const capabilities = getAgentCapabilities(agent.id);
              const context = agentContexts.get(agent.id);

              return (
                <Card key={agent.id} className="group hover:shadow-xl transition-all duration-300 border-border bg-chatgpt-card">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center ${getAgentColor(agent.id)}`}>
                        {getAgentIcon(agent.id)}
                      </div>
                    </div>
                    <CardTitle className={`text-xl ${getAgentColor(agent.id)}`}>
                      {agent.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {getAgentDescription(agent.id)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Capabilities */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Data Access</h4>
                      <div className="flex flex-wrap gap-1">
                        {capabilities.map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Statistics */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Workspace Data</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Projects:</span>
                          <span className="font-medium">{stats.projects}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tasks:</span>
                          <span className="font-medium">{stats.tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emails:</span>
                          <span className="font-medium">{stats.emails}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Team:</span>
                          <span className="font-medium">{stats.team}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Insights */}
                    {context?.memoryContext.crossProjectInsights && context.memoryContext.crossProjectInsights.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Recent Insights</h4>
                        <div className="space-y-1">
                          {context.memoryContext.crossProjectInsights.slice(0, 2).map((insight, index) => (
                            <div key={index} className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                              {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAgentAction(agent.id, 'analyze')}
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Analyze
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedAgent(agent.id)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Cross-Agent Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <h2 className="text-2xl font-semibold">Cross-Agent Communication</h2>
          
          <Card className="bg-chatgpt-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Agent Communication Network
              </CardTitle>
              <CardDescription>
                Monitor how your AI agents communicate and collaborate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Communication Flow Visualization */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center mx-auto mb-2 ${getAgentColor(agent.id)}`}>
                        {getAgentIcon(agent.id)}
                      </div>
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Connected & Learning
                      </div>
                    </div>
                  ))}
                </div>

                {/* Communication Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">5</div>
                    <div className="text-sm text-muted-foreground">Active Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">24/7</div>
                    <div className="text-sm text-muted-foreground">Continuous Learning</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">Real-time</div>
                    <div className="text-sm text-muted-foreground">Data Sync</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-semibold">Agent Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent Performance */}
            <Card className="bg-chatgpt-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Agent Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.map((agent) => {
                    const stats = getAgentStats(agent.id);
                    const totalData = stats.projects + stats.tasks + stats.emails + stats.team;
                    
                    return (
                      <div key={agent.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{agent.name}</span>
                          <span className="text-sm text-muted-foreground">{totalData} items</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((totalData / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card className="bg-chatgpt-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.map((agent) => {
                    const context = agentContexts.get(agent.id);
                    const insights = context?.memoryContext.crossProjectInsights.length || 0;
                    
                    return (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center ${getAgentColor(agent.id)}`}>
                            {getAgentIcon(agent.id)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{insights} insights generated</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-500">Active</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
