# Authentication Setup Guide

This guide will help you set up and test the authentication system for Nexus AI.

## ✅ Prerequisites

1. **Supabase Account**: You must have a Supabase project set up
2. **Environment Variables**: The `.env` file has been created with your Supabase credentials
3. **Database Tables**: You need to run the migration script in Supabase

## 🚀 Setup Steps

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (zxcdgyebqgyjzmheqbhy)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database-migration.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

**Important Notes:**
- The script is idempotent - you can run it multiple times safely
- It includes `IF NOT EXISTS` checks to prevent duplicate table creation
- It automatically creates the `profiles` table which is required for authentication
- Row Level Security (RLS) policies are automatically configured

### Step 2: Verify Environment Variables

The `.env` file has been automatically created with your credentials:

```env
VITE_SUPABASE_URL=https://zxcdgyebqgyjzmheqbhy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **This step is complete** - no action needed!

### Step 3: Configure Email Confirmations

By default, Supabase requires email confirmation for new accounts. For the "Get Started" button to work immediately after signup, you need to disable email confirmations for testing:

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Scroll to **Email Auth**
3. Toggle **Enable email confirmations** to OFF (for testing only)
4. Save changes

**Important**: 
- **With email confirmations ON**: User sees success page but must verify email before accessing workspace
- **With email confirmations OFF**: User can click "Get Started" and immediately access workspace

**Note**: For production, keep email confirmations enabled for security.

## 🧪 Testing Authentication

### Test Sign Up

1. Open the app: http://localhost:8080
2. You'll see the landing page
3. Click on any "Get Started" or "Sign Up" button
4. Fill in the sign-up form:
   - **Full Name**: Test User
   - **Email**: test@example.com
   - **Password**: TestPass123 (must have uppercase, lowercase, and number)
   - **Confirm Password**: TestPass123
5. Click **Create Account**

**Expected Result:**
- ✅ Success message: "Account Created Successfully!"
- ✅ Email verification message (if confirmations enabled)
- ✅ Welcome page with "Get Started" button
- ✅ Console logs showing successful signup

**If Error Occurs:**
- Check browser console (F12) for detailed error messages
- Verify database migration was run successfully
- Check that email doesn't already exist in Supabase Auth

### Test Sign In

1. If on the sign-up page, click **Sign in** at the bottom
2. Enter your credentials:
   - **Email**: test@example.com
   - **Password**: TestPass123
3. Click **Sign In**

**Expected Result:**
- ✅ Automatic redirect to `/workspace`
- ✅ User is logged in and sees the workspace dashboard
- ✅ Console logs showing successful signin

**If Error Occurs:**
- "Invalid email or password" → Check credentials
- "Email not confirmed" → Verify email or disable confirmations
- Check browser console for detailed errors

### Test Protected Routes

1. While logged in, try accessing:
   - `/workspace` - Main workspace
   - `/nexus` - Nexus AI dashboard
   - `/settings` - Settings page
2. All should load successfully

3. Sign out using the sidebar button
4. Try accessing the same routes again
5. You should be redirected to the auth page

## 🔍 Debugging

### Check Browser Console

Press F12 to open Developer Tools and check the Console tab for:

```javascript
// Successful signup
Attempting to sign up with: { email: "test@example.com", fullName: "Test User" }
AuthContext signUp called with: { email: "test@example.com", fullName: "Test User" }
Supabase signUp response: { data: {...}, error: null }
Sign up successful!

// Successful signin
AuthContext signIn called
```

### Common Errors and Solutions

#### "An unexpected error occurred"
- **Cause**: Database tables not created
- **Solution**: Run the database migration script in Supabase SQL Editor

#### "User already registered"
- **Cause**: Email already exists in Supabase Auth
- **Solution**: Use a different email or delete the user in Supabase Dashboard

#### White screen / No errors
- **Cause**: Dev server needs restart to pick up .env changes
- **Solution**: The dev server has been restarted automatically

#### "Invalid API key" or "Invalid project URL"
- **Cause**: Environment variables not loaded
- **Solution**: Check that `.env` file exists and restart dev server

### Verify Supabase Connection

Open browser console and run:

```javascript
// Check if environment variables are loaded
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has API Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Both should show valid values.

## 📋 Next Steps

Once authentication is working:

1. ✅ Users can sign up and sign in
2. ✅ Protected routes are secured
3. ✅ User profiles are automatically created
4. ✅ Session persists across page refreshes
5. 🔄 Migrate workspace components to use Supabase (next phase)

## 🆘 Need Help?

If you're still experiencing issues:

1. Check the Supabase dashboard for any error logs
2. Verify all tables were created successfully
3. Check browser console for detailed error messages
4. Ensure you're using the latest version of the code
5. Try using an incognito window to rule out cache issues

## 🎯 Success Criteria

✅ Authentication is working correctly when:

- You can create a new account without errors
- Email verification works (or is disabled for testing)
- You can sign in with your credentials
- Protected routes redirect to auth page when not logged in
- Protected routes are accessible when logged in
- Sign out works and clears the session
- Console shows no error messages

---

**Status**: Ready for testing! 🚀

The authentication system is now fully configured and ready to use.

