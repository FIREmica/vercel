
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

    // Define fbAsyncInit if not already defined
    if (typeof window.fbAsyncInit === 'undefined') {
      window.fbAsyncInit = function() {
        console.log("LoginPage: fbAsyncInit called.");
        if (window.FB) {
          window.FB.init({
            appId: facebookAppId,
            cookie: true,
            xfbml: true,
            version: 'v19.0' // او v20.0 si está disponible y probado
          });
          setIsFbSdkReady(true);
          console.log("LoginPage: Facebook SDK Inicializado y listo via fbAsyncInit.");
        } else {
          console.error("LoginPage: fbAsyncInit called, but window.FB is not defined.");
          setIsFbSdkReady(false);
        }
      };
    }


    // Load the SDK script if it doesn't exist
    if (!document.getElementById('facebook-jssdk')) {
      console.log("LoginPage: Facebook SDK script tag not found, loading it now...");
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = "https://connect.facebook.net/es_LA/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        // fbAsyncInit should be called automatically by the SDK after it loads
        // but as a fallback, if it's defined and FB object exists, call it.
        if (typeof window.fbAsyncInit === 'function' && window.FB && !isFbSdkReady) {
          console.log("LoginPage: SDK script loaded, calling fbAsyncInit directly as a fallback.");
          window.fbAsyncInit();
        }
      };
      document.body.appendChild(script);
    } else {
      // If script exists, FB might already be initialized.
      // Check if FB object exists and our init function has run.
      if (window.FB && typeof window.FB.getLoginStatus === 'function' && !isFbSdkReady ) {
         // This case can be tricky if another part of the app initialized FB.
         // For simplicity, we assume our fbAsyncInit will set isFbSdkReady.
         // If fbAsyncInit was already called by the SDK, our isFbSdkReady might remain false.
         // A robust solution might involve a global flag or event.
         // Let's try to call our fbAsyncInit if FB is loaded but our flag isn't set.
         if(typeof window.fbAsyncInit === 'function'){
            console.log("LoginPage: Facebook SDK script tag already present. FB object exists. Trying to ensure our fbAsyncInit runs.");
            window.fbAsyncInit(); // Attempt to run our init sequence if not already done.
         } else {
            console.log("LoginPage: Facebook SDK script tag already present, FB object exists, but isFbSdkReady is false and no window.fbAsyncInit.");
         }
      } else if (window.FB && isFbSdkReady) {
          console.log("LoginPage: Facebook SDK script tag already present and our SDK is marked as ready.");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        description = `Error de Supabase: ${error.message}. Verifique:
        1. Que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local sean correctas.
        2. Que haya REINICIADO su servidor de desarrollo (npm run dev) después de guardar .env.local.
        3. Su conexión a internet y acceso a la URL de Supabase.`;
      } else if (error.message.toLowerCase().includes("captcha verification process failed")) {
        title = "Error de CAPTCHA de Supabase";
        description = `Supabase rechazó el inicio de sesión por CAPTCHA. 
        **Solución Posible:** En la configuración de tu proyecto Supabase (Autenticación -> Proveedores -> Email o en Authentication -> Settings), asegúrate de que la "Protección con CAPTCHA" esté DESACTIVADA y guarda los cambios. Este proyecto actualmente no implementa un CAPTCHA frontend compatible con esa configuración de Supabase.`;
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
    if (!isFbSdkReady || typeof window.FB === 'undefined' || typeof window.FB.login !== 'function') {
      toast({
        variant: "destructive",
        title: "Error de Facebook Login",
        description: "El SDK de Facebook no está listo. Por favor, espera un momento o revisa tu conexión/configuración de App ID.",
      });
      setIsLoadingFacebook(false);
      return;
    }

    window.FB.getLoginStatus(function(statusResponse: any) {
      console.log('FB.getLoginStatus response (before login attempt):', statusResponse);
      // We call FB.login regardless of current status, as the user initiated the login action.
      // The main purpose here is to ensure getLoginStatus completes, implying init is done.
      window.FB.login(function(loginResponse: any) {
        console.log('Respuesta de FB.login:', loginResponse);
        if (loginResponse.authResponse) {
          // El usuario ha iniciado sesión y ha autorizado tu aplicación.
          // authResponse.accessToken, authResponse.userID, etc. están disponibles.
          window.FB.api('/me', {fields: 'id,name'}, function(profileResponse: any) {
            console.log('Respuesta de FB.api /me:', profileResponse);
            if (profileResponse && !profileResponse.error) {
              toast({
                title: `Login con Facebook Exitoso (Frontend)`,
                description: `¡Hola, ${profileResponse.name}! (ID: ${profileResponse.id}). Se necesita implementación de backend para completar.`,
                variant: "default",
                duration: 7000,
              });
              // TODO: Enviar loginResponse.authResponse.accessToken y/o profileResponse.id al backend
              // para verificar el token y crear/iniciar sesión del usuario en Supabase.
            } else {
               toast({
                variant: "destructive",
                title: "Error al obtener perfil de Facebook",
                description: `No se pudo obtener tu información de Facebook después del login: ${profileResponse?.error?.message || 'Error desconocido.'}`,
              });
            }
          });
        } else {
          // El usuario canceló el inicio de sesión o no autorizó completamente.
          toast({
            variant: "destructive",
            title: "Login con Facebook Cancelado",
            description: "No se completó el inicio de sesión con Facebook.",
          });
        }
        setIsLoadingFacebook(false);
      }, { scope: 'email,public_profile' }); // Solicitar permisos
    }, true); // Pass true to force a roundtrip to Facebook
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
            La autenticación con Email/Contraseña se gestiona con Supabase.
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
            <strong>Nota Importante:</strong> Los formularios de Email/Contraseña interactúan con Supabase Auth.
            El inicio de sesión con Facebook es solo frontend y requiere implementación de backend para ser funcional y seguro.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    

    

    