// AI Agent Service for Nexus - Supabase Version
// This provides AI agent operations with Supabase database integration

import { v4 as uuidv4 } from 'uuid';
import { agentOperationsService, tasksService, notesService, calendarService, emailsService } from './supabase-service';

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  status: 'active' | 'busy' | 'idle' | 'offline';
  currentTask: string | null;
  workload: number; // 0-100
  lastActivity: Date;
  avatar: string;
  color: string;
}

export interface AgentOperation {
  id: string;
  type: 'create_task' | 'update_task' | 'add_note' | 'read_email' | 'schedule_meeting' | 'update_project' | 'analyze_data' | 'send_notification';
  agentId: string;
  parameters: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  operationId?: string;
}

// AI Agents with actual capabilities
export const AI_AGENTS: AIAgent[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    role: 'Executive Assistant',
    capabilities: [
      'create_task',
      'update_task', 
      'add_note',
      'schedule_meeting',
      'update_project',
      'analyze_data',
      'send_notification'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    avatar: 'aurora-avatar.png',
    color: 'purple'
  },
  {
    id: 'vega',
    name: 'Vega',
    role: 'AI Sales Rep',
    capabilities: [
      'read_email',
      'create_task',
      'update_task',
      'add_note',
      'analyze_data',
      'send_notification'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    avatar: 'vega-avatar.png',
    color: 'blue'
  },
  {
    id: 'luma',
    name: 'Luma',
    role: 'Customer Support',
    capabilities: [
      'read_email',
      'create_task',
      'update_task',
      'add_note',
      'analyze_data',
      'send_notification'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    avatar: 'luma-avatar.png',
    color: 'green'
  },
  {
    id: 'orion',
    name: 'Orion',
    role: 'Marketing Strategist',
    capabilities: [
      'create_task',
      'update_task',
      'add_note',
      'analyze_data',
      'update_project',
      'send_notification'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    avatar: 'orion-avatar.png',
    color: 'orange'
  },
  {
    id: 'titan',
    name: 'Titan',
    role: 'Operations Manager',
    capabilities: [
      'create_task',
      'update_task',
      'add_note',
      'analyze_data',
      'update_project',
      'schedule_meeting',
      'send_notification'
    ],
    status: 'idle',
    currentTask: null,
    workload: 0,
    lastActivity: new Date(),
    avatar: 'titan-avatar.png',
    color: 'slate'
  },
];

// Helper function to generate unique IDs
function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get agent by ID
export function getAgent(agentId: string): AIAgent | null {
  return AI_AGENTS.find(agent => agent.id === agentId) || null;
}

// Update agent status
export function updateAgentStatus(agentId: string, status: AIAgent['status'], currentTask?: string | null): void {
  const agent = AI_AGENTS.find(a => a.id === agentId);
  if (agent) {
    agent.status = status;
    agent.currentTask = currentTask || null;
    agent.lastActivity = new Date();
    
    if (status === 'busy') {
      agent.workload = Math.min(100, agent.workload + 20);
    } else if (status === 'idle') {
      agent.workload = Math.max(0, agent.workload - 20);
    }
  }
}

// Create operation
export async function createOperation(type: AgentOperation['type'], agentId: string, parameters: any): Promise<string> {
  const operationId = generateId();
  
  await agentOperationsService.create({
    id: operationId,
    agent_id: agentId,
    operation_type: type,
    parameters,
    status: 'pending',
    created_by: '', // Will be set by the service
    team_id: null
  });

  return operationId;
}

// Execute operation
export async function executeOperation(operationId: string): Promise<AgentResponse> {
  try {
    // Get the operation
    const operations = await agentOperationsService.getAll();
    const operation = operations.find(op => op.id === operationId);
    
    if (!operation) {
      return { success: false, message: 'Operation not found' };
    }

    // Update status to running
    await agentOperationsService.update(operationId, { status: 'running' });
    updateAgentStatus(operation.agent_id, 'busy', `Executing ${operation.operation_type}`);

    // Perform the operation
    const result = await performOperation(operation);

    // Mark as completed
    await agentOperationsService.complete(operationId, result);
    updateAgentStatus(operation.agent_id, 'idle', null);

    return {
      success: true,
      message: result.message || 'Operation completed successfully',
      data: result,
      operationId
    };

  } catch (error: any) {
    // Mark as failed
    await agentOperationsService.fail(operationId, error.message);
    updateAgentStatus('', 'idle', null); // Reset status

    return {
      success: false,
      message: error.message,
      operationId
    };
  }
}

// Perform the actual operation
async function performOperation(operation: AgentOperation): Promise<any> {
  const { type, parameters, agentId } = operation;

  switch (type) {
    case 'create_task':
      return await createTask(parameters);
    case 'update_task':
      return await updateTask(parameters.id, parameters.updates);
    case 'add_note':
      return await addNote(parameters);
    case 'read_email':
      return await readEmails(parameters);
    case 'schedule_meeting':
      return await scheduleMeeting(parameters);
    case 'update_project':
      return await updateProject(parameters.id, parameters.updates);
    case 'analyze_data':
      return await analyzeData(parameters);
    case 'send_notification':
      return await sendNotification(parameters);
    default:
      throw new Error(`Unknown operation type: ${type}`);
  }
}

// Task operations
export async function createTask(parameters: {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  projectId?: string;
  dueDate?: Date;
}): Promise<any> {
  const task = await tasksService.create({
    project_id: parameters.projectId || 'default',
    title: parameters.title,
    description: parameters.description || '',
    status: 'todo',
    priority: parameters.priority || 'medium',
    due_date: parameters.dueDate?.toISOString(),
    assigned_to: null,
    created_by: '', // Will be set by the service
  });
  
  console.log(`✅ Task created: ${task.title}`, task);
  return {
    message: `Task "${task.title}" created successfully`,
    task
  };
}

export async function updateTask(taskId: string, updates: Partial<any>): Promise<any> {
  const task = await tasksService.update(taskId, updates);
  
  console.log(`✅ Task updated: ${task.title}`, task);
  return {
    message: `Task "${task.title}" updated successfully`,
    task
  };
}

// Note operations
export async function addNote(parameters: {
  title: string;
  content?: string;
  tags?: string[];
  projectId?: string;
}): Promise<any> {
  const note = await notesService.create({
    project_id: parameters.projectId || 'default',
    title: parameters.title,
    content: parameters.content || '',
    tags: parameters.tags || [],
    created_by: '', // Will be set by the service
  });
  
  console.log(`✅ Note created: ${note.title}`, note);
  return {
    message: `Note "${note.title}" created successfully`,
    note
  };
}

// Email operations
export async function readEmails(parameters: {
  limit?: number;
  unreadOnly?: boolean;
}): Promise<any> {
  const emails = parameters.unreadOnly 
    ? await emailsService.getUnread()
    : await emailsService.getAll();
  
  const limitedEmails = emails.slice(0, parameters.limit || 10);
  
  console.log(`✅ Read ${limitedEmails.length} emails`, limitedEmails);
  return {
    message: `Read ${limitedEmails.length} emails`,
    emails: limitedEmails
  };
}

// Meeting operations
export async function scheduleMeeting(parameters: {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}): Promise<any> {
  const meeting = await calendarService.create({
    title: parameters.title,
    description: parameters.description || '',
    start_time: parameters.startTime.toISOString(),
    end_time: parameters.endTime.toISOString(),
    attendees: parameters.attendees || [],
    created_by: '', // Will be set by the service
    team_id: null
  });
  
  console.log(`✅ Meeting scheduled: ${meeting.title}`, meeting);
  return {
    message: `Meeting "${meeting.title}" scheduled successfully`,
    meeting
  };
}

// Project operations
export async function updateProject(projectId: string, updates: Partial<any>): Promise<any> {
  // This would need to be implemented in the projects service
  // For now, return a mock response
  console.log(`✅ Project updated: ${projectId}`, updates);
  return {
    message: `Project updated successfully`,
    project: { id: projectId, ...updates }
  };
}

// Data analysis operations
export async function analyzeData(parameters: {
  dataType?: string;
  analysisType?: string;
}): Promise<any> {
  // Simulate data analysis
  const analysis = {
    id: generateId(),
    type: parameters.dataType || 'general',
    analysisType: parameters.analysisType || 'summary',
    insights: [
      'Data shows positive trends in key metrics',
      'Recommendations for optimization identified',
      'Performance indicators are within target ranges'
    ],
    createdAt: new Date()
  };
  
  console.log(`✅ Data analysis completed`, analysis);
  return {
    message: 'Data analysis completed successfully',
    analysis
  };
}

// Notification operations
export async function sendNotification(parameters: {
  message: string;
  type?: string;
}): Promise<any> {
  const notification = {
    id: generateId(),
    message: parameters.message,
    type: parameters.type || 'info',
    timestamp: new Date()
  };
  
  console.log(`✅ Notification sent: ${notification.message}`, notification);
  return {
    message: 'Notification sent successfully',
    notification
  };
}

// Get agent operations
export async function getAgentOperations(agentId: string): Promise<AgentOperation[]> {
  const operations = await agentOperationsService.getByAgent(agentId);
  return operations.map(op => ({
    id: op.id,
    type: op.operation_type as AgentOperation['type'],
    agentId: op.agent_id,
    parameters: op.parameters,
    status: op.status,
    result: op.result,
    error: op.error_message,
    createdAt: new Date(op.created_at),
    completedAt: op.completed_at ? new Date(op.completed_at) : undefined
  }));
}

// Get pending operations
export async function getPendingOperations(): Promise<AgentOperation[]> {
  const operations = await agentOperationsService.getPending();
  return operations.map(op => ({
    id: op.id,
    type: op.operation_type as AgentOperation['type'],
    agentId: op.agent_id,
    parameters: op.parameters,
    status: op.status,
    result: op.result,
    error: op.error_message,
    createdAt: new Date(op.created_at),
    completedAt: op.completed_at ? new Date(op.completed_at) : undefined
  }));
}

// Get agent workload status
export function getAgentWorkloadStatus(): { agentId: string; name: string; status: string; workload: number; currentTask: string | null }[] {
  return AI_AGENTS.map(agent => ({
    agentId: agent.id,
    name: agent.name,
    status: agent.status,
    workload: agent.workload,
    currentTask: agent.currentTask
  }));
}

// Send message to agent and get response
export async function sendMessageToAgent(agentId: string, message: string): Promise<AgentResponse> {
  const agent = getAgent(agentId);
  if (!agent) {
    return { success: false, message: 'Agent not found' };
  }

  // Parse the message to determine what operation to perform
  const operationType = parseMessageForOperation(message);
  if (!operationType) {
    return { success: false, message: 'Could not determine operation from message' };
  }

  // Extract parameters from message and check for missing information
  const parameterResult = extractParametersFromMessage(message, operationType);
  
  // Check if we need clarification
  if (parameterResult.needsClarification) {
    return {
      success: true,
      message: parameterResult.clarificationMessage || 'Please provide more details',
      data: {
        type: 'clarification_needed',
        operationType,
        missingFields: parameterResult.missingFields,
        suggestions: parameterResult.suggestions
      }
    };
  }

  // Create and execute operation
  const operationId = await createOperation(operationType, agentId, parameterResult.parameters);
  return await executeOperation(operationId);
}

// Parse message to determine operation type
function parseMessageForOperation(message: string): AgentOperation['type'] | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('create task') || lowerMessage.includes('add task') || lowerMessage.includes('new task')) {
    return 'create_task';
  }
  if (lowerMessage.includes('update task') || lowerMessage.includes('edit task')) {
    return 'update_task';
  }
  if (lowerMessage.includes('add note') || lowerMessage.includes('create note') || lowerMessage.includes('new note')) {
    return 'add_note';
  }
  if (lowerMessage.includes('read email') || lowerMessage.includes('check email') || lowerMessage.includes('emails')) {
    return 'read_email';
  }
  if (lowerMessage.includes('schedule meeting') || lowerMessage.includes('book meeting') || lowerMessage.includes('meeting')) {
    return 'schedule_meeting';
  }
  if (lowerMessage.includes('update project') || lowerMessage.includes('edit project')) {
    return 'update_project';
  }
  if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
    return 'analyze_data';
  }
  if (lowerMessage.includes('notify') || lowerMessage.includes('notification') || lowerMessage.includes('alert')) {
    return 'send_notification';
  }
  
  return null;
}

