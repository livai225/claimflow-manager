import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Claim, ClaimStatus, DashboardStats, ProcessStep, Participant, User, Expertise, ClaimEvent, ClaimType } from '@/types/claims';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DBClaimStatus = Database['public']['Enums']['claim_status'];
type DBClaimType = Database['public']['Enums']['claim_type'];

// Mapping entre les types DB et les types frontend
const statusMapping: Record<DBClaimStatus, ClaimStatus> = {
  declaration: 'ouvert',
  instruction: 'en_analyse',
  expertise: 'en_expertise',
  offre: 'en_validation',
  acceptation: 'approuve',
  paiement: 'paye',
  cloture: 'clos',
  rejete: 'rejete',
};

const typeMapping: Record<DBClaimType, ClaimType> = {
  automobile: 'auto',
  habitation: 'habitation',
  sante: 'sante',
  vie: 'vie',
  responsabilite_civile: 'responsabilite_civile',
  autre: 'auto', // fallback
};

const createInitialSteps = (): ProcessStep[] => [
  {
    id: 'declaration',
    title: '1. Déclaration du sinistre',
    description: [
      "Délai de 5 jours pour déclarer le sinistre à l'assureur dès sa connaissance.",
      'À la réception de la déclaration :',
      '• Accuser réception',
      '• Demander les pièces de procédure',
      "• Mandater un expert pour l'évaluation des dommages",
    ],
    status: 'in_progress',
    startedAt: new Date(),
    requiredActions: ['Vérifier les documents fournis', 'Assigner un gestionnaire'],
  },
  {
    id: 'instruction',
    title: "2. Phase d'instruction",
    description: [
      'À la réception des pièces de procédure :',
      "• Délivrer un acte de nomination à l'expert mandaté",
      "• Délai de 2 semaines pour le dépôt des conclusions de l'expert",
    ],
    status: 'pending',
    requiredActions: ['Attendre les pièces de procédure', 'Désigner un expert si nécessaire'],
  },
  {
    id: 'expertise',
    title: '3. Expertise et évaluation',
    description: [
      "L'expert doit évaluer les dommages et fournir un rapport détaillé.",
      "L'expert dispose d'un délai de 15 jours pour rendre son rapport.",
    ],
    status: 'pending',
    requiredActions: ["Attendre le rapport d'expertise", "Valider l'estimation des dommages"],
  },
  {
    id: 'validation',
    title: '4. Validation et décision',
    description: [
      "Le gestionnaire doit valider le rapport d'expertise.",
      "En cas d'accord, préparer la proposition d'indemnisation.",
    ],
    status: 'pending',
    requiredActions: ['Réviser le montant proposé', 'Approuver ou rejeter le dossier'],
  },
  {
    id: 'paiement',
    title: '5. Paiement et clôture',
    description: [
      "Préparer l'ordre de paiement.",
      'Vérifier les coordonnées bancaires du bénéficiaire.',
    ],
    status: 'pending',
    requiredActions: ["Préparer l'ordre de paiement", 'Effectuer le virement'],
  },
];

interface ClaimsContextType {
  claims: Claim[];
  stats: DashboardStats;
  isLoading: boolean;
  getClaimById: (id: string) => Claim | undefined;
  updateClaimStatus: (id: string, status: ClaimStatus) => void;
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'processSteps' | 'currentStepId' | 'participants' | 'expert'>) => Claim;
  filterClaims: (filters: ClaimFilters) => Claim[];
  updateProcessStep: (claimId: string, stepId: string, updates: Partial<ProcessStep>) => void;
  completeProcessStep: (claimId: string, stepId: string) => void;
  startProcessStep: (claimId: string, stepId: string) => void;
  upsertClaimExpertise: (claimId: string, input: { report?: string; estimatedAmount?: number; status: Expertise['status']; scheduledDate?: Date; completedDate?: Date; user: User }) => void;
  refreshClaims: () => Promise<void>;
}

