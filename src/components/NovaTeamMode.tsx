// Nova Team Mode - Central Coordinator Interface
// Redesigned with proper chat layout and agent integration

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  Crown, 
  TrendingUp, 
  Users, 
  Target, 
  Gauge,
  Brain,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Network,
  Zap,
  MessageSquare
} from 'lucide-react';

// Message renderer component for formatting text with markdown-like syntax
const MessageRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  const formatText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        const boldText = part.slice(2, -2);
        return <strong key={partIndex} className="font-semibold text-white">{boldText}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        // Italic text
        const italicText = part.slice(1, -1);
        return <em key={partIndex} className="italic text-gray-300">{italicText}</em>;
      } else {
        // Regular text
        return <span key={partIndex}>{part}</span>;
      }
    });
  };
  
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();
        
        // Check if it's a list item (starts with number or bullet)
        if (/^\d+\.\s/.test(trimmedParagraph) || /^\*\s/.test(trimmedParagraph)) {
          return (
            <div key={index} className="leading-relaxed pl-2">
              <div className="flex">
                <span className="text-gray-400 mr-2 flex-shrink-0">
                  {trimmedParagraph.match(/^\d+\./) ? 
                    trimmedParagraph.match(/^\d+\./)?.[0] : 
                    '•'
                  }
                </span>
                <div className="flex-1">
                  {formatText(trimmedParagraph.replace(/^(\d+\.|\*)\s/, ''))}
                </div>
              </div>
            </div>
          );
        }
        
        // Regular paragraph
        return (
          <div key={index} className="leading-relaxed">
            {formatText(trimmedParagraph)}
          </div>
        );
      })}
    </div>
  );
};

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: 'active' | 'busy' | 'available' | 'offline';
  workload: number;
  recentActivity: string;
}

interface TeamMessage {
  id: string;
  role: 'user' | 'nova';
  content: string;
  timestamp: Date;
  involvedAgents?: string[];
  suggestions?: TeamSuggestion[];
}

interface TeamSuggestion {
  id: string;
  type: 'delegate' | 'collaborate' | 'analyze' | 'schedule';
  agentIds: string[];
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface NovaTeamModeProps {
  className?: string;
}

export default function NovaTeamMode({ className }: NovaTeamModeProps) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(true);
  const [agentProfiles] = useState<AgentProfile[]>([
    {
      id: 'aurora',
      name: 'Aurora',
      role: 'Executive Assistant',
      description: 'Project coordination & executive support',
      icon: <Crown className="w-4 h-4" />,
      color: 'text-purple-500',
      status: 'active',
      workload: 65,
      recentActivity: 'Coordinated Q4 planning meeting'
    },
    {
      id: 'vega',
      name: 'Vega',
      role: 'Sales Representative',
      description: 'Lead management & sales automation',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-blue-500',
      status: 'active',
      workload: 45,
      recentActivity: 'Qualified 12 new leads'
    },
    {
      id: 'luma',
      name: 'Luma',
      role: 'Customer Support',
      description: 'Customer service & issue resolution',
      icon: <Users className="w-4 h-4" />,
      color: 'text-green-500',
      status: 'available',
      workload: 30,
      recentActivity: 'Resolved 8 support tickets'
    },
    {
      id: 'orion',
      name: 'Orion',
      role: 'Marketing Strategist',
      description: 'Campaign strategy & content creation',
      icon: <Target className="w-4 h-4" />,
      color: 'text-orange-500',
      status: 'busy',
      workload: 80,
      recentActivity: 'Created Q4 campaign strategy'
    },
    {
      id: 'titan',
      name: 'Titan',
      role: 'Operations Manager',
      description: 'Process optimization & performance monitoring',
      icon: <Gauge className="w-4 h-4" />,
      color: 'text-slate-500',
      status: 'active',
      workload: 55,
      recentActivity: 'Optimized 3 workflows'
    }
  ]);
  

  useEffect(() => {
    initializeChat();
  }, []);

