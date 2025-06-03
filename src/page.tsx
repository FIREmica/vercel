
'use client';

import { supabase } from '@/lib/supabase/client'; // Use the potentially null client
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (!supabase) {
      console.warn("Home page (src/page.tsx): Supabase client not initialized. Facebook login will not function.");
    }
  }, []);

  const handleLogin = async () => {
    if (!supabase) {
      alert("El servicio de autenticación no está disponible en este momento. Por favor, intente más tarde.");
      console.error("Facebook login attempt: Supabase client is not initialized.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("Error during Facebook signInWithOAuth:", error);
        alert(`Error al intentar iniciar sesión con Facebook: ${error.message}`);
      }
    } catch (e) {
      console.error("Exception during Facebook signInWithOAuth:", e);
      alert("Ocurrió un error inesperado al intentar iniciar sesión con Facebook.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h1 className="text-2xl mb-4">Iniciar sesión (Ejemplo de Página Raíz)</h1>
      <p className="text-sm text-muted-foreground mb-4 max-w-md text-center">
        Esta es una página de ejemplo en <code>src/page.tsx</code>. La página principal de la aplicación está en <code>src/app/page.tsx</code>.
      </p>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={!supabase}
      >
        {supabase ? "Iniciar sesión con Facebook" : "Facebook Login (No Disponible)"}
      </button>
      {!supabase && (
        <p className="text-xs text-destructive mt-2">
          El inicio de sesión con Facebook está deshabilitado porque el cliente Supabase no pudo inicializarse.
        </p>
      )}
    </main>
  );
}
