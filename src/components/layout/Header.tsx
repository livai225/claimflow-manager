import React from 'react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un dossier..." 
            className="w-72 pl-11 h-11 bg-muted/30 border-border/50 rounded-xl focus:bg-background focus:border-primary/50 transition-all"
          />
        </div>

        {/* Quick Actions */}
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5">
          <Sparkles className="h-5 w-5 text-primary" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative h-11 w-11 rounded-xl border-border/50 hover:border-primary/50 hover:bg-primary/5">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground flex items-center justify-center shadow-lg animate-pulse-gold">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Notifications</p>
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Tout marquer lu</span>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1.5 p-4 cursor-pointer hover:bg-primary/5 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm font-semibold">Nouveau sinistre assigné</p>
                </div>
                <p className="text-xs text-muted-foreground pl-4">CLM-2024-001 - Il y a 5 min</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1.5 p-4 cursor-pointer hover:bg-primary/5 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-success" />
                  <p className="text-sm font-semibold">Expertise terminée</p>
                </div>
                <p className="text-xs text-muted-foreground pl-4">CLM-2024-003 - Il y a 1h</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1.5 p-4 cursor-pointer hover:bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-warning" />
                  <p className="text-sm font-semibold">Paiement en attente</p>
                </div>
                <p className="text-xs text-muted-foreground pl-4">CLM-2024-005 - Il y a 2h</p>
              </DropdownMenuItem>
            </div>
            <div className="p-3 border-t border-border bg-muted/30">
              <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 text-sm font-medium">
                Voir toutes les notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
