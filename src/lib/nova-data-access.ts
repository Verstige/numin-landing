// Nova AI Comprehensive Data Access System
// This system allows Nova AI to access and analyze all user data across the platform

export interface UserDataSnapshot {
  timestamp: Date;
  userId: string;
  projects: ProjectData[];
  emails: EmailData[];
  crm: CRMData;
  tasks: TaskData[];
  teamMembers: TeamMemberData[];
  notes: NoteData[];
  activities: ActivityData[];
  settings: UserSettings;
  aiInsights: AIInsights;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate?: Date;
  endDate?: Date;
  teamId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  budget?: number;
  client?: string;
  milestones: MilestoneData[];
  risks: RiskData[];
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dependencies: string[];
  subtasks: TaskData[];
}

export interface EmailData {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  folder: string;
  tags: string[];
  attachments?: string[];
  threadId?: string;
  replyTo?: string;
  aiAnalysis?: {
    sentiment: 'positive' | 'negative' | 'neutral' | 'urgent';
    priority: 'high' | 'medium' | 'low';
    intent: 'question' | 'request' | 'complaint' | 'proposal' | 'follow-up' | 'general';
    category: 'business' | 'personal' | 'marketing' | 'support' | 'sales';
    keyPoints: string[];
    entities: {
      people: string[];
      companies: string[];
      dates: string[];
      amounts: string[];
      topics: string[];
    };
    suggestedActions: string[];
  };
}

export interface CRMData {
  contacts: ContactData[];
  deals: DealData[];
  companies: CompanyData[];
  activities: CRMActivityData[];
  pipeline: PipelineData;
  analytics: CRMAnalytics;
}

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  tags: string[];
  notes: string;
  lastContact?: Date;
  createdAt: Date;
  updatedAt: Date;
  deals: string[];
  activities: string[];
}

export interface DealData {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  contactId: string;
  contactName: string;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  source: string;
  tags: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatar?: string;
  projects: string[];
  department?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  lastActive?: Date;
  skills: string[];
  workload: number;
  performance: {
    tasksCompleted: number;
    averageCompletionTime: number;
    rating: number;
  };
}

export interface NoteData {
  id: string;
  title: string;
  content: string;
  type: 'personal' | 'project' | 'meeting' | 'idea';
  projectId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isShared: boolean;
  sharedWith: string[];
}

export interface ActivityData {
  id: string;
  type: 'project' | 'task' | 'email' | 'meeting' | 'note' | 'system';
  action: string;
  description: string;
  userId: string;
  userName: string;
  projectId?: string;
  taskId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    projectUpdates: boolean;
  };
  preferences: {
    defaultView: string;
    autoSave: boolean;
    timezone: string;
    language: string;
  };
  integrations: {
    gmail: boolean;
    calendar: boolean;
    slack: boolean;
    github: boolean;
  };
}

export interface AIInsights {
  productivity: {
    focusTime: number;
    taskCompletionRate: number;
    emailResponseTime: number;
    meetingEfficiency: number;
  };
  trends: {
    projectProgress: number[];
    taskCompletion: number[];
    emailVolume: number[];
    teamCollaboration: number[];
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    actionRequired: boolean;
  }[];
  alerts: {
    type: 'warning' | 'info' | 'success' | 'error';
    message: string;
    timestamp: Date;
    actionRequired: boolean;
  }[];
}

// Additional interfaces for comprehensive data
export interface MilestoneData {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  progress: number;
  dependencies: string[];
}

export interface RiskData {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'open' | 'mitigated' | 'closed';
  mitigationPlan?: string;
}

export interface CompanyData {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  phone?: string;
  address?: string;
  contacts: string[];
  deals: string[];
  notes: string;
  tags: string[];
}

export interface CRMActivityData {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  description: string;
  contactId: string;
  dealId?: string;
  userId: string;
  timestamp: Date;
  duration?: number;
  outcome?: string;
}

export interface PipelineData {
  stages: {
    id: string;
    name: string;
    deals: string[];
    value: number;
  }[];
  totalValue: number;
  conversionRates: Record<string, number>;
}

export interface CRMAnalytics {
  totalContacts: number;
  activeDeals: number;
  totalValue: number;
  conversionRate: number;
  averageDealSize: number;
  salesVelocity: number;
  topSources: { source: string; count: number }[];
  topPerformers: { userId: string; name: string; value: number }[];
}

