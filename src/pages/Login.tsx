import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import nsiaLogo from '@/assets/nsia-logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Identifiants incorrects. Utilisez le mot de passe: demo123');
    }

    setIsLoading(false);
  };

  const demoAccounts = [
    { email: 'admin@assurflow.gn', role: 'Administrateur', color: 'bg-purple-500' },
    { email: 'gestionnaire@assurflow.gn', role: 'Gestionnaire', color: 'bg-blue-500' },
    { email: 'expert@assurflow.gn', role: 'Expert', color: 'bg-emerald-500' },
    { email: 'superviseur@assurflow.gn', role: 'Superviseur', color: 'bg-amber-500' },
    { email: 'comptable@assurflow.gn', role: 'Comptabilité', color: 'bg-cyan-500' },
    { email: 'client@email.gn', role: 'Assuré', color: 'bg-gray-500' },
  ];

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-nsia-charcoal via-nsia-charcoal to-nsia-charcoal-light">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          {/* Mesh pattern overlay */}
          <div className="absolute inset-0 bg-mesh-pattern opacity-30" />
          
          {/* Gold gradient orbs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
          
          {/* Geometric lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(43, 70%, 53%)" />
                <stop offset="100%" stopColor="hsl(43, 80%, 65%)" />
              </linearGradient>
            </defs>
            <line x1="0" y1="100%" x2="100%" y2="0" stroke="url(#gold-gradient)" strokeWidth="1" />
            <line x1="20%" y1="100%" x2="100%" y2="20%" stroke="url(#gold-gradient)" strokeWidth="0.5" />
            <line x1="40%" y1="100%" x2="100%" y2="40%" stroke="url(#gold-gradient)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div>
            <img 
              src={nsiaLogo} 
              alt="NSIA Assurances" 
              className="h-16 w-auto drop-shadow-lg"
            />
          </div>

          {/* Main Message */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Gestion des
              <span className="block text-gradient-gold">Sinistres</span>
            </h1>
            <p className="text-xl text-white/70 max-w-md leading-relaxed">
              Plateforme professionnelle de traitement et de suivi des dossiers sinistres en Guinée.
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-wrap gap-3 pt-4">
              {['Traçabilité complète', 'Workflows automatisés', 'Rapports détaillés'].map((feature, i) => (
                <span 
                  key={feature}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm border border-white/10 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/50">
            © {new Date().getFullYear()} NSIA Assurances Guinée. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src={nsiaLogo} 
              alt="NSIA Assurances" 
              className="h-14 w-auto mx-auto mb-4"
            />
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">
              Bienvenue
            </h2>
            <p className="mt-2 text-muted-foreground">
              Connectez-vous à votre espace de gestion
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-scale-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.gn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 text-base premium-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 text-base premium-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold btn-gold group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Se connecter
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Demo Accounts Section */}
          <Collapsible open={showDemoAccounts} onOpenChange={setShowDemoAccounts}>
            <CollapsibleTrigger className="flex items-center justify-center gap-2 w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <span>Comptes de démonstration</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showDemoAccounts ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Cliquez pour remplir automatiquement • Mot de passe: <code className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">demo123</code>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleDemoLogin(account.email)}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className={`w-2 h-2 rounded-full ${account.color}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {account.role}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Mobile Footer */}
          <p className="lg:hidden text-center text-xs text-muted-foreground pt-4">
            © {new Date().getFullYear()} NSIA Assurances Guinée
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
