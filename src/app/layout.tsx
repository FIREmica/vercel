
import type {Metadata} from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { useEffect } from 'react';
import { analytics } from '@/lib/firebase/client'; // Import analytics

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
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "YOUR_PAYPAL_SANDBOX_CLIENT_ID_HERE";

  useEffect(() => {
    // This effect runs only on the client-side after hydration
    // Firebase Analytics initialization is handled in @/lib/firebase/client.ts
    // You can log custom events here if needed, e.g., page_view
    if (analytics) {
      console.log("Firebase Analytics initialized successfully.");
      // Example: logEvent(analytics, 'page_view', { page_path: window.location.pathname });
    }
  }, []);

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/* Wrap children with AuthProvider */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
