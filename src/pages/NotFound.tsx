import { Link } from "react-router-dom";
import { Home, Search, FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const NotFound = () => {
  const suggestions = [
    { icon: Home, label: "Tableau de bord", path: "/dashboard" },
    { icon: FileQuestion, label: "Liste des sinistres", path: "/claims" },
    { icon: Search, label: "Rechercher", path: "/claims" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl w-full">
        <Card className="p-8 md:p-12 text-center shadow-xl">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center">
              <span className="text-9xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                404
              </span>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Page introuvable
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          {/* Search */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un sinistre..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 mb-8">
            <p className="text-sm text-muted-foreground font-medium">
              Suggestions de navigation
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestions.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                    <item.icon className="h-6 w-6 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium">{item.label}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
