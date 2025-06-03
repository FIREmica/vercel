"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const LoginPage = () => {
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
      const redirectUrl = searchParams.get("redirect") || "/";
      router.replace(redirectUrl);
    }
  }, [session, authIsLoading, router, searchParams]);

  useEffect(() => {
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!facebookAppId || facebookAppId === "TU_FACEBOOK_APP_ID_AQUI") {
      console.warn("LoginPage: Facebook App ID no está configurado.");
      setIsFbSdkReady(false);
      return;
    }

    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
        setIsFbSdkReady(true);
      }
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/es_LA/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    } else if (window.FB && typeof window.FB.init === "function" && !isFbSdkReady) {
      window.fbAsyncInit();
    }
  }, [isFbSdkReady]);

  const getPremiumStatusForToast = async (userId: string): Promise<boolean> => {
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("subscription_status")
      .eq("id", userId)
      .single();

    if (profile && !profileError) {
      const premiumStatuses = [
        "active_premium",
        "premium_monthly",
        "premium_yearly",
        "active",
      ];
      return premiumStatuses.some((status) =>
        profile.subscription_status?.toLowerCase().includes(status)
      );
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: error.message,
        duration: 12000,
      });
      setIsLoading(false);
    } else if (signInData.user) {
      await refreshUserProfile();
      const currentIsPremium = await getPremiumStatusForToast(signInData.user.id);
      toast({
        title: "Inicio de Sesión Exitoso",
        description: `Bienvenido de nuevo. (Cuenta: ${
          currentIsPremium ? "Premium ✨" : "Gratuita"
        })`,
        variant: "default",
        duration: 4000,
      });
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
      setIsLoading(false);
    } else {
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: "Respuesta inesperada del servidor.",
      });
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoadingFacebook(true);

    if (!isFbSdkReady || !window.FB || typeof window.FB.login !== "function") {
      toast({
        variant: "destructive",
        title: "Error de Facebook Login",
        description: "El SDK de Facebook no está listo.",
      });
      setIsLoadingFacebook(false);
      return;
    }

    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          window.FB.api("/me", { fields: "id,name,email" }, async (profile: any) => {
            if (profile && !profile.error) {
              try {
                const res = await fetch("/api/auth/facebook", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ accessToken }),
                });

                const data = await res.json();

                if (!res.ok)
                  throw new Error(
                    data.error || "Error del servidor al autenticar con Facebook."
                  );

                await refreshUserProfile();
                const {
                  data: { user: supaUser },
                } = await supabase.auth.getUser();

                let currentIsPremium = false;
                if (supaUser) {
                  currentIsPremium = await getPremiumStatusForToast(supaUser.id);
                }

                toast({
                  title: "Autenticación Exitosa",
                  description: `Bienvenido con Facebook. (Cuenta: ${
                    currentIsPremium ? "Premium ✨" : "Gratuita"
                  })`,
                  duration: 5000,
                });

                router.push(searchParams.get("redirect") || "/");
              } catch (err: any) {
                toast({
                  variant: "destructive",
                  title: "Error de Autenticación",
                  description: err.message,
                });
              }
            } else {
              toast({
                variant: "destructive",
                title: "Error al obtener datos de Facebook",
                description: profile.error?.message || "Error desconocido.",
              });
            }
          });
        } else {
          toast({
            variant: "destructive",
            title: "Inicio de sesión cancelado",
            description: "No se completó el inicio con Facebook.",
          });
        }
        setIsLoadingFacebook(false);
      },
      { scope: "email,public_profile" }
    );
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isLoadingFacebook}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isLoadingFacebook}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingFacebook}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">O inicia sesión con:</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleFacebookLogin}
              disabled={isLoading || isLoadingFacebook}
            >
              {isLoadingFacebook ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-2 text-blue-600"
                >
                  <path d="M22.676 0H1.326C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.326 24h11.495v-9.294H9.692V11.01h3.129V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.796.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.588l-.467 3.696h-3.121V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.676 0z" />
                </svg>
              )}
              Facebook
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline text-primary">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
