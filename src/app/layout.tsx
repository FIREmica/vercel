import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Providers } from './providers';
import { ThemeProvider } from '@/context/ThemeContext';
import { ThemeClientWrapper } from '@/components/ThemeClientWrapper';

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
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error("ERROR CRÍTICO: La variable de entorno NEXT_PUBLIC_GOOGLE_CLIENT_ID no está definida. El inicio de sesión con Google no funcionará.");
  }

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        {paypalClientId && <Script src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`} strategy="beforeInteractive" data-sdk-integration-source="developer-studio" />}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`} suppressHydrationWarning={true}>
        <ThemeProvider>
          <ThemeClientWrapper />
          <GoogleOAuthProvider clientId={googleClientId || ""}>
            <Providers>{children}<Toaster /></Providers>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}