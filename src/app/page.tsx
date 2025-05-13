
"use client";

import { useState, useEffect } from "react";
import JSZip from 'jszip';
import { AppHeader } from "@/components/layout/header";
import { UrlInputForm, type UrlInputFormValues } from "@/components/url-input-form";
import { VulnerabilityReportDisplay } from "@/components/vulnerability-report-display";
import { AttackVectorsDisplay } from "@/components/attack-vectors-display";
import { AnalysisSummaryCard } from "@/components/analysis-summary-card"; 
import { performAnalysisAction } from "./actions";
import type { AnalysisResult, VulnerabilityFinding } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info, Download, ShieldCheck, LogIn, UserCheck, AlertTriangle, Database, ServerIcon, Briefcase, BarChart3, Zap, FileLock2, Globe, Sparkles, Unlock, Gamepad2 } from "lucide-react";
import { HackingInfoSection } from "@/components/hacking-info-section";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";


export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [submittedTargetDescription, setSubmittedTargetDescription] = useState<string>("");
  const [isPremiumUser, setIsPremiumUser] = useState(false); 
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
        console.error("Failed to create zip folder");
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
      console.error("Error generating ZIP file:", error);
      toast({ variant: "destructive", title: "Error al Generar ZIP", description: "Ocurrió un error." });
      setZipUrl(null); 
    }
  };

  const handleFormSubmit = async (values: UrlInputFormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);
    
    const descriptionParts = [];
    if (values.url) descriptionParts.push(`URL: ${values.url}`);
    if (values.serverDescription) descriptionParts.push("Servidor");
    if (values.databaseDescription) descriptionParts.push("Base de Datos");
    const currentTargetDesc = descriptionParts.join(', ') || "Análisis General";
    setSubmittedTargetDescription(currentTargetDesc);

    if (zipUrl) {
        URL.revokeObjectURL(zipUrl);
        setZipUrl(null);
    }

    toast({
        title: "Iniciando Análisis Integral...",
        description: `Escaneando ${currentTargetDesc}. Esto puede tomar unos momentos.`,
        variant: "default",
    });

    try {
      const params: Partial<UrlInputFormValues> = {};
      if (values.url) params.url = values.url;
      if (values.serverDescription) params.serverDescription = values.serverDescription;
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
            description: `${vulnerableCount} vulnerabilidad(es) potencial(es) encontrada(s). ${primarySummary} ${isPremiumUser ? 'Informe completo y descarga ZIP disponibles.' : 'Active el Modo Premium para acceder a escenarios de ataque, detalles técnicos y descarga.'}`,
            variant: vulnerableCount > 0 ? "default" : "default",
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

  const handlePremiumToggle = () => {
    setIsPremiumUser(!isPremiumUser);
    toast({ 
        title: isPremiumUser ? "Modo Premium Desactivado" : "¡Modo Premium Activado!", 
        description: isPremiumUser ? "El acceso a funciones avanzadas como escenarios de ataque, detalles técnicos y descarga ZIP ha sido limitado." : "Ahora tienes acceso completo a informes técnicos, escenarios de ataque y descargas.",
        variant: "default"
    });
    // If activating premium and results are present, generate ZIP
    if (!isPremiumUser && analysisResult && (analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0))) {
        generateZipFile(analysisResult, submittedTargetDescription);
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Centro de Análisis de Seguridad Integral
                </h2>
                <Button variant={isPremiumUser ? "default" : "outline"} onClick={handlePremiumToggle} size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isPremiumUser ? <Unlock className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isPremiumUser ? "Premium Activado" : "Activar Premium"}
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">
              Ingrese detalles de su URL, aplicación web, configuración de servidor (incluyendo servidores de juegos como Lineage 2, Roblox, etc.) y/o base de datos para un análisis de seguridad exhaustivo.
              Nuestra IA identificará vulnerabilidades, generará informes y sugerirá remediaciones. Active el Modo Premium para informes técnicos completos, escenarios de ataque ilustrativos y descarga de resultados.
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
                        Funcionalidades Empresariales (Próximamente)
                    </CardTitle>
                    <CardDescription>
                        Estamos trabajando para expandir nuestra plataforma con herramientas avanzadas para las necesidades de seguridad de su empresa, incluyendo análisis SAST/DAST, paneles de control avanzados y más.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-secondary/30 opacity-70 cursor-not-allowed">
                        <FileLock2 className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Análisis de Código Estático (SAST) y Dinámico (DAST)</span>
                        <Badge variant="outline" className="ml-auto">En Desarrollo</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-secondary/30 opacity-70 cursor-not-allowed">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Paneles de Control Avanzados y Analítica de Riesgos</span>
                         <Badge variant="outline" className="ml-auto">Planificado</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-secondary/30 opacity-70 cursor-not-allowed">
                        <Zap className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Integración con CI/CD y Herramientas de Ticketing</span>
                         <Badge variant="outline" className="ml-auto">Explorando</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-md bg-secondary/30 opacity-70 cursor-not-allowed">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">Informes de Cumplimiento Normativo (PCI, HIPAA, etc.)</span>
                        <Badge variant="outline" className="ml-auto">Considerando</Badge>
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
                  <Card className="mt-8 shadow-lg border-l-4 border-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl text-accent">
                        <Sparkles className="h-6 w-6" />
                        Desbloquear Análisis Completo y Escenarios de Ataque
                      </CardTitle>
                      <CardDescription>
                        Has recibido un resumen del análisis. Para acceder al informe técnico detallado, escenarios de ataque ilustrativos y la opción de descarga completa, por favor activa el Modo Premium.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-foreground mb-2">Beneficios del Modo Premium:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm mb-4">
                        <li>Informe técnico detallado con análisis en profundidad.</li>
                        <li>Escenarios de ataque ilustrativos para comprender riesgos específicos.</li>
                        <li>Acceso a detalles técnicos completos de cada hallazgo.</li>
                        <li>Descarga completa de resultados en formato ZIP.</li>
                        <li>Futuras funcionalidades avanzadas y soporte prioritario.</li>
                      </ul>
                      {analysisResult.error && <p className="text-sm text-destructive mt-2">{analysisResult.error}</p>}
                      <Button className="mt-6 w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handlePremiumToggle}>
                        <Unlock className="mr-2 h-5 w-5" /> Activar Modo Premium (Simulado)
                      </Button>
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
                        Potencie la seguridad de sus aplicaciones web, servidores (incluyendo servidores de juegos), y bases de datos con nuestra solución de análisis inteligente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Proporcione detalles de su URL, servidor y/o base de datos para un escaneo exhaustivo. Nuestro motor de IA identificará vulnerabilidades,
                        generará un informe detallado y, con el Modo Premium, proporcionará escenarios de ataque ilustrativos y detalles técnicos profundos.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Globe className="h-5 w-5 text-primary"/> Análisis de URL y Web.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <ServerIcon className="h-5 w-5 text-primary"/> Evaluación de Servidores.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Database className="h-5 w-5 text-primary"/> Chequeo de Bases de Datos.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow col-span-1 sm:col-span-3 lg:col-span-1"> <Gamepad2 className="h-5 w-5 text-primary"/> Análisis de Servidores de Juegos.</div>
                    </div>
                    <p className="text-muted-foreground mt-3">
                        Ideal para equipos de desarrollo, profesionales de seguridad, administradores de servidores de juegos y empresas que buscan proteger sus activos digitales de manera proactiva y eficiente.
                    </p>
                     <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-sm text-primary font-medium">
                        <Sparkles className="h-5 w-5" />
                        <span>Active el "Modo Premium" para informes completos, escenarios de ataque, descarga de resultados y futuras funcionalidades avanzadas.</span>
                    </div>
                </CardContent>
               </Card>
            )}
          </section>
        </main>
        <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} Plataforma de Seguridad Integral. Impulsado por GenAI. Herramienta educativa y de evaluación avanzada.
        </footer>
      </div>
    </TooltipProvider>
  );
}

