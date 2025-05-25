"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: "Las contraseñas no coinciden.",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      let title = "Error de Registro";
      let description = error.message || "No se pudo completar el registro.";

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
        duration: 12000, // Increased duration
      });
    } else if (data.user && data.session) {
      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta ha sido creada y has iniciado sesión. Serás redirigido.",
        variant: "default",
        duration: 3000,
      });
      console.log("INFO (SignupPage): Registro y sesión exitosos para:", data.user.email);
      console.log("INFO (SignupPage): El trigger 'handle_new_user' en Supabase debería haber creado un UserProfile para:", data.user.id, "con estado 'free'.");
      await refreshUserProfile();
      router.push('/'); 
    } else if (data.user) {
         toast({
            title: "Registro Casi Completo",
            description: "Tu cuenta ha sido creada. Si la configuración de Supabase lo requiere, revisa tu correo electrónico para confirmar tu cuenta. Luego podrás iniciar sesión.",
            variant: "default",
            duration: 7000,
        });
        console.log("INFO (SignupPage): Registro exitoso (posiblemente requiere confirmación) para:", data.user.email);
        console.log("INFO (SignupPage): El trigger 'handle_new_user' en Supabase debería haber creado un UserProfile para:", data.user.id, "con estado 'free'.");
        router.push('/login'); 
    } else {
        toast({
            variant: "destructive",
            title: "Error de Registro Inesperado",
            description: "Ocurrió un problema inesperado durante el registro. Por favor, inténtalo de nuevo.",
        });
         console.error("ERROR (SignupPage): Respuesta inesperada de Supabase Auth durante el signUp:", data);
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
            <UserPlus className="h-6 w-6 text-primary" />
            Crear Cuenta
          </CardTitle>
          <CardDescription>
            Regístrate para empezar a utilizar el Centro de Análisis de Seguridad y descubrir sus funciones.
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground p-3 bg-muted rounded-md">
            <strong>Nota Importante:</strong> Este formulario registra usuarios con Supabase Auth.
            Un perfil básico se creará automáticamente en la base de datos (`user_profiles`) gracias a un trigger de Supabase, con estado de suscripción 'free'.
            La funcionalidad de CAPTCHA del frontend está temporalmente deshabilitada. Si experimenta errores de CAPTCHA, asegúrese de que la protección CAPTCHA esté DESACTIVADA en la configuración de su proyecto Supabase (Authentication {"->"} Settings).
            Si ve "Invalid API key", revise sus variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` y reinicie su servidor.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

