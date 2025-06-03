"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  // Estados y hooks necesarios
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);
  const [isFbSdkReady, setIsFbSdkReady] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserProfile } = useAuth();

  // Aquí pon tu función getPremiumStatusForToast
  const getPremiumStatusForToast = async (userId: string): Promise<boolean> => {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("subscription_status")
      .eq("id", userId)
      .single();

    if (profile && !error) {
      const premiumStatuses = ["active_premium", "premium_monthly", "premium_yearly", "active"];
      return premiumStatuses.some((status) =>
        profile.subscription_status?.toLowerCase().includes(status)
      );
    }
    return false;
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

    window.FB.login(async (response: any) => {
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
                throw new Error(data.error || "Error del servidor al autenticar con Facebook.");

              await refreshUserProfile();

              const { data: { user: supaUser } = {} } = await supabase.auth.getUser();
              let currentIsPremium = false;
              if (supaUser) {
                currentIsPremium = await getPremiumStatusForToast(supaUser.id);
              }

              toast({
                title: "Autenticación Exitosa",
                description: `Bienvenido, ${profile.name}. (Cuenta: ${
                  currentIsPremium ? "Premium ✨" : "Gratuita"
                })`,
                variant: "default",
                duration: 4000,
              });

              const redirectUrl = searchParams.get("redirect") || "/";
              router.push(redirectUrl);
            } catch (error: any) {
              toast({
                variant: "destructive",
                title: "Error de Facebook Login",
                description: error.message || "Error inesperado al autenticar con Facebook.",
              });
            } finally {
              setIsLoadingFacebook(false);
            }
          } else {
            toast({
              variant: "destructive",
              title: "Error de Facebook Login",
              description: profile?.error?.message || "No se pudo obtener el perfil de Facebook.",
            });
            setIsLoadingFacebook(false);
          }
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Cancelado",
          description: "No se otorgaron permisos para iniciar sesión con Facebook.",
        });
        setIsLoadingFacebook(false);
      }
    }, { scope: "email" });
  };

  return (
    <div>
      {/* Aquí tu JSX para login, botón de Facebook etc */}
      <button onClick={handleFacebookLogin} disabled={isLoadingFacebook}>
        Login con Facebook
      </button>
    </div>
  );
};

export default LoginPage;
