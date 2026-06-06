// Authentication Context for Nexus AI
// Provides user authentication state and methods throughout the app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle profile creation/update on sign up
      if (event === 'SIGNED_IN' && session?.user) {
        await createOrUpdateProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createOrUpdateProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
            },
          ]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
      } else if (profile) {
        // Profile exists, update it if needed
        const updates: any = {};
        if (profile.email !== user.email) updates.email = user.email;
        if (profile.full_name !== user.user_metadata?.full_name) {
          updates.full_name = user.user_metadata?.full_name;
        }
        if (profile.avatar_url !== user.user_metadata?.avatar_url) {
          updates.avatar_url = user.user_metadata?.avatar_url;
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating profile:', updateError);
          }
        }
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('AuthContext signUp called with:', { email, fullName });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    console.log('Supabase signUp response:', { 
      data, 
      error,
      hasSession: !!data.session,
      hasUser: !!data.user,
      userConfirmed: data.user?.confirmed_at 
    });
    
    if (error) {
      console.error('Supabase signUp error:', error);
      throw error;
    }
    
    // If session was created, user is automatically signed in
    // If no session, user needs to confirm email first
    return data;
  };

  const signOut = async () => {
    console.log('🔐 AuthContext: Starting sign out process...');
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Supabase sign out error:', error);
        throw error;
      }
      
      console.log('✅ Supabase sign out successful');
      
      // Manually clear the local state to ensure immediate update
      setUser(null);
      setSession(null);
      
      console.log('✅ Local auth state cleared');
    } catch (error) {
      console.error('❌ Error in signOut:', error);
      
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      
      throw error;
    }
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    // Update the user metadata in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: updates
    });

    if (authError) {
      console.error('Error updating user metadata:', authError);
      // Don't throw here as the profile update was successful
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}