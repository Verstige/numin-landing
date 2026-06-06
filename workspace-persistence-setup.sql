-- Workspace Persistence Setup
-- Ensures all user-created content in the workspace is saved to the database
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Create Missing Tables
-- ============================================

-- Workspace Notes table (replaces localStorage usage)
CREATE TABLE IF NOT EXISTS public.workspace_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
  author TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  reminder_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace Tasks table (replaces localStorage usage)
CREATE TABLE IF NOT EXISTS public.workspace_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee TEXT NOT NULL,
  assignee_avatar TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
  subtasks JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages table (for AI conversations)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  suggestions JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentions table (for @mentions in chat)
CREATE TABLE IF NOT EXISTS public.mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by UUID REFERENCES auth.users(id) NOT NULL,
  context TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace Settings table (user preferences and workspace config)
CREATE TABLE IF NOT EXISTS public.workspace_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications JSONB DEFAULT '{"email": true, "push": true, "mentions": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

-- Activity Feed table (for workspace activity tracking)
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('project_created', 'task_completed', 'status_changed', 'member_added', 'comment_added', 'deadline_approaching', 'milestone_reached', 'note_created', 'note_updated')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Tracking table (for timer functionality)
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.workspace_tasks(id) ON DELETE CASCADE,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  is_running BOOLEAN DEFAULT FALSE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace Layouts table (for saved workspace layouts)
CREATE TABLE IF NOT EXISTS public.workspace_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  layout_type TEXT NOT NULL CHECK (layout_type IN ('project_map', 'dashboard', 'kanban', 'calendar')),
  layout_data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: Update Existing Tables
-- ============================================

-- Add missing columns to existing tables
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS enhanced_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS products TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS business_stage TEXT,
ADD COLUMN IF NOT EXISTS revenue TEXT,
ADD COLUMN IF NOT EXISTS employees TEXT,
ADD COLUMN IF NOT EXISTS founded TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS social_media TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================

ALTER TABLE public.workspace_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_layouts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS Policies
-- ============================================

-- Workspace Notes policies
CREATE POLICY "Users can view notes in their teams" ON public.workspace_notes
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes in their teams" ON public.workspace_notes
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update notes in their teams" ON public.workspace_notes
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete notes in their teams" ON public.workspace_notes
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Workspace Tasks policies
CREATE POLICY "Users can view tasks in their teams" ON public.workspace_tasks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their teams" ON public.workspace_tasks
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update tasks in their teams" ON public.workspace_tasks
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can delete tasks in their teams" ON public.workspace_tasks
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Chat Messages policies
CREATE POLICY "Users can view messages in their teams" ON public.chat_messages
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their teams" ON public.chat_messages
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Mentions policies
CREATE POLICY "Users can view their own mentions" ON public.mentions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create mentions in their teams" ON public.mentions
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Users can update their own mentions" ON public.mentions
  FOR UPDATE USING (user_id = auth.uid());

-- Workspace Settings policies
CREATE POLICY "Users can view their own settings" ON public.workspace_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own settings" ON public.workspace_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON public.workspace_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Activity Feed policies
CREATE POLICY "Users can view activity in their teams" ON public.activity_feed
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity in their teams" ON public.activity_feed
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Time Entries policies
CREATE POLICY "Users can view their own time entries" ON public.time_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries" ON public.time_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries" ON public.time_entries
  FOR DELETE USING (user_id = auth.uid());

