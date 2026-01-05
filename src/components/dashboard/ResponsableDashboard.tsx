import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  FileText,
  AlertCircle,
  Timer,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Claim, STATUS_CONFIG, TYPE_CONFIG } from '@/types/claims';

interface ResponsableDashboardProps {
  claims: Claim[];
}

export const ResponsableDashboard: React.FC<ResponsableDashboardProps> = ({ claims }) => {
  // Calcul des délais légaux
  const delayAnalysis = React.useMemo(() => {
    const now = new Date();
    
    const claimsWithDelays = claims.map(claim => {
      const declarationDate = new Date(claim.dateDeclaration);
      const incidentDate = new Date(claim.dateIncident);
      const daysSinceDeclaration = Math.floor((now.getTime() - declarationDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceIncident = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Délais légaux selon le workflow
      const declarationDelay = 5; // 5 jours pour déclarer
      const expertiseDelay = 14; // 2 semaines pour l'expertise
      const medicalDelay = 20; // 20 jours pour le rapport médical
      const paymentDelay = 30; // 21-30 jours pour le paiement
      
      let isLate = false;
      let delayType = '';
      let daysOverdue = 0;
      
      if (claim.status === 'en_expertise' && daysSinceDeclaration > expertiseDelay) {
        isLate = true;
        delayType = 'Expertise en retard';
        daysOverdue = daysSinceDeclaration - expertiseDelay;
      } else if (claim.status === 'approuve' && daysSinceDeclaration > paymentDelay) {
        isLate = true;
        delayType = 'Paiement en retard';
        daysOverdue = daysSinceDeclaration - paymentDelay;
      } else if ((claim.status === 'ouvert' || claim.status === 'en_analyse') && daysSinceDeclaration > 7) {
        isLate = true;
        delayType = 'Instruction en retard';
        daysOverdue = daysSinceDeclaration - 7;
      }
      
      return {
        ...claim,
        daysSinceDeclaration,
        daysSinceIncident,
        isLate,
        delayType,
        daysOverdue
      };
    });
    
    const lateClaims = claimsWithDelays.filter(c => c.isLate);
    const urgentClaims = claimsWithDelays.filter(c => 
      !c.isLate && 
      c.status !== 'clos' && 
      c.status !== 'paye' && 
      c.status !== 'rejete' &&
      c.daysSinceDeclaration >= 10
    );
    
    return {
      all: claimsWithDelays,
      late: lateClaims,
      urgent: urgentClaims,
      onTime: claimsWithDelays.filter(c => !c.isLate && c.status !== 'clos' && c.status !== 'paye')
    };
  }, [claims]);

  // Statistiques par gestionnaire
  const gestionnairesStats = React.useMemo(() => {
    const stats: Record<string, { name: string; total: number; enCours: number; termine: number; enRetard: number }> = {};
    
    claims.forEach(claim => {
      if (claim.assignedTo) {
        const id = claim.assignedTo.id;
        if (!stats[id]) {
          stats[id] = { 
            name: claim.assignedTo.name, 
            total: 0, 
            enCours: 0, 
            termine: 0, 
            enRetard: 0 
          };
        }
        stats[id].total++;
        
        if (claim.status === 'clos' || claim.status === 'paye') {
          stats[id].termine++;
        } else {
          stats[id].enCours++;
        }
        
        const delayInfo = delayAnalysis.all.find(c => c.id === claim.id);
        if (delayInfo?.isLate) {
          stats[id].enRetard++;
        }
      }
    });
    
    return Object.values(stats);
  }, [claims, delayAnalysis]);

  const formatGNF = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} M GNF`;
    }
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Alertes délais */}
      <div className="flex items-center gap-2 mb-2">
        <Timer className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Suivi des Délais Légaux</h2>
      </div>

      {/* Indicateurs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${delayAnalysis.late.length > 0 ? 'border-l-status-error' : 'border-l-status-success'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dossiers en retard</p>
                <p className={`text-3xl font-bold ${delayAnalysis.late.length > 0 ? 'text-status-error' : 'text-status-success'}`}>
                  {delayAnalysis.late.length}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${delayAnalysis.late.length > 0 ? 'text-status-error' : 'text-muted-foreground/30'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-warning">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dossiers urgents</p>
                <p className="text-3xl font-bold text-status-warning">{delayAnalysis.urgent.length}</p>
              </div>
              <Clock className="h-8 w-8 text-status-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-status-success">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dans les délais</p>
                <p className="text-3xl font-bold text-status-success">{delayAnalysis.onTime.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-status-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de conformité</p>
                <p className="text-3xl font-bold text-primary">
                  {claims.length > 0 
                    ? Math.round(((claims.length - delayAnalysis.late.length) / claims.length) * 100) 
                    : 100}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des dossiers en retard */}
      {delayAnalysis.late.length > 0 && (
        <Card className="border-status-error/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-status-error">
              <AlertCircle className="h-4 w-4" />
              Dossiers en Dépassement de Délai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {delayAnalysis.late.slice(0, 5).map((claim) => (
                <div 
                  key={claim.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-status-error/5 border border-status-error/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-status-error/10">
                      <FileText className="h-4 w-4 text-status-error" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{claim.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_CONFIG[claim.type]?.label} • {claim.assignedTo?.name || 'Non assigné'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-1">
                      +{claim.daysOverdue} jours
                    </Badge>
                    <p className="text-xs text-status-error">{claim.delayType}</p>
                  </div>
                  <Link to={`/claims/${claim.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supervision des gestionnaires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Supervision des Gestionnaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Gestionnaire</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">En cours</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Terminés</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">En retard</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {gestionnairesStats.map((gestionnaire, index) => {
                  const performance = gestionnaire.total > 0 
                    ? Math.round(((gestionnaire.total - gestionnaire.enRetard) / gestionnaire.total) * 100) 
                    : 100;
                  return (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {gestionnaire.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-sm">{gestionnaire.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 font-semibold">{gestionnaire.total}</td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="secondary">{gestionnaire.enCours}</Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="outline" className="text-status-success border-status-success/30">
                          {gestionnaire.termine}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        {gestionnaire.enRetard > 0 ? (
                          <Badge variant="destructive">{gestionnaire.enRetard}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">0</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={performance} className="h-2 flex-1" />
                          <span className={`text-sm font-medium ${
                            performance >= 90 ? 'text-status-success' : 
                            performance >= 70 ? 'text-status-warning' : 'text-status-error'
                          }`}>
                            {performance}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rappel délais légaux */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rappel des Délais Légaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-2xl font-bold text-primary">5 jours</p>
              <p className="text-xs text-muted-foreground">Délai de déclaration du sinistre</p>
            </div>
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-2xl font-bold text-primary">2 sem.</p>
              <p className="text-xs text-muted-foreground">Dépôt du rapport d'expertise</p>
            </div>
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-2xl font-bold text-primary">20 jours</p>
              <p className="text-xs text-muted-foreground">Rapport médecin (corporel)</p>
            </div>
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-2xl font-bold text-primary">21-30j</p>
              <p className="text-xs text-muted-foreground">Délai de règlement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
