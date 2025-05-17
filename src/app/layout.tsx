
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
  // It's recommended to use an environment variable for the PayPal Client ID here
  // For example, process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  // Ensure this Client ID matches the one used for your REST API app in PayPal Developer Portal
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "YOUR_PAYPAL_SANDBOX_CLIENT_ID_HERE";

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        {/* PayPal SDK Script for Smart Payment Buttons */}
        {/* Replace YOUR_PAYPAL_SANDBOX_CLIENT_ID_HERE with your actual Sandbox Client ID, ideally via an environment variable */}
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
