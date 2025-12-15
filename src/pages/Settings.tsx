import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    Bell,
    Shield,
    Database,
    FileText,
    Globe,
    Users,
    Activity,
    Server,
    Lock,
    Mail,
    Smartphone,
    DollarSign,
    Building2,
    MapPin,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const Admin: React.FC = () => {
    const { hasPermission } = useAuth();
    const [systemHealth] = useState({
        cpu: 45,
        memory: 62,
        disk: 38,
        uptime: '15 jours 8 heures',
    });

    if (!hasPermission('*')) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
                    <p className="text-muted-foreground">
                        Seuls les administrateurs peuvent accéder à cette page.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header title="Administration" subtitle="Configuration et gestion du système NSIA Sinistre App Guinée" />

            <div className="p-6 space-y-6">
                {/* System Health */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">CPU</span>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold">{systemHealth.cpu}%</p>
                            <Progress value={systemHealth.cpu} className="h-2" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Mémoire</span>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold">{systemHealth.memory}%</p>
                            <Progress value={systemHealth.memory} className="h-2" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Disque</span>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold">{systemHealth.disk}%</p>
                            <Progress value={systemHealth.disk} className="h-2" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Uptime</span>
                            <Activity className="h-4 w-4 text-status-success" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">{systemHealth.uptime}</p>
                            <Badge className="mt-2 bg-status-success/10 text-status-success">En ligne</Badge>
                        </div>
                    </Card>
                </div>

                <Tabs defaultValue="company" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="company">Entreprise</TabsTrigger>
                        <TabsTrigger value="system">Système</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="security">Sécurité</TabsTrigger>
                        <TabsTrigger value="data">Données</TabsTrigger>
                        <TabsTrigger value="integrations">Intégrations</TabsTrigger>
                    </TabsList>

                    {/* Company Settings */}
                    <TabsContent value="company">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations de l'entreprise</CardTitle>
                                    <CardDescription>
                                        Configuration de votre compagnie d'assurance en Guinée
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company-name">Nom de la compagnie</Label>
                                            <Input id="company-name" defaultValue="NSIA Assurances Guinée" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company-slogan">Slogan</Label>
                                            <Input
                                                id="company-slogan"
                                                defaultValue="Votre sécurité, notre priorité"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company-address">Adresse</Label>
                                        <Input
                                            id="company-address"
                                            defaultValue="Avenue de la République, Kaloum, Conakry"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company-phone">Téléphone</Label>
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                <Input id="company-phone" defaultValue="+224 622 123 456" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company-email">Email</Label>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <Input id="company-email" defaultValue="contact@assurflow.gn" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company-website">Site web</Label>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                <Input id="company-website" defaultValue="www.assurflow.gn" />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label htmlFor="company-registration">Numéro d'enregistrement</Label>
                                        <Input
                                            id="company-registration"
                                            defaultValue="RCCM/GN/CON/2020/B/12345"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company-tax">Numéro fiscal (NIF)</Label>
                                            <Input id="company-tax" defaultValue="123456789A" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company-license">Licence d'assurance</Label>
                                            <Input id="company-license" defaultValue="LA-GN-2020-001" />
                                        </div>
                                    </div>

                                    <Button onClick={() => toast.success('Informations sauvegardées')}>
                                        Sauvegarder les modifications
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Agences en Guinée</CardTitle>
                                    <CardDescription>Gérer vos points de service</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { name: 'Agence Kaloum', address: 'Avenue de la République, Conakry', phone: '+224 622 111 111' },
                                        { name: 'Agence Matam', address: 'Quartier Matam, Conakry', phone: '+224 622 222 222' },
                                        { name: 'Agence Kankan', address: 'Centre-ville, Kankan', phone: '+224 622 333 333' },
                                        { name: 'Agence Labé', address: 'Route de Pita, Labé', phone: '+224 622 444 444' },
                                    ].map((agency, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{agency.name}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {agency.address}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Smartphone className="h-3 w-3" />
                                                        {agency.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Modifier
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full">
                                        + Ajouter une agence
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* System Settings */}
                    <TabsContent value="system">
                        <Card>
                            <CardHeader>
                                <CardTitle>Paramètres système</CardTitle>
                                <CardDescription>Configuration technique de l'application</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Fuseau horaire</Label>
                                    <Select defaultValue="africa/conakry">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="africa/conakry">Africa/Conakry (GMT)</SelectItem>
                                            <SelectItem value="africa/abidjan">Africa/Abidjan (GMT)</SelectItem>
                                            <SelectItem value="africa/dakar">Africa/Dakar (GMT)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="language">Langue par défaut</Label>
                                    <Select defaultValue="fr">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fr">Français</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Devise</Label>
                                    <Select defaultValue="gnf">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gnf">Franc Guinéen (GNF)</SelectItem>
                                            <SelectItem value="usd">Dollar US (USD)</SelectItem>
                                            <SelectItem value="eur">Euro (EUR)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Mode maintenance</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Désactiver temporairement l'accès à l'application
                                        </p>
                                    </div>
                                    <Switch />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Mode débogage</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Activer les logs détaillés pour le développement
                                        </p>
                                    </div>
                                    <Switch />
                                </div>

                                <Button onClick={() => toast.success('Paramètres système sauvegardés')}>
                                    Sauvegarder
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Paramètres de notification</CardTitle>
                                <CardDescription>Configurez les notifications système</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Notifications SMS</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Envoyer des SMS via Orange Money ou MTN Mobile Money
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Notifications email</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Envoyer des emails pour les événements importants
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium">Types de notifications</h4>

                                    <div className="flex items-center justify-between">
                                        <Label>Nouveau sinistre</Label>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Changement de statut</Label>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Paiement effectué</Label>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Document uploadé</Label>
                                        <Switch />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="email-from">Email expéditeur</Label>
                                    <Input id="email-from" type="email" defaultValue="noreply@assurflow.gn" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sms-sender">Nom expéditeur SMS</Label>
                                    <Input id="sms-sender" defaultValue="NSIA" maxLength={11} />
                                </div>

                                <Button onClick={() => toast.success('Paramètres de notification sauvegardés')}>
                                    Sauvegarder
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sécurité</CardTitle>
                                <CardDescription>
                                    Paramètres de sécurité et d'authentification
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Authentification à deux facteurs (2FA)</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Exiger une vérification par SMS lors de la connexion
                                        </p>
                                    </div>
                                    <Switch />
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="session-timeout">Délai d'expiration de session (minutes)</Label>
                                    <Input id="session-timeout" type="number" defaultValue="30" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password-expiry">Expiration du mot de passe (jours)</Label>
                                    <Input id="password-expiry" type="number" defaultValue="90" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max-attempts">Tentatives de connexion max</Label>
                                    <Input id="max-attempts" type="number" defaultValue="5" />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Journalisation des connexions</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enregistrer toutes les tentatives de connexion
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Blocage automatique</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Bloquer le compte après échecs multiples
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Audit des actions</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Tracer toutes les actions des utilisateurs
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <Button onClick={() => toast.success('Paramètres de sécurité sauvegardés')}>
                                    Sauvegarder
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Data */}
                    <TabsContent value="data">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestion des données</CardTitle>
                                <CardDescription>Sauvegarde et maintenance des données</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Sauvegarde automatique</h4>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Activer les sauvegardes automatiques</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Sauvegarder automatiquement les données chaque jour
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="backup-time">Heure de sauvegarde</Label>
                                        <Input id="backup-time" type="time" defaultValue="02:00" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="backup-retention">Rétention (jours)</Label>
                                        <Input id="backup-retention" type="number" defaultValue="30" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="backup-location">Emplacement de sauvegarde</Label>
                                        <Input
                                            id="backup-location"
                                            defaultValue="/backups/assurflow-gn"
                                            disabled
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium">Actions</h4>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => toast.success('Sauvegarde manuelle lancée')}
                                    >
                                        <Database className="h-4 w-4 mr-2" />
                                        Créer une sauvegarde maintenant
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => toast.info('Export des données en cours...')}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Exporter toutes les données
                                    </Button>
                                </div>

                                <Separator />

                                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        Zone de danger
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Actions irréversibles - à utiliser avec précaution
                                    </p>
                                    <Button
                                        variant="destructive"
                                        onClick={() => toast.error('Cette action nécessite une confirmation')}
                                    >
                                        Réinitialiser toutes les données
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Integrations */}
                    <TabsContent value="integrations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Intégrations</CardTitle>
                                <CardDescription>Connectez des services externes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Smartphone className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Orange Money</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Paiements via Orange Money Guinée
                                                </p>
                                                <Badge className="mt-1 bg-status-success/10 text-status-success">
                                                    Connecté
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline">Configurer</Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-status-warning/10 flex items-center justify-center">
                                                <DollarSign className="h-5 w-5 text-status-warning" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">MTN Mobile Money</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Paiements via MTN Mobile Money
                                                </p>
                                                <Badge className="mt-1 bg-status-success/10 text-status-success">
                                                    Connecté
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline">Configurer</Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-status-info/10 flex items-center justify-center">
                                                <Mail className="h-5 w-5 text-status-info" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Service SMS</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Notifications SMS via passerelle locale
                                                </p>
                                                <Badge className="mt-1 bg-status-success/10 text-status-success">
                                                    Actif
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline">Configurer</Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Globe className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">API REST</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Accès programmatique aux données
                                                </p>
                                                <Badge className="mt-1 bg-status-success/10 text-status-success">
                                                    Actif
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline">Configurer</Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">Stockage cloud</h4>
                                                <p className="text-sm text-muted-foreground">Bientôt disponible</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" disabled>
                                            Bientôt
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Admin;
