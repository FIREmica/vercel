
import { ShieldCheck, LogIn, UserCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  isAuthenticated: boolean;
  onAuthToggle: () => void; // For demo purposes, page can toggle auth state via header too
};

export function AppHeader({ isAuthenticated, onAuthToggle }: AppHeaderProps) {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">
            Analizador de Seguridad Web
          </h1>
        </div>
        {/* This button's functionality can be expanded with a real auth system.
            For now, it visually reflects the mock auth state and can toggle it via onAuthToggle if desired.
            However, the primary toggle for demo is on the main page.
        */}
        <Button variant="outline" size="sm" onClick={onAuthToggle}>
          {isAuthenticated ? <UserCheck className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
          {isAuthenticated ? "Cuenta (Simulado)" : "Iniciar Sesión"}
        </Button>
      </div>
    </header>
  );
}