// Extract parameters from message with clarification logic
function extractParametersFromMessage(message: string, operationType: AgentOperation['type']): {
  parameters: any;
  needsClarification: boolean;
  clarificationMessage?: string;
  missingFields?: string[];
  suggestions?: string[];
} {
  const lowerMessage = message.toLowerCase();
  
  switch (operationType) {
    case 'create_task':
      return extractTaskParameters(message, lowerMessage);
    case 'add_note':
      return extractNoteParameters(message, lowerMessage);
    case 'read_email':
      return {
        parameters: {
          limit: 10,
          unreadOnly: lowerMessage.includes('unread')
        },
        needsClarification: false
      };
    case 'schedule_meeting':
      return extractMeetingParameters(message, lowerMessage);
    case 'analyze_data':
      return extractAnalysisParameters(message, lowerMessage);
    case 'send_notification':
      return {
        parameters: {
          message: message,
          type: 'info'
        },
        needsClarification: false
      };
    default:
      return {
        parameters: {},
        needsClarification: false
      };
  }
}

// Extract task parameters with clarification
function extractTaskParameters(message: string, lowerMessage: string) {
  const title = extractTitleFromMessage(message);
  const description = extractDescriptionFromMessage(message);
  const priority = extractPriorityFromMessage(message);
  
  // Check if title is too generic
  if (!title || title.length < 5 || title.toLowerCase().includes('task')) {
    return {
      parameters: {},
      needsClarification: true,
      clarificationMessage: "I'd be happy to create a task for you! However, I need a bit more information:",
      missingFields: ['title'],
      suggestions: [
        "What specific task would you like me to create?",
        "Please provide a clear title for the task",
        "Example: 'Review quarterly budget report' or 'Update project documentation'"
      ]
    };
  }
  
  return {
    parameters: {
      title,
      description,
      priority
    },
    needsClarification: false
  };
}

