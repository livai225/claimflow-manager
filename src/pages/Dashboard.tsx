import React from 'react';
import { FileText, CheckCircle, Clock, Euro, TrendingUp, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ClaimCard } from '@/components/claims/ClaimCard';
import { useClaims } from '@/contexts/ClaimsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUS_CONFIG, TYPE_CONFIG } from '@/types/claims';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard: React.FC = () => {
  const { claims } = useClaims();
  const { user } = useAuth();

  // Filtrer les sinistres pour le client
  const dashboardClaims = React.useMemo(() => {
    if (user?.role === 'assure') {
      return claims.filter(c => c.declarant.id === user.id);
    }
    return claims;
  }, [claims, user]);

  const stats = React.useMemo(() => {
    const totalClaims = dashboardClaims.length;
    const openClaims = dashboardClaims.filter(c => c.status !== 'clos' && c.status !== 'paye' && c.status !== 'rejete').length;
    const closedClaims = dashboardClaims.filter(c => c.status === 'clos').length;
    const totalPaid = dashboardClaims
      .filter(c => c.status === 'paye')
      .reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);

    const claimsByStatus = dashboardClaims.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const claimsByType = dashboardClaims.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcul du délai moyen de traitement (approximatif pour les besoins du dashboard)
    // On considère la différence entre createdAt et maintenant pour les dossiers non clos
    // ou createdAt et la date de clôture (si disponible) pour les dossiers clos
    // Pour simplifier, on utilisera une moyenne basée sur les dates de déclaration et d'incident
    const avgProcessingDays = dashboardClaims.length > 0
      ? Math.round(dashboardClaims.reduce((acc, curr) => {
        const start = curr.dateDeclaration.getTime();
        // Idéalement on utiliserait une propriété closedAt, mais on va utiliser updatedAd ou aujourd'hui
        const end = curr.status === 'clos' ? (curr.updatedAt?.getTime() || Date.now()) : Date.now();
        const days = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0) / dashboardClaims.length)
      : 0;

    return {
      totalClaims,
      openClaims,
      closedClaims,
      totalPaid,
      claimsByStatus,
      claimsByType,
      avgProcessingDays
    };
  }, [dashboardClaims]);

  const formatGNF = (amount: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const recentClaims = dashboardClaims.slice(0, 4);

  const statusData = Object.entries(stats.claimsByStatus)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
      value: count,
      color: `hsl(var(--status-${status === 'ouvert' ? 'info' : status === 'approuve' || status === 'paye' || status === 'clos' ? 'success' : status === 'rejete' ? 'error' : 'warning'}))`,
    }));

  const typeData = Object.entries(stats.claimsByType)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]?.label || type,
      value: count,
    }));

  return (
    <div className="min-h-screen">
      <Header
        title={`Bonjour, ${user?.name?.split(' ')[0]}`}
        subtitle={user?.role === 'assure' ? 'Suivez l\'état de vos dossiers en temps réel' : "Voici un aperçu de l'activité sinistres"}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total sinistres"
            value={stats.totalClaims}
            subtitle="Tous statuts confondus"
            icon={FileText}
            variant="primary"
          />
          <StatsCard
            title="Dossiers ouverts"
            value={stats.openClaims}
            subtitle="En cours de traitement"
            icon={Clock}
            variant="warning"
            trend={{ value: 12, isPositive: false }}
          />
          <StatsCard
            title="Dossiers clôturés"
            value={stats.closedClaims}
            subtitle="Ce mois"
            icon={CheckCircle}
            variant="success"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Montant indemnisé"
            value={formatGNF(stats.totalPaid)}
            subtitle="Total des paiements"
            icon={Euro}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Répartition par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
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
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sinistres par type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Délai moyen de traitement</p>
                <p className="text-2xl font-bold">{stats.avgProcessingDays} jours</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-status-success/10">
                <CheckCircle className="h-6 w-6 text-status-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux d'approbation</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-status-warning/10">
                <AlertTriangle className="h-6 w-6 text-status-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total payé</p>
                <p className="text-2xl font-bold">{formatGNF(stats.totalPaid)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Claims */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sinistres récents</h2>
            <a href="/claims" className="text-sm text-primary hover:underline">
              Voir tous les sinistres →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
