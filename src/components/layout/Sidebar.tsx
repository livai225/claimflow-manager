import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Users,
  Shield,
  LogOut,
  PlusCircle,
  UserCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ROLE_CONFIG } from '@/types/claims';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, permission: 'claims.view' },
  { name: 'Nouveau sinistre', href: '/claims/new', icon: PlusCircle, permission: 'claims.create' },
  { name: 'Sinistres', href: '/claims', icon: FileText, permission: 'claims.view' },
  { name: 'Paiements', href: '/payments', icon: CreditCard, permission: 'payments.view' },
  { name: 'Rapports', href: '/reports', icon: BarChart3, permission: 'reports.view' },
  { name: 'Utilisateurs', href: '/users', icon: Users, permission: 'users.view' },
  { name: 'Intervenants', href: '/participants', icon: UserCircle, permission: 'users.view' }, // Added new navigation item
  { name: 'Administration', href: '/admin', icon: Settings, permission: '*' },
];

export const Sidebar: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const filteredNavigation = navigation.filter(item =>
    hasPermission(item.permission) || hasPermission('*')
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">NSIA</h1>
            <p className="text-xs text-sidebar-foreground/60">Sinistre App</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60">{ROLE_CONFIG[user.role].label}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
