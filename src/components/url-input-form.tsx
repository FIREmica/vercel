
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Search, Loader2, ServerIcon, Database, Globe, Gamepad2 } from "lucide-react";

const formSchema = z.object({
  url: z.string().url({ message: "Por favor, ingresa una URL válida." }).optional().or(z.literal('')),
  serverDescription: z.string().min(10, {message: "La descripción del servidor debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  gameServerDescription: z.string().min(10, {message: "La descripción del servidor de juegos debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  databaseDescription: z.string().min(10, {message: "La descripción de la base de datos debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
}).refine(data => !!data.url || !!data.serverDescription || !!data.gameServerDescription || !!data.databaseDescription, {
  message: "Debes proporcionar al menos una URL, descripción del servidor (general o de juegos) o descripción de la base de datos.",
  path: ["url"], 
});

export type UrlInputFormValues = z.infer<typeof formSchema>;

type UrlInputFormProps = {
  onSubmit: (values: UrlInputFormValues) => Promise<void>;
  isLoading: boolean;
  defaultUrl?: string;
};

export function UrlInputForm({ onSubmit, isLoading, defaultUrl }: UrlInputFormProps) {
  const form = useForm<UrlInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: defaultUrl || "",
      serverDescription: "",
      gameServerDescription: "",
      databaseDescription: "",
    },
  });

  async function handleSubmit(values: UrlInputFormValues) {
    // The values passed to onSubmit will contain all fields from the form,
    // including gameServerDescription separately.
    // The merging logic is handled in `performAnalysisAction`.
    await onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="url-input" className="text-base flex items-center"><Globe className="mr-2 h-4 w-4 text-primary" />URL del Aplicativo Web (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  id="url-input"
                  placeholder="ej., http://www.ejemplo.com/registro" 
                  {...field} 
                  className="text-sm"
                  aria-describedby="url-form-message"
                />
              </FormControl>
               <FormDescription>
                Ingrese la URL completa de la aplicación web o página de registro que desea analizar.
              </FormDescription>
              <FormMessage id="url-form-message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serverDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="server-description-input" className="text-base flex items-center">
                <ServerIcon className="mr-2 h-4 w-4 text-primary"/>
                Descripción del Servidor General (Web/App) (Opcional)
              </FormLabel>
              <FormControl>
                <Textarea
                  id="server-description-input"
                  placeholder="Describe la configuración del servidor general: OS, servicios (web, app), puertos, versiones, medidas de seguridad existentes, etc."
                  {...field}
                  className="text-sm min-h-[100px]"
                  aria-describedby="server-description-form-message"
                />
              </FormControl>
              <FormDescription>
                Proporciona detalles relevantes para el análisis de seguridad del servidor general. Si es un servidor de juegos, utiliza el campo específico a continuación.
              </FormDescription>
              <FormMessage id="server-description-form-message" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="gameServerDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="game-server-description-input" className="text-base flex items-center">
                <Gamepad2 className="mr-2 h-4 w-4 text-primary"/>
                Descripción Específica del Servidor de Juegos (Opcional)
              </FormLabel>
              <FormControl>
                <Textarea
                  id="game-server-description-input"
                  placeholder="Detalles del servidor de juegos: tipo (ej. Lineage 2, Roblox, Minecraft), motor, modificaciones, sistemas anti-trampas, puertos de juego, autenticación de jugadores, etc."
                  {...field}
                  className="text-sm min-h-[100px]"
                  aria-describedby="game-server-description-form-message"
                />
              </FormControl>
              <FormDescription>
                Proporciona información detallada sobre la configuración y componentes de tu servidor de videojuegos para un análisis de seguridad más preciso.
              </FormDescription>
              <FormMessage id="game-server-description-form-message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="databaseDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="database-description-input" className="text-base flex items-center"><Database className="mr-2 h-4 w-4 text-primary"/>Descripción de la Base de Datos (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  id="database-description-input"
                  placeholder="Describe la configuración de la BD: tipo (MySQL, MongoDB, etc.), versión, métodos de autenticación, acceso a la red, tipo de datos almacenados (ej. datos de jugadores, inventarios virtuales, información financiera), etc."
                  {...field}
                  className="text-sm min-h-[100px]"
                  aria-describedby="database-description-form-message"
                />
              </FormControl>
               <FormDescription>
                Proporciona detalles para el análisis de seguridad de la base de datos, incluyendo aquellas utilizadas por servidores de juegos.
              </FormDescription>
              <FormMessage id="database-description-form-message" />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
            <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}
         {form.formState.errors.url && !form.formState.errors.url.message?.includes("válida") && (
             <FormMessage>{form.formState.errors.url.message}</FormMessage>
         )}

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Search className="mr-2 h-5 w-5" />
          )}
          Analizar Seguridad
        </Button>
      </form>
    </Form>
  );
}
