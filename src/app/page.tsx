
"use client";

import { useState, useEffect } from "react";
import JSZip from 'jszip';
import { AppHeader } from "@/components/layout/header";
import { UrlInputForm, type UrlInputFormValues } from "@/components/url-input-form";
import { VulnerabilityReportDisplay } from "@/components/vulnerability-report-display";
import { AttackVectorsDisplay } from "@/components/attack-vectors-display";
import { AnalysisSummaryCard } from "@/components/analysis-summary-card"; 
import { performAnalysisAction } from "./actions";
import type { AnalysisResult } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info, Download, ShieldCheck, LogIn, UserCheck, AlertTriangle, Database, ServerIcon, Briefcase, BarChart3, Zap, FileLock2, Globe, Sparkles, Unlock, Gamepad2, MessageCircle, Code, Cloud, SlidersHorizontal, Users, ShieldEllipsis, Bot, Check, ListChecks } from "lucide-react";
import { HackingInfoSection } from "@/components/hacking-info-section";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChatAssistant } from "@/components/chat-assistant";


export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [submittedTargetDescription, setSubmittedTargetDescription] = useState<string>("");
  const [isPremiumUser, setIsPremiumUser] = useState(false); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  const exampleUrl = "http://testphp.vulnweb.com/userinfo.php"; 

  useEffect(() => {
    const currentZipUrl = zipUrl;
    return () => {
      if (currentZipUrl) {
        URL.revokeObjectURL(currentZipUrl);
      }
    };
  }, [zipUrl]);

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
      folder.file("todos_los_hallazgos.json", JSON.stringify(result.allFindings, null, 2));
    } else {
        if (result.urlAnalysis?.findings) folder.file("hallazgos_url.json", JSON.stringify(result.urlAnalysis.findings, null, 2));
        if (result.serverAnalysis?.findings) folder.file("hallazgos_servidor.json", JSON.stringify(result.serverAnalysis.findings, null, 2));
        if (result.databaseAnalysis?.findings) folder.file("hallazgos_db.json", JSON.stringify(result.databaseAnalysis.findings, null, 2));
    }
    if (result.attackVectors && result.attackVectors.length > 0) { 
      folder.file("vectores_ataque_ilustrativos.json", JSON.stringify(result.attackVectors, null, 2));
    }
     if (result.urlAnalysis?.executiveSummary) folder.file("resumen_url.txt", result.urlAnalysis.executiveSummary);
     if (result.serverAnalysis?.executiveSummary) folder.file("resumen_servidor.txt", result.serverAnalysis.executiveSummary);
     if (result.databaseAnalysis?.executiveSummary) folder.file("resumen_db.txt", result.databaseAnalysis.executiveSummary);


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

  const handleFormSubmit = async (values: UrlInputFormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);
    
    const descriptionParts = [];
    if (values.url) descriptionParts.push(`URL: ${values.url}`);
    if (values.serverDescription) descriptionParts.push("Servidor General");
    if (values.gameServerDescription) descriptionParts.push("Servidor de Juegos");
    if (values.databaseDescription) descriptionParts.push("Base de Datos");
    const currentTargetDesc = descriptionParts.join(', ') || "Análisis General";
    setSubmittedTargetDescription(currentTargetDesc);

    if (zipUrl) {
        URL.revokeObjectURL(zipUrl);
        setZipUrl(null);
    }

    toast({
        title: "Iniciando Análisis Integral de Seguridad...",
        description: `Analizando: ${currentTargetDesc}. Este proceso puede tomar unos momentos.`,
        variant: "default",
    });

    try {
      const params: { url?: string; serverDescription?: string; databaseDescription?: string; } = {};
      if (values.url) params.url = values.url;
      
      let finalServerDescription = values.serverDescription || "";
      if (values.gameServerDescription) {
        finalServerDescription = finalServerDescription 
          ? `${finalServerDescription}\n\n--- Detalles Específicos del Servidor de Juegos ---\n${values.gameServerDescription}`
          : values.gameServerDescription;
      }
      if (finalServerDescription) params.serverDescription = finalServerDescription;

      if (values.databaseDescription) params.databaseDescription = values.databaseDescription;


      if (Object.keys(params).length === 0) {
        toast({ variant: "destructive", title: "Entrada Inválida", description: "Por favor, proporciona al menos una URL, descripción del servidor o descripción de la base de datos."});
        setIsLoading(false);
        return;
      }

      const result = await performAnalysisAction(params);
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
          const primarySummary = result.reportText ? "Informe completo generado." : (result.urlAnalysis?.executiveSummary || result.serverAnalysis?.executiveSummary || result.databaseAnalysis?.executiveSummary || (vulnerableCount > 0 ? 'Se encontraron vulnerabilidades.' : 'No se detectaron vulnerabilidades críticas.'));
          
          if (isPremiumUser && (result.reportText || (result.allFindings && result.allFindings.length > 0))) { 
            await generateZipFile(result, currentTargetDesc);
          }

          toast({
            title: "Análisis Completo",
            description: `${vulnerableCount} vulnerabilidad(es) activa(s) encontrada(s). ${primarySummary} ${isPremiumUser ? 'Informe completo y descarga ZIP disponibles.' : 'Active el Modo Premium para acceder a escenarios de ataque, detalles técnicos y descarga.'}`,
            variant: vulnerableCount > 0 ? "default" : "default", // Consider "warning" or "destructive" variant if many criticals
            duration: 7000,
          });
      }
    } catch (e) {
      const error = e as Error;
      console.error("Error en el envío del formulario:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado durante el análisis.";
      setAnalysisResult({ urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, reportText: null, attackVectors: null, error: errorMessage, allFindings: null });
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
          ? "Ahora tienes acceso completo a informes técnicos detallados, escenarios de ataque ilustrativos, descarga de resultados y futuras capacidades avanzadas." 
          : "El acceso a funciones avanzadas como escenarios de ataque, detalles técnicos completos y descarga ZIP ha sido limitado.",
        variant: "default"
    });
    
    if (newPremiumStatus && analysisResult && (analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0))) {
        await generateZipFile(analysisResult, submittedTargetDescription);
    }
     if (!newPremiumStatus && zipUrl) {
        URL.revokeObjectURL(zipUrl);
        setZipUrl(null);
    }
  };
  
  const summaryCardData = analysisResult?.urlAnalysis || analysisResult?.serverAnalysis || analysisResult?.databaseAnalysis || null;

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
                <Button variant={isPremiumUser ? "default" : "outline"} onClick={handlePremiumToggle} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground self-start sm:self-center">
                    {isPremiumUser ? <Unlock className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isPremiumUser ? "Premium Activado" : "Activar Premium"}
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">
              Nuestra plataforma utiliza Inteligencia Artificial para analizar exhaustivamente la seguridad de sus URLs, aplicaciones web, configuraciones de servidores (incluyendo servidores de juegos como Lineage 2, Roblox, Tibia, etc.) y/o bases de datos.
              Identificamos vulnerabilidades, generamos informes detallados y sugerimos remediaciones.
              <strong className="text-foreground"> Active el Modo Premium para desbloquear informes técnicos completos, escenarios de ataque ilustrativos y la descarga de resultados.</strong>
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
                        Estamos expandiendo continuamente nuestra plataforma para ofrecer herramientas de seguridad de nivel empresarial. Algunas funcionalidades en desarrollo y planificación incluyen:
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3 p-3 border rounded-md bg-secondary/30">
                        <FileLock2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground">Análisis SAST/DAST</span>
                          <p className="text-muted-foreground">Integración de análisis de código estático y dinámico para una detección de vulnerabilidades más profunda.</p>
                          <Badge variant="outline" className="mt-1">En Desarrollo</Badge>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-md bg-secondary/30">
                        <BarChart3 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                         <div>
                          <span className="font-semibold text-foreground">Paneles de Control Avanzados</span>
                          <p className="text-muted-foreground">Visualizaciones y analítica de riesgos personalizables para una gestión de seguridad proactiva.</p>
                          <Badge variant="outline" className="mt-1">Planificado</Badge>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-md bg-secondary/30">
                        <Zap className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground">Integración con CI/CD</span>
                          <p className="text-muted-foreground">Automatización de análisis de seguridad en pipelines de desarrollo para DevSecOps.</p>
                          <Badge variant="outline" className="mt-1">Explorando</Badge>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-md bg-secondary/30">
                        <ShieldCheck className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground">Informes de Cumplimiento</span>
                          <p className="text-muted-foreground">Mapeo de hallazgos a normativas (PCI, HIPAA, GDPR) y generación de informes de cumplimiento.</p>
                          <Badge variant="outline" className="mt-1">Considerando</Badge>
                        </div>
                    </div>
                     <div className="flex items-start gap-3 p-3 border rounded-md bg-secondary/30">
                        <Cloud className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground">Análisis de Configuración Cloud</span>
                          <p className="text-muted-foreground">Evaluación de seguridad para infraestructuras en AWS, Azure y GCP.</p>
                          <Badge variant="outline" className="mt-1">Planificado</Badge>
                        </div>
                    </div>
                     <div className="flex items-start gap-3 p-3 border rounded-md bg-secondary/30">
                        <SlidersHorizontal className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground">Reglas de Análisis Personalizadas</span>
                          <p className="text-muted-foreground">Permitir a las empresas definir políticas y reglas de detección específicas.</p>
                          <Badge variant="outline" className="mt-1">En Desarrollo</Badge>
                        </div>
                    </div>
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
                />
                
                <VulnerabilityReportDisplay result={analysisResult} isPremiumUser={isPremiumUser} />
                
                {isPremiumUser && analysisResult.attackVectors && analysisResult.attackVectors.length > 0 && (
                  <>
                    <Separator className="my-8 md:my-12" />
                    <AttackVectorsDisplay attackVectors={analysisResult.attackVectors} />
                  </>
                )}

                 {!isPremiumUser && (analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0)) && (
                  <Card className="mt-8 shadow-lg border-l-4 border-accent bg-accent/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl text-accent">
                        <Unlock className="h-6 w-6" />
                        Desbloquee Todo el Potencial con Premium
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Su análisis ha generado información valiosa. Para profundizar y obtener una visión completa de su postura de seguridad, considere activar el Modo Premium.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Con el Modo Premium, usted obtiene:</h3>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Informe Técnico Detallado:</strong> Acceso completo al análisis de la IA, incluyendo razonamiento y justificaciones.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Escenarios de Ataque Ilustrativos:</strong> Comprenda cómo las vulnerabilidades podrían ser explotadas con ejemplos prácticos.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Detalles Técnicos Exhaustivos:</strong> Visualice CVSS, impacto de negocio, evidencia (si aplica) y remediaciones para todos los hallazgos.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Descarga de Resultados (ZIP):</strong> Obtenga todos los artefactos del análisis (informe, hallazgos JSON, vectores de ataque JSON) para su documentación y uso offline.</span>
                          </li>
                           <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <span><strong className="text-foreground">Futuras Funcionalidades Avanzadas:</strong> Acceso prioritario a nuevas herramientas y características de nivel empresarial.</span>
                          </li>
                        </ul>
                      </div>
                      {analysisResult.error && <p className="text-sm text-destructive mt-2">{analysisResult.error}</p>}
                      <Button className="mt-6 w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePremiumToggle}>
                        <Sparkles className="mr-2 h-5 w-5" /> Activar Modo Premium (Simulado)
                      </Button>
                       <p className="text-xs text-muted-foreground mt-3 text-center">
                        La activación es simulada para demostración. En un entorno real, esto podría implicar un proceso de pago.
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {isPremiumUser && zipUrl && (analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0 )) && ( 
                  <div className="text-center mt-8">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <a href={zipUrl} download={`analisis_seguridad_${submittedTargetDescription.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0,50)}_${new Date().toISOString().split('T')[0]}.zip`}>
                        <Download className="mr-2 h-5 w-5" /> Descargar Paquete de Resultados (ZIP)
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      El ZIP contiene el informe completo (.md), detalles de hallazgos (.json) y escenarios de ataque (.json) si fueron generados.
                    </p>
                  </div>
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
                        Fortalezca la seguridad de sus aplicaciones web, servidores (incluyendo servidores de juegos populares como Lineage 2, Roblox, Tibia, servidores privados, etc.) y bases de datos con nuestra solución de análisis inteligente y automatizado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Proporcione detalles de su URL, la configuración de su servidor y/o las características de su base de datos para un escaneo exhaustivo. Nuestro motor de IA identificará vulnerabilidades comunes y específicas,
                        generará un informe detallado y, con el Modo Premium, proporcionará escenarios de ataque ilustrativos, detalles técnicos profundos y la capacidad de descargar todos los resultados.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Globe className="h-5 w-5 text-primary"/> Análisis de URL y Web.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <ServerIcon className="h-5 w-5 text-primary"/> Evaluación de Servidores.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Database className="h-5 w-5 text-primary"/> Chequeo de Bases de Datos.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow col-span-1 sm:col-span-3 lg:col-span-1"> <Gamepad2 className="h-5 w-5 text-primary"/> Análisis Específico para Servidores de Juegos.</div>
                    </div>
                    <p className="text-muted-foreground mt-3">
                        Ideal para equipos de desarrollo, profesionales de ciberseguridad, administradores de servidores de juegos y empresas que buscan proteger sus activos digitales de manera proactiva, eficiente y con la potencia de la IA.
                    </p>
                     <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-sm text-primary font-medium">
                        <Sparkles className="h-5 w-5" />
                        <span>Active el "Modo Premium" para desbloquear informes técnicos completos, escenarios de ataque detallados, descarga de resultados y acceso a futuras funcionalidades avanzadas.</span>
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
