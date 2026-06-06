# Supabase AI Agents Setup Guide

## 🎯 Overview

This guide will help you fully enable Supabase integration for AI agents. After running the SQL script, your AI agents will be saved to both Supabase (for cloud sync) and localStorage (for offline access).

## ✅ What This Fixes

1. **Database Constraint Error** - Allows custom agent roles (executive_assistant, sales_rep, etc.)
2. **Required Fields Error** - Makes `created_by` and `team_id` nullable for development
3. **Full Supabase Integration** - Enables cloud storage for AI agents
4. **Hybrid Storage** - Agents saved to both Supabase AND localStorage

## 📋 Step-by-Step Instructions

### Step 1: Run the SQL Script

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `zxcdgyebqgyjzmheqbhy`
3. **Click on "SQL Editor"** in the left sidebar
4. **Click "New Query"**
5. **Copy the entire script below** and paste it into the editor
6. **Click "Run"** (or press Cmd/Ctrl + Enter)

### Step 2: Copy and Paste This SQL Script

```sql
-- Supabase AI Agents Table Fix
-- This script fixes the ai_agents_role_check constraint to allow custom agent roles

-- Step 1: Drop the existing constraint if it exists
ALTER TABLE IF EXISTS public.ai_agents 
DROP CONSTRAINT IF EXISTS ai_agents_role_check;

-- Step 2: Add the updated constraint with all allowed roles
ALTER TABLE public.ai_agents 
ADD CONSTRAINT ai_agents_role_check 
CHECK (role IN (
  'executive_assistant',
  'sales_rep',
  'customer_support',
  'marketing_strategist',
  'operations_manager',
  'project_manager',
  'analyst',
  'developer',
  'designer',
  'general_assistant',
  'custom'
));

-- Step 3: Verify the constraint was added successfully
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'ai_agents_role_check';

-- Step 4: Make created_by and team_id nullable (optional for development)
ALTER TABLE public.ai_agents 
ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.ai_agents 
ALTER COLUMN team_id DROP NOT NULL;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ AI Agents table constraint updated successfully!';
  RAISE NOTICE '✅ The following roles are now allowed:';
  RAISE NOTICE '   - executive_assistant (Aurora)';
  RAISE NOTICE '   - sales_rep (Vega)';
  RAISE NOTICE '   - customer_support (Luma)';
  RAISE NOTICE '   - marketing_strategist (Orion)';
  RAISE NOTICE '   - operations_manager (Titan)';
  RAISE NOTICE '   - project_manager';
  RAISE NOTICE '   - analyst';
  RAISE NOTICE '   - developer';
  RAISE NOTICE '   - designer';
  RAISE NOTICE '   - general_assistant';
  RAISE NOTICE '   - custom';
END $$;
```

### Step 3: Verify Success

After running the script, you should see:

```
✅ AI Agents table constraint updated successfully!
✅ The following roles are now allowed:
   - executive_assistant (Aurora)
   - sales_rep (Vega)
   - customer_support (Luma)
   - marketing_strategist (Orion)
   - operations_manager (Titan)
   ...
```

### Step 4: Test the Integration