  // Add scroll event listener to detect manual scrolling
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShouldScroll(isNearBottom);
      };

      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Only scroll to bottom when new messages are added and scrolling is enabled
  useEffect(() => {
    if (messages.length > 0 && shouldScroll) {
      // Use a small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages.length, shouldScroll]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const initializeChat = () => {
    const welcomeMessage: TeamMessage = {
      id: 'welcome',
      role: 'nova',
      content: `Hello! I'm Nova, your central AI coordinator. I can coordinate complex tasks between all your AI agents.

**Your AI Team:**
• **Aurora** - Executive coordination & strategic oversight
• **Vega** - Sales pipeline & lead management  
• **Luma** - Customer support & issue resolution
• **Orion** - Marketing strategy & campaign execution
• **Titan** - Operations & process optimization

What would you like me to coordinate for you?`,
      timestamp: new Date(),
      suggestions: [
        {
          id: 'analyze-performance',
          type: 'analyze',
          agentIds: ['aurora', 'titan'],
          description: 'Analyze current project performance and identify optimization opportunities',
          priority: 'medium'
        },
        {
          id: 'sales-marketing',
          type: 'collaborate',
          agentIds: ['vega', 'orion'],
          description: 'Coordinate sales and marketing alignment for Q4 campaigns',
          priority: 'high'
        },
        {
          id: 'support-optimization',
          type: 'delegate',
          agentIds: ['luma'],
          description: 'Review and optimize customer support processes',
          priority: 'low'
        }
      ]
    };
    setMessages([welcomeMessage]);
  };

  const analyzeQuery = (query: string) => {
    const queryLower = query.toLowerCase();
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

    return { domains, recommendedAgents };
  };

  const generateNovaResponse = (query: string, analysis: any): TeamMessage => {
    const { domains, recommendedAgents } = analysis;
    const coordinationNeeded = recommendedAgents.length > 1;

    let content = `**Analysis:** ${query}\n\n`;
    
    if (domains.length > 0) {
      content += `**Domains:** ${domains.join(', ')}\n`;
    }

    content += `\n**Coordination Plan:**\n`;
    
    if (coordinationNeeded) {
      content += `This requires multi-agent coordination:\n\n`;
      recommendedAgents.forEach((agentId: string) => {
        const agent = agentProfiles.find(a => a.id === agentId);
        if (agent) {
          content += `• **${agent.name}** - ${agent.description}\n`;
        }
      });
      content += `\nI'll orchestrate seamless coordination between these agents.`;
    } else {
      const primaryAgent = agentProfiles.find(a => a.id === recommendedAgents[0]);
      if (primaryAgent) {
        content += `This task is best handled by **${primaryAgent.name}**.\n\n`;
        content += `I'll delegate this to ${primaryAgent.name} and coordinate with other agents as needed.`;
      }
    }

    return {
      id: `nova-${Date.now()}`,
      role: 'nova',
      content,
      timestamp: new Date(),
      involvedAgents: recommendedAgents
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: TeamMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const analysis = analyzeQuery(input);
      const novaResponse = generateNovaResponse(input, analysis);
      setMessages(prev => [...prev, novaResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: TeamSuggestion) => {
    const suggestionText = `I'd like to ${suggestion.description.toLowerCase()}. Can you coordinate this between ${suggestion.agentIds.map(id => agentProfiles.find(a => a.id === id)?.name).join(' and ')}?`;
    setInput(suggestionText);
  };

  const getAgentIcon = (agentId: string) => {
    const agent = agentProfiles.find(a => a.id === agentId);
    return agent?.icon || <Bot className="w-4 h-4" />;
  };

  const getAgentColor = (agentId: string) => {
    const agent = agentProfiles.find(a => a.id === agentId);
    return agent?.color || 'text-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'available': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background min-h-0 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Team Mode - AI Coordinator</h2>
            <p className="text-sm text-muted-foreground">Coordinate and orchestrate all your AI agents</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {agentProfiles.filter(a => a.status === 'active').length} Agents Active
        </Badge>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Message Header */}
                    {message.role === 'nova' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Nova</span>
                        {message.involvedAgents && message.involvedAgents.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Coordinating:</span>
                            {message.involvedAgents.map((agentId) => (
                              <div key={agentId} className={`flex items-center gap-1 ${getAgentColor(agentId)}`}>
                                {getAgentIcon(agentId)}
                                <span className="text-xs font-medium">
                                  {agentProfiles.find(a => a.id === agentId)?.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/50 text-foreground border border-border'
                    }`}>
                      <div className="text-sm">
                        <MessageRenderer content={message.content} />
                      </div>
                    </div>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion) => (
                          <Button
                            key={suggestion.id}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs h-auto py-2 hover:bg-primary/10"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <div className="flex items-center gap-2">
                              {suggestion.agentIds.map((agentId) => (
                                <div key={agentId} className={getAgentColor(agentId)}>
                                  {getAgentIcon(agentId)}
                                </div>
                              ))}
                              <span>{suggestion.description}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div className={`text-xs text-muted-foreground mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Nova</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="w-4 h-4 animate-spin" />
                        Analyzing request and coordinating agents...
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              </div>
            </ScrollArea>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-background">
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask Nova to coordinate your AI agents..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Agent Status Panel */}
        <div className="w-80 border-l border-border bg-muted/20 flex flex-col min-h-0">
          <div className="flex-shrink-0 p-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Agent Status</h3>
          </div>
          
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-3">
              {agentProfiles.map((agent) => (
                <div key={agent.id} className="bg-background rounded-lg p-3 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`${agent.color} w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center`}>
                        {agent.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                      <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Workload</span>
                      <span className="text-foreground font-medium">{agent.workload}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          agent.workload > 80 ? 'bg-red-500' : 
                          agent.workload > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${agent.workload}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Recent Activity:</div>
                    <div className="text-xs text-foreground leading-relaxed">
                      {agent.recentActivity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}