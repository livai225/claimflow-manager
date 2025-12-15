import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    { email: 'admin@assurflow.gn', role: 'Administrateur' },
    { email: 'gestionnaire@assurflow.gn', role: 'Gestionnaire' },
    { email: 'expert@assurflow.gn', role: 'Expert' },
    { email: 'superviseur@assurflow.gn', role: 'Superviseur' },
    { email: 'comptable@assurflow.gn', role: 'Comptabilité' },
    { email: 'client@email.fr', role: 'Assuré' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">NSIA SINISTRE APP</h1>
          <p className="text-muted-foreground">Gestion des sinistres en Guinée</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Comptes de démonstration (mot de passe: demo123)
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Comptes de démonstration :</p>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Admin:</span> admin@assurflow.gn</p>
                  <p><span className="font-medium">Gestionnaire:</span> gestionnaire@assurflow.gn</p>
                  <p><span className="font-medium">Expert:</span> expert@assurflow.gn</p>
                  <p><span className="font-medium">Superviseur:</span> superviseur@assurflow.gn</p>
                  <p><span className="font-medium">Comptable:</span> comptable@assurflow.gn</p>
                  <p><span className="font-medium">Client:</span> client@email.gn</p>
                  <p className="text-muted-foreground mt-2">Mot de passe: <span className="font-medium">demo123</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
