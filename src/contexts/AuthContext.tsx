import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types/claims';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  createClientAccount: (name: string, email: string, phone: string) => User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  responsable: ['claims.view', 'claims.validate', 'claims.reject', 'reports.view', 'users.view', 'dashboard.global', 'delays.monitor'],
  gestionnaire: ['claims.view', 'claims.edit', 'claims.assign', 'claims.instruction', 'documents.request', 'documents.upload', 'expert.designate', 'offer.prepare'],
  expert: ['claims.view.assigned', 'expertise.create', 'expertise.edit', 'documents.view', 'report.upload'],
  medecin_expert: ['claims.view.assigned.corporel', 'medical.report.create', 'medical.report.edit', 'documents.view.medical'],
  comptabilite: ['claims.view.validated', 'payments.create', 'payments.view', 'payment.proof.upload'],
  direction: ['dashboard.strategic', 'reports.view', 'kpi.view', 'performance.view'],
  audit: ['claims.view.readonly', 'history.view', 'delays.verify'],
  assure: ['claims.view.own', 'claims.create', 'documents.upload.own', 'offer.accept'],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulation d'authentification
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role];
    return permissions.includes('*') || permissions.includes(permission);
  }, [user]);

  const createClientAccount = useCallback((name: string, email: string, phone: string): User => {
    // Générer les initiales pour l'avatar
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Créer le nouvel utilisateur client
    const newClient: User = {
      id: `user-${Date.now()}`,
      email: email,
      name: name,
      role: 'assure',
      avatar: initials,
      createdAt: new Date(),
    };

    // Ajouter à la liste des utilisateurs mock (simulation)
    mockUsers.push(newClient);

    // Simuler l'envoi d'email avec les identifiants
    console.log(`📧 Email envoyé à ${email}`);
    console.log(`Identifiants de connexion:`);
    console.log(`Email: ${email}`);
    console.log(`Mot de passe: demo123`);

    return newClient;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasPermission, createClientAccount }}>
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
