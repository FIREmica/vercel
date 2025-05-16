
import Link from 'next/link';
import { ShieldCheck, UserCircle, LogIn, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  isPremiumUser: boolean; // Este estado ahora representa "usuario logueado Y con premium"
  onAuthToggle: () => void; 
};

export function AppHeader({ isPremiumUser, onAuthToggle }: AppHeaderProps) {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            Centro de Análisis de Seguridad Integral
          </h1>
        </Link>
        
        {isPremiumUser ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-foreground">
              <UserCircle className="mr-2 h-4 w-4" />
              Mi Perfil (Simulado)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAuthToggle} 
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión (Simulado)
            </Button>
          </div>
        ) : (
          <Link href="/login" passHref>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              // onClick={onAuthToggle} // El toggle ahora lo manejamos en la página principal para simular premium tras "login"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión / Premium
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
