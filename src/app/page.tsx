
"use client";

import { useState, useEffect } from "react";
import JSZip from 'jszip';
import { AppHeader } from "@/components/layout/header";
import { UrlInputForm, type UrlInputFormValues } from "@/components/url-input-form";
import { VulnerabilityReportDisplay } from "@/components/vulnerability-report-display";
import { AttackVectorsDisplay } from "@/components/attack-vectors-display";
import { RemediationPlaybooksDisplay } from "@/components/remediation-playbooks-display";
import { AnalysisSummaryCard } from "@/components/analysis-summary-card"; 
import { performAnalysisAction, exportAllFindingsAsJsonAction } from "./actions";
import type { AnalysisResult, RemediationPlaybook, VulnerabilityFinding } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info, Download, ShieldCheck, LogIn, UserCheck, AlertTriangle, Database, ServerIcon, Briefcase, BarChart3, Zap, FileLock2, Globe, Sparkles, Unlock, Gamepad2, MessageCircle, Code, Cloud, SlidersHorizontal, Users, ShieldEllipsis, Bot, Check, ListChecks, SearchCode, Network, BoxIcon, LibraryIcon, GitBranch, Columns, AlertOctagon, Waypoints, FileJson, Wifi, ExternalLink, LockIcon } from "lucide-react";
import { HackingInfoSection } from "@/components/hacking-info-section";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChatAssistant } from "@/components/chat-assistant";
import { cn } from "@/lib/utils";


