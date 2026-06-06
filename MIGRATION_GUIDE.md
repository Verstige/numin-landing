# Nexus AI Migration Guide: localStorage to Supabase

This guide will help you migrate your Nexus AI data from localStorage to our secure cloud database powered by Supabase.

## 🎯 Why Migrate?

- **Data Persistence**: Your data won't be lost when you clear browser cache
- **Multi-Device Access**: Access your data from any device
- **Better Performance**: Cloud database provides faster queries and updates
- **Real-time Sync**: Changes sync instantly across all your devices
- **Backup & Recovery**: Automatic backups and data recovery options
- **Collaboration**: Share data with team members securely

## 📋 Prerequisites

1. **Supabase Setup**: Ensure your Supabase project is configured
2. **Authentication**: You must be signed in to your Nexus AI account
3. **Database Tables**: Run the migration SQL script (see below)

## 🗄️ Database Setup

### Step 1: Run the Migration SQL Script

Execute the following SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of database-migration.sql
-- This creates all necessary tables and security policies
```

### Step 2: Verify Tables

After running the script, verify these tables exist in your Supabase database:

- `tasks`
- `notes`
- `calendar_events`
- `emails`
- `contacts`
- `agent_operations`
- `user_preferences`

## 🚀 Migration Process

### Option 1: Using the Migration Wizard (Recommended)

1. **Access Migration Page**: Navigate to `/migrate` in your Nexus AI app
2. **Preview Data**: Review what data will be migrated
3. **Start Migration**: Click "Start Migration" to begin the process
4. **Complete**: Review results and clear local data if desired

### Option 2: Programmatic Migration

```typescript
import { runMigration } from '@/lib/migration-utility';

// Run migration for current user
const result = await runMigration(userId, teamId);

console.log('Migration completed:', result);
```

## 📊 Data Types Migrated

| Data Type | Source | Destination | Notes |
|-----------|--------|-------------|-------|
| Tasks | `userTasks_${userId}` or `viewableTasks` | `tasks` table | Includes status, priority, due dates |
| Notes | `userNotes_${userId}` or `builtInNotes` | `notes` table | Includes tags and content |
| Calendar Events | `workspaceCalendarEvents_${userId}` | `calendar_events` table | Includes attendees and timing |
| Emails | `emails_${userId}` | `emails` table | Includes read status |
| Contacts | `contacts_${userId}` or `crmContacts` | `contacts` table | Includes company and role info |

## 🔧 Migration Utility Functions

### Preview Migration

```typescript
import { previewMigration } from '@/lib/migration-utility';

// Preview what will be migrated (dry run)
const preview = await previewMigration(userId, teamId);
console.log('Items to migrate:', preview.migrated);
```

### Clear Local Storage

```typescript
import { MigrationUtility } from '@/lib/migration-utility';

// Clear localStorage after successful migration
MigrationUtility.clearLocalStorageData(userId);
```

## 🛠️ New Supabase Service

The migration introduces a new centralized service for all database operations:

### Usage Examples

```typescript
import { tasksService, notesService, calendarService } from '@/lib/supabase-service';

// Create a task
const task = await tasksService.create({
  project_id: 'project-123',
  title: 'New Task',
  description: 'Task description',
  priority: 'high',
  status: 'todo'
});

// Get all tasks
const tasks = await tasksService.getAll();

// Update a task
const updatedTask = await tasksService.update(taskId, {
  status: 'completed'
});

// Create a note
const note = await notesService.create({
  project_id: 'project-123',
  title: 'Meeting Notes',
  content: 'Notes content',
  tags: ['meeting', 'important']
});

// Schedule a meeting
const meeting = await calendarService.create({
  title: 'Team Meeting',
  description: 'Weekly team sync',
  start_time: '2024-01-15T10:00:00Z',
  end_time: '2024-01-15T11:00:00Z',
  attendees: ['user1@example.com', 'user2@example.com']
});
```

## 🔄 Real-time Subscriptions

The new service includes real-time subscriptions for live updates:

```typescript
import { subscribeToTasks, subscribeToNotes } from '@/lib/supabase-service';

// Subscribe to task changes
const taskSubscription = subscribeToTasks((payload) => {
  console.log('Task changed:', payload);
});

// Subscribe to note changes
const noteSubscription = subscribeToNotes((payload) => {
  console.log('Note changed:', payload);
});
```

## 🔒 Security & Permissions

### Row Level Security (RLS)

All tables have Row Level Security enabled with the following policies:

- **Users can only access data from their teams**
- **Team members can manage team data**
- **Users can manage their own preferences**
- **Agent operations are team-scoped**

### Authentication Required

All operations require user authentication:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  // User is authenticated, proceed with operations
}
```

## 🚨 Troubleshooting

### Common Issues

1. **"User not authenticated" error**
   - Ensure user is signed in
   - Check AuthProvider is wrapping your app

2. **"Permission denied" error**
   - Verify RLS policies are set up correctly
   - Check user is member of the team

3. **Migration fails**
   - Check console for specific error messages
   - Verify database tables exist
   - Ensure user has proper permissions

### Debug Mode

Enable debug logging:

```typescript
// In your app initialization
localStorage.setItem('debug', 'true');
```

## 📈 Performance Benefits

After migration, you'll notice:

- **Faster Data Loading**: Cloud database queries are optimized
- **Real-time Updates**: Changes sync instantly across devices
- **Better Scalability**: Database can handle more data and users
- **Reduced Memory Usage**: No large localStorage objects in browser

## 🔄 Rollback Plan

If you need to rollback:

1. **Data is preserved**: Your localStorage data remains until you clear it
2. **Switch back**: You can temporarily disable Supabase service
3. **Re-migrate**: Run migration again if needed

## 📞 Support

If you encounter issues during migration:

1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure all database tables are created
4. Contact support with specific error details

## 🎉 Next Steps

After successful migration:

1. **Test all features** to ensure data is working correctly
2. **Clear localStorage** to free up browser storage
3. **Enjoy the benefits** of cloud-based data storage
4. **Share with team members** for collaborative features

---

**Note**: This migration is a one-time process. Once completed, all new data will be stored in the cloud database automatically.
