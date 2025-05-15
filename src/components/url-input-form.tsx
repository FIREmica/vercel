
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, ServerIcon, Database, Globe, Gamepad2, SearchCode, Network, CloudIcon, BoxIcon, LibraryIcon } from "lucide-react";

const formSchema = z.object({
  url: z.string().url({ message: "Por favor, ingresa una URL válida." }).optional().or(z.literal('')),
  serverDescription: z.string().min(10, {message: "La descripción del servidor debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  gameServerDescription: z.string().min(10, {message: "La descripción del servidor de juegos debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  databaseDescription: z.string().min(10, {message: "La descripción de la base de datos debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')),
  codeSnippet: z.string().min(10, {message: "El fragmento de código debe tener al menos 10 caracteres si se proporciona."}).optional().or(z.literal('')), // Adjusted min length
  sastLanguage: z.string().optional(),
  repositoryUrl: z.string().url({message: "Por favor, ingrese una URL de repositorio válida."}).optional().or(z.literal('')), // Not currently used in actions.ts but kept for future
  dastTargetUrl: z.string().url({message: "Por favor, ingrese una URL válida para el análisis DAST."}).optional().or(z.literal('')),
  
  cloudProvider: z.enum(["AWS", "Azure", "GCP", "Other"]).optional(),
  cloudConfigDescription: z.string().min(20, {message: "La descripción de la configuración cloud debe tener al menos 20 caracteres si se proporciona."}).optional().or(z.literal('')),
  cloudRegion: z.string().optional().or(z.literal('')),
  
  containerImageName: z.string().optional().or(z.literal('')),
  dockerfileContent: z.string().min(20, {message: "El contenido del Dockerfile debe tener al menos 20 caracteres si se proporciona."}).optional().or(z.literal('')),
  kubernetesManifestContent: z.string().min(20, {message: "El contenido del manifiesto K8s debe tener al menos 20 caracteres si se proporciona."}).optional().or(z.literal('')),
  containerAdditionalContext: z.string().optional().or(z.literal('')),

  dependencyFileContent: z.string().min(20, {message: "El contenido del archivo de dependencias debe tener al menos 20 caracteres si se proporciona."}).optional().or(z.literal('')),
  dependencyFileType: z.enum(["npm", "pip", "maven", "gem", "other"]).optional(),

}).refine(data => 
    !!data.url || 
    !!data.serverDescription || 
    !!data.gameServerDescription || 
    !!data.databaseDescription ||
    !!data.codeSnippet ||
    !!data.dastTargetUrl ||
    (!!data.cloudProvider && !!data.cloudConfigDescription) || // cloudProvider requires configDescription
    !!data.containerImageName ||
    !!data.dockerfileContent ||
    !!data.kubernetesManifestContent ||
    (!!data.dependencyFileType && !!data.dependencyFileContent), { // dependencyFileType requires fileContent
  message: "Debes proporcionar al menos un objetivo de análisis completo (ej. si seleccionas Cloud, describe la configuración).",
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
      codeSnippet: "",
      sastLanguage: "",
      repositoryUrl: "",
      dastTargetUrl: "",
      cloudProvider: undefined,
      cloudConfigDescription: "",
      cloudRegion: "",
      containerImageName: "",
      dockerfileContent: "",
      kubernetesManifestContent: "",
      containerAdditionalContext: "",
      dependencyFileContent: "",
      dependencyFileType: undefined,
    },
  });

  async function handleSubmit(values: UrlInputFormValues) {
    const cleanedValues = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v != null && v !== '')
    ) as UrlInputFormValues;
    await onSubmit(cleanedValues);
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
                Proporciona detalles relevantes para el análisis de seguridad del servidor general.
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

        <FormField
          control={form.control}
          name="codeSnippet"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="code-snippet-input" className="text-base flex items-center"><SearchCode className="mr-2 h-4 w-4 text-primary"/>Fragmento de Código para SAST (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  id="code-snippet-input"
                  placeholder="Pega aquí un fragmento de código para análisis estático (SAST). Mínimo 10 caracteres."
                  {...field}
                  className="text-sm min-h-[120px] font-mono"
                  aria-describedby="code-snippet-form-message"
                />
              </FormControl>
              <FormDescription>
                Análisis estático simulado de seguridad para el fragmento de código proporcionado.
              </FormDescription>
              <FormMessage id="code-snippet-form-message" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="sastLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="sast-language-select" className="text-base flex items-center">Lenguaje del Fragmento de Código (SAST - Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="sast-language-select">
                    <SelectValue placeholder="Selecciona un lenguaje (ayuda al análisis)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="php">PHP</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="ruby">Ruby</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="plaintext">Otro/Texto Plano</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Especificar el lenguaje puede mejorar la precisión del análisis SAST simulado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dastTargetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dast-target-url-input" className="text-base flex items-center"><Network className="mr-2 h-4 w-4 text-primary"/>URL para Análisis DAST (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  id="dast-target-url-input"
                  placeholder="ej., http://www.ejemplo-app.com" 
                  {...field} 
                  className="text-sm"
                  aria-describedby="dast-target-url-form-message"
                />
              </FormControl>
               <FormDescription>
                Ingrese la URL base de la aplicación que desea analizar dinámicamente (DAST simulado).
              </FormDescription>
              <FormMessage id="dast-target-url-form-message" />
            </FormItem>
          )}
        />

        {/* Cloud Analysis Fields */}
        <FormField
          control={form.control}
          name="cloudProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="cloud-provider-select" className="text-base flex items-center"><CloudIcon className="mr-2 h-4 w-4 text-primary"/>Proveedor Cloud (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="cloud-provider-select">
                    <SelectValue placeholder="Seleccione el proveedor de nube"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AWS">Amazon Web Services (AWS)</SelectItem>
                  <SelectItem value="Azure">Microsoft Azure</SelectItem>
                  <SelectItem value="GCP">Google Cloud Platform (GCP)</SelectItem>
                  <SelectItem value="Other">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Seleccione el proveedor para el análisis de configuración de infraestructura en la nube.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cloudConfigDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="cloud-config-description-input" className="text-base flex items-center"><CloudIcon className="mr-2 h-4 w-4 text-primary"/>Descripción de Configuración Cloud (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  id="cloud-config-description-input"
                  placeholder="Describa la configuración de la infraestructura cloud (IAM, redes, almacenamiento, etc.). Mínimo 20 caracteres."
                  {...field}
                  className="text-sm min-h-[100px]"
                />
              </FormControl>
              <FormDescription>
                Proporcione detalles sobre políticas IAM, grupos de seguridad, configuración de almacenamiento S3/Blob, funciones Lambda/Azure, etc. (Se requiere si se selecciona un Proveedor Cloud).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="cloudRegion"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="cloud-region-input" className="text-base flex items-center"><CloudIcon className="mr-2 h-4 w-4 text-primary"/>Región Cloud (Opcional)</FormLabel>
              <FormControl>
                <Input
                  id="cloud-region-input"
                  placeholder="ej., us-east-1, West Europe"
                  {...field}
                  className="text-sm"
                />
              </FormControl>
              <FormDescription>
                Región de la nube donde residen los recursos, si es aplicable.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Container Analysis Fields */}
        <FormField
          control={form.control}
          name="containerImageName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="container-image-name-input" className="text-base flex items-center"><BoxIcon className="mr-2 h-4 w-4 text-primary"/>Nombre de Imagen de Contenedor (Opcional)</FormLabel>
              <FormControl>
                <Input
                  id="container-image-name-input"
                  placeholder="ej., nginx:latest o mi-app:1.2.3"
                  {...field}
                  className="text-sm"
                />
              </FormControl>
              <FormDescription>
                Nombre e etiqueta de la imagen del contenedor para análisis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dockerfileContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dockerfile-content-input" className="text-base flex items-center"><BoxIcon className="mr-2 h-4 w-4 text-primary"/>Contenido del Dockerfile (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  id="dockerfile-content-input"
                  placeholder="Pega aquí el contenido de tu Dockerfile. Mínimo 20 caracteres."
                  {...field}
                  className="text-sm min-h-[120px] font-mono"
                />
              </FormControl>
              <FormDescription>
                Para análisis de seguridad de Dockerfile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kubernetesManifestContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="kubernetes-manifest-content-input" className="text-base flex items-center"><BoxIcon className="mr-2 h-4 w-4 text-primary"/>Contenido del Manifiesto Kubernetes (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  id="kubernetes-manifest-content-input"
                  placeholder="Pega aquí el contenido de tu manifiesto K8s (YAML o JSON). Mínimo 20 caracteres."
                  {...field}
                  className="text-sm min-h-[120px] font-mono"
                />
              </FormControl>
              <FormDescription>
                Para análisis de seguridad de configuraciones de Kubernetes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="containerAdditionalContext"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="container-additional-context-input" className="text-base flex items-center"><BoxIcon className="mr-2 h-4 w-4 text-primary"/>Contexto Adicional de Contenedores (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  id="container-additional-context-input"
                  placeholder="Proporcione cualquier contexto adicional sobre el despliegue del contenedor o la imagen."
                  {...field}
                  className="text-sm min-h-[80px]"
                />
              </FormControl>
              <FormDescription>
                Contexto adicional puede ayudar a mejorar la precisión del análisis del contenedor.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        {/* Dependency Analysis Fields */}
        <FormField
          control={form.control}
          name="dependencyFileType"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dependency-file-type-select" className="text-base flex items-center"><LibraryIcon className="mr-2 h-4 w-4 text-primary"/>Tipo de Archivo de Dependencias (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="dependency-file-type-select">
                    <SelectValue placeholder="Seleccione el tipo de archivo"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="npm">npm (package-lock.json, package.json)</SelectItem>
                  <SelectItem value="pip">pip (requirements.txt)</SelectItem>
                  <SelectItem value="maven">Maven (pom.xml)</SelectItem>
                  <SelectItem value="gem">RubyGems (Gemfile.lock)</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Seleccione el tipo para el análisis de dependencias de software.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dependencyFileContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dependency-file-content-input" className="text-base flex items-center"><LibraryIcon className="mr-2 h-4 w-4 text-primary"/>Contenido del Archivo de Dependencias (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  id="dependency-file-content-input"
                  placeholder="Pega aquí el contenido de tu archivo de dependencias (ej. package-lock.json, requirements.txt). Mínimo 20 caracteres."
                  {...field}
                  className="text-sm min-h-[120px] font-mono"
                />
              </FormControl>
              <FormDescription>
                Para análisis de vulnerabilidades en dependencias de software. (Se requiere si se selecciona un Tipo de Archivo).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.formState.errors.url && (form.formState.errors.url.type === "custom" || form.formState.errors.url.message?.includes("objetivo de análisis")) && (
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