export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [jsonExportUrl, setJsonExportUrl] = useState<string | null>(null);
  const [submittedTargetDescription, setSubmittedTargetDescription] = useState<string>("");
  const [isPremiumUser, setIsPremiumUser] = useState(false); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  const exampleUrl = "http://testphp.vulnweb.com/userinfo.php"; 

  useEffect(() => {
    const currentZipUrl = zipUrl;
    const currentJsonUrl = jsonExportUrl;
    return () => {
      if (currentZipUrl) {
        URL.revokeObjectURL(currentZipUrl);
      }
      if (currentJsonUrl) {
        URL.revokeObjectURL(currentJsonUrl);
      }
    };
  }, [zipUrl, jsonExportUrl]);

  const generateZipFile = async (result: AnalysisResult, targetDesc: string) => {
    if (!result || (result.error && !result.reportText && (!result.allFindings || result.allFindings.length === 0))) return; 

    const zip = new JSZip();
    const safeDesc = targetDesc.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50) || 'analisis';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderName = `analisis_seguridad_${safeDesc}_${timestamp}`;
    const folder = zip.folder(folderName);

    if (!folder) {
        console.error("Error al Crear ZIP: No se pudo crear la carpeta interna.");
        toast({ variant: "destructive", title: "Error al Crear ZIP", description: "No se pudo crear la carpeta interna." });
        return;
    }

    folder.file("descripcion_analisis.txt", targetDesc);

    if (result.reportText) {
      folder.file("informe_completo_seguridad.md", result.reportText);
    }
    if (result.allFindings && result.allFindings.length > 0) {
      try {
        const allFindingsJson = await exportAllFindingsAsJsonAction(result.allFindings);
        folder.file("todos_los_hallazgos.json", allFindingsJson);
      } catch (e) {
        console.error("Error al exportar hallazgos a JSON para ZIP:", e);
        folder.file("error_exportando_hallazgos.txt", "No se pudieron exportar los hallazgos a JSON.");
      }
    }
    if (result.attackVectors && result.attackVectors.length > 0) { 
      folder.file("vectores_ataque_ilustrativos.json", JSON.stringify(result.attackVectors, null, 2));
    }
    if (result.remediationPlaybooks && result.remediationPlaybooks.length > 0) {
        const playbooksFolder = folder.folder("playbooks_remediacion");
        if (playbooksFolder) {
            result.remediationPlaybooks.forEach((playbook, index) => {
                const safeTitle = playbook.playbookTitle.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 40) || `playbook_${index}`;
                playbooksFolder.file(`${safeTitle}.md`, playbook.playbookMarkdown);
            });
        }
    }
    
     if (result.urlAnalysis?.executiveSummary) folder.file("resumen_url.txt", result.urlAnalysis.executiveSummary);
     if (result.serverAnalysis?.executiveSummary) folder.file("resumen_servidor.txt", result.serverAnalysis.executiveSummary);
     if (result.databaseAnalysis?.executiveSummary) folder.file("resumen_db.txt", result.databaseAnalysis.executiveSummary);
     if (result.sastAnalysis?.executiveSummary) folder.file("resumen_sast.txt", result.sastAnalysis.executiveSummary);
     if (result.dastAnalysis?.executiveSummary) folder.file("resumen_dast.txt", result.dastAnalysis.executiveSummary);
     if (result.cloudAnalysis?.executiveSummary) folder.file("resumen_cloud.txt", result.cloudAnalysis.executiveSummary);
     if (result.containerAnalysis?.executiveSummary) folder.file("resumen_container.txt", result.containerAnalysis.executiveSummary);
     if (result.dependencyAnalysis?.executiveSummary) folder.file("resumen_dependencies.txt", result.dependencyAnalysis.executiveSummary);
     if (result.networkAnalysis?.executiveSummary) folder.file("resumen_network.txt", result.networkAnalysis.executiveSummary);


    try {
      const blob = await zip.generateAsync({ type: "blob" });
      const newZipUrl = URL.createObjectURL(blob);
      if (zipUrl) URL.revokeObjectURL(zipUrl);
      setZipUrl(newZipUrl);
      toast({ title: "Archivo ZIP Listo", description: "El ZIP con los resultados está listo para descargar.", variant: "default" });
    } catch (error) {
      console.error("Error generando archivo ZIP:", error);
      toast({ variant: "destructive", title: "Error al Generar ZIP", description: "Ocurrió un error." });
      setZipUrl(null); 
    }
  };

  const generateJsonExportFile = async (findings: VulnerabilityFinding[], targetDesc: string) => {
    if (!findings || findings.length === 0) {
        toast({ variant: "default", title: "Sin Hallazgos", description: "No hay hallazgos para exportar en JSON." });
        return;
    }
    try {
        const jsonString = await exportAllFindingsAsJsonAction(findings);
        const blob = new Blob([jsonString], { type: "application/json" });
        const newJsonUrl = URL.createObjectURL(blob);
        if (jsonExportUrl) URL.revokeObjectURL(jsonExportUrl);
        setJsonExportUrl(newJsonUrl);
        toast({ title: "Archivo JSON Listo", description: "Los hallazgos están listos para descargar en formato JSON.", variant: "default" });
    } catch (error) {
        console.error("Error generando archivo JSON:", error);
        toast({ variant: "destructive", title: "Error al Generar JSON", description: "Ocurrió un error." });
        setJsonExportUrl(null);
    }
  };


  const handleFormSubmit = async (values: UrlInputFormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);
    
    const descriptionParts = [];
    if (values.url) descriptionParts.push(`URL: ${values.url}`);
    if (values.serverDescription) descriptionParts.push("Servidor General");
    if (values.gameServerDescription) descriptionParts.push("Servidor de Juegos");
    if (values.databaseDescription) descriptionParts.push("Base de Datos");
    if (values.codeSnippet) descriptionParts.push("Análisis SAST");
    if (values.dastTargetUrl) descriptionParts.push(`Análisis DAST (${values.dastTargetUrl})`);
    if (values.cloudProvider && values.cloudConfigDescription) descriptionParts.push(`Cloud (${values.cloudProvider}${values.cloudRegion ? `/${values.cloudRegion}` : ''})`);
    if (values.containerImageName || values.dockerfileContent || values.kubernetesManifestContent) descriptionParts.push("Contenedores/K8s");
    if (values.dependencyFileType && values.dependencyFileContent) descriptionParts.push(`Dependencias (${values.dependencyFileType})`);
    if (values.networkDescription || values.networkScanResults || values.networkFirewallRules) descriptionParts.push('Red');


    
    const currentTargetDesc = descriptionParts.join(', ') || "Análisis General";
    setSubmittedTargetDescription(currentTargetDesc);

    if (zipUrl) {
        URL.revokeObjectURL(zipUrl);
        setZipUrl(null);
    }
    if (jsonExportUrl) {
        URL.revokeObjectURL(jsonExportUrl);
        setJsonExportUrl(null);
    }

    toast({
        title: "Iniciando Análisis Integral de Seguridad...",
        description: `Analizando: ${currentTargetDesc}. Este proceso puede tomar unos momentos.`,
        variant: "default",
    });

    try {
      const params: Parameters<typeof performAnalysisAction>[0] = {};
      if (values.url) params.url = values.url;
      
      let finalServerDescription = values.serverDescription || "";
      if (values.gameServerDescription) {
        finalServerDescription = finalServerDescription 
          ? `${finalServerDescription}\n\n--- Detalles Específicos del Servidor de Juegos ---\n${values.gameServerDescription}`
          : values.gameServerDescription;
      }
      if (finalServerDescription) params.serverDescription = finalServerDescription;

      if (values.databaseDescription) params.databaseDescription = values.databaseDescription;
      if (values.codeSnippet) params.codeSnippet = values.codeSnippet;
      if (values.sastLanguage) params.sastLanguage = values.sastLanguage;
      if (values.dastTargetUrl) params.dastTargetUrl = values.dastTargetUrl;
      
      if (values.cloudProvider) params.cloudProvider = values.cloudProvider;
      if (values.cloudConfigDescription) params.cloudConfigDescription = values.cloudConfigDescription;
      if (values.cloudRegion) params.cloudRegion = values.cloudRegion;

      if (values.containerImageName) params.containerImageName = values.containerImageName;
      if (values.dockerfileContent) params.dockerfileContent = values.dockerfileContent;
      if (values.kubernetesManifestContent) params.kubernetesManifestContent = values.kubernetesManifestContent;
      if (values.containerAdditionalContext) params.containerAdditionalContext = values.containerAdditionalContext;

      if (values.dependencyFileContent) params.dependencyFileContent = values.dependencyFileContent;
      if (values.dependencyFileType) params.dependencyFileType = values.dependencyFileType;

      if (values.networkDescription) params.networkDescription = values.networkDescription;
      if (values.networkScanResults) params.networkScanResults = values.networkScanResults;
      if (values.networkFirewallRules) params.networkFirewallRules = values.networkFirewallRules;


      if (Object.keys(params).length === 0) {
        toast({ variant: "destructive", title: "Entrada Inválida", description: "Por favor, proporciona al menos un objetivo de análisis."});
        setIsLoading(false);
        return;
      }

      const result = await performAnalysisAction(params, isPremiumUser);
      setAnalysisResult(result);

      if (result.error && !result.reportText && (!result.allFindings || result.allFindings.length === 0 )) { 
        toast({
          variant: "destructive",
          title: "Análisis Fallido",
          description: result.error,
          duration: 8000, 
        });
      } else {
          const vulnerableCount = result.allFindings?.filter(f => f.isVulnerable).length ?? 0;
          const summaryItems = [
              result.urlAnalysis?.executiveSummary,
              result.serverAnalysis?.executiveSummary,
              result.databaseAnalysis?.executiveSummary,
              result.sastAnalysis?.executiveSummary,
              result.dastAnalysis?.executiveSummary,
              result.cloudAnalysis?.executiveSummary,
              result.containerAnalysis?.executiveSummary,
              result.dependencyAnalysis?.executiveSummary,
              result.networkAnalysis?.executiveSummary,
          ];
          const primarySummary = result.reportText ? "Informe completo generado." : 
            (summaryItems.find(s => s) || (vulnerableCount > 0 ? 'Se encontraron vulnerabilidades.' : 'No se detectaron vulnerabilidades críticas.'));
          
          if (result.allFindings && result.allFindings.length > 0) {
             await generateJsonExportFile(result.allFindings, currentTargetDesc);
          }

          if (isPremiumUser && (result.reportText || (result.allFindings && result.allFindings.length > 0))) { 
            await generateZipFile(result, currentTargetDesc);
          }


          toast({
            title: "Análisis Completo",
            description: `${vulnerableCount} vulnerabilidad(es) activa(s) encontrada(s). ${primarySummary} ${isPremiumUser ? 'Informe, vectores de ataque, playbooks y descargas disponibles.' : 'Active Premium para acceder a todas las funcionalidades.'}`,
            variant: vulnerableCount > 0 ? "default" : "default",
            duration: 7000,
          });
      }
    } catch (e) {
      const error = e as Error;
      console.error("Error en el envío del formulario:", error);
      let errorMessage = "Ocurrió un error inesperado durante el análisis.";
      if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY === "YOUR_GOOGLE_AI_API_KEY_HERE" || process.env.NEXT_PUBLIC_GOOGLE_API_KEY.trim() === ""){
        errorMessage = "Error de Configuración del Servidor: La clave API para el servicio de Inteligencia Artificial no está configurada. Por favor, contacte al administrador de la plataforma.";
      } else if (error.message && (error.message.includes("API key not valid") || error.message.includes("GOOGLE_API_KEY"))) {
        errorMessage = "Error de Configuración del Servidor: La clave API para el servicio de Inteligencia Artificial no es válida. Por favor, contacte al administrador de la plataforma.";
      } else if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
        errorMessage = "Ocurrió un error de red al intentar contactar un servicio de análisis. Por favor, verifica tu conexión e inténtalo de nuevo.";
      } else if (error.message && error.message.includes('quota')) {
        errorMessage = "Se ha excedido una cuota del servicio de análisis. Por favor, inténtalo de nuevo más tarde.";
      } else if (error.message && (error.message.toLowerCase().includes('json') || error.message.includes('Unexpected token') || error.message.includes('output.findings') || error.message.includes('output!'))) {
          errorMessage = `La IA devolvió un formato inválido o inesperado. Por favor, inténtalo de nuevo. Detalles: ${error.message}. Si el problema persiste, el modelo podría estar temporalmente no disponible o mal configurado.`;
      } else {
        errorMessage = `El análisis falló catastróficamente: ${error.message}`;
      }
      setAnalysisResult({ 
        urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, sastAnalysis: null, dastAnalysis: null, 
        cloudAnalysis: null, containerAnalysis: null, dependencyAnalysis: null, networkAnalysis: null,
        reportText: null, attackVectors: null, remediationPlaybooks: null, error: errorMessage, allFindings: null 
      });
      toast({ variant: "destructive", title: "Error Crítico de Análisis", description: errorMessage, duration: 8000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumToggle = async () => {
    const newPremiumStatus = !isPremiumUser;
    setIsPremiumUser(newPremiumStatus);
    toast({ 
        title: newPremiumStatus ? "¡Modo Premium Activado!" : "Modo Premium Desactivado", 
        description: newPremiumStatus 
          ? "Acceso completo a informes técnicos, escenarios de ataque, playbooks de remediación y descarga de resultados." 
          : "El acceso a funciones avanzadas ha sido limitado.",
        variant: "default"
    });
    
    if (newPremiumStatus && analysisResult && (analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0))) {
        await generateZipFile(analysisResult, submittedTargetDescription);
        if(analysisResult.allFindings && analysisResult.allFindings.length > 0) {
           await generateJsonExportFile(analysisResult.allFindings, submittedTargetDescription);
        }
    }
     if (!newPremiumStatus) {
        if(zipUrl) URL.revokeObjectURL(zipUrl);
        setZipUrl(null);
    }
  };
  
  const summaryCardData = analysisResult?.urlAnalysis || analysisResult?.serverAnalysis || analysisResult?.databaseAnalysis || analysisResult?.sastAnalysis || analysisResult?.dastAnalysis || analysisResult?.cloudAnalysis || analysisResult?.containerAnalysis || analysisResult?.dependencyAnalysis || analysisResult?.networkAnalysis || null;

  const PremiumFeatureCard = ({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) => (
    <Card className="mt-8 shadow-lg border-l-4 border-accent bg-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-accent">
          <Icon className="h-6 w-6" />
          {title} (Función Premium)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePremiumToggle}>
          <Sparkles className="mr-2 h-5 w-5" /> Activar Modo Premium
        </Button>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          La activación es simulada para demostración.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-secondary/50">
        <AppHeader 
          isPremiumUser={isPremiumUser} 
          onAuthToggle={handlePremiumToggle}
        />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <section className="max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Centro de Análisis de Seguridad Integral
                </h2>
                <Button variant={isPremiumUser ? "default" : "outline"} onClick={handlePremiumToggle} size="sm" className={cn("self-start sm:self-center", isPremiumUser ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "")}>
                    {isPremiumUser ? <Unlock className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isPremiumUser ? "Premium Activado" : "Activar Premium"}
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">
              Nuestra plataforma IA analiza URLs, servidores (incluyendo juegos como Lineage 2, Roblox), bases de datos, código (SAST), aplicaciones (DAST), configuraciones Cloud (AWS, Azure, GCP), contenedores (Docker, K8s), dependencias de software y configuraciones de red.
              <strong className="text-foreground block mt-1"> Active Premium para informes técnicos, escenarios de ataque, playbooks de remediación y descarga completa.</strong>
            </p>
            <UrlInputForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              defaultUrl={exampleUrl} 
            />
          </section>

          <Separator className="my-8 md:my-12" />
          <HackingInfoSection />
          <Separator className="my-8 md:my-12" />
          
          <section className="max-w-4xl mx-auto mb-8 md:mb-12">
            <Card className="shadow-lg border-l-4 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
                        <Briefcase className="h-7 w-7 text-primary" />
                        Capacidades Empresariales Avanzadas
                    </CardTitle>
                    <CardDescription>
                        Nuestra plataforma ofrece herramientas de seguridad de nivel empresarial, con muchas funcionalidades en desarrollo activo, simulación y planificación estratégica:
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                        { icon: SearchCode, title: "Análisis SAST (Estático)", desc: "Análisis de fragmentos de código para identificar vulnerabilidades.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: Network, title: "Análisis DAST (Dinámico App)", desc: "Pruebas de seguridad en aplicaciones web en ejecución.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: Cloud, title: "Análisis Config. Cloud (AWS, Azure, GCP)", desc: "Evaluación de seguridad para infraestructuras en la nube.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: BoxIcon, title: "Análisis Seguridad Contenedores", desc: "Análisis de imágenes Docker y configuraciones Kubernetes.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: LibraryIcon, title: "Análisis de Dependencias de Software", desc: "Detección de vulnerabilidades en bibliotecas y frameworks.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: Wifi, title: "Análisis de Configuración de Red", desc: "Evaluación de descripciones de red, reglas de firewall y resultados de escaneos.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: FileLock2, title: "Generación de Playbooks de Remediación", desc: "Guías detalladas para solucionar vulnerabilidades (Premium).", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: AlertOctagon, title: "Pruebas de Penetración Automatizadas", desc: "Simulación de ataques avanzados en entornos controlados (Premium, con precaución).", status: "Explorando", badgeColor: "border-yellow-500 text-yellow-500" },
                        { icon: SlidersHorizontal, title: "Motor de Reglas Personalizadas", desc: "Definición de políticas y reglas de detección específicas para empresas.", status: "Planificado" },
                        { icon: ShieldEllipsis, title: "Mapeo a Controles de Cumplimiento", desc: "Relacionar hallazgos con controles de SOC2, ISO 27001, etc. (Informativo).", status: "Mejorado", badgeColor: "border-yellow-500 text-yellow-500" },
                        { icon: Waypoints, title: "Integración SIEM/SOAR (vía JSON export)", desc: "Exportación de datos y automatización de respuestas a incidentes.", status: "Base Implementada", badgeColor: "border-blue-500 text-blue-500" },
                        { icon: Users, title: "Gestión de Usuarios y RBAC", desc: "Control de acceso basado en roles y gestión de equipos.", status: "Planificado" },
                        { icon: BarChart3, title: "Paneles de Control Avanzados", desc: "Visualizaciones y analítica de riesgos personalizables.", status: "Planificado" },
                        { icon: GitBranch, title: "Integración con CI/CD", desc: "Automatización de análisis en pipelines de desarrollo (DevSecOps).", status: "Explorando" },
                        { icon: Columns, title: "Interfaz de Línea de Comandos (CLI)", desc: "Automatización y gestión de análisis desde la terminal.", status: "Considerando" },
                        { icon: Gamepad2, title: "Mejoras Específicas Servidores de Juegos", desc: "Análisis de protocolos, detección de trampas, análisis de mods/scripts.", status: "Planificado" },
                        { icon: ShieldCheck, title: "Informes de Cumplimiento Detallados", desc: "Generación de informes formales mapeados a normativas (PDF vía Markdown).", status: "Mejorado", badgeColor: "border-blue-500 text-blue-500" },
                    ].map(item => (
                        <div key={item.title} className="flex items-start gap-3 p-3 border rounded-md bg-secondary/30">
                            <item.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-foreground">{item.title}</span>
                                <p className="text-muted-foreground">{item.desc}</p>
                                <Badge variant="outline" className={cn("mt-1", item.badgeColor || "border-gray-400 text-gray-500")}>{item.status}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </section>

          <section className="max-w-4xl mx-auto">
            {isLoading && (
              <div className="space-y-8 mt-8">
                <Card className="shadow-lg animate-pulse">
                  <CardHeader> <Skeleton className="h-8 w-1/2" /> </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" />
                    </div>
                    <Skeleton className="h-40 w-full mt-4" />
                  </CardContent>
                </Card>
                <Card className="shadow-lg animate-pulse">
                  <CardHeader> <Skeleton className="h-8 w-3/4" /> <Skeleton className="h-4 w-1/2 mt-2" /> </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-5/6" />
                     <Skeleton className="h-20 w-full mt-4" />
                  </CardContent>
                </Card>
              </div>
            )}

            {!isLoading && analysisResult && (
              <div className="space-y-8">
                <AnalysisSummaryCard 
                  analysisInput={summaryCardData} 
                  allFindings={analysisResult.allFindings}
                  result={analysisResult}
                />
                
                <VulnerabilityReportDisplay result={analysisResult} isPremiumUser={isPremiumUser} />
                
                {analysisResult.attackVectors && analysisResult.attackVectors.length > 0 && isPremiumUser && (
                  <>
                    <Separator className="my-8 md:my-12" />
                    <AttackVectorsDisplay attackVectors={analysisResult.attackVectors} />
                  </>
                )}
                {!isPremiumUser && analysisResult.attackVectors && analysisResult.attackVectors.length > 0 && (
                   <PremiumFeatureCard 
                    title="Escenarios de Ataque Ilustrativos"
                    description="Comprenda cómo las vulnerabilidades activas identificadas podrían ser explotadas con ejemplos conceptuales."
                    icon={Zap}
                   />
                )}

                {analysisResult.remediationPlaybooks && analysisResult.remediationPlaybooks.length > 0 && isPremiumUser && (
                  <>
                    <Separator className="my-8 md:my-12" />
                    <RemediationPlaybooksDisplay playbooks={analysisResult.remediationPlaybooks} />
                  </>
                )}
                 {!isPremiumUser && analysisResult.remediationPlaybooks && analysisResult.remediationPlaybooks.length > 0 && (
                   <PremiumFeatureCard 
                    title="Playbooks de Remediación Sugeridos"
                    description="Acceda a guías paso a paso generadas por IA para ayudar a corregir las vulnerabilidades detectadas."
                    icon={FileLock2}
                   />
                )}


                 {!isPremiumUser && (analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0)) && (
                  <Card className="mt-8 shadow-lg border-l-4 border-accent bg-accent/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl text-accent">
                        <Unlock className="h-6 w-6" />
                        Desbloquee Todo el Potencial con Premium
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Su análisis ha generado información valiosa. Active el Modo Premium para una visión completa de su postura de seguridad.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Con el Modo Premium, usted obtiene:</h3>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Informe Técnico Detallado:</strong> Acceso completo al análisis de la IA.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Escenarios de Ataque Ilustrativos:</strong> Comprenda cómo las vulnerabilidades podrían ser explotadas.</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Playbooks de Remediación:</strong> Guías paso a paso para corregir vulnerabilidades.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Detalles Técnicos Exhaustivos:</strong> CVSS, impacto, evidencia para todos los hallazgos.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Descarga de Resultados (ZIP):</strong> Todos los artefactos del análisis para uso offline.</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Descarga de Hallazgos (JSON):</strong> Datos estructurados para SIEM y otras herramientas.</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Futuras Funcionalidades Avanzadas:</strong> Acceso prioritario a nuevas herramientas.</span>
                          </li>
                        </ul>
                      </div>
                      {analysisResult.error && <p className="text-sm text-destructive mt-2">{analysisResult.error}</p>}
                      <Button className="mt-6 w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePremiumToggle}>
                        <Sparkles className="mr-2 h-5 w-5" /> Activar Modo Premium (Simulado)
                      </Button>
                       <p className="text-xs text-muted-foreground mt-3 text-center">
                        La activación es simulada para demostración. No se procesarán pagos reales.
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {(analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0)) && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                    {isPremiumUser && zipUrl ? (
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                        <a href={zipUrl} download={`analisis_seguridad_${submittedTargetDescription.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0,50)}_${new Date().toISOString().split('T')[0]}.zip`}>
                            <Download className="mr-2 h-5 w-5" /> Descargar Paquete de Resultados (ZIP)
                        </a>
                        </Button>
                    ) : !isPremiumUser && (analysisResult.allFindings && analysisResult.allFindings.length > 0) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="lg" className="bg-primary/70 text-primary-foreground w-full sm:w-auto cursor-not-allowed" disabled>
                                    <LockIcon className="mr-2 h-5 w-5" /> Descargar Paquete (ZIP) - Premium
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Active Premium para descargar el paquete completo de resultados.</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {jsonExportUrl && (
                        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                        <a href={jsonExportUrl} download={`hallazgos_seguridad_${submittedTargetDescription.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0,50)}_${new Date().toISOString().split('T')[0]}.json`}>
                            <FileJson className="mr-2 h-5 w-5" /> Descargar Hallazgos (JSON)
                        </a>
                        </Button>
                    )}
                </div>
                 )}
                 {isPremiumUser && zipUrl && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      El ZIP contiene informe, hallazgos, vectores de ataque y playbooks (si fueron generados). El JSON contiene todos los hallazgos.
                    </p>
                 )}
                  {jsonExportUrl && !zipUrl && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      El JSON contiene todos los hallazgos. Active Premium para la descarga ZIP completa.
                    </p>
                 )}
              </div>
            )}

            {!isLoading && !analysisResult && (
               <Card className="mt-8 shadow-lg max-w-3xl mx-auto border-l-4 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        Plataforma Integral de Análisis de Seguridad Asistido por IA
                    </CardTitle>
                    <CardDescription>
                        Fortalezca la seguridad de sus aplicaciones web, servidores (juegos populares como Lineage 2, Roblox, Tibia, etc.), bases de datos, código (SAST), aplicaciones (DAST), Cloud, Contenedores, Dependencias y Redes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Proporcione detalles de su URL, servidor, base de datos, código, URL DAST, configuración Cloud, información de contenedores, archivos de dependencias o descripción de red. Nuestro motor IA identificará vulnerabilidades y generará un informe detallado.
                        Con Modo Premium, obtendrá escenarios de ataque, detalles técnicos y playbooks de remediación.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Globe className="h-5 w-5 text-primary"/> Análisis Web/URL.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <ServerIcon className="h-5 w-5 text-primary"/> Evaluación de Servidores.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Database className="h-5 w-5 text-primary"/> Chequeo de Bases de Datos.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Gamepad2 className="h-5 w-5 text-primary"/> Análisis Servidores de Juegos.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <SearchCode className="h-5 w-5 text-primary"/> Análisis de Código (SAST).</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Network className="h-5 w-5 text-primary"/> Análisis Dinámico (DAST).</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Cloud className="h-5 w-5 text-primary"/> Análisis Config. Cloud.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <BoxIcon className="h-5 w-5 text-primary"/> Análisis Contenedores.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <LibraryIcon className="h-5 w-5 text-primary"/> Análisis Dependencias.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Wifi className="h-5 w-5 text-primary"/> Análisis Config. Red.</div>
                    </div>
                    <p className="text-muted-foreground mt-3">
                        Ideal para equipos DevSecOps, profesionales de ciberseguridad, administradores de sistemas y empresas que buscan proteger sus activos digitales de forma proactiva, eficiente y con la potencia de la IA.
                    </p>
                     <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-sm text-primary font-medium">
                        <Sparkles className="h-5 w-5" />
                        <span>Active el "Modo Premium" para desbloquear informes técnicos, escenarios de ataque, playbooks y descarga.</span>
                    </div>
                </CardContent>
               </Card>
            )}
          </section>
        </main>

        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary-foreground/50"
                  aria-label="Abrir Asistente IA"
                >
                  <Bot className="h-7 w-7" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-primary text-primary-foreground">
              <p>Asistente IA de Seguridad</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-[450px] p-0 border-0 shadow-none bg-transparent">
            <ChatAssistant />
          </DialogContent>
        </Dialog>

        <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} Centro de Análisis de Seguridad Integral. Impulsado por GenAI. Herramienta educativa y de evaluación avanzada para profesionales.
        </footer>
      </div>
    </TooltipProvider>
  );
}

    