import React from 'react';
import { ClaimStatus, STATUS_CONFIG } from '@/types/claims';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ClaimStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusStyles: Record<ClaimStatus, string> = {
  ouvert: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  en_analyse: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  en_expertise: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  en_validation: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  approuve: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  rejete: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  paye: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  clos: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

const statusDotStyles: Record<ClaimStatus, string> = {
  ouvert: 'bg-blue-500',
  en_analyse: 'bg-amber-500',
  en_expertise: 'bg-purple-500',
  en_validation: 'bg-cyan-500',
  approuve: 'bg-emerald-500',
  rejete: 'bg-red-500',
  paye: 'bg-green-500',
  clos: 'bg-gray-500',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all',
        statusStyles[status],
        sizeClasses[size]
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', statusDotStyles[status])} />
      {config.label}
    </span>
  );
};
