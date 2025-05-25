
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Facebook, Loader2 } from "lucide-react"; // Added Facebook icon
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Declare FB a nivel global para TypeScript si aún no lo has hecho en un .d.ts
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: any;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);
  const [isFbSdkReady, setIsFbSdkReady] = useState(false); // New state for SDK readiness

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

  // Facebook SDK Initialization
  useEffect(() => {
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!facebookAppId || facebookAppId === "TU_FACEBOOK_APP_ID_AQUI") {
      console.warn("Facebook App ID no está configurado. El login con Facebook no funcionará.");
      setIsFbSdkReady(false); // Explicitly set to false if no App ID
      return;
    }

    // Cargar el SDK de Facebook de forma asíncrona
    if (document.getElementById('facebook-jssdk')) {
        // If script is already there, check if FB object exists
        if (window.FB) {
            setIsFbSdkReady(true);
        }
        return; 
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = "https://connect.facebook.net/es_LA/sdk.js"; // es_LA para español Latinoamérica
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v19.0' // Usa una versión específica de la API
      });
      window.FB.AppEvents.logPageView();
      setIsFbSdkReady(true); // SDK is ready
      console.log("Facebook SDK Inicializado en Login Page");
    };

    return () => {
        // Optional: cleanup script on unmount if needed, but generally not required for SDKs like this
        // const fbScript = document.getElementById('facebook-jssdk');
        // if (fbScript) {
        //    document.body.removeChild(fbScript);
        // }
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let title = "Error de Inicio de Sesión";
      let description = error.message || "No se pudo iniciar sesión. Por favor, verifica tus credenciales.";
      
      if (error.message.toLowerCase().includes("invalid api key") || error.message.toLowerCase().includes("api key error") || error.message.toLowerCase().includes("failed to fetch")) {
        title = "Error de Configuración de Supabase";
        description = `Error de Supabase: ${error.message}. Esto usualmente significa que las claves API son incorrectas o el servidor no está accesible. 
        Por favor, verifica lo siguiente:
        1. Que las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local (en la raíz de tu proyecto) sean EXACTAMENTE las mismas que aparecen en tu panel de Supabase (Project Settings > API).
        2. Que hayas REINICIADO tu servidor de desarrollo Next.js (npm run dev) después de guardar cualquier cambio en .env.local.
        3. Que tu conexión a internet funcione y puedas acceder a la URL de tu proyecto Supabase.`;
      } else if (error.message.toLowerCase().includes("captcha verification process failed")) {
        title = "Error de CAPTCHA de Supabase";
        description = `Supabase rechazó el intento de inicio de sesión debido a un problema con la verificación CAPTCHA. 
        **Solución:** Ve a tu proyecto en supabase.com -> Authentication -> Settings (o "Proveedores" -> "Email") y DESACTIVA la "Protección con CAPTCHA". Guarda los cambios.
        Si el problema persiste, verifica que no haya restos de integraciones de hCaptcha en el código o que alguna extensión del navegador esté interfiriendo.`;
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
        duration: 12000,
      });
    } else {
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "¡Bienvenido de nuevo! Serás redirigido en breve.",
        variant: "default",
        duration: 3000,
      });
      await refreshUserProfile(); // Asegúrate de que el perfil se actualice después del login
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
    setIsLoading(false);
  };

  const handleFacebookLogin = async () => {
    setIsLoadingFacebook(true);
    if (!isFbSdkReady || typeof window.FB === 'undefined' || !window.FB || typeof window.FB.login !== 'function') {
      toast({
        variant: "destructive",
        title: "Error de Facebook Login",
        description: "El SDK de Facebook no se ha cargado o inicializado correctamente. Por favor, espera un momento e inténtalo de nuevo o revisa tu conexión/configuración de App ID.",
      });
      setIsLoadingFacebook(false);
      return;
    }

    window.FB.login(function(response: any) {
      console.log('Respuesta de FB.login:', response);
      if (response.authResponse) {
        // El usuario ha iniciado sesión y ha autorizado tu aplicación.
        // response.authResponse contiene: accessToken, userID, expiresIn, etc.
        // ¡AQUÍ DEBERÍAS ENVIAR response.authResponse.accessToken A TU BACKEND!
        // Tu backend luego verificaría este token con Facebook y crearía/iniciaría sesión
        // para el usuario en tu sistema (Supabase).
        toast({
          title: "Login con Facebook Exitoso (Frontend)",
          description: `Token de acceso recibido (userID: ${response.authResponse.userID}). Se necesita implementación de backend para completar el login.`,
          variant: "default",
          duration: 7000,
        });
        // Conceptualmente: router.push('/procesar-facebook-login?token=' + response.authResponse.accessToken);
      } else {
        // El usuario canceló el inicio de sesión o no autorizó completamente.
        toast({
          variant: "destructive",
          title: "Login con Facebook Cancelado",
          description: "No se completó el inicio de sesión con Facebook.",
        });
      }
      setIsLoadingFacebook(false);
    }, { scope: 'email,public_profile' }); // Solicita permisos básicos
  };


  if (authIsLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/50 p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando sesión...</p>
        </div>
    );
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
            Esta es una simulación. La autenticación real se haría con Supabase.
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
                disabled={isLoading || isLoadingFacebook}
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
                disabled={isLoading || isLoadingFacebook}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || isLoadingFacebook}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="my-4 flex items-center before:flex-1 before:border-t before:border-border after:flex-1 after:border-t after:border-border">
            <p className="mx-4 text-center text-sm text-muted-foreground">O</p>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            onClick={handleFacebookLogin}
            disabled={isLoading || isLoadingFacebook || !isFbSdkReady}
          >
            <Facebook className="mr-2 h-5 w-5" />
            {isLoadingFacebook ? "Conectando..." : (isFbSdkReady ? "Iniciar Sesión con Facebook" : "Cargando Facebook...")}
          </Button>

          <div className="mt-6 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>
           <div className="mt-4 text-center text-xs text-muted-foreground p-3 bg-muted rounded-md">
            <strong>Nota Importante:</strong> Este formulario ahora interactúa con <strong className="text-primary">Supabase Auth</strong> para intentos de inicio de sesión.
            El inicio de sesión con Facebook es solo frontend por ahora y requiere implementación de backend para ser funcional y seguro.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    