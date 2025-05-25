"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
// HCAPTCHA INTEGRATION - Temporarily disabled due to installation issues.
// See README.md for instructions on how to re-enable and troubleshoot.
// import HCaptcha from "react-hcaptcha";
// interface HCaptchaInstance {
//   resetCaptcha: () => void;
//   execute: () => void;
// }


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null); // HCAPTCHA
  // const captchaRef = useRef<HCaptchaInstance>(null); // HCAPTCHA

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading: authIsLoading, refreshUserProfile } = useAuth();

  useEffect(() => {
    if (!authIsLoading && session) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [session, authIsLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let title = "Error de Inicio de Sesión";
      let description = error.message || "No se pudo iniciar sesión. Por favor, verifica tus credenciales.";
      
      if (error.message.toLowerCase().includes("captcha verification process failed") || error.message.toLowerCase().includes("captcha required")) {
        title = "Error de CAPTCHA";
        description = "Error de CAPTCHA de Supabase: La verificación CAPTCHA falló. Por favor, asegúrate de que la protección CAPTCHA esté DESACTIVADA en la configuración de tu proyecto Supabase (Authentication -> Settings -> CAPTCHA protection) y guarda los cambios. Si persiste, contacta el soporte de Supabase.";
      } else if (error.message.toLowerCase().includes("invalid api key") || error.message.toLowerCase().includes("api key error") || error.message.toLowerCase().includes("failed to fetch")) {
        title = "Error de Configuración de Supabase";
        description = `Error de Supabase: ${error.message}. Esto usualmente significa que las claves API son incorrectas o el servidor no está accesible. 
        Por favor, verifica lo siguiente:
        1. Que las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local (en la raíz de tu proyecto) sean EXACTAMENTE las mismas que aparecen en tu panel de Supabase (Project Settings > API).
        2. Que hayas REINICIADO tu servidor de desarrollo Next.js (npm run dev) después de guardar cualquier cambio en .env.local.
        3. Que tu conexión a internet funcione y puedas acceder a la URL de tu proyecto Supabase.`;
      }
      toast({
        variant: "destructive",
        title: title,
        description: description,
        duration: 12000, // Increased duration for more complex error messages
      });
    } else {
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "¡Bienvenido de nuevo! Serás redirigido en breve.",
        variant: "default",
        duration: 3000,
      });
      await refreshUserProfile();
      router.push('/');
    }
    setIsLoading(false);
  };

  if (authIsLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Cargando...</p></div>;
  }


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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>
           <div className="mt-4 text-center text-xs text-muted-foreground p-3 bg-muted rounded-md">
            <strong>Nota Importante:</strong> Este formulario ahora interactúa con <strong className="text-primary">Supabase Auth</strong> para intentos de inicio de sesión.
            La funcionalidad de CAPTCHA del frontend está temporalmente deshabilitada.
            Si experimenta errores de CAPTCHA persistentes, asegúrese de que la protección CAPTCHA esté DESACTIVADA en la configuración de su proyecto Supabase (Authentication {"->"} Settings).
            Si ve "Invalid API key", revise sus variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` y reinicie su servidor.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
