// Enhanced Nova AI Intelligence System
// This system provides comprehensive AI assistance across all user data

import { novaDataAccess, type UserDataSnapshot, type ProjectData, type EmailData, type CRMData, type TaskData, type TeamMemberData, type NoteData, type ActivityData, type AIInsights } from './nova-data-access';

export interface NovaContext {
  userData: UserDataSnapshot;
  currentFocus?: 'projects' | 'emails' | 'crm' | 'tasks' | 'overview';
  recentActivity?: ActivityData[];
  userIntent?: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    dataTypes?: string[];
    entities?: string[];
    actions?: string[];
  };
  suggestions?: ActionSuggestion[];
}

export interface ActionSuggestion {
  id: string;
  type: 'create' | 'update' | 'analyze' | 'navigate' | 'automate';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dataType: string;
  action?: () => void;
  confidence: number;
}

export interface NovaInsight {
  type: 'trend' | 'alert' | 'recommendation' | 'pattern' | 'opportunity';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  data: any;
  actionable: boolean;
  confidence: number;
  timestamp: Date;
}

export class NovaAIIntelligence {
  private context: NovaContext | null = null;
  private insights: NovaInsight[] = [];

  constructor() {}

  // Initialize Nova with comprehensive user data
  async initialize(userId: string): Promise<NovaContext> {
    const userData = await novaDataAccess.getUserDataSnapshot();
    const recentActivity = await this.getRecentActivity();
    
    this.context = {
      userData,
      currentFocus: 'overview',
      recentActivity,
      conversationHistory: []
    };

    // Generate initial insights
    await this.generateInitialInsights();
    
    return this.context;
  }

