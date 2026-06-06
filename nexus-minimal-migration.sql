-- Nexus AI Business Suite - Minimal Migration
-- This script creates a simplified version of the Nexus AI tables
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI Agents table (simplified without team constraints)
CREATE TABLE IF NOT EXISTS ai_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('aurora', 'vega', 'luma', 'orion', 'titan', 'custom')),
  description TEXT,
  system_prompt TEXT NOT NULL,
  model JSONB NOT NULL DEFAULT '{"provider": "gemini", "model": "gemini-1.5-pro", "temperature": 0.7, "maxTokens": 2000}',
  memory JSONB NOT NULL DEFAULT '{"shortTerm": [], "longTerm": [], "contextWindow": 8000, "maxMemorySize": 100}',
  permissions JSONB NOT NULL DEFAULT '{"canAccessAPIs": [], "canExecuteWorkflows": true, "canAccessFiles": true, "canSendEmails": false, "canScheduleMeetings": false, "canAccessCRM": false, "canAccessAnalytics": false}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'training', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics JSONB NOT NULL DEFAULT '{"totalInteractions": 0, "successfulTasks": 0, "failedTasks": 0, "averageResponseTime": 0, "userSatisfaction": 0, "lastPerformanceReview": "2024-01-01T00:00:00Z"}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID DEFAULT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_created_by ON ai_agents(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_ai_agents_role ON ai_agents(role);

-- Row Level Security (RLS) policies (simplified)
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own agents
CREATE POLICY "Users can view their own agents" ON ai_agents
  FOR SELECT USING (auth.uid() = created_by);

-- Allow users to create their own agents
CREATE POLICY "Users can create their own agents" ON ai_agents
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own agents
CREATE POLICY "Users can update their own agents" ON ai_agents
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own agents
CREATE POLICY "Users can delete their own agents" ON ai_agents
  FOR DELETE USING (auth.uid() = created_by);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
