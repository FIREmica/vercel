// Remove "use client"; directive
// "use client"; 

import type {Metadata} from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected: Assuming Geist is the correct package name
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
// Remove useEffect as it's not needed for basic analytics init here and causes metadata export issues
// import { useEffect } from 'react'; 
import { analytics } from '@/lib/firebase/client'; // Import analytics

const geistSans = Geist({ // Corrected: Assuming Geist is the correct package name
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected: Assuming Geist_Mono is the correct package name
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
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "YOUR_PAYPAL_SANDBOX_CLIENT_ID_HERE";

  // useEffect for analytics console.log removed to keep RootLayout as a Server Component
  // useEffect(() => {
  //   if (analytics) {
  //     console.log("Firebase Analytics initialized successfully in Layout.");
  //   }
  // }, []);

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/* AuthProvider itself is a Client Component */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
