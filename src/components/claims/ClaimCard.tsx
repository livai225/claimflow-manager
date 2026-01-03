import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, User, FileText, ArrowRight } from 'lucide-react';
import { Claim, TYPE_CONFIG, STATUS_CONFIG } from '@/types/claims';
import { StatusBadge } from './StatusBadge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClaimCardProps {
  claim: Claim;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim }) => {
  const statusConfig = STATUS_CONFIG[claim.status];
  const typeConfig = TYPE_CONFIG[claim.type];

  const formatGNF = (amount: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  const TypeIcon = typeConfig.icon;

  return (
    <Link to={`/claims/${claim.id}`}>
      <Card className="group p-5 hover:shadow-gold hover:border-primary/30 transition-all duration-300 cursor-pointer hover-lift overflow-hidden relative">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${typeConfig.bgColor} transition-transform group-hover:scale-110`}>
              <TypeIcon className={`h-5 w-5 ${typeConfig.textColor}`} />
            </div>
            <div>
              <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                {claim.id}
              </p>
              <p className="text-xs text-muted-foreground font-medium">{claim.policyNumber}</p>
            </div>
          </div>
          <StatusBadge status={claim.status} />
        </div>

        <p className="text-sm text-foreground/80 mb-4 line-clamp-2 leading-relaxed">
          {claim.description}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            <span>{format(claim.dateIncident, 'dd MMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <MapPin className="h-3.5 w-3.5 text-primary/70" />
            <span className="truncate">{claim.location}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <User className="h-3.5 w-3.5 text-primary/70" />
            <span className="truncate">{claim.declarant.name}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <FileText className="h-3.5 w-3.5 text-primary/70" />
            <span>{claim.documents.length} doc(s)</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {claim.estimatedAmount && (
              <p className="text-sm">
                <span className="text-muted-foreground">Estimé:</span>{' '}
                <span className="font-bold text-primary">
                  {formatGNF(claim.estimatedAmount)}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Voir détails
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
};
