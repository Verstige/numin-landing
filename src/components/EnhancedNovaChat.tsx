import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Sparkles, 
  X, 
  MessageSquare, 
  Brain, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  BarChart3,
  Mail,
  Users,
  Briefcase,
  FileText,
  Activity,
  Target,
  Lightbulb,
  ArrowRight,
  Copy,
  Star
} from 'lucide-react';
import { novaAI, type NovaContext, type ChatMessage, type ActionSuggestion, type NovaInsight } from '@/lib/nova-ai-intelligence';
import { novaDataAccess } from '@/lib/nova-data-access';
import { toast } from '@/hooks/use-toast';

interface EnhancedNovaChatProps {
  onClose?: () => void;
  initialFocus?: 'projects' | 'emails' | 'crm' | 'tasks' | 'overview';
  className?: string;
}

export default function EnhancedNovaChat({ 
  onClose, 
  initialFocus = 'overview',
  className = "" 
}: EnhancedNovaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<NovaContext | null>(null);
  const [insights, setInsights] = useState<NovaInsight[]>([]);
  const [showInsights, setShowInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Nova AI
  useEffect(() => {
    initializeNova();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeNova = async () => {
    try {
      const novaContext = await novaAI.initialize('user-1');
      setContext(novaContext);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `# 🤖 Nova AI Assistant

Welcome! I'm your comprehensive AI assistant with access to all your data across the platform.

## 📊 **What I Can See:**
• **${novaContext.userData.projects.length}** projects
• **${novaContext.userData.emails.length}** emails
• **${novaContext.userData.tasks.length}** tasks
• **${novaContext.userData.crm.contacts.length}** contacts
• **${novaContext.userData.crm.deals.length}** deals

## 🎯 **Quick Actions:**
• Ask about your projects: "Show me my project progress"
• Check emails: "What emails need my attention?"
• Review sales: "How is my pipeline looking?"
• Search data: "Search for TechCorp"
• Get insights: "What should I focus on today?"

I have real-time access to all your data and can provide intelligent insights, recommendations, and assistance across your entire workspace.

**What would you like to explore?**`,
        timestamp: new Date(),
        context: { dataTypes: ['projects', 'emails', 'tasks', 'crm'] },
        suggestions: [
          {
            id: 'overview',
            type: 'analyze',
            title: 'Dashboard Overview',
            description: 'Get a comprehensive view of your workspace',
            priority: 'high',
            category: 'Overview',
            dataType: 'all',
            confidence: 0.95
          },
          {
            id: 'projects',
            type: 'analyze',
            title: 'Project Status',
            description: 'Review all your active projects',
            priority: 'medium',
            category: 'Projects',
            dataType: 'projects',
            confidence: 0.9
          },
          {
            id: 'emails',
            type: 'analyze',
            title: 'Email Inbox',
            description: 'Check unread and important emails',
            priority: 'medium',
            category: 'Communication',
            dataType: 'emails',
            confidence: 0.9
          },
          {
            id: 'crm',
            type: 'analyze',
            title: 'Sales Pipeline',
            description: 'View your CRM and active deals',
            priority: 'medium',
            category: 'Sales',
            dataType: 'crm',
            confidence: 0.9
          }
        ]
      };
      
      setMessages([welcomeMessage]);
      
      // Load initial insights
      const initialInsights = await novaAI.getInsights();
      setInsights(initialInsights);
      
    } catch (error) {
      console.error('Error initializing Nova AI:', error);
      toast({
        title: "Error",
        description: "Failed to initialize Nova AI. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !context) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      context: { dataTypes: [], entities: [] }
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await novaAI.generateResponse(input, context);
      
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        context: { dataTypes: Object.keys(response.dataContext) },
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setInsights(prev => [...prev, ...response.insights]);
      
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: ActionSuggestion) => {
    if (isLoading) return;
    
    const query = `Show me ${suggestion.title.toLowerCase()}`;
    setInput(query);
    
    // Auto-send the suggestion
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'pattern': return <BarChart3 className="w-4 h-4" />;
      case 'opportunity': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getDataIcon = (dataType: string) => {
    switch (dataType) {
      case 'projects': return <Briefcase className="w-4 h-4" />;
      case 'emails': return <Mail className="w-4 h-4" />;
      case 'tasks': return <CheckCircle className="w-4 h-4" />;
      case 'crm': return <Users className="w-4 h-4" />;
      case 'contacts': return <Users className="w-4 h-4" />;
      case 'deals': return <Target className="w-4 h-4" />;
      case 'notes': return <FileText className="w-4 h-4" />;
      case 'activities': return <Activity className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Nova AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Comprehensive AI with full data access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
            className="h-8 w-8 p-0"
          >
            <Zap className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Insights Panel */}
      {showInsights && (
        <div className="p-4 border-b border-border bg-chatgpt-card">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
          </div>
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-background/50 rounded border border-border">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">{insight.title}</span>
                    <Badge className={`text-xs ${getInsightColor(insight.priority)} border`}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
              <Card className={`${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-chatgpt-card border-border'
              }`}>
                <CardContent className="p-4">
                  <div className="prose prose-sm max-w-none">
                    <div 
                      className={`${
                        message.role === 'user' ? 'text-white' : 'text-foreground'
                      }`}
                      dangerouslySetInnerHTML={{ 
                        __html: message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>').replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>').replace(/# (.*)/g, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>').replace(/\• (.*)/g, '<div class="flex items-start gap-2 mb-1"><span class="text-blue-500 mt-1">•</span><span>$1</span></div>')
                      }}
                    />
                  </div>
                  
                  {/* Context Tags */}
                  {message.context?.dataTypes && message.context.dataTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {message.context.dataTypes.map((dataType, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {getDataIcon(dataType)}
                          <span className="ml-1">{dataType}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-foreground">Suggested Actions</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {message.suggestions.slice(0, 4).map((suggestion) => (
                          <Button
                            key={suggestion.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="justify-start text-left h-auto p-3 border-border hover:bg-background/50"
                            disabled={isLoading}
                          >
                            <div className="flex items-start gap-2 w-full">
                              <div className="flex-shrink-0 mt-0.5">
                                {getDataIcon(suggestion.dataType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground">{suggestion.title}</div>
                                <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(suggestion.confidence * 100)}% confidence
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Message Actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(message.content)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <Card className="bg-chatgpt-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">
                    <Brain className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Nova is thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Nova about your data, projects, emails, or anything..."
            className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("Show me my project progress")}
            className="text-xs border-border hover:bg-background/50"
          >
            <Briefcase className="w-3 h-3 mr-1" />
            Projects
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("What emails need my attention?")}
            className="text-xs border-border hover:bg-background/50"
          >
            <Mail className="w-3 h-3 mr-1" />
            Emails
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("How is my sales pipeline looking?")}
            className="text-xs border-border hover:bg-background/50"
          >
            <Users className="w-3 h-3 mr-1" />
            CRM
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("What should I focus on today?")}
            className="text-xs border-border hover:bg-background/50"
          >
            <Target className="w-3 h-3 mr-1" />
            Priorities
          </Button>
        </div>
      </div>
    </div>
  );
}