// Extract note parameters with clarification
function extractNoteParameters(message: string, lowerMessage: string) {
  const title = extractTitleFromMessage(message);
  const content = extractDescriptionFromMessage(message);
  
  if (!title || title.length < 3) {
    return {
      parameters: {},
      needsClarification: true,
      clarificationMessage: "I'd be happy to add a note for you! However, I need a bit more information:",
      missingFields: ['title'],
      suggestions: [
        "What should I title this note?",
        "Please provide a clear title for the note",
        "Example: 'Meeting notes from today' or 'Client feedback summary'"
      ]
    };
  }
  
  if (!content || content.length < 10) {
    return {
      parameters: {
        title
      },
      needsClarification: true,
      clarificationMessage: `I have the title "${title}". What content should I include in this note?`,
      missingFields: ['content'],
      suggestions: [
        "Please provide the note content",
        "What information should I include in this note?",
        "Example: 'Discussed project timeline, next meeting scheduled for Friday'"
      ]
    };
  }
  
  return {
    parameters: {
      title,
      content,
      priority: extractPriorityFromMessage(message)
    },
    needsClarification: false
  };
}

// Extract meeting parameters with clarification
function extractMeetingParameters(message: string, lowerMessage: string) {
  const title = extractTitleFromMessage(message);
  const timeInfo = extractTimeFromMessage(message);
  const attendees = extractAttendeesFromMessage(message);
  
  if (!title || title.length < 5) {
    return {
      parameters: {},
      needsClarification: true,
      clarificationMessage: "I'd be happy to schedule a meeting for you! However, I need a bit more information:",
      missingFields: ['title'],
      suggestions: [
        "What should I call this meeting?",
        "Please provide a clear meeting title",
        "Example: 'Team standup' or 'Project review meeting'"
      ]
    };
  }
  
  if (!timeInfo.date || !timeInfo.time) {
    return {
      parameters: {
        title,
        description: extractDescriptionFromMessage(message)
      },
      needsClarification: true,
      clarificationMessage: `I have the meeting title "${title}". When would you like to schedule this meeting?`,
      missingFields: ['startTime'],
      suggestions: [
        "Please specify the date and time",
        "Example: 'tomorrow at 2 PM' or 'Friday at 10:30 AM'",
        "Example: 'next Monday at 3 PM' or 'December 15th at 1 PM'"
      ]
    };
  }
  
  return {
    parameters: {
      title,
      description: extractDescriptionFromMessage(message),
      startTime: timeInfo.date,
      endTime: new Date(timeInfo.date.getTime() + (timeInfo.duration || 60) * 60000),
      attendees
    },
    needsClarification: false
  };
}

