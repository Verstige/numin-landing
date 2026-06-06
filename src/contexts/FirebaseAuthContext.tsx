/**
 * FirebaseAuthContext — Clerk Compatibility Shim
 * 
 * Replaces Firebase auth with Clerk while keeping the same hook API.
 * All existing components using useFirebaseAuth() continue working unchanged.
 */
import React, { createContext, useContext } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

// Minimal Firebase User shape that existing components depend on
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, data?: object) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Map Clerk user → Firebase User shape
  const user: User | null = clerkUser ? {
    uid: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
    displayName: clerkUser.fullName ?? clerkUser.username ?? null,
    photoURL: clerkUser.imageUrl ?? null,
    emailVerified: clerkUser.primaryEmailAddress?.verification?.status === 'verified',
  } : null;

  const signIn = async (_email: string, _password: string) => {
    // Clerk handles sign-in via its prebuilt UI — redirect to /auth
    window.location.href = '/auth';
  };

  const signUp = async (_email: string, _password: string, _data?: object) => {
    window.location.href = '/auth';
  };

  const logout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const resetPassword = async (_email: string) => {
    window.location.href = '/auth';
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!clerkUser) return;
    try {
      await clerkUser.update({
        firstName: data.displayName?.split(' ')[0],
        lastName: data.displayName?.split(' ').slice(1).join(' ') || undefined,
      });
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading: !isLoaded,
      signIn,
      signUp,
      logout,
      resetPassword,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
