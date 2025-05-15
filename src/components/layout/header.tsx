
import { ShieldCheck, Sparkles, Unlock, LogIn, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  isPremiumUser: boolean;
  onAuthToggle: () => void; 
};

export function AppHeader({ isPremiumUser, onAuthToggle }: AppHeaderProps) {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">
            Centro de Análisis de Seguridad Integral
          </h1>
        </div>
        <Button 
          variant={isPremiumUser ? "outline" : "default"} 
          size="sm" 
          onClick={onAuthToggle} 
          className={isPremiumUser ? "border-green-500 text-green-600 hover:bg-green-500/10" : "bg-accent hover:bg-accent/90 text-accent-foreground"}
        >
          {isPremiumUser ? <LogOut className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
          {isPremiumUser ? "Cerrar Sesión (Simulado)" : "Iniciar Sesión / Premium (Simulado)"}
        </Button>
      </div>
    </header>
  );
}
