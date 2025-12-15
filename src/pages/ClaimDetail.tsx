import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, User, FileText, Download, 
  Clock, CheckCircle, AlertTriangle, Euro, MessageSquare 
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/claims/StatusBadge';
import { useClaims } from '@/contexts/ClaimsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { TYPE_CONFIG, STATUS_CONFIG, ClaimStatus } from '@/types/claims';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusFlow: ClaimStatus[] = ['ouvert', 'en_analyse', 'en_expertise', 'en_validation', 'approuve', 'paye', 'clos'];

const ClaimDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getClaimById, updateClaimStatus } = useClaims();
  const { hasPermission } = useAuth();
  
  const claim = getClaimById(id || '');

  if (!claim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Dossier non trouvé</h1>
          <p className="text-muted-foreground mb-4">Le dossier {id} n'existe pas.</p>
          <Link to="/claims">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux sinistres
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[claim.type];
  const TypeIcon = typeConfig.icon;
  const currentStatusIndex = statusFlow.indexOf(claim.status);

  const getNextStatus = (): ClaimStatus | null => {
    if (claim.status === 'rejete' || claim.status === 'clos') return null;
    const nextIndex = currentStatusIndex + 1;
    return nextIndex < statusFlow.length ? statusFlow[nextIndex] : null;
  };

  const nextStatus = getNextStatus();

  return (
    <div className="min-h-screen">
      <Header 
        title={`Dossier ${claim.id}`} 
        subtitle={`Police: ${claim.policyNumber}`}
      />

      <div className="p-6 space-y-6">
        {/* Back & Actions */}
        <div className="flex items-center justify-between">
          <Link to="/claims">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>

          <div className="flex gap-2">
            {nextStatus && (hasPermission('claims.edit') || hasPermission('*')) && (
              <Button onClick={() => updateClaimStatus(claim.id, nextStatus)}>
                Passer à: {STATUS_CONFIG[nextStatus].label}
              </Button>
            )}
            {claim.status !== 'rejete' && claim.status !== 'clos' && (hasPermission('claims.reject') || hasPermission('*')) && (
              <Button variant="destructive" onClick={() => updateClaimStatus(claim.id, 'rejete')}>
                Rejeter
              </Button>
            )}
          </div>
        </div>

        {/* Status Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Progression du dossier</h3>
            <StatusBadge status={claim.status} size="lg" />
          </div>
          <div className="relative">
            <div className="flex justify-between">
              {statusFlow.slice(0, -1).map((status, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const config = STATUS_CONFIG[status];
                
                return (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                      isCompleted && 'bg-status-success text-white',
                      isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                      !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                    )}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                    </div>
                    <p className={cn(
                      'text-xs mt-2 text-center',
                      isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}>
                      {config.label}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
              <div 
                className="h-full bg-status-success transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (statusFlow.length - 2)) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Détails</TabsTrigger>
                <TabsTrigger value="documents" className="flex-1">Documents ({claim.documents.length})</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${typeConfig.bgColor}`}>
                        <TypeIcon className={`h-6 w-6 ${typeConfig.textColor}`} />
                      </div>
                      <div>
                        <CardTitle>{typeConfig.label}</CardTitle>
                        <p className="text-sm text-muted-foreground">{claim.policyNumber}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                      <p className="text-foreground">{claim.description}</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date de l'incident</p>
                          <p className="font-medium">{format(claim.dateIncident, 'dd MMMM yyyy', { locale: fr })}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date de déclaration</p>
                          <p className="font-medium">{format(claim.dateDeclaration, 'dd MMMM yyyy', { locale: fr })}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 col-span-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Lieu</p>
                          <p className="font-medium">{claim.location}</p>
                        </div>
                      </div>
                    </div>

                    {claim.rejectionReason && (
                      <>
                        <Separator />
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <h4 className="font-medium text-destructive">Motif de rejet</h4>
                          </div>
                          <p className="text-sm text-foreground">{claim.rejectionReason}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {claim.documents.map((doc) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.type} • Ajouté le {format(doc.uploadedAt, 'dd/MM/yyyy', { locale: fr })}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {claim.events.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            {index < claim.events.length - 1 && (
                              <div className="w-0.5 flex-1 bg-border mt-2" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="font-medium text-sm">{event.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(event.date, "dd MMM yyyy 'à' HH:mm", { locale: fr })} • {event.user.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Commentaires internes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Ajouter un commentaire interne..."
                  className="mb-3"
                />
                <Button size="sm">Ajouter</Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Montants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimé</span>
                  <span className="font-semibold">{claim.estimatedAmount?.toLocaleString('fr-FR')} €</span>
                </div>
                {claim.approvedAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approuvé</span>
                    <span className="font-semibold text-status-success">{claim.approvedAmount.toLocaleString('fr-FR')} €</span>
                  </div>
                )}
                {claim.paidAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payé</span>
                    <span className="font-semibold text-primary">{claim.paidAmount.toLocaleString('fr-FR')} €</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* People */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Intervenants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Déclarant</p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {claim.declarant.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{claim.declarant.name}</p>
                      <p className="text-xs text-muted-foreground">{claim.declarant.email}</p>
                    </div>
                  </div>
                </div>

                {claim.assignedTo && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Gestionnaire</p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                        {claim.assignedTo.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{claim.assignedTo.name}</p>
                        <p className="text-xs text-muted-foreground">{claim.assignedTo.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {claim.expert && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expert</p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-status-info/10 flex items-center justify-center text-sm font-medium text-status-info">
                        {claim.expert.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{claim.expert.name}</p>
                        <p className="text-xs text-muted-foreground">{claim.expert.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;
