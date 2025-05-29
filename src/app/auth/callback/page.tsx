'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Procesando inicio de sesión...</p>
    </div>
  );
}
