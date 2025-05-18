
"use client"; // Since we're using a hook (useAuth)

import Link from 'next/link';
import { ShieldCheck, UserCircle, LogIn, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton';

export function AppHeader() {
  const { session, user, isLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    // Redirect handled by onAuthStateChange or can be forced here if needed
    // For instance, router.push('/login'); 
  };

  return (
    <header className="py-6 px-4 md:px-8 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            Centro de Análisis de Seguridad Integral
          </h1>
        </Link>
        
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        ) : session ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-foreground" asChild>
              {/* Conceptual link, could go to /profile or /dashboard */}
              <Link href="#"> 
                <UserCircle className="mr-2 h-4 w-4" />
                {user?.email || "Mi Perfil"}
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        ) : (
          <Link href="/login" passHref>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión / Registrarse
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
