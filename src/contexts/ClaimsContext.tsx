import React, { createContext, useContext, useState, useCallback } from 'react';
import { Claim, ClaimStatus, DashboardStats, ProcessStep, Participant, User, Expertise, ClaimEvent } from '@/types/claims';
import { mockClaims, mockDashboardStats, mockUsers } from '@/data/mockData';

 const createInitialSteps = (): ProcessStep[] => [
   {
     id: 'declaration',
     title: '1. Déclaration du sinistre',
     description: [
       "Délai de 5 jours pour déclarer le sinistre à l'assureur dès sa connaissance (Article 27, paragraphe 4 du Code des assurances).",
       'À la réception de la déclaration :',
       '• Accuser réception',
       '• Demander les pièces de procédure',
       "• Mandater un expert pour l'évaluation des dommages",
       '• Attribuer un numéro de sinistre au dossier',
     ],
     status: 'in_progress',
     startedAt: new Date(),
     requiredActions: ['Vérifier les documents fournis', 'Assigner un gestionnaire', "Passer à l'analyse"],
   },
   {
     id: 'instruction',
     title: "2. Phase d'instruction",
     description: [
       'À la réception des pièces de procédure :',
       "• Délivrer un acte de nomination à l'expert mandaté",
       "• Délai de 2 semaines pour le dépôt des conclusions de l'expert",
       '\nPour les sinistres corporels :',
       "• Délivrer un bon de prise en charge pour l'hôpital",
       "• Délivrer une lettre de demande d'informations pour la victime ou les ayants droit (Articles 81 et 89 du Code des assurances)",
     ],
     status: 'pending',
     requiredActions: ['Attendre les pièces de procédure', 'Désigner un expert si nécessaire', 'Délivrer les documents requis'],
   },
   {
     id: 'expertise',
     title: '3. Expertise et évaluation',
     description: [
       "L'expert doit évaluer les dommages et fournir un rapport détaillé.",
       "L'expert dispose d'un délai de 15 jours pour rendre son rapport.",
       'Le rapport doit inclure :',
       '• L\u2019évaluation des dommages',
       '• Les causes du sinistre',
       '• Les mesures de prévention recommandées',
     ],
     status: 'pending',
     requiredActions: ["Attendre le rapport d'expertise", "Valider l'estimation des dommages", 'Préparer le dossier pour validation'],
   },
   {
     id: 'validation',
     title: '4. Validation et décision',
     description: [
       "Le gestionnaire doit valider le rapport d'expertise.",
       "En cas d'accord, préparer la proposition d'indemnisation.",
       "En cas de désaccord, demander des compléments d'information.",
       'Transmettre la décision au service compétent pour le paiement.',
     ],
     status: 'pending',
     requiredActions: ['Réviser le montant proposé', 'Approuver ou rejeter le dossier', 'Notifier le déclarant'],
   },
   {
     id: 'paiement',
     title: '5. Paiement et clôture',
     description: [
       "Préparer l'ordre de paiement.",
       'Vérifier les coordonnées bancaires du bénéficiaire.',
       'Effectuer le virement bancaire.',
       'Archiver le dossier une fois le paiement effectué.',
     ],
     status: 'pending',
     requiredActions: ["Préparer l'ordre de paiement", 'Vérifier les coordonnées bancaires', 'Effectuer le virement'],
   },
 ];

interface ClaimsContextType {
  claims: Claim[];
  stats: DashboardStats;
  getClaimById: (id: string) => Claim | undefined;
  updateClaimStatus: (id: string, status: ClaimStatus) => void;
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'processSteps' | 'currentStepId' | 'participants' | 'expert'>) => Claim;
  filterClaims: (filters: ClaimFilters) => Claim[];
  updateProcessStep: (claimId: string, stepId: string, updates: Partial<ProcessStep>) => void;
  completeProcessStep: (claimId: string, stepId: string) => void;
  startProcessStep: (claimId: string, stepId: string) => void;
  upsertClaimExpertise: (claimId: string, input: { report?: string; estimatedAmount?: number; status: Expertise['status']; scheduledDate?: Date; completedDate?: Date; user: User }) => void;
}

const buildParticipants = (args: { declarant: User; assignedTo?: User; expert?: User }): Participant[] => {
  const participants: Participant[] = [
    {
      ...args.declarant,
      role: args.declarant.role,
      roleLabel: 'Déclarant',
    },
  ];

  if (args.assignedTo) {
    participants.push({
      ...args.assignedTo,
      role: args.assignedTo.role,
      roleLabel: 'Gestionnaire',
    });
  }

  if (args.expert) {
    participants.push({
      ...args.expert,
      role: args.expert.role,
      roleLabel: 'Expert',
    });
  }

  return participants;
};

interface ClaimFilters {
  status?: ClaimStatus[];
  type?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>(() =>
    mockClaims.map(claim => {
      if (claim.processSteps?.length && claim.currentStepId) return claim;
      return {
        ...claim,
        processSteps: createInitialSteps(),
        currentStepId: 'declaration',
      };
    })
  );
  const [stats] = useState<DashboardStats>(mockDashboardStats);

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

    const defaultExpert = mockUsers.find(u => u.role === 'expert');

    const newClaim: Claim = {
      ...claimData,
      id: `CLM-${new Date().getFullYear()}-${String(claims.length + 1).padStart(3, '0')}`,
      expert: defaultExpert,
      participants: buildParticipants({ declarant: claimData.declarant, assignedTo: claimData.assignedTo, expert: defaultExpert }),
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
      
      return {
        ...claim,
        processSteps: updatedSteps,
        updatedAt: new Date()
      };
    }));
  }, []);

  const completeProcessStep = useCallback((claimId: string, stepId: string) => {
    setClaims(prev => 
      prev.map(claim => {
        if (claim.id !== claimId) return claim;
        
        const updatedSteps = claim.processSteps.map(step => 
          step.id === stepId 
            ? { 
                ...step, 
                status: 'completed' as const, // Type assertion here
                completedAt: new Date() 
              } 
            : step
        );

        // Trouver l'index de l'étape actuelle
        const currentIndex = claim.processSteps.findIndex(step => step.id === stepId);
        const nextStep = claim.processSteps[currentIndex + 1];
        
        // Créer une copie mise à jour de la réclamation
        const updatedClaim: Claim = {
          ...claim,
          processSteps: updatedSteps,
          currentStepId: nextStep?.id || stepId,
          status: nextStep ? claim.status : 'clos',
          updatedAt: new Date()
        };

        return updatedClaim;
      })
    );
  }, []);

  const startProcessStep = useCallback((claimId: string, stepId: string) => {
    updateProcessStep(claimId, stepId, { 
      status: 'in_progress',
      startedAt: new Date() 
    });
  }, [updateProcessStep]);

  const upsertClaimExpertise = useCallback((
    claimId: string,
    input: {
      report?: string;
      estimatedAmount?: number;
      status: Expertise['status'];
      scheduledDate?: Date;
      completedDate?: Date;
      user: User;
    }
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

        return {
          ...claim,
          expertise,
          events: [newEvent, ...claim.events],
          updatedAt: now,
        };
      })
    );
  }, []);

  return (
    <ClaimsContext.Provider value={{
      claims,
      stats,
      getClaimById,
      updateClaimStatus,
      addClaim,
      filterClaims,
      updateProcessStep,
      completeProcessStep,
      startProcessStep,
      upsertClaimExpertise,
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