-- Workspace Layouts policies
CREATE POLICY "Users can view their own layouts" ON public.workspace_layouts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own layouts" ON public.workspace_layouts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own layouts" ON public.workspace_layouts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own layouts" ON public.workspace_layouts
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- STEP 5: Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_workspace_notes_team_id ON public.workspace_notes(team_id);
CREATE INDEX IF NOT EXISTS idx_workspace_notes_project_id ON public.workspace_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_notes_created_by ON public.workspace_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_workspace_notes_tags ON public.workspace_notes USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_workspace_tasks_team_id ON public.workspace_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_project_id ON public.workspace_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_created_by ON public.workspace_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON public.workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_priority ON public.workspace_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_due_date ON public.workspace_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_tags ON public.workspace_tasks USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_chat_messages_team_id ON public.chat_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_by ON public.chat_messages(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_mentions_user_id ON public.mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_team_id ON public.mentions(team_id);
CREATE INDEX IF NOT EXISTS idx_mentions_read ON public.mentions(read);

CREATE INDEX IF NOT EXISTS idx_workspace_settings_user_id ON public.workspace_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_settings_team_id ON public.workspace_settings(team_id);

CREATE INDEX IF NOT EXISTS idx_activity_feed_team_id ON public.activity_feed(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed(type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at);

CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_team_id ON public.time_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_is_running ON public.time_entries(is_running);

CREATE INDEX IF NOT EXISTS idx_workspace_layouts_user_id ON public.workspace_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_layouts_team_id ON public.workspace_layouts(team_id);
CREATE INDEX IF NOT EXISTS idx_workspace_layouts_type ON public.workspace_layouts(layout_type);

-- ============================================
-- STEP 6: Create Updated At Triggers
-- ============================================

CREATE TRIGGER update_workspace_notes_updated_at BEFORE UPDATE ON public.workspace_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_tasks_updated_at BEFORE UPDATE ON public.workspace_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_settings_updated_at BEFORE UPDATE ON public.workspace_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_layouts_updated_at BEFORE UPDATE ON public.workspace_layouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 7: Create Helper Functions
-- ============================================

-- Function to migrate localStorage data to database
CREATE OR REPLACE FUNCTION migrate_localStorage_data()
RETURNS TEXT AS $$
BEGIN
  -- This function would be called from the frontend to migrate existing localStorage data
  -- Implementation would depend on the specific migration logic needed
  RETURN 'Migration function created - call from frontend to migrate localStorage data';
END;
$$ LANGUAGE plpgsql;

-- Function to get workspace statistics
CREATE OR REPLACE FUNCTION get_workspace_stats(team_uuid UUID, user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_projects', (
            SELECT COUNT(*) FROM projects p 
            WHERE p.team_id = team_uuid
        ),
        'total_notes', (
            SELECT COUNT(*) FROM workspace_notes wn 
            WHERE wn.team_id = team_uuid
        ),
        'total_tasks', (
            SELECT COUNT(*) FROM workspace_tasks wt 
            WHERE wt.team_id = team_uuid
        ),
        'completed_tasks', (
            SELECT COUNT(*) FROM workspace_tasks wt 
            WHERE wt.team_id = team_uuid AND wt.status = 'done'
        ),
        'total_time_tracked', (
            SELECT COALESCE(SUM(duration_minutes), 0) FROM time_entries te 
            WHERE te.team_id = team_uuid
        ),
        'recent_activity', (
            SELECT COUNT(*) FROM activity_feed af 
            WHERE af.team_id = team_uuid 
            AND af.created_at > NOW() - INTERVAL '7 days'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN 
  RAISE NOTICE '✅ Workspace persistence setup completed successfully!';
  RAISE NOTICE '✅ All workspace content tables created';
  RAISE NOTICE '✅ Row Level Security enabled';
  RAISE NOTICE '✅ Policies configured for team-based access';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '✅ Triggers set up for timestamps';
  RAISE NOTICE '';
  RAISE NOTICE '📋 New tables created:';
  RAISE NOTICE '   - workspace_notes (replaces localStorage for notes)';
  RAISE NOTICE '   - workspace_tasks (replaces localStorage for tasks)';
  RAISE NOTICE '   - chat_messages (for AI conversations)';
  RAISE NOTICE '   - mentions (for @mentions)';
  RAISE NOTICE '   - workspace_settings (user preferences)';
  RAISE NOTICE '   - activity_feed (workspace activity)';
  RAISE NOTICE '   - time_entries (timer functionality)';
  RAISE NOTICE '   - workspace_layouts (saved layouts)';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next step: Update frontend components to use database instead of localStorage';
END $$;
