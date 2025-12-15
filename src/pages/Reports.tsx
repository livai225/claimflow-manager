import React, { useState } from 'react';
import { Calendar, Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useClaims } from '@/contexts/ClaimsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { STATUS_CONFIG, TYPE_CONFIG } from '@/types/claims';
import { toast } from 'sonner';

const Reports: React.FC = () => {
    const { hasPermission } = useAuth();
    const { claims, stats } = useClaims();
    const [period, setPeriod] = useState('month');

    if (!hasPermission('reports.view') && !hasPermission('*')) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
                    <p className="text-muted-foreground">
                        Vous n'avez pas les permissions nécessaires pour accéder aux rapports.
                    </p>
                </Card>
            </div>
        );
    }

    // Generate monthly trend data
    const monthlyData = [
        { month: 'Jan', sinistres: 12, montant: 45000, approuves: 10 },
        { month: 'Fév', sinistres: 15, montant: 52000, approuves: 12 },
        { month: 'Mar', sinistres: 18, montant: 61000, approuves: 15 },
        { month: 'Avr', sinistres: 14, montant: 48000, approuves: 11 },
        { month: 'Mai', sinistres: 20, montant: 72000, approuves: 17 },
        { month: 'Juin', sinistres: 16, montant: 55000, approuves: 13 },
    ];

    // Type distribution data
    const typeData = Object.entries(stats.claimsByType)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => ({
            name: TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]?.label || type,
            value: count,
            montant: Math.floor(Math.random() * 50000) + 10000,
        }));

    // Status distribution data
    const statusData = Object.entries(stats.claimsByStatus)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
            name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
            value: count,
        }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const handleExport = (format: 'pdf' | 'excel') => {
        toast.success(`Export ${format.toUpperCase()} en cours...`);
    };

    return (
        <div className="min-h-screen">
            <Header
                title="Rapports et Statistiques"
                subtitle="Analyse détaillée de l'activité sinistres"
            />

            <div className="p-6 space-y-6">
                {/* Controls */}
                <div className="flex justify-between items-center">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Cette semaine</SelectItem>
                            <SelectItem value="month">Ce mois</SelectItem>
                            <SelectItem value="quarter">Ce trimestre</SelectItem>
                            <SelectItem value="year">Cette année</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleExport('pdf')}>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('excel')}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Excel
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Sinistres ce mois</p>
                                <p className="text-3xl font-bold">16</p>
                                <div className="flex items-center gap-1 text-status-success text-sm mt-1">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>+12%</span>
                                </div>
                            </div>
                            <FileText className="h-12 w-12 text-primary/20" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Taux d'approbation</p>
                                <p className="text-3xl font-bold">87%</p>
                                <div className="flex items-center gap-1 text-status-success text-sm mt-1">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>+5%</span>
                                </div>
                            </div>
                            <TrendingUp className="h-12 w-12 text-status-success/20" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Montant moyen</p>
                                <p className="text-3xl font-bold">34 370 000 GNF</p>
                                <div className="flex items-center gap-1 text-status-error text-sm mt-1">
                                    <TrendingDown className="h-4 w-4" />
                                    <span>-3%</span>
                                </div>
                            </div>
                            <DollarSign className="h-12 w-12 text-status-warning/20" />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Délai moyen</p>
                                <p className="text-3xl font-bold">18j</p>
                                <div className="flex items-center gap-1 text-status-success text-sm mt-1">
                                    <TrendingDown className="h-4 w-4" />
                                    <span>-2j</span>
                                </div>
                            </div>
                            <Calendar className="h-12 w-12 text-status-info/20" />
                        </div>
                    </Card>
                </div>

                {/* Charts */}
                <Tabs defaultValue="trends" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="trends">Tendances</TabsTrigger>
                        <TabsTrigger value="distribution">Répartition</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="trends" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Trend */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Évolution mensuelle</CardTitle>
                                    <CardDescription>Nombre de sinistres par mois</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="sinistres"
                                                    stroke="hsl(var(--primary))"
                                                    fill="hsl(var(--primary))"
                                                    fillOpacity={0.2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Amount Trend */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Montants indemnisés</CardTitle>
                                    <CardDescription>Évolution des paiements (GNF)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="montant"
                                                    stroke="hsl(var(--status-success))"
                                                    strokeWidth={2}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="distribution" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Type Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par type</CardTitle>
                                    <CardDescription>Distribution des sinistres</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={typeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {typeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Répartition par statut</CardTitle>
                                    <CardDescription>État des dossiers</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={statusData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Approval Rate */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Taux d'approbation</CardTitle>
                                    <CardDescription>Par mois</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                                <Legend />
                                                <Bar dataKey="sinistres" fill="hsl(var(--primary))" name="Total" />
                                                <Bar
                                                    dataKey="approuves"
                                                    fill="hsl(var(--status-success))"
                                                    name="Approuvés"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Amount by Type */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Montants par type</CardTitle>
                                    <CardDescription>Indemnisations moyennes (GNF)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={typeData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="name" type="category" width={120} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="montant"
                                                    fill="hsl(var(--status-warning))"
                                                    radius={[0, 8, 8, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Reports;
