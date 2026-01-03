import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, User, FileText, Download,
  Clock, CheckCircle, AlertTriangle, MessageSquare, Phone, Mail, Building2, X
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatusBadge } from '@/components/claims/StatusBadge';
import { useClaims } from '@/contexts/ClaimsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { TYPE_CONFIG, STATUS_CONFIG, ClaimStatus, User as UserType } from '@/types/claims';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ClaimProcessSteps } from '@/components/ClaimProcessSteps';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statusFlow: ClaimStatus[] = ['ouvert', 'en_analyse', 'en_expertise', 'en_validation', 'approuve', 'paye', 'clos'];

const ClaimDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getClaimById, updateClaimStatus, upsertClaimExpertise } = useClaims();
  const { hasPermission, user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [expertiseStatus, setExpertiseStatus] = useState<'planifie' | 'en_cours' | 'termine'>('planifie');
  const [expertiseScheduledDate, setExpertiseScheduledDate] = useState<string>('');
  const [expertiseCompletedDate, setExpertiseCompletedDate] = useState<string>('');
  const [expertiseEstimatedAmount, setExpertiseEstimatedAmount] = useState<string>('');
  const [expertiseReport, setExpertiseReport] = useState<string>('');

  const formatGNF = (amount: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  const isMandatedExpert = user?.role === 'expert' && claim.expert?.id === user.id;
  const canEditExpertise = isMandatedExpert && (hasPermission('expertise.edit') || hasPermission('expertise.create') || hasPermission('*'));

  React.useEffect(() => {
    const exp = claim.expertise;
    if (!exp) return;

    setExpertiseStatus(exp.status);
    setExpertiseScheduledDate(exp.scheduledDate ? format(exp.scheduledDate, 'yyyy-MM-dd') : '');
    setExpertiseCompletedDate(exp.completedDate ? format(exp.completedDate, 'yyyy-MM-dd') : '');
    setExpertiseEstimatedAmount(exp.estimatedAmount != null ? String(exp.estimatedAmount) : '');
    setExpertiseReport(exp.report ?? '');
  }, [claim.expertise]);

  const handleUserClick = (user: UserType) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const currentStatusIndex = statusFlow.indexOf(claim.status);

  return (
    <div className="min-h-screen">
      <Header
        title={`Sinistre ${claim.id}`}
        subtitle={claim.policyNumber}
      />

      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Link to="/claims">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux sinistres
          </Button>
        </Link>

        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${typeConfig.bgColor}`}>
                  <TypeIcon className={`h-6 w-6 ${typeConfig.textColor}`} />
                </div>
                <div>
                  <CardTitle className="text-2xl">{claim.id}</CardTitle>
                  <p className="text-muted-foreground">{typeConfig.label}</p>
                </div>
              </div>
              <StatusBadge status={claim.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{claim.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date incident</p>
                  <p className="font-medium">{format(claim.dateIncident, 'dd MMMM yyyy', { locale: fr })}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Lieu</p>
                  <p className="font-medium">{claim.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="font-medium">{claim.documents.length} fichier(s)</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Intervenants cliquables */}
            <div>
              <h3 className="font-semibold mb-3">Intervenants</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleUserClick(claim.declarant)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {claim.declarant.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Déclarant</p>
                    <p className="font-medium truncate">{claim.declarant.name}</p>
                  </div>
                </button>

                {claim.assignedTo && (
                  <button
                    onClick={() => handleUserClick(claim.assignedTo!)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {claim.assignedTo.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Assigné à</p>
                      <p className="font-medium truncate">{claim.assignedTo.name}</p>
                    </div>
                  </button>
                )}

                {claim.expert && (
                  <button
                    onClick={() => handleUserClick(claim.expert!)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {claim.expert.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Expert</p>
                      <p className="font-medium truncate">{claim.expert.name}</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="progression" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="process">Processus</TabsTrigger>
            <TabsTrigger value="expertise">Expertise</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          {/* Onglet Progression détaillé */}
          <TabsContent value="progression">
            <Card>
              <CardHeader>
                <CardTitle>Progression du dossier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusFlow.map((status, index) => {
                    const config = STATUS_CONFIG[status];
                    const isPast = index < currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isFuture = index > currentStatusIndex;

                    return (
                      <div key={status} className="relative">
                        {index < statusFlow.length - 1 && (
                          <div
                            className={cn(
                              'absolute left-5 top-12 w-0.5 h-16',
                              isPast ? 'bg-status-success' : 'bg-border'
                            )}
                          />
                        )}
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                              isPast && 'bg-status-success text-white',
                              isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                              isFuture && 'bg-muted text-muted-foreground'
                            )}
                          >
                            {isPast ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : isCurrent ? (
                              <Clock className="h-5 w-5" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-current" />
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={cn('font-semibold', isCurrent && 'text-primary')}>
                                {config.label}
                              </h4>
                              {isPast && (
                                <span className="text-xs text-muted-foreground">
                                  Complété
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-xs text-primary font-medium">
                                  En cours
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {status === 'ouvert' && 'Le sinistre a été déclaré et enregistré dans le système.'}
                              {status === 'en_analyse' && 'Le dossier est en cours d\'analyse par le gestionnaire pour vérifier la recevabilité.'}
                              {status === 'en_expertise' && 'Un expert a été mandaté pour évaluer les dommages et estimer le montant.'}
                              {status === 'en_validation' && 'Le dossier est en attente de validation par le superviseur.'}
                              {status === 'approuve' && 'Le sinistre a été approuvé et le montant d\'indemnisation a été déterminé.'}
                              {status === 'paye' && 'Le paiement a été effectué au bénéficiaire.'}
                              {status === 'clos' && 'Le dossier est clôturé, toutes les démarches sont terminées.'}
                            </p>
                            {isCurrent && (
                              <div className="bg-accent/50 p-3 rounded-lg">
                                <p className="text-sm font-medium mb-2">Actions requises :</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {status === 'ouvert' && (
                                    <>
                                      <li>• Vérifier les documents fournis</li>
                                      <li>• Assigner un gestionnaire</li>
                                      <li>• Passer à l'analyse</li>
                                    </>
                                  )}
                                  {status === 'en_analyse' && (
                                    <>
                                      <li>• Analyser la conformité du dossier</li>
                                      <li>• Vérifier la couverture d'assurance</li>
                                      <li>• Décider si une expertise est nécessaire</li>
                                    </>
                                  )}
                                  {status === 'en_expertise' && (
                                    <>
                                      <li>• Attendre le rapport d'expertise</li>
                                      <li>• Valider l'estimation des dommages</li>
                                      <li>• Préparer le dossier pour validation</li>
                                    </>
                                  )}
                                  {status === 'en_validation' && (
                                    <>
                                      <li>• Réviser le montant proposé</li>
                                      <li>• Approuver ou rejeter le dossier</li>
                                      <li>• Notifier le déclarant</li>
                                    </>
                                  )}
                                  {status === 'approuve' && (
                                    <>
                                      <li>• Préparer l'ordre de paiement</li>
                                      <li>• Vérifier les coordonnées bancaires</li>
                                      <li>• Effectuer le virement</li>
                                    </>
                                  )}
                                  {status === 'paye' && (
                                    <>
                                      <li>• Confirmer la réception du paiement</li>
                                      <li>• Archiver les documents</li>
                                      <li>• Clôturer le dossier</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {claim.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Ajouté le {format(doc.uploadedAt, 'dd/MM/yyyy', { locale: fr })} par {doc.uploadedBy.name}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Historique */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des événements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claim.events.map((event, index) => (
                    <div key={event.id} className="relative">
                      {index < claim.events.length - 1 && (
                        <div className="absolute left-5 top-12 w-0.5 h-full bg-border" />
                      )}
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{event.description}</p>
                            <span className="text-sm text-muted-foreground">
                              {format(event.date, 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Par {event.user.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Processus */}
          <TabsContent value="process">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Processus de traitement du sinistre</h3>
              <ClaimProcessSteps claimId={claim.id} />
            </div>
          </TabsContent>

          {/* Onglet Expertise */}
          <TabsContent value="expertise">
            <Card>
              <CardHeader>
                <CardTitle>Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canEditExpertise && (
                  <div className="text-sm text-muted-foreground">
                    {claim.expertise
                      ? 'Cette expertise est en lecture seule.'
                      : "Aucune expertise n'a encore été enregistrée."}
                  </div>
                )}

                {claim.expertise && !canEditExpertise && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <span className="font-medium">{claim.expertise.status}</span>
                    </div>
                    {claim.expertise.scheduledDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Planifiée</span>
                        <span className="font-medium">{format(claim.expertise.scheduledDate, 'dd/MM/yyyy', { locale: fr })}</span>
                      </div>
                    )}
                    {claim.expertise.completedDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Terminée</span>
                        <span className="font-medium">{format(claim.expertise.completedDate, 'dd/MM/yyyy', { locale: fr })}</span>
                      </div>
                    )}
                    {claim.expertise.estimatedAmount != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant estimé</span>
                        <span className="font-medium">{formatGNF(claim.expertise.estimatedAmount)}</span>
                      </div>
                    )}
                    {claim.expertise.report && (
                      <div>
                        <p className="text-muted-foreground mb-1">Rapport</p>
                        <p className="whitespace-pre-wrap">{claim.expertise.report}</p>
                      </div>
                    )}
                  </div>
                )}

                {canEditExpertise && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select value={expertiseStatus} onValueChange={(v) => setExpertiseStatus(v as 'planifie' | 'en_cours' | 'termine')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planifie">Planifiée</SelectItem>
                          <SelectItem value="en_cours">En cours</SelectItem>
                          <SelectItem value="termine">Terminée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date planifiée</Label>
                        <Input type="date" value={expertiseScheduledDate} onChange={(e) => setExpertiseScheduledDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Date de fin</Label>
                        <Input type="date" value={expertiseCompletedDate} onChange={(e) => setExpertiseCompletedDate(e.target.value)} disabled={expertiseStatus !== 'termine'} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Montant estimé (GNF)</Label>
                      <Input type="number" value={expertiseEstimatedAmount} onChange={(e) => setExpertiseEstimatedAmount(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Rapport</Label>
                      <Textarea value={expertiseReport} onChange={(e) => setExpertiseReport(e.target.value)} rows={6} />
                    </div>

                    <Button
                      onClick={() => {
                        if (!user) return;
                        upsertClaimExpertise(claim.id, {
                          status: expertiseStatus,
                          scheduledDate: expertiseScheduledDate ? new Date(expertiseScheduledDate) : undefined,
                          completedDate: expertiseCompletedDate ? new Date(expertiseCompletedDate) : undefined,
                          estimatedAmount: expertiseEstimatedAmount ? Number(expertiseEstimatedAmount) : undefined,
                          report: expertiseReport || undefined,
                          user,
                        });
                      }}
                    >
                      Enregistrer l'expertise
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Participants */}
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Déclarant */}
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {claim.declarant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{claim.declarant.name}</p>
                      <p className="text-sm text-muted-foreground">Déclarant</p>
                    </div>
                  </div>

                  {/* Gestionnaire assigné */}
                  {claim.assignedTo && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {claim.assignedTo.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{claim.assignedTo.name}</p>
                        <p className="text-sm text-muted-foreground">Gestionnaire</p>
                      </div>
                    </div>
                  )}

                  {/* Expert */}
                  {claim.expert && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {claim.expert.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{claim.expert.name}</p>
                        <p className="text-sm text-muted-foreground">Expert</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Montants */}
          <TabsContent value="montants">
            <Card>
              <CardHeader>
                <CardTitle>Informations financières</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimé</span>
                  <span className="font-semibold">{formatGNF(claim.estimatedAmount || 0)}</span>
                </div>
                {claim.approvedAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approuvé</span>
                    <span className="font-semibold text-status-success">{formatGNF(claim.approvedAmount)}</span>
                  </div>
                )}
                {claim.paidAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payé</span>
                    <span className="font-semibold text-primary">{formatGNF(claim.paidAmount)}</span>
                  </div>
                )}
                {claim.rejectionReason && (
                  <div className="bg-destructive/10 p-3 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-1">Raison du rejet</p>
                    <p className="text-sm text-muted-foreground">{claim.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Détails Intervenant */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'intervenant</DialogTitle>
            <DialogDescription>
              Informations complètes sur cet intervenant
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {selectedUser.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{selectedUser.role.replace('_', ' ')}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">+224 622 XXX XXX</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Département</p>
                    <p className="font-medium">NSIA Assurances Guinée</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Membre depuis</p>
                    <p className="font-medium">{format(selectedUser.createdAt, 'dd MMMM yyyy', { locale: fr })}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button className="flex-1" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </Button>
                <Button className="flex-1" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClaimDetail;