  // Generate comprehensive AI response
  async generateResponse(userMessage: string, context?: Partial<NovaContext>): Promise<{
    response: string;
    suggestions: ActionSuggestion[];
    insights: NovaInsight[];
    dataContext: any;
  }> {
    if (!this.context) {
      await this.initialize('user-1');
    }

    const message = userMessage.toLowerCase();
    const userData = this.context!.userData;

    // Analyze user intent
    const intent = this.analyzeIntent(userMessage);
    
    // Generate contextual response based on intent and data
    let response = '';
    let suggestions: ActionSuggestion[] = [];
    let insights: NovaInsight[] = [];
    let dataContext: any = {};

    // Route to specific handlers based on intent
    if (intent.includes('project') || intent.includes('task')) {
      const result = await this.handleProjectTaskQuery(userMessage, userData);
      response = result.response;
      suggestions = result.suggestions;
      insights = result.insights;
      dataContext = result.dataContext;
    } else if (intent.includes('email') || intent.includes('message')) {
      const result = await this.handleEmailQuery(userMessage, userData);
      response = result.response;
      suggestions = result.suggestions;
      insights = result.insights;
      dataContext = result.dataContext;
    } else if (intent.includes('crm') || intent.includes('contact') || intent.includes('deal')) {
      const result = await this.handleCRMQuery(userMessage, userData);
      response = result.response;
      suggestions = result.suggestions;
      insights = result.insights;
      dataContext = result.dataContext;
    } else if (intent.includes('overview') || intent.includes('summary') || intent.includes('dashboard')) {
      const result = await this.handleOverviewQuery(userMessage, userData);
      response = result.response;
      suggestions = result.suggestions;
      insights = result.insights;
      dataContext = result.dataContext;
    } else if (intent.includes('search') || intent.includes('find')) {
      const result = await this.handleSearchQuery(userMessage, userData);
      response = result.response;
      suggestions = result.suggestions;
      insights = result.insights;
      dataContext = result.dataContext;
    } else {
      const result = await this.handleGeneralQuery(userMessage, userData);
      response = result.response;
      suggestions = result.suggestions;
      insights = result.insights;
      dataContext = result.dataContext;
    }

    // Update conversation history
    this.context!.conversationHistory = this.context!.conversationHistory || [];
    this.context!.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      context: { dataTypes: Object.keys(dataContext), entities: this.extractEntities(userMessage) }
    });

    this.context!.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      suggestions,
      context: { dataTypes: Object.keys(dataContext) }
    });

    return { response, suggestions, insights, dataContext };
  }

  // Handle project and task related queries
  private async handleProjectTaskQuery(userMessage: string, userData: UserDataSnapshot): Promise<any> {
    const projects = userData.projects;
    const tasks = userData.tasks;
    const activities = userData.activities;

    const activeProjects = projects.filter(p => p.status === 'active');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress');
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');

    let response = '';
    let suggestions: ActionSuggestion[] = [];
    let insights: NovaInsight[] = [];
    let dataContext: any = {};

    if (userMessage.includes('progress') || userMessage.includes('status')) {
      const totalProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;
      
      response = `## 📊 Project Overview

**Overall Progress:** ${totalProgress.toFixed(1)}% across ${projects.length} projects

### Active Projects (${activeProjects.length})
${activeProjects.map(p => `• **${p.name}**: ${p.progress}% complete (${p.priority} priority)`).join('\n')}

### Task Summary
• **Completed:** ${completedTasks.length} tasks
• **Pending:** ${pendingTasks.length} tasks
• **Overdue:** ${overdueTasks.length} tasks

### Recent Activity
${activities.slice(0, 5).map(a => `• ${a.description} (${this.formatTimeAgo(a.timestamp)})`).join('\n')}`;

      suggestions = [
        {
          id: 'focus-overdue',
          type: 'analyze',
          title: 'Review Overdue Tasks',
          description: `${overdueTasks.length} tasks are overdue and need attention`,
          priority: overdueTasks.length > 0 ? 'high' : 'low',
          category: 'Productivity',
          dataType: 'tasks',
          confidence: 0.9
        },
        {
          id: 'schedule-review',
          type: 'create',
          title: 'Schedule Project Review',
          description: 'Set up a meeting to review project progress',
          priority: 'medium',
          category: 'Planning',
          dataType: 'projects',
          confidence: 0.8
        }
      ];

      dataContext = { projects, tasks, activities };
    } else if (userMessage.includes('priority') || userMessage.includes('urgent')) {
      const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
      
      response = `## 🚨 High Priority Items

**High Priority Tasks (${highPriorityTasks.length}):**
${highPriorityTasks.map(t => `• **${t.title}** (${t.status}) - Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}`).join('\n')}

**High Priority Projects (${projects.filter(p => p.priority === 'high' || p.priority === 'urgent').length}):**
${projects.filter(p => p.priority === 'high' || p.priority === 'urgent').map(p => `• **${p.name}** - ${p.progress}% complete`).join('\n')}`;

      suggestions = [
        {
          id: 'focus-high-priority',
          type: 'update',
          title: 'Focus on High Priority Tasks',
          description: 'Block time for high-priority items',
          priority: 'high',
          category: 'Productivity',
          dataType: 'tasks',
          confidence: 0.95
        }
      ];

      dataContext = { highPriorityTasks, highPriorityProjects: projects.filter(p => p.priority === 'high' || p.priority === 'urgent') };
    } else {
      response = `I can help you with your projects and tasks. You currently have:
• **${projects.length}** projects (${activeProjects.length} active)
• **${tasks.length}** total tasks
• **${completedTasks.length}** completed tasks

What would you like to know about your projects or tasks?`;

      suggestions = [
        {
          id: 'project-status',
          type: 'analyze',
          title: 'View Project Status',
          description: 'Get detailed status of all projects',
          priority: 'medium',
          category: 'Analysis',
          dataType: 'projects',
          confidence: 0.8
        },
        {
          id: 'task-overview',
          type: 'analyze',
          title: 'View Task Overview',
          description: 'See all tasks and their status',
          priority: 'medium',
          category: 'Analysis',
          dataType: 'tasks',
          confidence: 0.8
        }
      ];

      dataContext = { projects, tasks };
    }

    return { response, suggestions, insights, dataContext };
  }

  // Handle email related queries
  private async handleEmailQuery(userMessage: string, userData: UserDataSnapshot): Promise<any> {
    const emails = userData.emails;
    const unreadEmails = emails.filter(e => !e.isRead);
    const importantEmails = emails.filter(e => e.isImportant);
    const starredEmails = emails.filter(e => e.isStarred);

    let response = '';
    let suggestions: ActionSuggestion[] = [];
    let insights: NovaInsight[] = [];
    let dataContext: any = {};

    if (userMessage.includes('unread') || userMessage.includes('inbox')) {
      response = `## 📧 Email Inbox Summary

**Unread Emails:** ${unreadEmails.length}
${unreadEmails.slice(0, 5).map(e => `• **${e.subject}** from ${e.from} (${this.formatTimeAgo(e.timestamp)})`).join('\n')}

**Important Emails:** ${importantEmails.length}
${importantEmails.slice(0, 3).map(e => `• **${e.subject}** - ${e.aiAnalysis?.priority || 'medium'} priority`).join('\n')}`;

      suggestions = [
        {
          id: 'respond-urgent',
          type: 'create',
          title: 'Respond to Urgent Emails',
          description: 'Reply to high-priority emails first',
          priority: 'high',
          category: 'Communication',
          dataType: 'emails',
          confidence: 0.9
        },
        {
          id: 'ai-drafts',
          type: 'automate',
          title: 'Generate AI Drafts',
          description: 'Use AI to generate response drafts',
          priority: 'medium',
          category: 'AI Assistant',
          dataType: 'emails',
          confidence: 0.8
        }
      ];

      dataContext = { unreadEmails, importantEmails };
    } else if (userMessage.includes('sentiment') || userMessage.includes('analysis')) {
      const analyzedEmails = emails.filter(e => e.aiAnalysis);
      const positiveEmails = analyzedEmails.filter(e => e.aiAnalysis?.sentiment === 'positive');
      const negativeEmails = analyzedEmails.filter(e => e.aiAnalysis?.sentiment === 'negative');

      response = `## 📊 Email Analysis

**Sentiment Breakdown:**
• **Positive:** ${positiveEmails.length} emails
• **Negative:** ${negativeEmails.length} emails
• **Neutral:** ${analyzedEmails.length - positiveEmails.length - negativeEmails.length} emails

**Recent AI Insights:**
${analyzedEmails.slice(0, 3).map(e => `• **${e.subject}**: ${e.aiAnalysis?.sentiment} sentiment, ${e.aiAnalysis?.intent} intent`).join('\n')}`;

      suggestions = [
        {
          id: 'analyze-trends',
          type: 'analyze',
          title: 'Analyze Email Trends',
          description: 'Get deeper insights into email patterns',
          priority: 'medium',
          category: 'Analytics',
          dataType: 'emails',
          confidence: 0.8
        }
      ];

      dataContext = { analyzedEmails, sentimentData: { positive: positiveEmails.length, negative: negativeEmails.length } };
    } else {
      response = `I can help you with your emails. You currently have:
• **${emails.length}** total emails
• **${unreadEmails.length}** unread emails
• **${importantEmails.length}** important emails

What would you like to know about your emails?`;

      suggestions = [
        {
          id: 'check-inbox',
          type: 'analyze',
          title: 'Check Inbox',
          description: 'Review unread and important emails',
          priority: 'medium',
          category: 'Communication',
          dataType: 'emails',
          confidence: 0.8
        },
        {
          id: 'email-analysis',
          type: 'analyze',
          title: 'Email Analysis',
          description: 'Get AI insights on email sentiment and patterns',
          priority: 'low',
          category: 'Analytics',
          dataType: 'emails',
          confidence: 0.7
        }
      ];

      dataContext = { emails, unreadEmails, importantEmails };
    }

    return { response, suggestions, insights, dataContext };
  }

  // Handle CRM related queries
  private async handleCRMQuery(userMessage: string, userData: UserDataSnapshot): Promise<any> {
    const crm = userData.crm;
    const contacts = crm.contacts;
    const deals = crm.deals;
    const activeDeals = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');

    let response = '';
    let suggestions: ActionSuggestion[] = [];
    let insights: NovaInsight[] = [];
    let dataContext: any = {};

    if (userMessage.includes('pipeline') || userMessage.includes('deals')) {
      const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
      const avgDealSize = totalValue / deals.length || 0;

      response = `## 💼 Sales Pipeline

**Active Deals:** ${activeDeals.length}
**Total Pipeline Value:** $${totalValue.toLocaleString()}
**Average Deal Size:** $${avgDealSize.toLocaleString()}

### Top Deals:
${deals.slice(0, 3).map(d => `• **${d.title}** - $${d.value.toLocaleString()} (${d.stage}, ${d.probability}% chance)`).join('\n')}

### Pipeline Stages:
${crm.pipeline.stages.map(s => `• **${s.name}**: ${s.deals.length} deals, $${s.value.toLocaleString()}`).join('\n')}`;

      suggestions = [
        {
          id: 'follow-up-deals',
          type: 'update',
          title: 'Follow up on Deals',
          description: 'Schedule follow-ups for active deals',
          priority: 'high',
          category: 'Sales',
          dataType: 'deals',
          confidence: 0.9
        },
        {
          id: 'analyze-pipeline',
          type: 'analyze',
          title: 'Pipeline Analysis',
          description: 'Get insights on pipeline performance',
          priority: 'medium',
          category: 'Analytics',
          dataType: 'deals',
          confidence: 0.8
        }
      ];

      dataContext = { deals, pipeline: crm.pipeline };
    } else if (userMessage.includes('contact') || userMessage.includes('leads')) {
      const prospects = contacts.filter(c => c.status === 'prospect');
      const customers = contacts.filter(c => c.status === 'customer');

      response = `## 👥 Contact Overview

**Total Contacts:** ${contacts.length}
• **Prospects:** ${prospects.length}
• **Customers:** ${customers.length}

### Recent Contacts:
${contacts.slice(0, 5).map(c => `• **${c.name}** (${c.company}) - ${c.status} (${c.source})`).join('\n')}

### Top Sources:
${crm.analytics.topSources.map(s => `• **${s.source}**: ${s.count} contacts`).join('\n')}`;

      suggestions = [
        {
          id: 'nurture-prospects',
          type: 'create',
          title: 'Nurture Prospects',
          description: 'Create follow-up campaigns for prospects',
          priority: 'medium',
          category: 'Sales',
          dataType: 'contacts',
          confidence: 0.8
        },
        {
          id: 'add-contact',
          type: 'create',
          title: 'Add New Contact',
          description: 'Add a new contact to the CRM',
          priority: 'low',
          category: 'Data Entry',
          dataType: 'contacts',
          confidence: 0.9
        }
      ];

      dataContext = { contacts, prospects, customers };
    } else {
      response = `I can help you with your CRM data. You currently have:
• **${contacts.length}** contacts
• **${deals.length}** deals
• **$${crm.analytics.totalValue.toLocaleString()}** total pipeline value

What would you like to know about your sales pipeline or contacts?`;

      suggestions = [
        {
          id: 'view-pipeline',
          type: 'analyze',
          title: 'View Sales Pipeline',
          description: 'See all deals and pipeline stages',
          priority: 'medium',
          category: 'Sales',
          dataType: 'deals',
          confidence: 0.8
        },
        {
          id: 'view-contacts',
          type: 'analyze',
          title: 'View Contacts',
          description: 'Browse all contacts and leads',
          priority: 'medium',
          category: 'Sales',
          dataType: 'contacts',
          confidence: 0.8
        }
      ];

      dataContext = { crm, contacts, deals };
    }

    return { response, suggestions, insights, dataContext };
  }

  // Handle overview and dashboard queries
  private async handleOverviewQuery(userMessage: string, userData: UserDataSnapshot): Promise<any> {
    const projects = userData.projects;
    const tasks = userData.tasks;
    const emails = userData.emails;
    const crm = userData.crm;
    const aiInsights = userData.aiInsights;

    const activeProjects = projects.filter(p => p.status === 'active');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const unreadEmails = emails.filter(e => !e.isRead);
    const activeDeals = crm.deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');

    let response = '';
    let suggestions: ActionSuggestion[] = [];
    let insights: NovaInsight[] = [];
    let dataContext: any = {};

    response = `## 🏠 Dashboard Overview

### 📊 Quick Stats
• **Active Projects:** ${activeProjects.length}
• **Completed Tasks:** ${completedTasks.length} this week
• **Unread Emails:** ${unreadEmails.length}
• **Active Deals:** ${activeDeals.length} ($${activeDeals.reduce((sum, d) => sum + d.value, 0).toLocaleString()} pipeline)

### 🎯 Priority Items
${aiInsights.alerts.slice(0, 3).map(alert => `• **${alert.type.toUpperCase()}**: ${alert.message}`).join('\n')}

### 📈 Productivity Insights
• **Focus Time:** ${aiInsights.productivity.focusTime} hours/day
• **Task Completion Rate:** ${(aiInsights.productivity.taskCompletionRate * 100).toFixed(1)}%
• **Email Response Time:** ${aiInsights.productivity.emailResponseTime} hours average

### 💡 Recommendations
${aiInsights.recommendations.slice(0, 3).map(rec => `• **${rec.title}**: ${rec.description}`).join('\n')}`;

    suggestions = [
      {
        id: 'focus-alerts',
        type: 'update',
        title: 'Address Alerts',
        description: `${aiInsights.alerts.filter(a => a.actionRequired).length} alerts need attention`,
        priority: aiInsights.alerts.filter(a => a.actionRequired).length > 0 ? 'high' : 'low',
        category: 'Productivity',
        dataType: 'alerts',
        confidence: 0.9
      },
      {
        id: 'review-recommendations',
        type: 'analyze',
        title: 'Review Recommendations',
        description: 'Check AI recommendations for productivity improvements',
        priority: 'medium',
        category: 'AI Assistant',
        dataType: 'recommendations',
        confidence: 0.8
      }
    ];

      dataContext = { 
        summary: {
          activeProjects: activeProjects.length,
          completedTasks: completedTasks.length,
          unreadEmails: unreadEmails.length,
          activeDeals: activeDeals.length
        },
        insights: aiInsights,
        alerts: aiInsights.alerts,
        recommendations: aiInsights.recommendations
      };

    return { response, suggestions, insights, dataContext };
  }

  // Handle search queries across all data
  private async handleSearchQuery(userMessage: string, userData: UserDataSnapshot): Promise<any> {
    const searchTerm = this.extractSearchTerm(userMessage);
    const searchResults = await novaDataAccess.searchAllData(searchTerm);

    let response = '';
    let suggestions: ActionSuggestion[] = [];
    let insights: NovaInsight[] = [];
    let dataContext: any = {};

    const totalResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);

    response = `## 🔍 Search Results for "${searchTerm}"

**Found ${totalResults} results across your data:**

### 📁 Projects (${searchResults.projects.length})
${searchResults.projects.slice(0, 3).map(p => `• **${p.name}** - ${p.status} (${p.progress}% complete)`).join('\n')}

### 📧 Emails (${searchResults.emails.length})
${searchResults.emails.slice(0, 3).map(e => `• **${e.subject}** from ${e.from}`).join('\n')}

### ✅ Tasks (${searchResults.tasks.length})
${searchResults.tasks.slice(0, 3).map(t => `• **${t.title}** - ${t.status} (${t.priority} priority)`).join('\n')}

### 👥 Contacts (${searchResults.contacts.length})
${searchResults.contacts.slice(0, 3).map(c => `• **${c.name}** at ${c.company}`).join('\n')}

### 💼 Deals (${searchResults.deals.length})
${searchResults.deals.slice(0, 3).map(d => `• **${d.title}** - $${d.value.toLocaleString()}`).join('\n')}`;

    suggestions = [
      {
        id: 'refine-search',
        type: 'analyze',
        title: 'Refine Search',
        description: 'Try more specific search terms',
        priority: 'low',
        category: 'Search',
        dataType: 'all',
        confidence: 0.7
      }
    ];

    dataContext = searchResults;

    return { response, suggestions, insights, dataContext };
  }

  // Handle general queries
  private async handleGeneralQuery(userMessage: string, userData: UserDataSnapshot): Promise<any> {
    let response = '';
    let suggestions: ActionSuggestion[] = [];
    let insights: NovaInsight[] = [];
    let dataContext: any = {};

    if (userMessage.includes('help') || userMessage.includes('what can you do')) {
      response = `## 🤖 Nova AI Assistant

I'm your comprehensive AI assistant with access to all your data across the platform. Here's what I can help you with:

### 📊 **Data Analysis & Insights**
• Analyze project progress and performance
• Review email sentiment and patterns
• Track sales pipeline and CRM metrics
• Monitor task completion and productivity

### 🔍 **Search & Discovery**
• Search across all your data (projects, emails, tasks, contacts, deals)
• Find specific information quickly
• Identify patterns and relationships

### 💡 **Smart Recommendations**
• Suggest productivity improvements
• Recommend next actions based on data
• Identify opportunities and risks
• Provide actionable insights

### 🎯 **Context-Aware Assistance**
• Understand your current focus and priorities
• Provide relevant suggestions based on your data
• Help with decision-making using data insights

### 📈 **Real-time Monitoring**
• Track your productivity metrics
• Monitor important deadlines and alerts
• Provide updates on your business performance

**Try asking me about:**
• "Show me my project progress"
• "What emails need my attention?"
• "How is my sales pipeline looking?"
• "Search for TechCorp"
• "What are my priorities today?"`;

      suggestions = [
        {
          id: 'explore-projects',
          type: 'analyze',
          title: 'Explore Projects',
          description: 'Get detailed insights on your projects',
          priority: 'medium',
          category: 'Projects',
          dataType: 'projects',
          confidence: 0.9
        },
        {
          id: 'check-emails',
          type: 'analyze',
          title: 'Check Emails',
          description: 'Review your email inbox and important messages',
          priority: 'medium',
          category: 'Communication',
          dataType: 'emails',
          confidence: 0.9
        },
        {
          id: 'sales-overview',
          type: 'analyze',
          title: 'Sales Overview',
          description: 'View your CRM and sales pipeline',
          priority: 'medium',
          category: 'Sales',
          dataType: 'crm',
          confidence: 0.9
        }
      ];

      dataContext = { userData };
    } else {
      response = `I'm here to help! I have access to all your data including projects, emails, tasks, CRM, and more. 

What would you like to know about your work? You can ask me about:
• Your projects and tasks
• Email analysis and responses
• Sales pipeline and contacts
• Productivity insights
• Search across all your data

Just ask me anything!`;

      suggestions = [
        {
          id: 'get-started',
          type: 'analyze',
          title: 'Get Started',
          description: 'See what I can help you with',
          priority: 'medium',
          category: 'Getting Started',
          dataType: 'overview',
          confidence: 0.9
        }
      ];

      dataContext = { userData };
    }

    return { response, suggestions, insights, dataContext };
  }

  // Utility methods
  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('project') || lowerMessage.includes('task')) return 'project_task';
    if (lowerMessage.includes('email') || lowerMessage.includes('message')) return 'email';
    if (lowerMessage.includes('crm') || lowerMessage.includes('contact') || lowerMessage.includes('deal')) return 'crm';
    if (lowerMessage.includes('overview') || lowerMessage.includes('summary') || lowerMessage.includes('dashboard')) return 'overview';
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) return 'search';
    
    return 'general';
  }

  private extractEntities(message: string): string[] {
    // Simple entity extraction - could be enhanced with NLP
    const words = message.toLowerCase().split(' ');
    const entities: string[] = [];
    
    // Look for common entity patterns
    words.forEach(word => {
      if (word.includes('@') || word.includes('.com')) entities.push(word);
      if (word.length > 3 && /^[A-Z]/.test(word)) entities.push(word);
    });
    
    return entities;
  }

  private extractSearchTerm(message: string): string {
    // Extract search term from query
    const searchPatterns = [
      /search for (.+)/i,
      /find (.+)/i,
      /look for (.+)/i,
      /show me (.+)/i
    ];
    
    for (const pattern of searchPatterns) {
      const match = message.match(pattern);
      if (match) return match[1].trim();
    }
    
    // If no pattern matches, return the message without common words
    const commonWords = ['search', 'find', 'look', 'show', 'me', 'for', 'the', 'a', 'an'];
    return message.toLowerCase().split(' ').filter(word => !commonWords.includes(word)).join(' ');
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  }

  private async getRecentActivity(): Promise<ActivityData[]> {
    // Get recent activity from user data
    const userData = await novaDataAccess.getUserDataSnapshot();
    return userData.activities.slice(0, 10);
  }

  private async generateInitialInsights(): Promise<void> {
    // Generate initial insights based on user data
    const userData = await novaDataAccess.getUserDataSnapshot();
    
    // Add insights based on data patterns
    this.insights = [
      {
        type: 'recommendation',
        title: 'Focus on High-Priority Tasks',
        description: `You have ${userData.tasks.filter(t => t.priority === 'high').length} high-priority tasks that need attention.`,
        priority: 'high',
        category: 'Productivity',
        data: userData.tasks.filter(t => t.priority === 'high'),
        actionable: true,
        confidence: 0.9,
        timestamp: new Date()
      }
    ];
  }

  // Public methods for external access
  async getInsights(): Promise<NovaInsight[]> {
    return this.insights;
  }

  async getContext(): Promise<NovaContext | null> {
    return this.context;
  }

  async updateContext(updates: Partial<NovaContext>): Promise<void> {
    if (this.context) {
      this.context = { ...this.context, ...updates };
    }
  }
}

// Export singleton instance
export const novaAI = new NovaAIIntelligence();
