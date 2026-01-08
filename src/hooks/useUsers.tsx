import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, ROLE_CONFIG } from '@/types/claims';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type AppRole = Database['public']['Enums']['app_role'];

export interface DBUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  phone?: string;
  role: UserRole;
  roles: AppRole[];
  createdAt: Date;
}

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

export function useUsers() {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Fetch all user roles
      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        throw rolesError;
      }

      // Map profiles with their roles
      const usersWithRoles: DBUser[] = profiles.map(profile => {
        const userRoles = allRoles
          .filter(r => r.user_id === profile.id)
          .map(r => r.role);

        // Déterminer le rôle principal
        let primaryRole: UserRole = 'assure';
        for (const priorityRole of rolePriority) {
          if (userRoles.includes(priorityRole)) {
            primaryRole = roleMapping[priorityRole];
            break;
          }
        }

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar || profile.name.substring(0, 2).toUpperCase(),
          phone: profile.phone || undefined,
          role: primaryRole,
          roles: userRoles,
          createdAt: new Date(profile.created_at),
        };
      });

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = useCallback(async (userId: string, newRole: AppRole) => {
    try {
      // Supprimer tous les rôles existants
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Ajouter le nouveau rôle
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      toast.success('Rôle mis à jour avec succès');
      await fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  }, [fetchUsers]);

  const updateUserProfile = useCallback(async (userId: string, data: { name?: string; phone?: string }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      toast.success('Profil mis à jour avec succès');
      await fetchUsers();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  }, [fetchUsers]);

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    gestionnaires: users.filter(u => u.role === 'gestionnaire').length,
    experts: users.filter(u => u.role === 'expert').length,
    assures: users.filter(u => u.role === 'assure').length,
  };

  return {
    users,
    isLoading,
    error,
    stats,
    fetchUsers,
    updateUserRole,
    updateUserProfile,
  };
}
