import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">
            Analizador de Seguridad Web
          </h1>
        </div>
        {/* Placeholder for authentication - crucial for monetization */}
        <Button variant="outline" size="sm">
          Iniciar Sesión
        </Button>
      </div>
    </header>
  );
}
