import type {Metadata} from 'next';
import Script from 'next/script'; // Import Script from next/script
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

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
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        {/* PayPal SDK Script */}
        <Script
          src="https://www.paypal.com/sdk/js?client-id=BAA-fGCf9vG9LpXLsI0hmdbxEy5X8t_F38HBNtTmkHxE1Q0gUsrj3J0UEiin4N4dlSydXvf9skKDBgsqYM&components=hosted-buttons&disable-funding=venmo&currency=USD"
          strategy="beforeInteractive" // Carga el script antes de que la página sea interactiva
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
