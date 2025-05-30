
"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/layout/header";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // SIMULACIÓN DE ENVÍO DE FORMULARIO
    // En una aplicación real, aquí llamarías a tu API de backend
    // para procesar el formulario y enviar el correo.
    // Ejemplo:
    // try {
    //   const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ name, email, company, message }),
    //   });
    //   if (!response.ok) throw new Error('Error al enviar el mensaje.');
    //   // Éxito
    // } catch (error) {
    //   // Manejar error
    // }
    console.log("Simulación de envío de formulario:", { name, email, company, message });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Mensaje Recibido (Simulación)",
      description: "Gracias por contactarnos. En una aplicación real, tu mensaje sería enviado. Esta es una demostración.",
      variant: "default",
      duration: 6000,
    });
    setName("");
    setEmail("");
    setCompany("");
    setMessage("");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <section className="text-center mb-12 md:mb-16">
          <Mail className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Contáctenos</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            ¿Tiene preguntas sobre nuestros servicios o necesita una consulta de seguridad personalizada? Estamos aquí para ayudarle.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <Card className="shadow-xl border border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Envíenos un Mensaje</CardTitle>
              <CardDescription>Complete el formulario y nuestro equipo se pondrá en contacto. (Actualmente es una simulación)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Su nombre" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="su@correo.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Empresa (Opcional)</Label>
                  <Input 
                    id="company" 
                    type="text" 
                    placeholder="Nombre de su empresa" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Su Mensaje</Label>
                  <Textarea 
                    id="message" 
                    placeholder="¿En qué podemos ayudarle?" 
                    rows={5} 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required 
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="shadow-lg border border-border">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Información de Contacto Directo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <span><a href="mailto:soporte@tu-dominio.com" className="hover:underline">soporte@tu-dominio.com</a> (Reemplazar)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>+1 (555) 123-4567 (Reemplazar)</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>123 Calle Ficticia, Ciudad Segura, Mundo Digital (Reemplazar)</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border border-border">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Horario de Atención</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>Lunes a Viernes: 9:00 AM - 6:00 PM (Su Zona Horaria)</p>
                <p>Sábados y Domingos: Cerrado (Soporte de emergencia para clientes premium según acuerdo).</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="text-center py-8 text-sm text-muted-foreground border-t border-border bg-card">
          <p>© {new Date().getFullYear()} Centro de Análisis de Seguridad Integral. Todos los derechos reservados.</p>
          <p className="mb-2">Idea y Visión: Ronald Gonzalez Niche</p>
          <div className="space-x-3">
            <Link href="/terms" className="text-xs text-primary hover:underline"> Términos y Condiciones </Link>
            <span className="text-xs text-muted-foreground">|</span>
            <Link href="/privacy" className="text-xs text-primary hover:underline"> Política de Privacidad </Link>
          </div>
        </footer>
    </div>
  );
}
