import React, { createContext, useContext, useState, useCallback } from 'react';
import { Claim, ClaimStatus, DashboardStats } from '@/types/claims';
import { mockClaims, mockDashboardStats } from '@/data/mockData';

interface ClaimsContextType {
  claims: Claim[];
  stats: DashboardStats;
  getClaimById: (id: string) => Claim | undefined;
  updateClaimStatus: (id: string, status: ClaimStatus) => void;
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>) => Claim;
  filterClaims: (filters: ClaimFilters) => Claim[];
}

interface ClaimFilters {
  status?: ClaimStatus[];
  type?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [stats] = useState<DashboardStats>(mockDashboardStats);

  const getClaimById = useCallback((id: string) => {
    return claims.find(c => c.id === id);
  }, [claims]);

  const updateClaimStatus = useCallback((id: string, status: ClaimStatus) => {
    setClaims(prev => prev.map(claim => 
      claim.id === id 
        ? { ...claim, status, updatedAt: new Date() }
        : claim
    ));
  }, []);

  const addClaim = useCallback((claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>): Claim => {
    const newClaim: Claim = {
      ...claimData,
      id: `CLM-${new Date().getFullYear()}-${String(claims.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setClaims(prev => [newClaim, ...prev]);
    return newClaim;
  }, [claims.length]);

  const filterClaims = useCallback((filters: ClaimFilters): Claim[] => {
    return claims.filter(claim => {
      if (filters.status?.length && !filters.status.includes(claim.status)) return false;
      if (filters.type?.length && !filters.type.includes(claim.type)) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!claim.id.toLowerCase().includes(search) && 
            !claim.policyNumber.toLowerCase().includes(search) &&
            !claim.description.toLowerCase().includes(search)) {
          return false;
        }
      }
      if (filters.dateFrom && claim.dateDeclaration < filters.dateFrom) return false;
      if (filters.dateTo && claim.dateDeclaration > filters.dateTo) return false;
      return true;
    });
  }, [claims]);

  return (
    <ClaimsContext.Provider value={{ claims, stats, getClaimById, updateClaimStatus, addClaim, filterClaims }}>
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};