// Nova AI Data Access Class
export class NovaDataAccess {
  private userData: UserDataSnapshot | null = null;
  private lastUpdate: Date | null = null;

  constructor(private userId: string) {}

  // Get comprehensive user data snapshot
  async getUserDataSnapshot(): Promise<UserDataSnapshot> {
    if (this.userData && this.lastUpdate && 
        (Date.now() - this.lastUpdate.getTime()) < 30000) { // Cache for 30 seconds
      return this.userData;
    }

    const snapshot: UserDataSnapshot = {
      timestamp: new Date(),
      userId: this.userId,
      projects: await this.getProjectsData(),
      emails: await this.getEmailsData(),
      crm: await this.getCRMData(),
      tasks: await this.getTasksData(),
      teamMembers: await this.getTeamMembersData(),
      notes: await this.getNotesData(),
      activities: await this.getActivitiesData(),
      settings: await this.getUserSettings(),
      aiInsights: await this.generateAIInsights()
    };

    this.userData = snapshot;
    this.lastUpdate = new Date();
    return snapshot;
  }

  // Alias for backwards compatibility
  async getCompleteUserData(): Promise<UserDataSnapshot> {
    return this.getUserDataSnapshot();
  }

  // Get all projects data
  private async getProjectsData(): Promise<ProjectData[]> {
    // Load from localStorage with user-specific key (same as main app)
    const userId = this.userId || 'anonymous';
    const savedProjects = localStorage.getItem(`userProjects_${userId}`);
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    
    // Convert to ProjectData format
    return projects.map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      progress: 0, // Start with 0% progress
      startDate: project.startDate ? new Date(project.startDate) : new Date(),
      endDate: project.endDate ? new Date(project.endDate) : new Date(),
      teamId: project.teamId || '',
      createdBy: this.userId,
      createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
      updatedAt: new Date(),
      tags: project.tags || [],
      category: project.category || 'general',
      budget: project.budget || 0,
      client: project.client || '',
      milestones: [],
      risks: []
    }));
  }

  // Get all emails data
  private async getEmailsData(): Promise<EmailData[]> {
    // TODO: Integrate with actual email system
    return [];
  }

  // Get CRM data
  private async getCRMData(): Promise<CRMData> {
    // TODO: Integrate with actual CRM system
    return {
      contacts: [
        {
          id: 'c1',
          name: 'John Smith',
          email: 'john.smith@techcorp.com',
          phone: '+1-555-0123',
          company: 'TechCorp',
          position: 'CTO',
          source: 'Website',
          status: 'prospect',
          tags: ['enterprise', 'ai-interested'],
          notes: 'Very interested in AI integration services',
          lastContact: new Date('2024-01-20'),
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          deals: ['d1'],
          activities: ['a1', 'a2']
        }
      ],
      deals: [
        {
          id: 'd1',
          title: 'AI Integration Services',
          value: 150000,
          stage: 'Proposal',
          probability: 75,
          contactId: 'c1',
          contactName: 'John Smith',
          expectedCloseDate: new Date('2024-03-15'),
          source: 'Website',
          tags: ['enterprise', 'ai'],
          notes: 'Large enterprise deal for AI integration',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        }
      ],
      companies: [
        {
          id: 'co1',
          name: 'TechCorp',
          industry: 'Technology',
          size: '500-1000 employees',
          website: 'techcorp.com',
          phone: '+1-555-0100',
          address: '123 Tech Street, San Francisco, CA',
          contacts: ['c1'],
          deals: ['d1'],
          notes: 'Major technology company interested in AI solutions',
          tags: ['enterprise', 'technology', 'ai-interested']
        }
      ],
      activities: [
        {
          id: 'a1',
          type: 'email',
          subject: 'Initial Contact',
          description: 'Sent project proposal email',
          contactId: 'c1',
          userId: this.userId,
          timestamp: new Date('2024-01-15'),
          outcome: 'Positive response received'
        }
      ],
      pipeline: {
        stages: [
          { id: 's1', name: 'Lead', deals: ['d1'], value: 150000 },
          { id: 's2', name: 'Proposal', deals: [], value: 0 },
          { id: 's3', name: 'Negotiation', deals: [], value: 0 },
          { id: 's4', name: 'Closed Won', deals: [], value: 0 }
        ],
        totalValue: 150000,
        conversionRates: { 'Lead to Proposal': 0.75 }
      },
      analytics: {
        totalContacts: 1,
        activeDeals: 1,
        totalValue: 150000,
        conversionRate: 0.75,
        averageDealSize: 150000,
        salesVelocity: 30,
        topSources: [{ source: 'Website', count: 1 }],
        topPerformers: [{ userId: this.userId, name: 'You', value: 150000 }]
      }
    };

    return {
      contacts: [],
      deals: [],
      companies: [],
      activities: [],
      pipeline: {
        stages: [],
        totalValue: 0,
        conversionRates: {}
      },
      analytics: {
        totalContacts: 0,
        activeDeals: 0,
        totalValue: 0,
        conversionRate: 0,
        averageDealSize: 0,
        salesVelocity: 0,
        topSources: [],
        topPerformers: []
      }
    };
  }

  // Get all tasks data
  private async getTasksData(): Promise<TaskData[]> {
    // TODO: Integrate with actual task management system
    return [];
  }

  // Get team members data
  private async getTeamMembersData(): Promise<TeamMemberData[]> {
    const savedTeamMembers = localStorage.getItem('teamMembers');
    const teamMembers = savedTeamMembers ? JSON.parse(savedTeamMembers) : [];
    
    // Return only actual team members from localStorage
    return teamMembers.map((member: any) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      projects: member.projects || [],
      status: member.status,
      joinedAt: new Date(member.joinedAt),
      lastActive: new Date(member.lastActive),
      skills: member.skills || [],
      workload: member.workload || 0,
      performance: {
        tasksCompleted: member.performance?.tasksCompleted || 0,
        averageCompletionTime: member.performance?.averageCompletionTime || 0,
        rating: member.performance?.rating || 0
      }
    }));
  }

  // Get notes data
  private async getNotesData(): Promise<NoteData[]> {
    // TODO: Integrate with actual notes system
    return [];
  }

  // Get activities data
  private async getActivitiesData(): Promise<ActivityData[]> {
    // TODO: Integrate with actual activity tracking system
    return [];
  }

  // Get user settings
  private async getUserSettings(): Promise<UserSettings> {
    return {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        mentions: true,
        projectUpdates: true
      },
      preferences: {
        defaultView: 'dashboard',
        autoSave: true,
        timezone: 'UTC',
        language: 'en'
      },
      integrations: {
        gmail: true,
        calendar: false,
        slack: false,
        github: false
      }
    };
  }

  // Generate AI insights from all data
  private async generateAIInsights(): Promise<AIInsights> {
    return {
      productivity: {
        focusTime: 6.5, // hours per day
        taskCompletionRate: 0.85,
        emailResponseTime: 2.3, // hours average
        meetingEfficiency: 0.78
      },
      trends: {
        projectProgress: [20, 35, 50, 65, 75], // last 5 weeks
        taskCompletion: [8, 12, 15, 18, 22], // last 5 weeks
        emailVolume: [45, 52, 38, 41, 47], // last 5 weeks
        teamCollaboration: [0.6, 0.7, 0.8, 0.75, 0.85] // last 5 weeks
      },
      recommendations: [
        {
          priority: 'high',
          category: 'Productivity',
          title: 'Focus on High-Priority Tasks',
          description: 'You have 3 high-priority tasks due this week. Consider blocking time for focused work.',
          actionRequired: true
        },
        {
          priority: 'medium',
          category: 'Communication',
          title: 'Follow up on Pending Emails',
          description: 'You have 5 unread emails from important contacts. Consider prioritizing responses.',
          actionRequired: true
        }
      ],
      alerts: [
        {
          type: 'warning',
          message: 'TechCorp proposal deadline approaching (3 days)',
          timestamp: new Date(),
          actionRequired: true
        },
        {
          type: 'info',
          message: 'Weekly productivity increased by 15%',
          timestamp: new Date(),
          actionRequired: false
        }
      ]
    };
  }

  // Get specific data by type
  async getProjects(): Promise<ProjectData[]> {
    const snapshot = await this.getUserDataSnapshot();
    return snapshot.projects;
  }

  async getEmails(): Promise<EmailData[]> {
    const snapshot = await this.getUserDataSnapshot();
    return snapshot.emails;
  }


  async getTasks(): Promise<TaskData[]> {
    const snapshot = await this.getUserDataSnapshot();
    return snapshot.tasks;
  }

  async getTeamMembers(): Promise<TeamMemberData[]> {
    const snapshot = await this.getUserDataSnapshot();
    return snapshot.teamMembers;
  }

  async getNotes(): Promise<NoteData[]> {
    const snapshot = await this.getUserDataSnapshot();
    return snapshot.notes;
  }

  async getActivities(): Promise<ActivityData[]> {
    const snapshot = await this.getUserDataSnapshot();
    return snapshot.activities;
  }

  async getSettings(): Promise<UserSettings> {
    const snapshot = await this.getUserDataSnapshot();
    return snapshot.settings;
  }

  async getAIInsights(): Promise<AIInsights> {
    const snapshot = await this.getUserDataSnapshot();
    return snapshot.aiInsights;
  }

  // Search across all data
  async searchAllData(query: string): Promise<{
    projects: ProjectData[];
    emails: EmailData[];
    tasks: TaskData[];
    notes: NoteData[];
    contacts: ContactData[];
    deals: DealData[];
  }> {
    const snapshot = await this.getUserDataSnapshot();
    const lowerQuery = query.toLowerCase();

    return {
      projects: snapshot.projects.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ),
      emails: snapshot.emails.filter(e =>
        e.subject.toLowerCase().includes(lowerQuery) ||
        e.content.toLowerCase().includes(lowerQuery) ||
        e.from.toLowerCase().includes(lowerQuery) ||
        e.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ),
      tasks: snapshot.tasks.filter(t =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ),
      notes: snapshot.notes.filter(n =>
        n.title.toLowerCase().includes(lowerQuery) ||
        n.content.toLowerCase().includes(lowerQuery) ||
        n.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ),
      contacts: snapshot.crm.contacts.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery) ||
        c.company?.toLowerCase().includes(lowerQuery) ||
        c.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      ),
      deals: snapshot.crm.deals.filter(d =>
        d.title.toLowerCase().includes(lowerQuery) ||
        d.contactName.toLowerCase().includes(lowerQuery) ||
        d.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    };
  }

  // Get data relationships
  async getDataRelationships(): Promise<{
    projectTasks: Record<string, TaskData[]>;
    projectEmails: Record<string, EmailData[]>;
    contactDeals: Record<string, DealData[]>;
    userActivities: Record<string, ActivityData[]>;
  }> {
    const snapshot = await this.getUserDataSnapshot();

    return {
      projectTasks: snapshot.tasks.reduce((acc, task) => {
        if (task.projectId) {
          if (!acc[task.projectId]) acc[task.projectId] = [];
          acc[task.projectId].push(task);
        }
        return acc;
      }, {} as Record<string, TaskData[]>),
      projectEmails: snapshot.emails.reduce((acc, email) => {
        // This would need more sophisticated matching logic
        return acc;
      }, {} as Record<string, EmailData[]>),
      contactDeals: snapshot.crm.deals.reduce((acc, deal) => {
        if (!acc[deal.contactId]) acc[deal.contactId] = [];
        acc[deal.contactId].push(deal);
        return acc;
      }, {} as Record<string, DealData[]>),
      userActivities: snapshot.activities.reduce((acc, activity) => {
        if (!acc[activity.userId]) acc[activity.userId] = [];
        acc[activity.userId].push(activity);
        return acc;
      }, {} as Record<string, ActivityData[]>)
    };
  }
  
  // ===== WORKSPACE ACTIONS =====
  // Methods for Nova AI to create/update workspace data
  
  async createTask(task: Partial<TaskData>): Promise<TaskData> {
    const newTask: TaskData = {
      id: `task-${Date.now()}`,
      title: task.title || 'Untitled Task',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      projectId: task.projectId,
      assignedTo: task.assignedTo,
      createdBy: this.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: task.dueDate,
      tags: task.tags || [],
      dependencies: task.dependencies || [],
      subtasks: task.subtasks || []
    };
    
    // Save to localStorage with user-specific key
    const userId = this.userId || 'anonymous';
    const savedTasks = localStorage.getItem(`userTasks_${userId}`);
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    tasks.push(newTask);
    localStorage.setItem(`userTasks_${userId}`, JSON.stringify(tasks));
    
    // Invalidate cache
    this.userData = null;
    this.lastUpdate = null;
    
    console.log('✅ Nova AI created task:', newTask.title);
    return newTask;
  }
  
  async createNote(note: Partial<NoteData>): Promise<NoteData> {
    const newNote: NoteData = {
      id: `note-${Date.now()}`,
      title: note.title || 'Untitled Note',
      content: note.content || '',
      type: note.type || 'personal',
      projectId: note.projectId,
      tags: note.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: note.isPinned || false,
      isShared: note.isShared || false,
      sharedWith: note.sharedWith || []
    };
    
    // Save to localStorage with user-specific key
    const userId = this.userId || 'anonymous';
    const savedNotes = localStorage.getItem(`userNotes_${userId}`);
    const notes = savedNotes ? JSON.parse(savedNotes) : [];
    notes.push(newNote);
    localStorage.setItem(`userNotes_${userId}`, JSON.stringify(notes));
    
    // Invalidate cache
    this.userData = null;
    this.lastUpdate = null;
    
    console.log('✅ Nova AI created note:', newNote.title);
    return newNote;
  }
  
  async createProject(project: Partial<ProjectData>): Promise<ProjectData> {
    const newProject: ProjectData = {
      id: `project-${Date.now()}`,
      name: project.name || 'Untitled Project',
      description: project.description || '',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      progress: project.progress || 0,
      startDate: project.startDate || new Date(),
      endDate: project.endDate,
      teamId: project.teamId || '',
      createdBy: this.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: project.tags || [],
      category: project.category || 'general',
      budget: project.budget,
      client: project.client,
      milestones: project.milestones || [],
      risks: project.risks || []
    };
    
    // Save to localStorage with user-specific key
    const userId = this.userId || 'anonymous';
    const savedProjects = localStorage.getItem(`userProjects_${userId}`);
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    projects.push(newProject);
    localStorage.setItem(`userProjects_${userId}`, JSON.stringify(projects));
    
    // Invalidate cache
    this.userData = null;
    this.lastUpdate = null;
    
    console.log('✅ Nova AI created project:', newProject.name);
    return newProject;
  }
  
  async updateTask(taskId: string, updates: Partial<TaskData>): Promise<TaskData | null> {
    const userId = this.userId || 'anonymous';
    const savedTasks = localStorage.getItem(`userTasks_${userId}`);
    if (!savedTasks) return null;
    
    const tasks = JSON.parse(savedTasks);
    const taskIndex = tasks.findIndex((t: TaskData) => t.id === taskId);
    if (taskIndex === -1) return null;
    
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date() };
    localStorage.setItem(`userTasks_${userId}`, JSON.stringify(tasks));
    
    // Invalidate cache
    this.userData = null;
    this.lastUpdate = null;
    
    console.log('✅ Nova AI updated task:', taskId);
    return tasks[taskIndex];
  }
  
  async updateProject(projectId: string, updates: Partial<ProjectData>): Promise<ProjectData | null> {
    const userId = this.userId || 'anonymous';
    const savedProjects = localStorage.getItem(`userProjects_${userId}`);
    if (!savedProjects) return null;
    
    const projects = JSON.parse(savedProjects);
    const projectIndex = projects.findIndex((p: ProjectData) => p.id === projectId);
    if (projectIndex === -1) return null;
    
    projects[projectIndex] = { ...projects[projectIndex], ...updates, updatedAt: new Date() };
    localStorage.setItem(`userProjects_${userId}`, JSON.stringify(projects));
    
    // Invalidate cache
    this.userData = null;
    this.lastUpdate = null;
    
    console.log('✅ Nova AI updated project:', projectId);
    return projects[projectIndex];
  }
  
  async deleteTask(taskId: string): Promise<boolean> {
    const userId = this.userId || 'anonymous';
    const savedTasks = localStorage.getItem(`userTasks_${userId}`);
    if (!savedTasks) return false;
    
    const tasks = JSON.parse(savedTasks);
    const filtered = tasks.filter((t: TaskData) => t.id !== taskId);
    
    if (filtered.length === tasks.length) return false;
    
    localStorage.setItem(`userTasks_${userId}`, JSON.stringify(filtered));
    
    // Invalidate cache
    this.userData = null;
    this.lastUpdate = null;
    
    console.log('✅ Nova AI deleted task:', taskId);
    return true;
  }
}

// Export singleton instance
export const novaDataAccess = new NovaDataAccess('user-1');