interface ClaimFilters {
  status?: ClaimStatus[];
  type?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

// Helper pour convertir les données DB en type Claim frontend
const convertDBClaimToClaim = (dbClaim: any): Claim => {
  const declarant: User = dbClaim.declarant ? {
    id: dbClaim.declarant.id,
    email: dbClaim.declarant.email,
    name: dbClaim.declarant.name || 'Utilisateur',
    role: 'assure',
    avatar: dbClaim.declarant.avatar,
    createdAt: new Date(dbClaim.declarant.created_at || dbClaim.created_at),
  } : {
    id: dbClaim.declarant_id,
    email: '',
    name: 'Utilisateur',
    role: 'assure',
    createdAt: new Date(),
  };

  const gestionnaire: User | undefined = dbClaim.gestionnaire ? {
    id: dbClaim.gestionnaire.id,
    email: dbClaim.gestionnaire.email,
    name: dbClaim.gestionnaire.name || 'Gestionnaire',
    role: 'gestionnaire',
    avatar: dbClaim.gestionnaire.avatar,
    createdAt: new Date(),
  } : undefined;

  const expert: User | undefined = dbClaim.expert ? {
    id: dbClaim.expert.id,
    email: dbClaim.expert.email,
    name: dbClaim.expert.name || 'Expert',
    role: 'expert',
    avatar: dbClaim.expert.avatar,
    createdAt: new Date(),
  } : undefined;

  const participants: Participant[] = [
    { ...declarant, roleLabel: 'Déclarant' },
  ];
  if (gestionnaire) {
    participants.push({ ...gestionnaire, roleLabel: 'Gestionnaire' });
  }
  if (expert) {
    participants.push({ ...expert, roleLabel: 'Expert' });
  }

  const documents = (dbClaim.documents || []).map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    url: doc.url,
    uploadedAt: new Date(doc.created_at),
    uploadedBy: declarant,
  }));

  const events: ClaimEvent[] = (dbClaim.claim_events || []).map((evt: any) => ({
    id: evt.id,
    type: evt.event_type as ClaimEvent['type'],
    description: evt.description,
    date: new Date(evt.created_at),
    user: evt.user ? {
      id: evt.user_id,
      email: '',
      name: evt.user?.name || 'Système',
      role: 'gestionnaire' as const,
      avatar: evt.user?.avatar,
      createdAt: new Date(),
    } : declarant,
  }));

  const dbStatus = dbClaim.status as DBClaimStatus;
  const dbType = dbClaim.type as DBClaimType;

  return {
    id: dbClaim.claim_number || dbClaim.id,
    policyNumber: dbClaim.policy_number,
    type: typeMapping[dbType] || 'auto',
    status: statusMapping[dbStatus] || 'ouvert',
    declarant,
    assignedTo: gestionnaire,
    expert,
    participants,
    dateIncident: new Date(dbClaim.incident_date),
    dateDeclaration: new Date(dbClaim.declaration_date),
    location: dbClaim.location || '',
    description: dbClaim.description,
    estimatedAmount: dbClaim.amount_claimed ? Number(dbClaim.amount_claimed) : undefined,
    approvedAmount: dbClaim.amount_approved ? Number(dbClaim.amount_approved) : undefined,
    paidAmount: dbClaim.amount_paid ? Number(dbClaim.amount_paid) : undefined,
    documents,
    events,
    processSteps: createInitialSteps(),
    currentStepId: 'declaration',
    createdAt: new Date(dbClaim.created_at),
    updatedAt: new Date(dbClaim.updated_at),
  };
};

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    openClaims: 0,
    closedClaims: 0,
    totalPaid: 0,
    avgProcessingDays: 0,
    claimsByStatus: {} as Record<ClaimStatus, number>,
    claimsByType: {} as Record<ClaimType, number>,
  });

  const fetchClaims = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          declarant:profiles!claims_declarant_id_fkey(id, name, email, avatar, created_at),
          gestionnaire:profiles!claims_gestionnaire_id_fkey(id, name, email, avatar),
          expert:profiles!claims_expert_id_fkey(id, name, email, avatar),
          documents(*),
          claim_events(*, user:profiles(name, avatar))
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching claims:', error);
        return;
      }

      const convertedClaims = (data || []).map(convertDBClaimToClaim);
      setClaims(convertedClaims);

      // Calculate stats
      const totalClaims = convertedClaims.length;
      const openClaims = convertedClaims.filter(c => !['clos', 'paye', 'rejete'].includes(c.status)).length;
      const closedClaims = convertedClaims.filter(c => c.status === 'clos').length;
      const totalPaid = convertedClaims.reduce((acc, c) => acc + (c.paidAmount || 0), 0);

      const claimsByStatus = convertedClaims.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<ClaimStatus, number>);

      const claimsByType = convertedClaims.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<ClaimType, number>);

      setStats({
        totalClaims,
        openClaims,
        closedClaims,
        totalPaid,
        avgProcessingDays: 0,
        claimsByStatus,
        claimsByType,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const getClaimById = useCallback((id: string) => {
    return claims.find(c => c.id === id);
  }, [claims]);

  const updateClaimStatus = useCallback((id: string, status: ClaimStatus) => {
    setClaims(prev => prev.map(claim =>
      claim.id === id
        ? { ...claim, status, updatedAt: new Date() }
        : claim
    ));
  }, []);

  const addClaim = useCallback((claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'processSteps' | 'currentStepId' | 'participants' | 'expert'>): Claim => {
    const initialSteps = createInitialSteps();
    const newClaim: Claim = {
      ...claimData,
      id: `CLM-${new Date().getFullYear()}-${String(claims.length + 1).padStart(3, '0')}`,
      participants: [{ ...claimData.declarant, roleLabel: 'Déclarant' }],
      processSteps: initialSteps,
      currentStepId: 'declaration',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setClaims(prev => [newClaim, ...prev]);
    return newClaim;
  }, [claims.length]);

  const filterClaims = useCallback((filters: ClaimFilters): Claim[] => {
    return claims.filter(claim => {
      if (filters.status?.length && !filters.status.includes(claim.status)) return false;
      if (filters.type?.length && !filters.type.includes(claim.type)) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!claim.id.toLowerCase().includes(search) &&
            !claim.policyNumber.toLowerCase().includes(search) &&
            !claim.description.toLowerCase().includes(search)) {
          return false;
        }
      }
      if (filters.dateFrom && claim.dateDeclaration < filters.dateFrom) return false;
      if (filters.dateTo && claim.dateDeclaration > filters.dateTo) return false;
      return true;
    });
  }, [claims]);

  const updateProcessStep = useCallback((claimId: string, stepId: string, updates: Partial<ProcessStep>) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id !== claimId) return claim;
      const updatedSteps = claim.processSteps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      );
      return { ...claim, processSteps: updatedSteps, updatedAt: new Date() };
    }));
  }, []);

  const completeProcessStep = useCallback((claimId: string, stepId: string) => {
    setClaims(prev =>
      prev.map(claim => {
        if (claim.id !== claimId) return claim;
        const updatedSteps = claim.processSteps.map(step =>
          step.id === stepId ? { ...step, status: 'completed' as const, completedAt: new Date() } : step
        );
        const currentIndex = claim.processSteps.findIndex(step => step.id === stepId);
        const nextStep = claim.processSteps[currentIndex + 1];
        return {
          ...claim,
          processSteps: updatedSteps,
          currentStepId: nextStep?.id || stepId,
          status: nextStep ? claim.status : 'clos',
          updatedAt: new Date()
        };
      })
    );
  }, []);

  const startProcessStep = useCallback((claimId: string, stepId: string) => {
    updateProcessStep(claimId, stepId, { status: 'in_progress', startedAt: new Date() });
  }, [updateProcessStep]);

  const upsertClaimExpertise = useCallback((
    claimId: string,
    input: { report?: string; estimatedAmount?: number; status: Expertise['status']; scheduledDate?: Date; completedDate?: Date; user: User }
  ) => {
    setClaims(prev =>
      prev.map(claim => {
        if (claim.id !== claimId) return claim;
        const now = new Date();
        const existing = claim.expertise;
        const expertise: Expertise = {
          id: existing?.id ?? `exp-${Date.now()}`,
          claimId: claim.id,
          expertId: input.user.id,
          status: input.status,
          scheduledDate: input.scheduledDate ?? existing?.scheduledDate,
          completedDate: input.completedDate ?? existing?.completedDate,
          report: input.report ?? existing?.report,
          estimatedAmount: input.estimatedAmount ?? existing?.estimatedAmount,
          createdAt: existing?.createdAt ?? now,
        };
        const newEvent: ClaimEvent = {
          id: `evt-expertise-${Date.now()}`,
          type: 'expertise',
          description: `Rapport d'expertise mis à jour par ${input.user.name}`,
          date: now,
          user: input.user,
        };
        return { ...claim, expertise, events: [newEvent, ...claim.events], updatedAt: now };
      })
    );
  }, []);

  return (
    <ClaimsContext.Provider value={{
      claims,
      stats,
      isLoading,
      getClaimById,
      updateClaimStatus,
      addClaim,
      filterClaims,
      updateProcessStep,
      completeProcessStep,
      startProcessStep,
      upsertClaimExpertise,
      refreshClaims: fetchClaims,
    }}>
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};
