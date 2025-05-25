
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Facebook, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);
  const [isFbSdkReady, setIsFbSdkReady] = useState(false);

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

  useEffect(() => {
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!facebookAppId || facebookAppId === "TU_FACEBOOK_APP_ID_AQUI") {
      console.warn("LoginPage: Facebook App ID no está configurado. El login con Facebook no funcionará.");
      setIsFbSdkReady(false);
      return;
    }

    // Define fbAsyncInit. This function will be called by the Facebook SDK after it loads.
    window.fbAsyncInit = function() {
      console.log("LoginPage: fbAsyncInit called.");
      if (window.FB) {
        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });
        setIsFbSdkReady(true); // SDK is initialized and ready
        console.log("LoginPage: Facebook SDK Initialized and ready via fbAsyncInit.");
      } else {
        console.error("LoginPage: fbAsyncInit called, but window.FB is not defined.");
        setIsFbSdkReady(false);
      }
    };

    // Load the SDK script if it doesn't exist
    if (!document.getElementById('facebook-jssdk')) {
      console.log("LoginPage: Facebook SDK script tag not found, loading it now...");
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = "https://connect.facebook.net/es_LA/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      // The SDK will automatically call window.fbAsyncInit once it's loaded
      document.head.appendChild(script);
    } else if (window.FB && typeof window.FB.init === 'function' && !isFbSdkReady) {
      // If script tag exists, FB object might exist, but our app-specific init might not have run
      // (or our component mounted after SDK's initial fbAsyncInit call).
      // Call our fbAsyncInit to ensure our app's FB.init and flag setting occurs.
      console.log("LoginPage: FB SDK script tag present. FB object exists. Forcing our fbAsyncInit.");
      window.fbAsyncInit();
    }
  }, []); // Empty dependency array ensures this runs once on mount


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      let title = "Error de Inicio de Sesión";
      let description = error.message || "No se pudo iniciar sesión. Por favor, verifica tus credenciales.";
      
      if (error.message.toLowerCase().includes("invalid api key") || error.message.toLowerCase().includes("api key error") || error.message.toLowerCase().includes("failed to fetch")) {
        title = "Error de Configuración de Supabase";
        description = `Error de Supabase: ${error.message}. Verifique:
        1. Que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local sean correctas.
        2. Que haya REINICIADO su servidor de desarrollo (npm run dev) después de guardar .env.local.
        3. Su conexión a internet y acceso a la URL de Supabase.`;
      } else if (error.message.toLowerCase().includes("captcha verification process failed")) {
        title = "Error de CAPTCHA de Supabase";
        description = `Supabase rechazó el inicio de sesión por CAPTCHA. 
        **Solución Posible:** En la configuración de tu proyecto Supabase (Autenticación -> Configuración), asegúrate de que la "Protección con CAPTCHA" esté DESACTIVADA y guarda los cambios. Este proyecto actualmente no implementa un CAPTCHA frontend compatible con esa configuración de Supabase. Contacta al administrador de la plataforma si el problema persiste.`;
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
      await refreshUserProfile();
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
    setIsLoading(false);
  };

  const handleFacebookLogin = async () => {
    setIsLoadingFacebook(true);

    if (!isFbSdkReady || !window.FB || typeof window.FB.login !== 'function') {
      toast({
        variant: "destructive",
        title: "Error de Facebook Login",
        description: "El SDK de Facebook no está listo o no se pudo inicializar. Por favor, espera un momento e inténtalo de nuevo.",
      });
      setIsLoadingFacebook(false);
      return;
    }
    
    window.FB.login(async (loginResponse: any) => {
      console.log('Respuesta de FB.login:', loginResponse);
      if (loginResponse.authResponse) {
        const accessToken = loginResponse.authResponse.accessToken;
        // Call FB.api to get user details
        window.FB.api('/me', {fields: 'id,name,email'}, async function(profileResponse: any) {
          console.log('Respuesta de FB.api /me:', profileResponse);
          if (profileResponse && !profileResponse.error) {
            toast({
              title: `Conexión con Facebook Exitosa (Frontend)`,
              description: `¡Hola, ${profileResponse.name}! (ID: ${profileResponse.id}). Ahora intentando autenticar con el backend...`,
              variant: "default",
              duration: 4000,
            });
            
            try {
              const res = await fetch("/api/auth/facebook", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ accessToken }), // Send the access token obtained from FB.login
              });

              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.error || "Error inesperado del servidor durante la autenticación con Facebook.");
              }

              toast({
                title: "Autenticación Completa Exitosa",
                description: "Te has autenticado correctamente con Facebook a través de nuestro servidor.",
                variant: "default",
                duration: 5000,
              });

              await refreshUserProfile(); 
              router.push(searchParams.get("redirect") || "/");

            } catch (err: any) {
              console.error("Error en la llamada a /api/auth/facebook:", err);
              toast({
                variant: "destructive",
                title: "Error de Autenticación con Servidor",
                description: err.message || "No se pudo completar la autenticación con Facebook en el servidor.",
                duration: 7000,
              });
            }
          } else {
             toast({
              variant: "destructive",
              title: "Error al obtener perfil de Facebook",
              description: `No se pudo obtener tu información de Facebook después del login: ${profileResponse?.error?.message || 'Error desconocido.'}`,
            });
          }
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login con Facebook Cancelado",
          description: "No se completó el inicio de sesión con Facebook.",
        });
      }
      setIsLoadingFacebook(false);
    }, { scope: 'email,public_profile' });
  };


  if (authIsLoading && !session) {
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
            Accede a tu cuenta para gestionar tus análisis de seguridad.
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
            <strong>Nota Importante:</strong> El inicio de sesión con Email/Contraseña usa Supabase Auth. 
            El inicio de sesión con Facebook actualmente llama a un endpoint de backend (`/api/auth/facebook`) que necesita ser implementado para una autenticación segura y completa con Supabase.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    

    

    

    