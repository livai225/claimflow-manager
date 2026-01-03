import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClaims } from '@/contexts/ClaimsContext';
import type { ProcessStep } from '@/types/claims';
import { CheckCircle, FileText, AlertTriangle, Clock } from 'lucide-react';

type ClaimProcessStepsProps = {
  claimId: string;
};

const stepIconById: Record<string, React.ReactNode> = {
  declaration: <FileText className="h-5 w-5" />,
  instruction: <AlertTriangle className="h-5 w-5" />,
  expertise: <Clock className="h-5 w-5" />,
  validation: <AlertTriangle className="h-5 w-5" />,
  paiement: <CheckCircle className="h-5 w-5" />,
};

const formatDateTime = (d: Date) => d.toLocaleString('fr-FR');

export function ClaimProcessSteps({ claimId }: ClaimProcessStepsProps) {
  const { getClaimById, startProcessStep, completeProcessStep } = useClaims();
  const claim = getClaimById(claimId);

  if (!claim) return null;

  const getStatusMeta = (step: ProcessStep) => {
    if (step.status === 'completed') {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        label: 'Terminé',
      } as const;
    }
    if (step.status === 'in_progress') {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        label: 'En cours',
      } as const;
    }
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: <Clock className="h-5 w-5 text-gray-400" />,
      label: 'En attente',
    } as const;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Étapes de traitement du sinistre</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {claim.processSteps.map((step, index) => {
          const isCurrent = claim.currentStepId === step.id;
          const meta = getStatusMeta(step);
          const icon = stepIconById[step.id] ?? <Clock className="h-5 w-5" />;

          const canStart = isCurrent && step.status === 'pending';
          const canComplete = isCurrent && step.status === 'in_progress';

          return (
            <div key={step.id}>
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full ${meta.bg}`}>{meta.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className={`text-lg font-medium ${isCurrent ? meta.text : 'text-gray-900'}`}>{step.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {meta.label}
                        {step.startedAt ? ` • Démarré: ${formatDateTime(new Date(step.startedAt))}` : ''}
                        {step.completedAt ? ` • Terminé: ${formatDateTime(new Date(step.completedAt))}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-muted-foreground">{icon}</div>
                      {canStart && (
                        <Button size="sm" onClick={() => startProcessStep(claim.id, step.id)}>
                          Démarrer
                        </Button>
                      )}
                      {canComplete && (
                        <Button size="sm" onClick={() => completeProcessStep(claim.id, step.id)}>
                          Terminer
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    {step.description.map((line, i) => (
                      <p key={i} className={line.startsWith('•') ? 'ml-4' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {!!step.requiredActions?.length && isCurrent && (
                    <div className="mt-4 bg-accent/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-2">Actions requises :</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {step.requiredActions.map((a, i) => (
                          <li key={i}>• {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {index < claim.processSteps.length - 1 && (
                <div className="ml-5 pl-4 border-l-2 border-gray-200 h-8 my-2"></div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
