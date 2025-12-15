import React, { useState } from 'react';
import {
    DollarSign,
    Search,
    Filter,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    CreditCard,
    Building2,
    Calendar,
    TrendingUp,
    AlertCircle,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useClaims } from '@/contexts/ClaimsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Simulated payment data
const mockPayments = [
    {
        id: 'PAY-2024-001',
        claimId: 'CLM-2024-006',
        beneficiary: 'Mamadou Diallo',
        amount: 8500000,
        status: 'paye',
        method: 'virement',
        reference: 'VIR-GN-2024-00156',
        bankAccount: 'GN033 0001 0123 4567 8901 23',
        processedAt: new Date('2024-12-10'),
        createdAt: new Date('2024-12-08'),
    },
    {
        id: 'PAY-2024-002',
        claimId: 'CLM-2024-005',
        beneficiary: 'Fatoumata Camara',
        amount: 125000000,
        status: 'en_attente',
        method: 'virement',
        reference: 'VIR-GN-2024-00157',
        bankAccount: 'GN033 0002 0987 6543 2109 87',
        createdAt: new Date('2024-12-12'),
    },
    {
        id: 'PAY-2024-003',
        claimId: 'CLM-2024-004',
        beneficiary: 'Ibrahima Sow',
        amount: 38000000,
        status: 'paye',
        method: 'cheque',
        reference: 'CHQ-GN-2024-00089',
        processedAt: new Date('2024-12-11'),
        createdAt: new Date('2024-12-09'),
    },
    {
        id: 'PAY-2024-004',
        claimId: 'CLM-2024-003',
        beneficiary: 'Aissatou Bah',
        amount: 250000000,
        status: 'en_attente',
        method: 'virement',
        reference: 'VIR-GN-2024-00158',
        bankAccount: 'GN033 0003 1234 5678 9012 34',
        createdAt: new Date('2024-12-13'),
    },
    {
        id: 'PAY-2024-005',
        claimId: 'CLM-2024-002',
        beneficiary: 'Ousmane Kouyaté',
        amount: 85000000,
        status: 'rejete',
        method: 'virement',
        reference: 'VIR-GN-2024-00159',
        rejectionReason: 'Informations bancaires incorrectes',
        createdAt: new Date('2024-12-14'),
    },
];

