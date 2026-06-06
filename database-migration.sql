-- Additional Tables for Nexus AI Migration from localStorage to Supabase
-- Run this in your Supabase SQL Editor

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  attendees TEXT[],
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emails table (for workspace data)
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent operations table (for tracking AI agent activities)
CREATE TABLE IF NOT EXISTS public.agent_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  parameters JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
DROP POLICY IF EXISTS "Users can view tasks from their teams" ON public.tasks;
CREATE POLICY "Users can view tasks from their teams" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      JOIN public.projects p ON p.team_id = tm.team_id
      WHERE p.id = tasks.project_id AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can manage tasks" ON public.tasks;
CREATE POLICY "Team members can manage tasks" ON public.tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      JOIN public.projects p ON p.team_id = tm.team_id
      WHERE p.id = tasks.project_id AND tm.user_id = auth.uid()
    )
  );

-- Create policies for notes
DROP POLICY IF EXISTS "Users can view notes from their teams" ON public.notes;
CREATE POLICY "Users can view notes from their teams" ON public.notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      JOIN public.projects p ON p.team_id = tm.team_id
      WHERE p.id = notes.project_id AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can manage notes" ON public.notes;
CREATE POLICY "Team members can manage notes" ON public.notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      JOIN public.projects p ON p.team_id = tm.team_id
      WHERE p.id = notes.project_id AND tm.user_id = auth.uid()
    )
  );

-- Create policies for calendar events
DROP POLICY IF EXISTS "Users can view calendar events from their teams" ON public.calendar_events;
CREATE POLICY "Users can view calendar events from their teams" ON public.calendar_events
  FOR SELECT USING (
    team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = calendar_events.team_id AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can manage calendar events" ON public.calendar_events;
CREATE POLICY "Team members can manage calendar events" ON public.calendar_events
  FOR ALL USING (
    team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = calendar_events.team_id AND tm.user_id = auth.uid()
    )
  );

-- Create policies for emails
DROP POLICY IF EXISTS "Users can view emails from their teams" ON public.emails;
CREATE POLICY "Users can view emails from their teams" ON public.emails
  FOR SELECT USING (
    team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = emails.team_id AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can manage emails" ON public.emails;
CREATE POLICY "Team members can manage emails" ON public.emails
  FOR ALL USING (
    team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = emails.team_id AND tm.user_id = auth.uid()
    )
  );

-- Create policies for contacts
DROP POLICY IF EXISTS "Users can view contacts from their teams" ON public.contacts;
CREATE POLICY "Users can view contacts from their teams" ON public.contacts
  FOR SELECT USING (
    team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = contacts.team_id AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can manage contacts" ON public.contacts;
CREATE POLICY "Team members can manage contacts" ON public.contacts
  FOR ALL USING (
    team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = contacts.team_id AND tm.user_id = auth.uid()
    )
  );

-- Create policies for agent operations
DROP POLICY IF EXISTS "Users can view agent operations from their teams" ON public.agent_operations;
CREATE POLICY "Users can view agent operations from their teams" ON public.agent_operations
  FOR SELECT USING (
    team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = agent_operations.team_id AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can manage agent operations" ON public.agent_operations;
CREATE POLICY "Team members can manage agent operations" ON public.agent_operations
  FOR ALL USING (
    team_id IS NULL OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = agent_operations.team_id AND tm.user_id = auth.uid()
    )
  );

-- Create policies for user preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- No sample data will be inserted
-- Users can create their own data through the application
