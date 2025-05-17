
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"; 
import { useRouter } from "next/navigation"; // Para simular redirección

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación real con un backend
    toast({
      title: "Inicio de Sesión (Simulado)",
      description: "Funcionalidad en desarrollo. Redirigiendo al inicio...",
    });
    console.log("Intento de inicio de sesión (simulado):", { email, password });
    // En una aplicación real, aquí se verificarían las credenciales
    // y se gestionaría el estado de la sesión.
    // Por ahora, solo redirigimos o simulamos el cambio de estado.
    // Para simular, podríamos usar el toggle del modo premium que ya existe
    // o simplemente redirigir a la página principal.
    // router.push('/'); // Descomentar si se desea redirigir
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            Iniciar Sesión
          </CardTitle>
          <CardDescription>
            Accede a tu cuenta para gestionar tus análisis de seguridad y acceder a funciones premium.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>
           <div className="mt-4 text-center text-xs text-muted-foreground p-3 bg-muted rounded-md">
            <strong>Nota Importante:</strong> Esta página de inicio de sesión es una <strong className="text-foreground">simulación</strong>. La funcionalidad de autenticación de usuarios real (con verificación de credenciales y gestión de sesiones) es un paso crucial que se implementará utilizando tecnologías como NextAuth.js.
            Actualmente, para probar las funciones "Premium", utilice el interruptor en el encabezado de la página principal.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