const Payments: React.FC = () => {
    const { hasPermission } = useAuth();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');

    if (!hasPermission('payments.view') && !hasPermission('*')) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
                    <p className="text-muted-foreground">
                        Vous n'avez pas les permissions nécessaires pour accéder aux paiements.
                    </p>
                </Card>
            </div>
        );
    }

    const filteredPayments = mockPayments.filter((payment) => {
        const matchesSearch =
            payment.id.toLowerCase().includes(search.toLowerCase()) ||
            payment.beneficiary.toLowerCase().includes(search.toLowerCase()) ||
            payment.reference.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    const totalPending = mockPayments
        .filter((p) => p.status === 'en_attente')
        .reduce((sum, p) => sum + p.amount, 0);

    const totalPaid = mockPayments
        .filter((p) => p.status === 'paye')
        .reduce((sum, p) => sum + p.amount, 0);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paye':
                return <Badge className="bg-status-success/10 text-status-success">Payé</Badge>;
            case 'en_attente':
                return <Badge className="bg-status-warning/10 text-status-warning">En attente</Badge>;
            case 'rejete':
                return <Badge className="bg-status-error/10 text-status-error">Rejeté</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatGNF = (amount: number) => {
        return new Intl.NumberFormat('fr-GN', {
            style: 'currency',
            currency: 'GNF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleProcessPayment = (paymentId: string) => {
        toast.success('Paiement traité avec succès');
    };

    const handleRejectPayment = (paymentId: string) => {
        toast.error('Paiement rejeté');
    };

    return (
        <div className="min-h-screen">
            <Header
                title="Gestion des Paiements"
                subtitle={`${filteredPayments.length} paiement(s) trouvé(s)`}
            />

            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total paiements</p>
                                <p className="text-2xl font-bold">{mockPayments.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-status-warning/10">
                                <Clock className="h-6 w-6 text-status-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">En attente</p>
                                <p className="text-xl font-bold">{formatGNF(totalPending)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-status-success/10">
                                <CheckCircle className="h-6 w-6 text-status-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Payés</p>
                                <p className="text-xl font-bold">{formatGNF(totalPaid)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-status-info/10">
                                <TrendingUp className="h-6 w-6 text-status-info" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Ce mois</p>
                                <p className="text-xl font-bold">{formatGNF(totalPaid + totalPending)}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par référence, bénéficiaire..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="en_attente">En attente</SelectItem>
                                <SelectItem value="paye">Payé</SelectItem>
                                <SelectItem value="rejete">Rejeté</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={methodFilter} onValueChange={setMethodFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Méthode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les méthodes</SelectItem>
                                <SelectItem value="virement">Virement</SelectItem>
                                <SelectItem value="cheque">Chèque</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Exporter
                        </Button>
                    </div>
                </Card>

                {/* Payments Table */}
                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="pending">En attente</TabsTrigger>
                        <TabsTrigger value="paid">Payés</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Bénéficiaire</TableHead>
                                        <TableHead>Sinistre</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Méthode</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{payment.id}</p>
                                                    <p className="text-xs text-muted-foreground">{payment.reference}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                        {payment.beneficiary.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{payment.beneficiary}</p>
                                                        {payment.bankAccount && (
                                                            <p className="text-xs text-muted-foreground">{payment.bankAccount}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-primary">{payment.claimId}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">{formatGNF(payment.amount)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {payment.method === 'virement' ? (
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <span className="capitalize">{payment.method}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {format(payment.createdAt, 'dd/MM/yyyy', { locale: fr })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {payment.status === 'en_attente' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-status-success"
                                                            onClick={() => handleProcessPayment(payment.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Valider
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-status-error"
                                                            onClick={() => handleRejectPayment(payment.id)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Rejeter
                                                        </Button>
                                                    </div>
                                                )}
                                                {payment.status === 'paye' && (
                                                    <span className="text-sm text-muted-foreground">
                                                        Traité le {payment.processedAt && format(payment.processedAt, 'dd/MM/yyyy')}
                                                    </span>
                                                )}
                                                {payment.status === 'rejete' && payment.rejectionReason && (
                                                    <div className="flex items-center gap-2 text-status-error">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span className="text-xs">{payment.rejectionReason}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pending">
                        <Card>
                            <CardHeader>
                                <CardTitle>Paiements en attente de validation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockPayments
                                        .filter((p) => p.status === 'en_attente')
                                        .map((payment) => (
                                            <Card key={payment.id} className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                                                {payment.beneficiary.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">{payment.beneficiary}</p>
                                                                <p className="text-sm text-muted-foreground">{payment.reference}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-muted-foreground">Montant</p>
                                                                <p className="font-semibold">{formatGNF(payment.amount)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Méthode</p>
                                                                <p className="capitalize">{payment.method}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground">Compte</p>
                                                                <p className="text-xs">{payment.bankAccount}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="text-status-success"
                                                            onClick={() => handleProcessPayment(payment.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Valider
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="text-status-error"
                                                            onClick={() => handleRejectPayment(payment.id)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Rejeter
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="paid">
                        <Card>
                            <CardHeader>
                                <CardTitle>Paiements effectués</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockPayments
                                        .filter((p) => p.status === 'paye')
                                        .map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle className="h-5 w-5 text-status-success" />
                                                    <div>
                                                        <p className="font-medium">{payment.beneficiary}</p>
                                                        <p className="text-sm text-muted-foreground">{payment.reference}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatGNF(payment.amount)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {payment.processedAt && format(payment.processedAt, 'dd/MM/yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Payments;