1. **Refresh your application** (http://localhost:8080)
2. **Clear your browser console** (F12 → Console → Clear)
3. **Navigate to the workspace**
4. **Watch the console** for these messages:

```javascript
✅ Agent saved to Supabase successfully: [agent data]
✅ Agent also cached in localStorage
```

## 🔍 What Changed in the Code

### Enhanced `agent-manager.ts`

The `saveAgent()` method now:

1. **Tries Supabase first** - Attempts to save to cloud database
2. **Falls back to localStorage** - If Supabase fails, still works offline
3. **Hybrid storage** - Saves to BOTH when Supabase is available
4. **Smart error handling** - Multiple fallback layers for reliability
5. **Detailed logging** - See exactly what's happening

### Storage Strategy

```
┌─────────────────────────────────────┐
│      User Creates/Updates Agent     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Try to Save to Supabase (Cloud)  │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
    ✅ Success   ❌ Fails
         │           │
         │           ▼
         │     ┌─────────────────┐
         │     │  Fallback to    │
         │     │  localStorage   │
         │     └─────────────────┘
         │           │
         └─────┬─────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Also Save to localStorage (Cache)  │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         ✅ Agent Saved!              │
│  Available in Supabase & Offline    │
└─────────────────────────────────────┘
```

## 🎯 Benefits of This Approach

### 1. **Cloud Sync** ✅
- AI agents synced across devices
- Team can share agent configurations
- Persistent storage in Supabase

### 2. **Offline Support** ✅
- Works without internet connection
- localStorage fallback ensures reliability
- No data loss if Supabase fails

### 3. **Performance** ✅
- localStorage provides instant access
- Supabase provides cloud backup
- Best of both worlds

### 4. **Reliability** ✅
- Multiple fallback layers
- Comprehensive error handling
- Detailed logging for debugging

## 🧪 Testing Checklist

After running the SQL script:

- [ ] Open browser console (F12)
- [ ] Navigate to workspace
- [ ] Check for Supabase save success messages
- [ ] Verify agents appear in Supabase dashboard (Table Editor → ai_agents)
- [ ] Check localStorage (Application → Local Storage → nexus_ai_agents)
- [ ] Try creating a new account and verify agents sync
- [ ] Test offline mode (disable network) - should still work

## 📊 Monitoring Agent Storage

### Check Supabase:
1. Go to **Table Editor** in Supabase dashboard
2. Select **ai_agents** table
3. See all saved agents with their data

### Check localStorage:
1. Open browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Find key: `nexus_ai_agents`
4. See local cache of agents

### Check Console Logs:
```javascript
// Successful Supabase save:
✅ Agent saved to Supabase successfully: {...}
✅ Agent also cached in localStorage

// Fallback to localStorage:
⚠️ No authenticated user found, using localStorage
✅ Agent saved to localStorage: aurora

// Error fallback:
❌ Supabase error, falling back to localStorage: {...}
✅ Agent saved to localStorage (fallback): aurora
```

## 🔧 Troubleshooting

### Issue: Still getting constraint errors

**Solution:**
1. Make sure you ran the ENTIRE SQL script
2. Check that the constraint was dropped first
3. Verify the new constraint was added
4. Try running the script again

### Issue: "Table ai_agents does not exist"

**Solution:**
1. You need to run the main database migration first
2. Check `database-migration.sql` for the full schema
3. The ai_agents table should be created there

### Issue: Agents not appearing in Supabase

**Solution:**
1. Check if you're signed in (agents need `created_by`)
2. Look for "No authenticated user" in console
3. Agents will still save to localStorage
4. After signing in, new agents will sync to Supabase

### Issue: Permission errors in Supabase

**Solution:**
1. Check Row Level Security (RLS) policies
2. Make sure policies allow INSERT/UPDATE for authenticated users
3. Temporarily disable RLS for testing (not recommended for production)

## 🎉 Expected Results

After setup, you should see:

### In Browser Console:
```
✅ Supabase client initialized: { url: "https://...", hasKey: true }
✅ Supabase connection test successful
🔍 Attempting to save agent: Aurora
👤 Current user: [user-id]
📝 Mapped agent data: {...}
💾 Final agent data to save: {...}
📊 Supabase response: { data: [...], error: null }
✅ Agent saved to Supabase successfully: [...]
✅ Agent also cached in localStorage
✅ All AI agents initialized with workspace integration
```

### In Supabase Dashboard:
- Navigate to **Table Editor** → **ai_agents**
- See rows with agents: Aurora, Vega, Luma, Orion, Titan
- Each with role, permissions, model config, etc.

### In Browser localStorage:
- Key: `nexus_ai_agents`
- Value: JSON object with all agents
- Provides offline access and instant loading

## 📚 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL CHECK Constraints**: https://www.postgresql.org/docs/current/ddl-constraints.html
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Summary

You now have:
- ✅ Updated database constraint allowing custom agent roles
- ✅ Nullable fields for development flexibility
- ✅ Hybrid storage (Supabase + localStorage)
- ✅ Automatic fallback mechanisms
- ✅ Full cloud sync for AI agents
- ✅ Offline support and reliability

**Your AI agents are now fully integrated with Supabase!** 🚀

