
import { ShieldCheck, Sparkles, Unlock } from 'lucide-react';
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
            Analizador de Seguridad Integral
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={onAuthToggle} className={isPremiumUser ? "border-accent text-accent hover:bg-accent/10" : ""}>
          {isPremiumUser ? <Unlock className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isPremiumUser ? "Premium Activo" : "Activar Premium"}
        </Button>
      </div>
    </header>
  );
}
