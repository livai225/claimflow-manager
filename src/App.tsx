import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClaimsProvider } from "@/contexts/ClaimsContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ClaimsList from "@/pages/ClaimsList";
import ClaimDetail from "@/pages/ClaimDetail";
import NewClaim from "@/pages/NewClaim";
import Users from "@/pages/Users";
import Participants from "@/pages/Participants";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Payments from "@/pages/Payments";
import Admin from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ClaimsProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="claims" element={<ClaimsList />} />
                <Route path="claims/new" element={<NewClaim />} />
                <Route path="claims/:id" element={<ClaimDetail />} />
                <Route path="users" element={<Users />} />
                <Route path="participants" element={<Participants />} />
                <Route path="payments" element={<Payments />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<Admin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ClaimsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
