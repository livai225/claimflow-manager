import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, CheckCircle, ArrowRight, 
  AlertCircle
} from 'lucide-react';
import { Claim, STATUS_CONFIG, TYPE_CONFIG, ClaimStatus } from '@/types/claims';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface InsuredDashboardProps {
  claims: Claim[];
}

const statusFlow: ClaimStatus[] = ['ouvert', 'en_analyse', 'en_expertise', 'en_validation', 'approuve', 'paye', 'clos'];

const getProgressPercentage = (status: ClaimStatus) => {
  const index = statusFlow.indexOf(status);
  return Math.round(((index + 1) / statusFlow.length) * 100);
};

const getNextStep = (status: ClaimStatus) => {
  switch (status) {
    case 'ouvert':
      return "En attente d'attribution à un gestionnaire";
    case 'en_analyse':
      return "Analyse des pièces justificatives en cours";
    case 'en_expertise':
      return "Attente du rapport d'expertise";
    case 'en_validation':
      return "Validation finale du dossier";
    case 'approuve':
      return "Préparation du paiement";
    case 'paye':
      return "Dossier clôturé";
    case 'clos':
      return "Dossier archivé";
    case 'rejete':
      return "Consultez le motif du rejet";
    default:
      return "Traitement en cours";
  }
};

const ActiveClaimCard: React.FC<{ claim: Claim }> = ({ claim }) => {
  const typeConfig = TYPE_CONFIG[claim.type];
  const TypeIcon = typeConfig.icon;
  const statusConfig = STATUS_CONFIG[claim.status];
  const progress = getProgressPercentage(claim.status);
  const nextStep = getNextStep(claim.status);

  return (
    <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Icon & Basic Info */}
          <div className="flex items-start gap-4 min-w-[200px]">
            <div className={`p-3 rounded-xl ${typeConfig.bgColor}`}>
              <TypeIcon className={`h-8 w-8 ${typeConfig.textColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{typeConfig.label}</h3>
              <p className="text-sm text-muted-foreground mb-1">{claim.policyNumber}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Progress & Status */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Progression</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
              <div className="mt-0.5">
                {claim.status === 'rejete' ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <Clock className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Prochaine étape</p>
                <p className="text-sm text-muted-foreground">{nextStep}</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center justify-end">
            <Link to={`/claims/${claim.id}`}>
              <Button variant="outline" className="gap-2">
                Voir les détails
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const InsuredDashboard: React.FC<InsuredDashboardProps> = ({ claims }) => {
  const sortedClaims = React.useMemo(() => {
    return [...claims].sort((a, b) => b.dateDeclaration.getTime() - a.dateDeclaration.getTime());
  }, [claims]);

  const activeClaims = React.useMemo(() => {
    return sortedClaims.filter(c => !['clos', 'paye', 'rejete'].includes(c.status));
  }, [sortedClaims]);

  const selectedClaim = activeClaims[0] ?? sortedClaims[0];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dossier en cours</p>
              <p className="text-2xl font-bold">{selectedClaim && !['clos', 'paye', 'rejete'].includes(selectedClaim.status) ? '1' : '0'}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accès au dossier</p>
              <p className="text-2xl font-bold">{selectedClaim ? 'OK' : '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Single Claim */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Suivi de votre dossier
        </h2>
        
        {selectedClaim ? (
          <ActiveClaimCard claim={selectedClaim} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium">Aucun dossier</h3>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore de dossier.
              </p>
              <Link to="/claims/new">
                <Button>Déclarer un sinistre</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
