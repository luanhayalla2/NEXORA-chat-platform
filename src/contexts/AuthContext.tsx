import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeUserInput, isValidEmail, validatePassword } from '@/lib/sanitize';
import { logSecurityEvent, checkRateLimit } from '@/lib/securityLogger';
import type { User, AuthState, LoginCredentials, SignupCredentials } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    email: '',
    avatarUrl: data.avatar_url || '',
    bio: data.bio || '',
    phone: data.phone || '',
    lastSeen: new Date(data.last_seen || Date.now()),
    isOnline: data.is_online || false,
    createdAt: new Date(data.created_at || Date.now()),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid Supabase client deadlock
          setTimeout(async () => {
            const profile = await fetchProfile(session.user.id);
            setState({
              user: profile ? { ...profile, email: session.user.email || '' } : null,
              isAuthenticated: !!profile,
              isLoading: false,
            });
          }, 0);
        } else {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: profile ? { ...profile, email: session.user.email || '' } : null,
          isAuthenticated: !!profile,
          isLoading: false,
        });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error(error.message);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          username: credentials.username,
          display_name: credentials.displayName,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error(error.message);
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const userId = state.user?.id;
    if (!userId) return;

    const updates: Record<string, unknown> = {};
    if (data.displayName !== undefined) updates.display_name = data.displayName;
    if (data.username !== undefined) updates.username = data.username;
    if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.phone !== undefined) updates.phone = data.phone;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (!error) {
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
      }));
    }
  }, [state.user?.id]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
