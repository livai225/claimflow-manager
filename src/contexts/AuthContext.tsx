import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, ROLE_CONFIG } from '@/types/claims';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mapping des rôles DB vers les rôles frontend
const roleMapping: Record<AppRole, UserRole> = {
  admin: 'admin',
  responsable: 'responsable',
  gestionnaire: 'gestionnaire',
  expert: 'expert',
  medecin_expert: 'medecin_expert',
  comptabilite: 'comptabilite',
  direction: 'direction',
  audit: 'audit',
  assure: 'assure',
};

// Priorité des rôles (le plus élevé en premier)
const rolePriority: AppRole[] = [
  'admin',
  'direction',
  'responsable',
  'gestionnaire',
  'comptabilite',
  'expert',
  'medecin_expert',
  'audit',
  'assure',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Fetch roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return null;
      }

      // Déterminer le rôle principal (le plus prioritaire)
      const roles = userRoles?.map(r => r.role) || [];
      let primaryRole: UserRole = 'assure';
      
      for (const priorityRole of rolePriority) {
        if (roles.includes(priorityRole)) {
          primaryRole = roleMapping[priorityRole];
          break;
        }
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: primaryRole,
        avatar: profile.avatar || profile.name.substring(0, 2).toUpperCase(),
        phone: profile.phone || undefined,
        createdAt: new Date(profile.created_at),
      };
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Defer the fetch to avoid deadlock
          setTimeout(() => {
            fetchUserData(newSession.user).then(setUser);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      
      if (existingSession?.user) {
        fetchUserData(existingSession.user).then((userData) => {
          setUser(userData);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const permissions = ROLE_CONFIG[user.role]?.permissions || [];
    return permissions.includes('*') || permissions.includes(permission);
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isAuthenticated: !!user, 
      isLoading,
      login, 
      logout, 
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