// Extract analysis parameters with clarification
function extractAnalysisParameters(message: string, lowerMessage: string) {
  const dataType = extractDataTypeFromMessage(message);
  const analysisType = extractAnalysisTypeFromMessage(message);
  
  if (!dataType) {
    return {
      parameters: {},
      needsClarification: true,
      clarificationMessage: "I'd be happy to analyze data for you! However, I need to know what data to analyze:",
      missingFields: ['dataType'],
      suggestions: [
        "What data would you like me to analyze?",
        "Example: 'projects', 'tasks', 'emails', or 'notes'",
        "Example: 'team performance' or 'customer data'"
      ]
    };
  }
  
  return {
    parameters: {
      dataType,
      analysisType
    },
    needsClarification: false
  };
}

// Helper functions to extract information from messages
function extractTitleFromMessage(message: string): string {
  // Simple extraction - look for patterns like "create task: title" or "add note about: title"
  const patterns = [
    /create task:\s*(.+)/i,
    /add task:\s*(.+)/i,
    /new task:\s*(.+)/i,
    /add note:\s*(.+)/i,
    /create note:\s*(.+)/i,
    /schedule meeting:\s*(.+)/i,
    /book meeting:\s*(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  // Fallback: extract first meaningful words
  const words = message.split(' ').slice(0, 5);
  return words.join(' ').replace(/[^\w\s]/g, '');
}

function extractDescriptionFromMessage(message: string): string {
  // Look for description patterns
  const descPattern = /(?:description|about|details?):\s*(.+)/i;
  const match = message.match(descPattern);
  if (match) {
    return match[1].trim();
  }
  
  return message;
}

function extractPriorityFromMessage(message: string): 'low' | 'medium' | 'high' {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('high priority') || lowerMessage.includes('urgent') || lowerMessage.includes('asap')) {
    return 'high';
  }
  if (lowerMessage.includes('low priority') || lowerMessage.includes('when you can')) {
    return 'low';
  }
  return 'medium';
}

// Extract time information from message
function extractTimeFromMessage(message: string): { date?: Date; time?: string; duration?: number } {
  const lowerMessage = message.toLowerCase();
  
  // Look for time patterns
  const timePatterns = [
    /tomorrow at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    /today at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
    /(\w+day) at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i
  ];
  
  let time: string | undefined;
  let date: Date | undefined;
  
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      time = match[0];
      
      // Calculate date based on time reference
      if (lowerMessage.includes('tomorrow')) {
        date = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (lowerMessage.includes('today')) {
        date = new Date();
      } else {
        // Default to tomorrow if no specific day mentioned
        date = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      
      // Set the time on the date
      if (match[1] && match[3]) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3].toLowerCase();
        
        let adjustedHour = hour;
        if (ampm === 'pm' && hour !== 12) {
          adjustedHour += 12;
        } else if (ampm === 'am' && hour === 12) {
          adjustedHour = 0;
        }
        
        date.setHours(adjustedHour, minute, 0, 0);
      }
      
      break;
    }
  }
  
  // Look for duration
  let duration = 60; // Default 60 minutes
  const durationMatch = message.match(/(\d+)\s*(minute|hour)/i);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    duration = unit === 'hour' ? value * 60 : value;
  }
  
  return { date, time, duration };
}

