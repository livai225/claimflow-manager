import React, { useState } from 'react';
import { Search, User, FileText, TrendingUp, Mail, Phone, Building2, Calendar } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useClaims } from '@/contexts/ClaimsContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { User as UserType, UserRole } from '@/types/claims';
import { mockUsers } from '@/data/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const Participants: React.FC = () => {
    const { hasPermission } = useAuth();
    const { claims } = useClaims();
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');

    // Calculer les statistiques pour chaque utilisateur
    const getUserStats = (userId: string) => {
        const userClaims = claims.filter(
            (claim) =>
                claim.declarant.id === userId ||
                claim.assignedTo?.id === userId ||
                claim.expert?.id === userId
        );

        const assignedClaims = claims.filter((claim) => claim.assignedTo?.id === userId);
        const expertClaims = claims.filter((claim) => claim.expert?.id === userId);
        const declaredClaims = claims.filter((claim) => claim.declarant.id === userId);

        return {
            total: userClaims.length,
            assigned: assignedClaims.length,
            expert: expertClaims.length,
            declared: declaredClaims.length,
            claims: userClaims,
        };
    };

    const handleUserClick = (user: UserType) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const formatGNF = (amount: number) => {
        return new Intl.NumberFormat('fr-GN', {
            style: 'currency',
            currency: 'GNF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Filtrer les utilisateurs
    const filteredUsers = mockUsers.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    // Statistiques globales
    const totalParticipants = mockUsers.length;
    const activeParticipants = mockUsers.filter(
        (user) => getUserStats(user.id).total > 0
    ).length;

    if (!hasPermission('users.view') && !hasPermission('*')) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
                    <p className="text-muted-foreground">
                        Vous n'avez pas les permissions nécessaires pour voir cette page.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header
                title="Intervenants"
                subtitle="Gestion des participants aux sinistres"
            />

            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total intervenants</p>
                                <p className="text-2xl font-bold">{totalParticipants}</p>
                            </div>
                            <User className="h-8 w-8 text-primary" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Actifs</p>
                                <p className="text-2xl font-bold">{activeParticipants}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-status-success" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total sinistres</p>
                                <p className="text-2xl font-bold">{claims.length}</p>
                            </div>
                            <FileText className="h-8 w-8 text-status-info" />
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par nom ou email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole | 'all')}>
                                <TabsList>
                                    <TabsTrigger value="all">Tous</TabsTrigger>
                                    <TabsTrigger value="gestionnaire">Gestionnaires</TabsTrigger>
                                    <TabsTrigger value="expert">Experts</TabsTrigger>
                                    <TabsTrigger value="assure">Assurés</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => {
                        const stats = getUserStats(user.id);

                        return (
                            <Card
                                key={user.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleUserClick(user)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{user.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    {user.role.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground truncate">{user.email}</span>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                                                <p className="text-xs text-muted-foreground">Total</p>
                                            </div>
                                            {stats.assigned > 0 && (
                                                <div>
                                                    <p className="text-2xl font-bold text-status-warning">{stats.assigned}</p>
                                                    <p className="text-xs text-muted-foreground">Assignés</p>
                                                </div>
                                            )}
                                            {stats.expert > 0 && (
                                                <div>
                                                    <p className="text-2xl font-bold text-status-info">{stats.expert}</p>
                                                    <p className="text-xs text-muted-foreground">Expertises</p>
                                                </div>
                                            )}
                                            {stats.declared > 0 && (
                                                <div>
                                                    <p className="text-2xl font-bold text-status-success">{stats.declared}</p>
                                                    <p className="text-xs text-muted-foreground">Déclarés</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredUsers.length === 0 && (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">Aucun intervenant trouvé</p>
                    </Card>
                )}
            </div>

            {/* Modal Détails Intervenant */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détails de l'intervenant</DialogTitle>
                        <DialogDescription>
                            Informations complètes et historique des sinistres
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    {selectedUser.avatar}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {selectedUser.role.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium text-sm">{selectedUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Téléphone</p>
                                        <p className="font-medium text-sm">+224 622 XXX XXX</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Département</p>
                                        <p className="font-medium text-sm">NSIA Assurances Guinée</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Membre depuis</p>
                                        <p className="font-medium text-sm">
                                            {format(selectedUser.createdAt, 'dd MMM yyyy', { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Claims History */}
                            <div>
                                <h4 className="font-semibold mb-3">Sinistres associés</h4>
                                <Tabs defaultValue="all">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="all">
                                            Tous ({getUserStats(selectedUser.id).total})
                                        </TabsTrigger>
                                        <TabsTrigger value="assigned">
                                            Assignés ({getUserStats(selectedUser.id).assigned})
                                        </TabsTrigger>
                                        <TabsTrigger value="expert">
                                            Expertises ({getUserStats(selectedUser.id).expert})
                                        </TabsTrigger>
                                        <TabsTrigger value="declared">
                                            Déclarés ({getUserStats(selectedUser.id).declared})
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="all" className="space-y-3 mt-4">
                                        {getUserStats(selectedUser.id).claims.map((claim) => (
                                            <Link key={claim.id} to={`/claims/${claim.id}`}>
                                                <Card className="p-3 hover:bg-accent transition-colors cursor-pointer">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{claim.id}</p>
                                                            <p className="text-sm text-muted-foreground">{claim.description.substring(0, 60)}...</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-sm">{formatGNF(claim.estimatedAmount || 0)}</p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {claim.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                        {getUserStats(selectedUser.id).claims.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                Aucun sinistre associé
                                            </p>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="assigned" className="space-y-3 mt-4">
                                        {claims
                                            .filter((claim) => claim.assignedTo?.id === selectedUser.id)
                                            .map((claim) => (
                                                <Link key={claim.id} to={`/claims/${claim.id}`}>
                                                    <Card className="p-3 hover:bg-accent transition-colors cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">{claim.id}</p>
                                                                <p className="text-sm text-muted-foreground">{claim.description.substring(0, 60)}...</p>
                                                            </div>
                                                            <Badge variant="outline">{claim.status}</Badge>
                                                        </div>
                                                    </Card>
                                                </Link>
                                            ))}
                                    </TabsContent>

                                    <TabsContent value="expert" className="space-y-3 mt-4">
                                        {claims
                                            .filter((claim) => claim.expert?.id === selectedUser.id)
                                            .map((claim) => (
                                                <Link key={claim.id} to={`/claims/${claim.id}`}>
                                                    <Card className="p-3 hover:bg-accent transition-colors cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">{claim.id}</p>
                                                                <p className="text-sm text-muted-foreground">{claim.description.substring(0, 60)}...</p>
                                                            </div>
                                                            <Badge variant="outline">{claim.status}</Badge>
                                                        </div>
                                                    </Card>
                                                </Link>
                                            ))}
                                    </TabsContent>

                                    <TabsContent value="declared" className="space-y-3 mt-4">
                                        {claims
                                            .filter((claim) => claim.declarant.id === selectedUser.id)
                                            .map((claim) => (
                                                <Link key={claim.id} to={`/claims/${claim.id}`}>
                                                    <Card className="p-3 hover:bg-accent transition-colors cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">{claim.id}</p>
                                                                <p className="text-sm text-muted-foreground">{claim.description.substring(0, 60)}...</p>
                                                            </div>
                                                            <Badge variant="outline">{claim.status}</Badge>
                                                        </div>
                                                    </Card>
                                                </Link>
                                            ))}
                                    </TabsContent>
                                </Tabs>
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

export default Participants;
