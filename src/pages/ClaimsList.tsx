import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Grid3X3, List, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ClaimCard } from '@/components/claims/ClaimCard';
import { StatusBadge } from '@/components/claims/StatusBadge';
import { useClaims } from '@/contexts/ClaimsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { STATUS_CONFIG, TYPE_CONFIG, ClaimStatus, ClaimType } from '@/types/claims';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ClaimsList: React.FC = () => {
  const { claims } = useClaims();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ClaimType | 'all'>('all');

  const formatGNF = (amount: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        claim.id.toLowerCase().includes(search.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
        claim.description.toLowerCase().includes(search.toLowerCase()) ||
        claim.declarant.name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesType = typeFilter === 'all' || claim.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [claims, search, statusFilter, typeFilter]);

  return (
    <div className="min-h-screen">
      <Header
        title="Sinistres"
        subtitle={`${filteredClaims.length} dossier(s) trouvé(s)`}
      />

      <div className="p-6 space-y-6">
        {/* Filters Bar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par n° dossier, police, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border border-border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {(hasPermission('claims.create') || hasPermission('*')) && (
                <Link to="/claims/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau sinistre
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* Claims Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Dossier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Déclarant</TableHead>
                  <TableHead>Date incident</TableHead>
                  <TableHead className="text-right">Montant estimé</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link to={`/claims/${claim.id}`} className="font-medium text-primary hover:underline">
                        {claim.id}
                      </Link>
                      <p className="text-xs text-muted-foreground">{claim.policyNumber}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {React.createElement(TYPE_CONFIG[claim.type].icon, { className: 'h-4 w-4 text-muted-foreground' })}
                        {TYPE_CONFIG[claim.type].label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={claim.status} size="sm" />
                    </TableCell>
                    <TableCell>{claim.declarant.name}</TableCell>
                    <TableCell>
                      {format(claim.dateIncident, 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatGNF(claim.estimatedAmount || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun sinistre trouvé avec ces critères.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsList;
