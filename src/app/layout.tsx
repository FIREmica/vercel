
// Remove "use client"; directive
// "use client"; 

import type {Metadata} from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { analytics } from '@/lib/firebase/client';

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Centro de Análisis de Seguridad Integral',
  description: 'Plataforma integral para analizar la seguridad de aplicaciones web, servidores (incluyendo servidores de juegos), bases de datos y más, identificando vulnerabilidades comunes y específicas con IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use the new Client ID from environment variable, with the new ID as a fallback placeholder
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AdLdNIavBkmAj9AyalbF_sDT0pF5l7PH0W6JHfHKl9gl5bIqrHa9cNAunX52IIoMFPtPPgum28S0ZnYr";

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}`}
          strategy="beforeInteractive"
        />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
