import { ProcessStep, Participant } from '@/types/claims';

// Helper functions for creating process steps and participants
// Kept for backwards compatibility but no longer exports mock data

export const createInitialSteps = (): ProcessStep[] => [
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
