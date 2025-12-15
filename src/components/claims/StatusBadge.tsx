import React from 'react';
import { ClaimStatus, STATUS_CONFIG } from '@/types/claims';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ClaimStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        config.color
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
};