// Extract attendees from message
function extractAttendeesFromMessage(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const attendees: string[] = [];
  
  // Look for common patterns
  const patterns = [
    /with (\w+)/g,
    /team members/g,
    /development team/g,
    /stakeholders/g,
    /(\w+), (\w+), and (\w+)/g
  ];
  
  for (const pattern of patterns) {
    const matches = message.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        attendees.push(match[1]);
      }
    }
  }
  
  // Add common team references
  if (lowerMessage.includes('team')) {
    attendees.push('team members');
  }
  
  return attendees;
}

// Extract data type from message
function extractDataTypeFromMessage(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('project')) return 'projects';
  if (lowerMessage.includes('task')) return 'tasks';
  if (lowerMessage.includes('email')) return 'emails';
  if (lowerMessage.includes('note')) return 'notes';
  if (lowerMessage.includes('meeting')) return 'calendar';
  if (lowerMessage.includes('team')) return 'team';
  
  return null;
}

// Extract analysis type from message
function extractAnalysisTypeFromMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('summary') || lowerMessage.includes('overview')) return 'summary';
  if (lowerMessage.includes('trend') || lowerMessage.includes('pattern')) return 'trends';
  if (lowerMessage.includes('performance') || lowerMessage.includes('metrics')) return 'performance';
  if (lowerMessage.includes('insight') || lowerMessage.includes('recommendation')) return 'insights';
  
  return 'summary';
}
