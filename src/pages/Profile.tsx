import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Edit, Save, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ROLE_CONFIG } from '@/types/claims';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: false,
        weeklyReport: true,
        darkMode: false,
    });

    if (!user) {
        return null;
    }

    const handleSave = () => {
        toast.success('Profil mis à jour avec succès');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user.name,
            email: user.email,
        });
        setIsEditing(false);
    };

    const handlePreferenceChange = (key: keyof typeof preferences) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
        toast.success('Préférence mise à jour');
    };

    return (
        <div className="min-h-screen">
            <Header title="Mon Profil" subtitle="Gérez vos informations personnelles et préférences" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                {/* Profile Header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {user.avatar}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {ROLE_CONFIG[user.role].label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Membre depuis {format(user.createdAt, 'MMMM yyyy', { locale: fr })}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant={isEditing ? 'outline' : 'default'}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? (
                                    <>
                                        <X className="h-4 w-4 mr-2" />
                                        Annuler
                                    </>
                                ) : (
                                    <>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="info" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="info">Informations</TabsTrigger>
                        <TabsTrigger value="security">Sécurité</TabsTrigger>
                        <TabsTrigger value="preferences">Préférences</TabsTrigger>
                    </TabsList>

                    {/* Personal Information */}
                    <TabsContent value="info">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations personnelles</CardTitle>
                                <CardDescription>
                                    Mettez à jour vos informations de profil
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom complet</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Rôle</Label>
                                        <Input value={ROLE_CONFIG[user.role].label} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ID Utilisateur</Label>
                                        <Input value={user.id} disabled />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Date de création</Label>
                                    <Input
                                        value={format(user.createdAt, "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                                        disabled
                                    />
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="outline" onClick={handleCancel}>
                                            Annuler
                                        </Button>
                                        <Button onClick={handleSave}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Enregistrer
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sécurité</CardTitle>
                                <CardDescription>
                                    Gérez votre mot de passe et la sécurité de votre compte
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                                    <Input id="current-password" type="password" placeholder="••••••••" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                                    <Input id="new-password" type="password" placeholder="••••••••" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                                </div>

                                <Separator />

                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Exigences du mot de passe</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Au moins 8 caractères</li>
                                        <li>• Au moins une lettre majuscule</li>
                                        <li>• Au moins un chiffre</li>
                                        <li>• Au moins un caractère spécial</li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={() => toast.success('Mot de passe mis à jour avec succès')}
                                    className="w-full"
                                >
                                    Changer le mot de passe
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences */}
                    <TabsContent value="preferences">
                        <Card>
                            <CardHeader>
                                <CardTitle>Préférences</CardTitle>
                                <CardDescription>
                                    Personnalisez votre expérience utilisateur
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-4">Notifications</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Notifications par email</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Recevez des emails pour les mises à jour importantes
                                                </p>
                                            </div>
                                            <Switch
                                                checked={preferences.emailNotifications}
                                                onCheckedChange={() => handlePreferenceChange('emailNotifications')}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Notifications push</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Recevez des notifications dans le navigateur
                                                </p>
                                            </div>
                                            <Switch
                                                checked={preferences.pushNotifications}
                                                onCheckedChange={() => handlePreferenceChange('pushNotifications')}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Rapport hebdomadaire</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Recevez un résumé hebdomadaire de votre activité
                                                </p>
                                            </div>
                                            <Switch
                                                checked={preferences.weeklyReport}
                                                onCheckedChange={() => handlePreferenceChange('weeklyReport')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-4">Apparence</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Mode sombre</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Activer le thème sombre de l'interface
                                            </p>
                                        </div>
                                        <Switch
                                            checked={preferences.darkMode}
                                            onCheckedChange={() => handlePreferenceChange('darkMode')}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-4">Langue</h4>
                                    <div className="space-y-2">
                                        <Label>Langue de l'interface</Label>
                                        <Input value="Français" disabled />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Activity Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Statistiques d'activité</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-3xl font-bold text-primary">12</p>
                                <p className="text-sm text-muted-foreground mt-1">Sinistres traités</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-3xl font-bold text-status-success">8</p>
                                <p className="text-sm text-muted-foreground mt-1">Validations</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-3xl font-bold text-status-warning">24</p>
                                <p className="text-sm text-muted-foreground mt-1">Documents uploadés</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
