
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
  const { session, isLoading: authIsLoading } = useAuth();

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
    captchaRef.current?.resetCaptcha();
  };

  const onCaptchaError = (err: string) => {
    setCaptchaToken(null);
    captchaRef.current?.resetCaptcha();
    toast({
      variant: "destructive",
      title: "Error de CAPTCHA",
      description: `Error de hCaptcha: ${err}. Por favor, intente de nuevo.`,
    });
  };
  */

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

    /* HCAPTCHA - Temporarily disabled. Uncomment when react-hcaptcha is successfully installed.
    if (!captchaToken) {
      toast({
        variant: "destructive",
        title: "Verificación Requerida",
        description: "Por favor, complete el CAPTCHA.",
      });
      return;
    }
    */
    setIsLoading(true);

    // In a real implementation, you would send captchaToken to your backend for verification here.

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo: `${window.location.origin}/auth/callback`, // Optional: for email confirmation flow
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: error.message || "No se pudo completar el registro.",
      });
    } else if (data.user && data.session) {
      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta ha sido creada y has iniciado sesión. Serás redirigido.",
        variant: "default",
        duration: 3000,
      });
      // Redirection is handled by useEffect
      // The Supabase trigger 'handle_new_user' should create the profile in user_profiles.
    } else if (data.user) {
         toast({
            title: "Registro Casi Completo",
            description: "Tu cuenta ha sido creada. Si la configuración de Supabase lo requiere, revisa tu correo electrónico para confirmar tu cuenta. Luego podrás iniciar sesión.",
            variant: "default",
            duration: 7000,
        });
        // The Supabase trigger 'handle_new_user' should create the profile in user_profiles.
        console.log("SIMULACIÓN BD: Trigger 'handle_new_user' en Supabase debería haber creado un UserProfile para:", data.user.id, data.user.email);
        router.push('/login');
    } else {
        toast({
            variant: "destructive",
            title: "Error de Registro",
            description: "Ocurrió un problema inesperado durante el registro. Por favor, inténtalo de nuevo.",
        });
    }
    setIsLoading(false);
    /* HCAPTCHA - Temporarily disabled. Uncomment when react-hcaptcha is successfully installed.
    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);
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

            {/* HCAPTCHA INTEGRATION - Temporarily disabled. Uncomment when react-hcaptcha is successfully installed.
            // See README.md for instructions on how to re-enable and troubleshoot.
            <div className="flex justify-center my-4">
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "YOUR_FALLBACK_SITE_KEY_HERE"}
                onVerify={onCaptchaVerify}
                onExpire={onCaptchaExpire}
                onError={onCaptchaError}
                ref={captchaRef}
              />
            </div>
            */}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading /* HCAPTCHA - Temporarily disabled. || !captchaToken */}>
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
            <strong>Nota Importante:</strong> Este formulario ahora registra usuarios con <strong className="text-primary">Supabase Auth</strong>.
            Un perfil básico se creará automáticamente en nuestra base de datos gracias a un trigger de Supabase.
            La funcionalidad de CAPTCHA está temporalmente deshabilitada; sigue las instrucciones en el README para reactivarla.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
