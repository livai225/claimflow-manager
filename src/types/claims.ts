import { Car, Home, Heart, Shield, Users, LucideIcon } from 'lucide-react';

export type ClaimStatus = 
  | 'ouvert' 
  | 'en_analyse' 
  | 'en_expertise' 
  | 'en_validation' 
  | 'approuve' 
  | 'rejete' 
  | 'paye' 
  | 'clos';

export type ClaimType = 
  | 'auto' 
  | 'habitation' 
  | 'sante' 
  | 'responsabilite_civile' 
  | 'vie';

export type UserRole = 
  | 'admin' 
  | 'responsable' 
  | 'gestionnaire' 
  | 'expert' 
  | 'medecin_expert'
  | 'comptabilite' 
  | 'direction'
  | 'audit'
  | 'assure';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: User;
}

export interface ClaimEvent {
  id: string;
  type: 'creation' | 'affectation' | 'statut' | 'document' | 'commentaire' | 'expertise' | 'validation' | 'paiement' | 'rejet' | 'cloture';
  description: string;
  date: Date;
  user: User;
}

export interface Expertise {
  id: string;
  expertId: string;
  claimId: string;
  status: 'planifie' | 'en_cours' | 'termine';
  scheduledDate?: Date;
  completedDate?: Date;
  report?: string;
  estimatedAmount?: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  claimId: string;
  amount: number;
  status: 'en_attente' | 'paye' | 'rejete';
  method?: 'virement' | 'cheque';
  reference?: string;
  processedAt?: Date;
  createdAt: Date;
}

export interface Participant extends Omit<User, 'role'> {
  role: UserRole;
  roleLabel: string;
  phone?: string;
  department?: string;
}

export type ProcessStep = {
  id: string;
  title: string;
  description: string[];
  status: 'completed' | 'in_progress' | 'pending';
  requiredActions?: string[];
  completedAt?: Date;
  startedAt?: Date;
};

export interface Claim {
  id: string;
  policyNumber: string;
  type: ClaimType;
  status: ClaimStatus;
  declarant: User;
  assignedTo?: User;
  expert?: User;
  participants: Participant[];
  dateIncident: Date;
  dateDeclaration: Date;
  location: string;
  description: string;
  estimatedAmount?: number;
  approvedAmount?: number;
  paidAmount?: number;
  rejectionReason?: string;
  documents: Document[];
  events: ClaimEvent[];
  expertise?: Expertise;
  payment?: Payment;
  processSteps: ProcessStep[];
  currentStepId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalClaims: number;
  openClaims: number;
  closedClaims: number;
  totalPaid: number;
  avgProcessingDays: number;
  claimsByStatus: Record<ClaimStatus, number>;
  claimsByType: Record<ClaimType, number>;
}

export const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string }> = {
  ouvert: { label: 'Ouvert', color: 'bg-status-info/10 text-status-info' },
  en_analyse: { label: 'En analyse', color: 'bg-status-warning/10 text-status-warning' },
  en_expertise: { label: 'En expertise', color: 'bg-purple-500/10 text-purple-500' },
  en_validation: { label: 'En validation', color: 'bg-orange-500/10 text-orange-500' },
  approuve: { label: 'Approuvé', color: 'bg-status-success/10 text-status-success' },
  rejete: { label: 'Rejeté', color: 'bg-status-error/10 text-status-error' },
  paye: { label: 'Payé', color: 'bg-emerald-500/10 text-emerald-500' },
  clos: { label: 'Clôturé', color: 'bg-muted text-muted-foreground' },
};

export const TYPE_CONFIG: Record<ClaimType, { label: string; icon: LucideIcon; bgColor: string; textColor: string }> = {
  auto: { label: 'Automobile', icon: Car, bgColor: 'bg-blue-500/10', textColor: 'text-blue-500' },
  habitation: { label: 'Habitation', icon: Home, bgColor: 'bg-amber-500/10', textColor: 'text-amber-500' },
  sante: { label: 'Santé', icon: Heart, bgColor: 'bg-red-500/10', textColor: 'text-red-500' },
  responsabilite_civile: { label: 'Resp. Civile', icon: Shield, bgColor: 'bg-purple-500/10', textColor: 'text-purple-500' },
  vie: { label: 'Vie', icon: Users, bgColor: 'bg-green-500/10', textColor: 'text-green-500' },
};

export const ROLE_CONFIG: Record<UserRole, { label: string; permissions: string[] }> = {
  admin: { label: 'Administrateur Système', permissions: ['*'] },
  responsable: { label: 'Responsable Sinistres', permissions: ['claims.view', 'claims.validate', 'claims.reject', 'reports.view', 'users.view', 'dashboard.global', 'delays.monitor'] },
  gestionnaire: { label: 'Gestionnaire Sinistre', permissions: ['claims.view', 'claims.edit', 'claims.assign', 'claims.instruction', 'documents.request', 'documents.upload', 'expert.designate', 'offer.prepare'] },
  expert: { label: 'Expert Agréé', permissions: ['claims.view.assigned', 'expertise.create', 'expertise.edit', 'documents.view', 'report.upload'] },
  medecin_expert: { label: 'Médecin Expert', permissions: ['claims.view.assigned.corporel', 'medical.report.create', 'medical.report.edit', 'documents.view.medical'] },
  comptabilite: { label: 'Service Financier', permissions: ['claims.view.validated', 'payments.create', 'payments.view', 'payment.proof.upload'] },
  direction: { label: 'Direction', permissions: ['dashboard.strategic', 'reports.view', 'kpi.view', 'performance.view'] },
  audit: { label: 'Audit / Régulateur', permissions: ['claims.view.readonly', 'history.view', 'delays.verify'] },
  assure: { label: 'Assuré', permissions: ['claims.view.own', 'claims.create', 'documents.upload.own', 'offer.accept'] },
};
