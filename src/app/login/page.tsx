"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGoogleLogin } from '@react-oauth/google';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<null | 'google' | 'facebook'>(null);
  const supabase = createClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailLogin = async (data: LoginFormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message,
      });
    } else {
      toast({
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido de vuelta!",
      });
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleLoginSuccess = async (codeResponse: any) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeResponse.code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falló el inicio de sesión con Google.');
      }

      toast({
        title: "Inicio de sesión con Google exitoso",
        description: "¡Bienvenido!",
      });
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión con Google",
        description: error.message,
      });
    } finally {
      setProviderLoading(null);
    }
  };

  const handleGoogleLoginError = (errorResponse: any) => {
    console.error('Error en el login con Google:', errorResponse);
    toast({
      variant: "destructive",
      title: "Error de inicio de sesión con Google",
      description: "No se pudo completar el inicio de sesión. Por favor, intente de nuevo.",
    });
    setProviderLoading(null);
  };

  const loginWithGoogle = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
  