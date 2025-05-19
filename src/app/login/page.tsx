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

  /* HCAPTCHA - Temporarily disabled. Uncomment when react-hcaptcha is successfully installed.
  const onCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const onCaptchaExpire = () => {
    setCaptchaToken(null);
    // captchaRef.current?.resetCaptcha(); // Uncomment if captchaRef is defined
  };

  const onCaptchaError = (err: string) => {
    setCaptchaToken(null);
    // captchaRef.current?.resetCaptcha(); // Uncomment if captchaRef is defined
    toast({
      variant: "destructive",
      title: "Error de CAPTCHA",
      description: `Error de hCaptcha: ${err}. Por favor, intente de nuevo.`,
    });
  };
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    /* HCAPTCHA - Temporarily disabled.
    if (!captchaToken) {
      toast({
        variant: "destructive",
        title: "Verificación Requerida",
        description: "Por favor, complete el CAPTCHA.",
      });
      setIsLoading(false);
      return;
    }
    */

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let description = error.message || "No se pudo iniciar sesión. Por favor, verifica tus credenciales.";
      if (error.message.toLowerCase().includes("captcha verification process failed") || error.message.toLowerCase().includes("captcha required")) {
        description = "Error de CAPTCHA de Supabase: La verificación CAPTCHA falló. Por favor, asegúrate de que la protección CAPTCHA esté DESACTIVADA en la configuración de tu proyecto Supabase (Authentication -> Settings -> CAPTCHA protection) y guarda los cambios. Si persiste, contacta el soporte de Supabase.";
      }
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: description,
        duration: 9000,
      });
    } else {
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "¡Bienvenido de nuevo! Serás redirigido en breve.",
        variant: "default",
        duration: 3000,
      });
      await refreshUserProfile(); // Refresh user profile to get latest subscription status
      router.push('/'); // Redirect on successful login
    }
    setIsLoading(false);
    /* HCAPTCHA - Temporarily disabled.
    // captchaRef.current?.resetCaptcha(); // Uncomment if captchaRef is defined
    // setCaptchaToken(null);
    */
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

            {/* HCAPTCHA - Temporarily disabled. Uncomment when react-hcaptcha is successfully installed.
            // See README.md for instructions on how to re-enable and troubleshoot.
            // <div className="flex justify-center my-4">
            //  <HCaptcha
            //    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "YOUR_FALLBACK_SITE_KEY_HERE"}
            //    onVerify={onCaptchaVerify}
            //    onExpire={onCaptchaExpire}
            //    onError={onCaptchaError}
            //    ref={captchaRef} // Ensure captchaRef is defined and typed if uncommenting
            //  />
            // </div>
            */}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading /* HCAPTCHA - Temporarily disabled. || !captchaToken */ }>
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
            <strong>Nota Importante:</strong> Este formulario ahora interactúa con <strong className="text-primary">Supabase Auth</strong>.
            La funcionalidad de CAPTCHA del frontend está temporalmente deshabilitada debido a problemas persistentes con la instalación del paquete `react-hcaptcha`.
            Si experimenta errores de CAPTCHA, asegúrese de que la protección CAPTCHA esté DESACTIVADA en la configuración de su proyecto Supabase (Authentication {"->"} Settings).
          </div>
        </CardContent>
      </Card>
    </div>
  );
}