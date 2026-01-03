import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Users,
  LogOut,
  PlusCircle,
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ROLE_CONFIG } from '@/types/claims';
import nsiaLogo from '@/assets/nsia-logo.png';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, permission: 'claims.view' },
  { name: 'Nouveau sinistre', href: '/claims/new', icon: PlusCircle, permission: 'claims.create' },
  { name: 'Sinistres', href: '/claims', icon: FileText, permission: 'claims.view' },
  { name: 'Paiements', href: '/payments', icon: CreditCard, permission: 'payments.view' },
  { name: 'Rapports', href: '/reports', icon: BarChart3, permission: 'reports.view' },
  { name: 'Utilisateurs', href: '/users', icon: Users, permission: 'users.view' },
  { name: 'Intervenants', href: '/participants', icon: UserCircle, permission: 'users.view' },
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
        <div className="flex h-20 items-center gap-3 px-6 border-b border-sidebar-border">
          <img 
            src={nsiaLogo} 
            alt="NSIA" 
            className="h-10 w-auto"
          />
          <div className="h-8 w-px bg-sidebar-border" />
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Sinistre</p>
            <p className="text-[10px] text-sidebar-foreground/50">Application</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Menu principal
          </p>
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 opacity-50" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm shadow-gold">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                  <p className="text-xs text-sidebar-foreground/60">{ROLE_CONFIG[user.role].label}</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
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
