import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const roles = rolesData?.map(r => r.role) || ['assure'];

      return { profile, roles };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { profile: null, roles: ['assure'] as AppRole[] };
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session?.user,
          isLoading: !!session?.user, // Keep loading if we need to fetch profile
        }));

        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id).then(({ profile, roles }) => {
              setAuthState(prev => ({
                ...prev,
                profile,
                roles,
                isLoading: false,
              }));
            });
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            roles: [],
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          isAuthenticated: true,
          isLoading: true,
        }));
        
        fetchUserData(session.user.id).then(({ profile, roles }) => {
          setAuthState(prev => ({
            ...prev,
            profile,
            roles,
            isLoading: false,
          }));
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: { name?: string }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuthState({
        user: null,
        session: null,
        profile: null,
        roles: [],
        isLoading: false,
        isAuthenticated: false,
      });
    }
    return { error };
  }, []);

  const hasRole = useCallback((role: AppRole) => {
    return authState.roles.includes(role);
  }, [authState.roles]);

  const hasAnyRole = useCallback((roles: AppRole[]) => {
    return roles.some(role => authState.roles.includes(role));
  }, [authState.roles]);

  const getPrimaryRole = useCallback((): AppRole => {
    // Priority order for roles
    const priority: AppRole[] = [
      'admin', 'direction', 'responsable', 'gestionnaire', 
      'comptabilite', 'expert', 'medecin_expert', 'audit', 'assure'
    ];
    
    for (const role of priority) {
      if (authState.roles.includes(role)) {
        return role;
      }
    }
    return 'assure';
  }, [authState.roles]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    hasRole,
    hasAnyRole,
    getPrimaryRole,
  };
}
