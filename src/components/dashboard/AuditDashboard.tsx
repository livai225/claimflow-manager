import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Filter,
  FileText,
  Calendar,
  User,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Claim, ClaimEvent, STATUS_CONFIG, TYPE_CONFIG } from '@/types/claims';

interface AuditDashboardProps {
  claims: Claim[];
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({ claims }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Collecter tous les événements de tous les dossiers
  const allEvents = React.useMemo(() => {
    const events: (ClaimEvent & { claimId: string; claimType: string })[] = [];
    
    claims.forEach(claim => {
      claim.events.forEach(event => {
        events.push({
          ...event,
          claimId: claim.id,
          claimType: claim.type
        });
      });
    });
    
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [claims]);

  // Statistiques de conformité
  const complianceStats = React.useMemo(() => {
    const now = new Date();
    let declarationConformity = 0;
    let expertiseConformity = 0;
    let paymentConformity = 0;
    let totalWithExpertise = 0;
    let totalWithPayment = 0;
    
    claims.forEach(claim => {
      const incidentDate = new Date(claim.dateIncident);
      const declarationDate = new Date(claim.dateDeclaration);
      const daysSinceIncident = Math.floor((declarationDate.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Vérifier le délai de déclaration (5 jours)
      if (daysSinceIncident <= 5) {
        declarationConformity++;
      }
      
      // Vérifier si l'expertise a été faite dans les délais
      if (claim.expertise) {
        totalWithExpertise++;
        if (claim.expertise.completedDate) {
          const expertiseDays = Math.floor(
            (new Date(claim.expertise.completedDate).getTime() - declarationDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (expertiseDays <= 14) {
            expertiseConformity++;
          }
        }
      }
      
      // Vérifier le délai de paiement
      if (claim.payment && claim.payment.status === 'paye') {
        totalWithPayment++;
        if (claim.payment.processedAt) {
          const approvalDate = claim.events.find(e => e.type === 'validation')?.date || declarationDate;
          const paymentDays = Math.floor(
            (new Date(claim.payment.processedAt).getTime() - new Date(approvalDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (paymentDays <= 30) {
            paymentConformity++;
          }
        }
      }
    });
    
    return {
      declaration: {
        rate: claims.length > 0 ? Math.round((declarationConformity / claims.length) * 100) : 100,
        compliant: declarationConformity,
        total: claims.length
      },
      expertise: {
        rate: totalWithExpertise > 0 ? Math.round((expertiseConformity / totalWithExpertise) * 100) : 100,
        compliant: expertiseConformity,
        total: totalWithExpertise
      },
      payment: {
        rate: totalWithPayment > 0 ? Math.round((paymentConformity / totalWithPayment) * 100) : 100,
        compliant: paymentConformity,
        total: totalWithPayment
      }
    };
  }, [claims]);

  // Filtrer les dossiers
  const filteredClaims = React.useMemo(() => {
    return claims.filter(claim => {
      const matchesSearch = searchTerm === '' || 
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.declarant.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesType = typeFilter === 'all' || claim.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [claims, searchTerm, statusFilter, typeFilter]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'creation': return <FileText className="h-4 w-4" />;
      case 'affectation': return <User className="h-4 w-4" />;
      case 'statut': return <ArrowRight className="h-4 w-4" />;
      case 'validation': return <CheckCircle className="h-4 w-4 text-status-success" />;
      case 'rejet': return <XCircle className="h-4 w-4 text-status-error" />;
      case 'paiement': return <CheckCircle className="h-4 w-4 text-status-success" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-2 mb-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Audit & Traçabilité</h2>
        <Badge variant="outline" className="ml-auto">Mode lecture seule</Badge>
      </div>

      {/* Indicateurs de conformité */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-l-4 ${complianceStats.declaration.rate >= 90 ? 'border-l-status-success' : complianceStats.declaration.rate >= 70 ? 'border-l-status-warning' : 'border-l-status-error'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Délai de Déclaration</p>
              {complianceStats.declaration.rate >= 90 ? (
                <CheckCircle className="h-5 w-5 text-status-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-status-warning" />
              )}
            </div>
            <p className="text-3xl font-bold">{complianceStats.declaration.rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {complianceStats.declaration.compliant}/{complianceStats.declaration.total} conformes (≤5j)
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${complianceStats.expertise.rate >= 90 ? 'border-l-status-success' : complianceStats.expertise.rate >= 70 ? 'border-l-status-warning' : 'border-l-status-error'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Délai d'Expertise</p>
              {complianceStats.expertise.rate >= 90 ? (
                <CheckCircle className="h-5 w-5 text-status-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-status-warning" />
              )}
            </div>
            <p className="text-3xl font-bold">{complianceStats.expertise.rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {complianceStats.expertise.compliant}/{complianceStats.expertise.total} conformes (≤2 sem.)
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${complianceStats.payment.rate >= 90 ? 'border-l-status-success' : complianceStats.payment.rate >= 70 ? 'border-l-status-warning' : 'border-l-status-error'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Délai de Règlement</p>
              {complianceStats.payment.rate >= 90 ? (
                <CheckCircle className="h-5 w-5 text-status-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-status-warning" />
              )}
            </div>
            <p className="text-3xl font-bold">{complianceStats.payment.rate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {complianceStats.payment.compliant}/{complianceStats.payment.total} conformes (≤30j)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par n° sinistre, police ou déclarant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historique des événements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Journal des Événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {allEvents.slice(0, 20).map((event, index) => (
              <div 
                key={`${event.id}-${index}`} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-background border">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {event.claimId}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {TYPE_CONFIG[event.claimType as keyof typeof TYPE_CONFIG]?.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{event.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{event.user.name}</span>
                    <span>•</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>
                <Link to={`/claims/${event.claimId}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des dossiers consultables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Dossiers Consultables ({filteredClaims.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">N° Sinistre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Déclarant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date déclaration</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.slice(0, 10).map((claim) => (
                  <tr key={claim.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{claim.id}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {TYPE_CONFIG[claim.type]?.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{claim.declarant.name}</td>
                    <td className="py-3 px-4">
                      <Badge className={STATUS_CONFIG[claim.status]?.color}>
                        {STATUS_CONFIG[claim.status]?.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(claim.dateDeclaration).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link to={`/claims/${claim.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          Consulter
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
