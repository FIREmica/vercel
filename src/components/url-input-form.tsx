
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
    const submissionValues: Partial<UrlInputFormValues> = {};
    if (values.url) submissionValues.url = values.url;
    
    // Combine serverDescription and gameServerDescription before sending
    let finalServerDescription = values.serverDescription || "";
    if (values.gameServerDescription) {
      finalServerDescription = finalServerDescription 
        ? `${finalServerDescription}\n\n--- Información Específica del Servidor de Juegos ---\n${values.gameServerDescription}`
        : values.gameServerDescription;
    }
    if (finalServerDescription) submissionValues.serverDescription = finalServerDescription;
    // We no longer send gameServerDescription as a separate field to the action
    // It's now part of serverDescription

    if (values.databaseDescription) submissionValues.databaseDescription = values.databaseDescription;
    
    // Ensure the correct type is passed to onSubmit
    const validSubmissionValues: UrlInputFormValues = {
      url: submissionValues.url || "", // Ensure url is always a string
      serverDescription: submissionValues.serverDescription || "", // Ensure serverDescription is always a string
      // gameServerDescription is intentionally omitted here as it's merged into serverDescription
      databaseDescription: submissionValues.databaseDescription || "" // Ensure databaseDescription is always a string
    };

    await onSubmit(validSubmissionValues);
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
                  placeholder="Describe la config. del servidor general: OS, servicios (web, app), puertos, versiones, etc."
                  {...field}
                  className="text-sm min-h-[100px]"
                  aria-describedby="server-description-form-message"
                />
              </FormControl>
              <FormDescription>
                Proporciona detalles para el análisis de seguridad del servidor general. Para servidores de juegos, usa el campo específico.
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
                  placeholder="Detalles del servidor de juegos: tipo (Lineage, Roblox, etc.), motor, mods, anti-cheat, puertos específicos del juego, etc."
                  {...field}
                  className="text-sm min-h-[100px]"
                  aria-describedby="game-server-description-form-message"
                />
              </FormControl>
              <FormDescription>
                Proporciona detalles específicos del servidor de videojuegos para un análisis más preciso.
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
                  placeholder="Describe la config. de la BD: tipo, versión, auth., red, datos de jugadores, ítems virtuales, etc."
                  {...field}
                  className="text-sm min-h-[100px]"
                  aria-describedby="database-description-form-message"
                />
              </FormControl>
               <FormDescription>
                Proporciona detalles para el análisis de seguridad de la base de datos, incluyendo aquellas para servidores de juegos.
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
