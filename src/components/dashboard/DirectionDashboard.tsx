import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  Clock, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Claim, TYPE_CONFIG, STATUS_CONFIG } from '@/types/claims';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface DirectionDashboardProps {
  claims: Claim[];
}

export const DirectionDashboard: React.FC<DirectionDashboardProps> = ({ claims }) => {
  const formatGNF = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} Mrd GNF`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} M GNF`;
    }
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // KPIs stratégiques
  const kpis = React.useMemo(() => {
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === 'approuve' || c.status === 'paye' || c.status === 'clos').length;
    const rejectedClaims = claims.filter(c => c.status === 'rejete').length;
    const totalEstimated = claims.reduce((sum, c) => sum + (c.estimatedAmount || 0), 0);
    const totalPaid = claims.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
    const totalApproved = claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
    
    const avgProcessingDays = claims.length > 0
      ? Math.round(claims.reduce((acc, curr) => {
          const start = curr.dateDeclaration.getTime();
          const end = curr.status === 'clos' ? (curr.updatedAt?.getTime() || Date.now()) : Date.now();
          return acc + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
        }, 0) / claims.length)
      : 0;

    const approvalRate = totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0;
    const rejectionRate = totalClaims > 0 ? Math.round((rejectedClaims / totalClaims) * 100) : 0;
    const savingsRate = totalEstimated > 0 ? Math.round(((totalEstimated - totalPaid) / totalEstimated) * 100) : 0;

    return {
      totalClaims,
      approvedClaims,
      rejectedClaims,
      totalEstimated,
      totalPaid,
      totalApproved,
      avgProcessingDays,
      approvalRate,
      rejectionRate,
      savingsRate
    };
  }, [claims]);

  // Données pour le graphique d'évolution
  const evolutionData = React.useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months.slice(0, 6).map((month, index) => ({
      name: month,
      declarations: Math.floor(Math.random() * 30) + 10,
      reglements: Math.floor(Math.random() * 25) + 5,
      couts: Math.floor(Math.random() * 500) + 100,
    }));
  }, []);

  // Données par type de sinistre
  const typeDistribution = React.useMemo(() => {
    const distribution = claims.reduce((acc, claim) => {
      acc[claim.type] = (acc[claim.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#C6A35A', '#1E3A5F', '#8B7355', '#4A6FA5', '#2E5944'];
    
    return Object.entries(distribution).map(([type, count], index) => ({
      name: TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]?.label || type,
      value: count,
      color: colors[index % colors.length]
    }));
  }, [claims]);

  // Performance par gestionnaire (mock data)
  const teamPerformance = [
    { name: 'F. Camara', dossiers: 45, delaiMoyen: 12, satisfaction: 92 },
    { name: 'M. Diallo', dossiers: 38, delaiMoyen: 15, satisfaction: 88 },
    { name: 'A. Bah', dossiers: 32, delaiMoyen: 10, satisfaction: 95 },
    { name: 'O. Kouyaté', dossiers: 28, delaiMoyen: 18, satisfaction: 85 },
  ];

  return (
    <div className="space-y-6">
      {/* Section Vision Stratégique */}
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Vision Stratégique</h2>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coût Total Sinistres</p>
                <p className="text-2xl font-bold text-primary">{formatGNF(kpis.totalPaid)}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-status-success">
                  <TrendingDown className="h-4 w-4" />
                  <span>-{kpis.savingsRate}% vs estimé</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-status-success/10 to-status-success/5 border-status-success/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Taux d'Approbation</p>
                <p className="text-2xl font-bold text-status-success">{kpis.approvalRate}%</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-status-success">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+3% ce mois</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-status-success/10">
                <TrendingUp className="h-5 w-5 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-status-warning/10 to-status-warning/5 border-status-warning/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Délai Moyen</p>
                <p className="text-2xl font-bold text-status-warning">{kpis.avgProcessingDays} jours</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-status-warning">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Objectif: 15j</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-status-warning/10">
                <Clock className="h-5 w-5 text-status-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-status-info/10 to-status-info/5 border-status-info/20">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Volume Total</p>
                <p className="text-2xl font-bold text-status-info">{kpis.totalClaims}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>{kpis.approvedClaims} traités</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-status-info/10">
                <BarChart3 className="h-5 w-5 text-status-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Évolution mensuelle */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Évolution Mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="colorDeclarations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReglements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--status-success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--status-success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="declarations" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorDeclarations)" 
                    name="Déclarations"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reglements" 
                    stroke="hsl(var(--status-success))" 
                    fillOpacity={1} 
                    fill="url(#colorReglements)" 
                    name="Règlements"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Répartition par Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {typeDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance des équipes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Performance des Équipes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformance.map((member, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 font-medium text-sm">{member.name}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{member.dossiers} dossiers</span>
                    <span>Délai: {member.delaiMoyen}j</span>
                  </div>
                  <Progress value={member.satisfaction} className="h-2" />
                </div>
                <div className="w-16 text-right">
                  <span className={`text-sm font-semibold ${
                    member.satisfaction >= 90 ? 'text-status-success' : 
                    member.satisfaction >= 80 ? 'text-status-warning' : 'text-status-error'
                  }`}>
                    {member.satisfaction}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs financiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Montant Estimé</p>
            <p className="text-xl font-bold">{formatGNF(kpis.totalEstimated)}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Montant Approuvé</p>
            <p className="text-xl font-bold text-status-info">{formatGNF(kpis.totalApproved)}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Économies Réalisées</p>
            <p className="text-xl font-bold text-status-success">{formatGNF(kpis.totalEstimated - kpis.totalPaid)}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
