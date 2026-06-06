// Migration Utility for Nexus AI
// Helps users migrate their localStorage data to Supabase

import { tasksService, notesService, calendarService, emailsService, contactsService } from './supabase-service';

interface MigrationOptions {
  userId: string;
  teamId?: string;
  dryRun?: boolean;
}

interface MigrationResult {
  success: boolean;
  message: string;
  migrated: {
    tasks: number;
    notes: number;
    calendarEvents: number;
    emails: number;
    contacts: number;
  };
  errors: string[];
}

export class MigrationUtility {
  private options: MigrationOptions;

  constructor(options: MigrationOptions) {
    this.options = options;
  }

  async migrateAll(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      message: 'Migration completed successfully',
      migrated: {
        tasks: 0,
        notes: 0,
        calendarEvents: 0,
        emails: 0,
        contacts: 0
      },
      errors: []
    };

    try {
      // Migrate tasks
      result.migrated.tasks = await this.migrateTasks();
      
      // Migrate notes
      result.migrated.notes = await this.migrateNotes();
      
      // Migrate calendar events
      result.migrated.calendarEvents = await this.migrateCalendarEvents();
      
      // Migrate emails
      result.migrated.emails = await this.migrateEmails();
      
      // Migrate contacts
      result.migrated.contacts = await this.migrateContacts();

    } catch (error: any) {
      result.success = false;
      result.message = error.message;
      result.errors.push(error.message);
    }

