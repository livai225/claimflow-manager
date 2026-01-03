import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-card hover:shadow-lg',
    primary: 'bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 hover:shadow-gold',
    success: 'bg-gradient-to-br from-status-success/5 via-status-success/10 to-status-success/5 border-status-success/20',
    warning: 'bg-gradient-to-br from-status-warning/5 via-status-warning/10 to-status-warning/5 border-status-warning/20',
  };

  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/15 text-primary shadow-inner-gold',
    success: 'bg-status-success/15 text-status-success',
    warning: 'bg-status-warning/15 text-status-warning',
  };

  return (
    <Card className={cn(
      'p-6 transition-all duration-300 hover-lift group',
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-semibold',
              trend.isPositive 
                ? 'bg-status-success/10 text-status-success' 
                : 'bg-status-error/10 text-status-error'
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        <div className={cn(
          'p-3.5 rounded-2xl transition-transform duration-300 group-hover:scale-110',
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};
