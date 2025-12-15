import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, User, FileText, ArrowRight } from 'lucide-react';
import { Claim, TYPE_CONFIG } from '@/types/claims';
import { StatusBadge } from './StatusBadge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClaimCardProps {
  claim: Claim;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim }) => {
  const typeConfig = TYPE_CONFIG[claim.type];
  const TypeIcon = typeConfig.icon;

  return (
    <Link to={`/claims/${claim.id}`}>
      <Card className="group p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
              <TypeIcon className={`h-5 w-5 ${typeConfig.textColor}`} />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {claim.id}
              </p>
              <p className="text-sm text-muted-foreground">{claim.policyNumber}</p>
            </div>
          </div>
          <StatusBadge status={claim.status} />
        </div>

        <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
          {claim.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {format(claim.dateIncident, 'dd MMM yyyy', { locale: fr })}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{claim.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {claim.declarant.name}
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {claim.documents.length} document(s)
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            {claim.estimatedAmount && (
              <p className="text-sm">
                <span className="text-muted-foreground">Estimé:</span>{' '}
                <span className="font-semibold text-foreground">
                  {claim.estimatedAmount.toLocaleString('fr-FR')} €
                </span>
              </p>
            )}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </Card>
    </Link>
  );
};
