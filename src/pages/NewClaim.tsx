import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, FileText, Calendar, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useClaims } from '@/contexts/ClaimsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { TYPE_CONFIG, ClaimType } from '@/types/claims';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const claimSchema = z.object({
    policyNumber: z.string().min(5, 'Le numéro de police doit contenir au moins 5 caractères'),
    type: z.enum(['auto', 'habitation', 'sante', 'responsabilite_civile', 'vie']),
    dateIncident: z.string().min(1, 'La date de l\'incident est requise'),
    dateDeclaration: z.string().min(1, 'La date de déclaration est requise'),
    location: z.string().min(3, 'Le lieu doit contenir au moins 3 caractères'),
    description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
    estimatedAmount: z.string().min(1, 'Le montant estimé est requis'),
});

type ClaimFormData = z.infer<typeof claimSchema>;

const steps = [
    { id: 1, title: 'Informations générales', icon: FileText },
    { id: 2, title: 'Détails du sinistre', icon: MapPin },
    { id: 3, title: 'Documents', icon: Upload },
    { id: 4, title: 'Récapitulatif', icon: Check },
];

const NewClaim: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const navigate = useNavigate();
    const { addClaim } = useClaims();
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ClaimFormData>({
        resolver: zodResolver(claimSchema),
        defaultValues: {
            dateDeclaration: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const formData = watch();
    const progress = (currentStep / steps.length) * 100;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploadedFiles(Array.from(e.target.files));
            toast.success(`${e.target.files.length} fichier(s) ajouté(s)`);
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
            toast.success('Étape validée !');
        }
    };

    const onSubmit = (data: ClaimFormData) => {
        // Dernière étape : créer le sinistre
        const newClaim = addClaim({
            policyNumber: data.policyNumber,
            type: data.type as ClaimType,
            status: 'ouvert',
            declarant: user!,
            dateIncident: new Date(data.dateIncident),
            dateDeclaration: new Date(data.dateDeclaration),
            location: data.location,
            description: data.description,
            estimatedAmount: parseFloat(data.estimatedAmount),
            documents: uploadedFiles.map((file, index) => ({
                id: `doc-new-${index}`,
                name: file.name,
                type: file.type,
                url: '#',
                uploadedAt: new Date(),
                uploadedBy: user!,
            })),
            events: [
                {
                    id: 'evt-new-1',
                    type: 'creation',
                    description: 'Déclaration de sinistre créée',
                    date: new Date(),
                    user: user!,
                },
            ],
        });

        toast.success('Sinistre créé avec succès !');
        navigate(`/claims/${newClaim.id}`);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="policyNumber">Numéro de police *</Label>
                            <Input
                                id="policyNumber"
                                placeholder="POL-AUTO-12345"
                                {...register('policyNumber')}
                            />
                            {errors.policyNumber && (
                                <p className="text-sm text-destructive">{errors.policyNumber.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type de sinistre *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setValue('type', value as ClaimType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                                {React.createElement(config.icon, { className: 'h-4 w-4' })}
                                                {config.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-destructive">{errors.type.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dateIncident">Date de l'incident *</Label>
                                <Input
                                    id="dateIncident"
                                    type="date"
                                    {...register('dateIncident')}
                                />
                                {errors.dateIncident && (
                                    <p className="text-sm text-destructive">{errors.dateIncident.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateDeclaration">Date de déclaration *</Label>
                                <Input
                                    id="dateDeclaration"
                                    type="date"
                                    {...register('dateDeclaration')}
                                />
                                {errors.dateDeclaration && (
                                    <p className="text-sm text-destructive">{errors.dateDeclaration.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="location">Lieu de l'incident *</Label>
                            <Input
                                id="location"
                                placeholder="Ex: Kaloum, Avenue de la République, Conakry"
                                {...register('location')}
                            />
                            {errors.location && (
                                <p className="text-sm text-destructive">{errors.location.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description détaillée *</Label>
                            <Textarea
                                id="description"
                                placeholder="Décrivez les circonstances du sinistre..."
                                rows={6}
                                {...register('description')}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estimatedAmount">Montant estimé (GNF) *</Label>
                            <Input
                                id="estimatedAmount"
                                type="number"
                                placeholder="Ex: 35000000 (35 millions GNF)"
                                {...register('estimatedAmount')}
                            />
                            {errors.estimatedAmount && (
                                <p className="text-sm text-destructive">{errors.estimatedAmount.message}</p>
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">Ajouter des documents</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Constat, photos, devis, factures...
                            </p>
                            <Input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="max-w-xs mx-auto"
                            />
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Fichiers ajoutés ({uploadedFiles.length})</h4>
                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                                    >
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Récapitulatif</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Numéro de police</p>
                                    <p className="font-medium">{formData.policyNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium">
                                        {formData.type && TYPE_CONFIG[formData.type as ClaimType]?.label}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date incident</p>
                                    <p className="font-medium">
                                        {formData.dateIncident && format(new Date(formData.dateIncident), 'dd/MM/yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Montant estimé</p>
                                    <p className="font-medium">{formData.estimatedAmount?.toLocaleString('fr-GN')} GNF</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Lieu</p>
                                <p className="font-medium">{formData.location}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Description</p>
                                <p className="text-sm">{formData.description}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Documents</p>
                                <p className="font-medium">{uploadedFiles.length} fichier(s)</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b bg-card">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/claims">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Retour
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Nouveau sinistre</h1>
                                <p className="text-sm text-muted-foreground">
                                    Étape {currentStep} sur {steps.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Progress */}
                <div className="mb-8">
                    <Progress value={progress} className="h-2 mb-4" />
                    <div className="grid grid-cols-4 gap-4">
                        {steps.map((step) => {
                            const StepIcon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div
                                    key={step.id}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg transition-colors',
                                        isActive && 'bg-primary/10',
                                        isCompleted && 'bg-muted'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'h-10 w-10 rounded-full flex items-center justify-center',
                                            isActive && 'bg-primary text-primary-foreground',
                                            isCompleted && 'bg-status-success text-white',
                                            !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <StepIcon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="hidden md:block">
                                        <p
                                            className={cn(
                                                'text-sm font-medium',
                                                isActive && 'text-foreground',
                                                !isActive && 'text-muted-foreground'
                                            )}
                                        >
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form */}
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                        <CardDescription>
                            {currentStep === 1 && 'Renseignez les informations de base du sinistre'}
                            {currentStep === 2 && 'Décrivez les circonstances du sinistre'}
                            {currentStep === 3 && 'Ajoutez les documents justificatifs'}
                            {currentStep === 4 && 'Vérifiez les informations avant de soumettre'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {renderStep()}

                            <div className="flex justify-between mt-8 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                    disabled={currentStep === 1}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Précédent
                                </Button>

                                {currentStep === steps.length ? (
                                    <Button type="submit">
                                        <Check className="h-4 w-4 mr-2" />
                                        Créer le sinistre
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleNext}>
                                        Suivant
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NewClaim;
