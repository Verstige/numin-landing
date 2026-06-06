// Centralized Supabase Service for Nexus AI
// This service handles all database operations and replaces localStorage usage

import { supabase } from './supabase';
import type { Database } from './supabase';

// Type definitions for our workspace data
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  project_id: string;
  title: string;
  content?: string;
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees?: string[];
  created_by: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body?: string;
  is_read: boolean;
  received_at: string;
  created_by: string;
  team_id?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
  created_by: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentOperation {
  id: string;
  agent_id: string;
  operation_type: string;
  parameters?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error_message?: string;
  created_by: string;
  team_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  settings: any;
  created_at: string;
  updated_at: string;
}

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to get current user's team
export async function getCurrentUserTeam() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from('team_members')
    .select('team_id, teams(*)')
    .eq('user_id', user.id)
    .single();

  return data?.teams;
}

// Tasks Service
export const tasksService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Notes Service
export const notesService = {
  async getAll(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByProject(projectId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...note, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Calendar Events Service
export const calendarService = {
  async getAll(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{ ...event, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Emails Service
export const emailsService = {
  async getAll(): Promise<Email[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('received_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUnread(): Promise<Email[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('is_read', false)
      .order('received_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(email: Omit<Email, 'id' | 'created_at'>): Promise<Email> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('emails')
      .insert([{ ...email, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(id: string): Promise<Email> {
    const { data, error } = await supabase
      .from('emails')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Contacts Service
export const contactsService = {
  async getAll(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...contact, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Contact>): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Agent Operations Service
export const agentOperationsService = {
  async getAll(): Promise<AgentOperation[]> {
    const { data, error } = await supabase
      .from('agent_operations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByAgent(agentId: string): Promise<AgentOperation[]> {
    const { data, error } = await supabase
      .from('agent_operations')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPending(): Promise<AgentOperation[]> {
    const { data, error } = await supabase
      .from('agent_operations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(operation: Omit<AgentOperation, 'id' | 'created_at'>): Promise<AgentOperation> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('agent_operations')
      .insert([{ ...operation, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<AgentOperation>): Promise<AgentOperation> {
    const { data, error } = await supabase
      .from('agent_operations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async complete(id: string, result: any): Promise<AgentOperation> {
    const { data, error } = await supabase
      .from('agent_operations')
      .update({ 
        status: 'completed', 
        result, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async fail(id: string, errorMessage: string): Promise<AgentOperation> {
    const { data, error } = await supabase
      .from('agent_operations')
      .update({ 
        status: 'failed', 
        error_message: errorMessage, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// User Preferences Service
export const preferencesService = {
  async get(): Promise<UserPreferences | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  async create(preferences: Omit<UserPreferences, 'created_at' | 'updated_at'>): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert([preferences])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsert(preferences: Omit<UserPreferences, 'created_at' | 'updated_at'>): Promise<UserPreferences> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{ ...preferences, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Real-time subscriptions
export const subscribeToTasks = (callback: (payload: any) => void) => {
  return supabase
    .channel('tasks')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
    .subscribe();
};

export const subscribeToNotes = (callback: (payload: any) => void) => {
  return supabase
    .channel('notes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, callback)
    .subscribe();
};

export const subscribeToCalendarEvents = (callback: (payload: any) => void) => {
  return supabase
    .channel('calendar_events')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, callback)
    .subscribe();
};

export const subscribeToAgentOperations = (callback: (payload: any) => void) => {
  return supabase
    .channel('agent_operations')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_operations' }, callback)
    .subscribe();
};