    return result;
  }

  private async migrateTasks(): Promise<number> {
    const userTasksKey = `userTasks_${this.options.userId}`;
    const viewableTasksKey = 'viewableTasks';
    
    // Try to get tasks from localStorage
    let tasks = [];
    
    try {
      const savedTasks = localStorage.getItem(userTasksKey) || localStorage.getItem(viewableTasksKey);
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
      }
    } catch (error) {
      console.warn('Could not parse tasks from localStorage:', error);
      return 0;
    }

    if (!Array.isArray(tasks)) {
      return 0;
    }

    let migratedCount = 0;

    for (const task of tasks) {
      try {
        if (this.options.dryRun) {
          console.log('Would migrate task:', task.title);
          migratedCount++;
        } else {
          await tasksService.create({
            project_id: task.projectId || 'default',
            title: task.title || 'Untitled Task',
            description: task.description || '',
            status: this.mapTaskStatus(task.status),
            priority: this.mapTaskPriority(task.priority),
            due_date: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
            assigned_to: task.assignedTo || null,
            created_by: this.options.userId,
          });
          migratedCount++;
        }
      } catch (error: any) {
        console.error('Error migrating task:', task.title, error);
      }
    }

    return migratedCount;
  }

  private async migrateNotes(): Promise<number> {
    const userNotesKey = `userNotes_${this.options.userId}`;
    const builtInNotesKey = 'builtInNotes';
    
    let notes = [];
    
    try {
      const savedNotes = localStorage.getItem(userNotesKey) || localStorage.getItem(builtInNotesKey);
      if (savedNotes) {
        notes = JSON.parse(savedNotes);
      }
    } catch (error) {
      console.warn('Could not parse notes from localStorage:', error);
      return 0;
    }

    if (!Array.isArray(notes)) {
      return 0;
    }

    let migratedCount = 0;

    for (const note of notes) {
      try {
        if (this.options.dryRun) {
          console.log('Would migrate note:', note.title);
          migratedCount++;
        } else {
          await notesService.create({
            project_id: note.projectId || 'default',
            title: note.title || 'Untitled Note',
            content: note.content || '',
            tags: note.tags || [],
            created_by: this.options.userId,
          });
          migratedCount++;
        }
      } catch (error: any) {
        console.error('Error migrating note:', note.title, error);
      }
    }

    return migratedCount;
  }

  private async migrateCalendarEvents(): Promise<number> {
    const calendarEventsKey = `workspaceCalendarEvents_${this.options.userId}`;
    const generalCalendarKey = 'workspaceCalendarEvents';
    
    let events = [];
    
    try {
      const savedEvents = localStorage.getItem(calendarEventsKey) || localStorage.getItem(generalCalendarKey);
      if (savedEvents) {
        events = JSON.parse(savedEvents);
      }
    } catch (error) {
      console.warn('Could not parse calendar events from localStorage:', error);
      return 0;
    }

    if (!Array.isArray(events)) {
      return 0;
    }

    let migratedCount = 0;

    for (const event of events) {
      try {
        if (this.options.dryRun) {
          console.log('Would migrate calendar event:', event.title);
          migratedCount++;
        } else {
          await calendarService.create({
            title: event.title || 'Untitled Event',
            description: event.description || '',
            start_time: event.startTime ? new Date(event.startTime).toISOString() : new Date().toISOString(),
            end_time: event.endTime ? new Date(event.endTime).toISOString() : new Date(Date.now() + 3600000).toISOString(),
            attendees: event.attendees || [],
            created_by: this.options.userId,
            team_id: this.options.teamId,
          });
          migratedCount++;
        }
      } catch (error: any) {
        console.error('Error migrating calendar event:', event.title, error);
      }
    }

    return migratedCount;
  }

  private async migrateEmails(): Promise<number> {
    const emailsKey = `emails_${this.options.userId}`;
    
    let emails = [];
    
    try {
      const savedEmails = localStorage.getItem(emailsKey);
      if (savedEmails) {
        emails = JSON.parse(savedEmails);
      }
    } catch (error) {
      console.warn('Could not parse emails from localStorage:', error);
      return 0;
    }

    if (!Array.isArray(emails)) {
      return 0;
    }

    let migratedCount = 0;

    for (const email of emails) {
      try {
        if (this.options.dryRun) {
          console.log('Would migrate email:', email.subject);
          migratedCount++;
        } else {
          await emailsService.create({
            sender: email.sender || 'unknown@example.com',
            subject: email.subject || 'No Subject',
            body: email.body || '',
            is_read: email.read || false,
            received_at: email.receivedAt ? new Date(email.receivedAt).toISOString() : new Date().toISOString(),
            created_by: this.options.userId,
            team_id: this.options.teamId,
          });
          migratedCount++;
        }
      } catch (error: any) {
        console.error('Error migrating email:', email.subject, error);
      }
    }

    return migratedCount;
  }

  private async migrateContacts(): Promise<number> {
    const contactsKey = `contacts_${this.options.userId}`;
    const crmContactsKey = 'crmContacts';
    
    let contacts = [];
    
    try {
      const savedContacts = localStorage.getItem(contactsKey) || localStorage.getItem(crmContactsKey);
      if (savedContacts) {
        contacts = JSON.parse(savedContacts);
      }
    } catch (error) {
      console.warn('Could not parse contacts from localStorage:', error);
      return 0;
    }

    if (!Array.isArray(contacts)) {
      return 0;
    }

    let migratedCount = 0;

    for (const contact of contacts) {
      try {
        if (this.options.dryRun) {
          console.log('Would migrate contact:', contact.name);
          migratedCount++;
        } else {
          await contactsService.create({
            name: contact.name || 'Unknown Contact',
            email: contact.email || '',
            phone: contact.phone || '',
            company: contact.company || '',
            role: contact.role || '',
            notes: contact.notes || '',
            created_by: this.options.userId,
            team_id: this.options.teamId,
          });
          migratedCount++;
        }
      } catch (error: any) {
        console.error('Error migrating contact:', contact.name, error);
      }
    }

    return migratedCount;
  }

  private mapTaskStatus(status: string): 'todo' | 'in-progress' | 'completed' {
    const statusMap: Record<string, 'todo' | 'in-progress' | 'completed'> = {
      'todo': 'todo',
      'pending': 'todo',
      'in-progress': 'in-progress',
      'in_progress': 'in-progress',
      'completed': 'completed',
      'done': 'completed',
      'finished': 'completed'
    };
    
    return statusMap[status?.toLowerCase()] || 'todo';
  }

  private mapTaskPriority(priority: string): 'low' | 'medium' | 'high' {
    const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'urgent': 'high',
      'critical': 'high'
    };
    
    return priorityMap[priority?.toLowerCase()] || 'medium';
  }

  // Utility method to preview what would be migrated
  async previewMigration(): Promise<MigrationResult> {
    const originalDryRun = this.options.dryRun;
    this.options.dryRun = true;
    
    const result = await this.migrateAll();
    
    this.options.dryRun = originalDryRun;
    
    return result;
  }

  // Utility method to clear localStorage after successful migration
  static clearLocalStorageData(userId: string): void {
    const keysToRemove = [
      `userTasks_${userId}`,
      `userNotes_${userId}`,
      `workspaceCalendarEvents_${userId}`,
      `emails_${userId}`,
      `contacts_${userId}`,
      'viewableTasks',
      'builtInNotes',
      'workspaceCalendarEvents',
      'crmContacts'
    ];

    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Removed ${key} from localStorage`);
      }
    });
  }
}

// Convenience function to run migration
export async function runMigration(userId: string, teamId?: string, dryRun: boolean = false): Promise<MigrationResult> {
  const migration = new MigrationUtility({ userId, teamId, dryRun });
  return await migration.migrateAll();
}

// Convenience function to preview migration
export async function previewMigration(userId: string, teamId?: string): Promise<MigrationResult> {
  const migration = new MigrationUtility({ userId, teamId, dryRun: true });
  return await migration.previewMigration();
}
