
"use client";

import { useState, useEffect } from "react";
import JSZip from 'jszip';
import { AppHeader } from "@/components/layout/header";
import { UrlInputForm, type UrlInputFormValues } from "@/components/url-input-form"; // Updated import
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
import { Info, Download, ShieldCheck, LogIn, UserCheck, AlertTriangle, Database, ServerIcon } from "lucide-react";
import { HackingInfoSection } from "@/components/hacking-info-section";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [submittedTargetDescription, setSubmittedTargetDescription] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    if (!result || result.error) return; // Allow generation even if some parts are null, as long as no major error

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
    if (result.attackVectors) {
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

  const handleFormSubmit = async (values: UrlInputFormValues) => { // Updated to use UrlInputFormValues
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
        title: "Iniciando Análisis...",
        description: `Escaneando ${currentTargetDesc}. Esto puede tomar un momento.`,
        variant: "default",
    });

    try {
      // Pass only non-empty values to performAnalysisAction
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

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Análisis Fallido",
          description: result.error,
          duration: 8000, 
        });
      } else {
          const vulnerableCount = result.allFindings?.filter(f => f.isVulnerable).length ?? 0;
          const primarySummary = result.urlAnalysis?.executiveSummary || result.serverAnalysis?.executiveSummary || result.databaseAnalysis?.executiveSummary || (vulnerableCount > 0 ? 'Se encontraron vulnerabilidades.' : 'No se detectaron vulnerabilidades críticas.');
          
          if (isAuthenticated) {
            await generateZipFile(result, currentTargetDesc);
          }

          toast({
            title: "Análisis Completo",
            description: `${vulnerableCount} vulnerabilidad(es) potencial(es) encontrada(s) en total. ${primarySummary} ${isAuthenticated ? 'Revisa el informe y descarga el ZIP.' : 'Inicia sesión para ver el informe completo.'}`,
            variant: vulnerableCount > 0 ? "default" : "default", // Could be "destructive" or "warning" for vulnerabilities
            duration: 7000,
          });
      }
    } catch (e) {
      const error = e as Error;
      console.error("Error en el envío del formulario:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado.";
      setAnalysisResult({ urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, reportText: null, attackVectors: null, error: errorMessage, allFindings: null });
      toast({ variant: "destructive", title: "Error de Envío", description: errorMessage, duration: 8000 });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which summary to show in AnalysisSummaryCard
  // Prioritize URL, then server, then database if multiple analyses were run.
  // Or, we could pass allFindings to AnalysisSummaryCard and let it derive overall status.
  const summaryCardData = analysisResult?.urlAnalysis || analysisResult?.serverAnalysis || analysisResult?.databaseAnalysis || null;
  // If we want to use allFindings for summary card:
  // const allFindingsSummary = analysisResult?.allFindings ? { findings: analysisResult.allFindings, overallRiskAssessment: ..., executiveSummary: ...} : null;


  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-secondary/50">
        <AppHeader 
          isAuthenticated={isAuthenticated} 
          onAuthToggle={() => setIsAuthenticated(!isAuthenticated)}
        />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <section className="max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                Centro de Análisis de Seguridad
                </h2>
                <Button variant="outline" onClick={() => setIsAuthenticated(!isAuthenticated)} size="sm">
                    {isAuthenticated ? <UserCheck className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                    {isAuthenticated ? "Simular Cierre Sesión" : "Simular Inicio Sesión"}
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">
              Ingresa una URL, describe la configuración de tu servidor y/o base de datos para un análisis de seguridad integral.
              La IA identificará vulnerabilidades, generará informes y sugerirá remediaciones. Autentícate para informes completos y descargas.
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
                  </CardContent>
                </Card>
                <Card className="shadow-lg animate-pulse">
                  <CardHeader> <Skeleton className="h-8 w-3/4" /> <Skeleton className="h-4 w-1/2 mt-2" /> </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              </div>
            )}

            {!isLoading && analysisResult && (
              <div className="space-y-8">
                {/* Pass allFindings to AnalysisSummaryCard if it's adapted to handle them */}
                {/* Otherwise, pass a primary analysis result (e.g., urlAnalysis) or a synthesized summary object */}
                <AnalysisSummaryCard 
                  analysisInput={summaryCardData} // Pass the most relevant summary
                  allFindings={analysisResult.allFindings} // Or pass all findings for a more holistic summary
                />
                
                {isAuthenticated ? (
                  <>
                    <Separator />
                    <VulnerabilityReportDisplay result={analysisResult} />
                    {analysisResult.attackVectors && analysisResult.attackVectors.length > 0 && (
                      <>
                        <Separator className="my-8 md:my-12" />
                        <AttackVectorsDisplay attackVectors={analysisResult.attackVectors} />
                      </>
                    )}
                    {zipUrl && !analysisResult.error && ( // Check error on main result
                      <div className="text-center mt-8">
                        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                          <a href={zipUrl} download={`analisis_seguridad_${submittedTargetDescription.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0,50)}_${new Date().toISOString().split('T')[0]}.zip`}>
                            <Download className="mr-2 h-5 w-5" /> Descargar Resultados (ZIP)
                          </a>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          El ZIP contiene el informe (.md), detalles (.json) y vectores de ataque (.json).
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  (analysisResult.urlAnalysis || analysisResult.serverAnalysis || analysisResult.databaseAnalysis) && (
                    <Card className="mt-8 shadow-lg border-l-4 border-accent">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-accent">
                          <AlertTriangle className="h-6 w-6" />
                          Acceso Limitado al Informe
                        </CardTitle>
                        <CardDescription>
                          Has recibido un resumen del análisis. Para acceder al informe detallado, vectores de ataque y la opción de descarga, por favor inicia sesión.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold text-foreground mb-2">Resumen Principal del Escaneo:</h3>
                        <p className="text-muted-foreground bg-secondary/30 p-3 rounded-md">
                          {analysisResult.urlAnalysis?.executiveSummary || analysisResult.serverAnalysis?.executiveSummary || analysisResult.databaseAnalysis?.executiveSummary || "No se proporcionó un resumen ejecutivo."}
                        </p>
                        <Button className="mt-6 w-full" onClick={() => setIsAuthenticated(true)}>
                          <LogIn className="mr-2 h-5 w-5" /> Ver Informe Completo (Simular Inicio de Sesión)
                        </Button>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}

            {!isLoading && !analysisResult && (
               <Card className="mt-8 shadow-lg max-w-3xl mx-auto border-l-4 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        Plataforma Integral de Análisis de Seguridad
                    </CardTitle>
                    <CardDescription>
                        Potencie la seguridad de sus aplicaciones y sistemas con nuestra solución de análisis inteligente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Proporcione detalles de su URL, servidor y/o base de datos para un escaneo exhaustivo. Nuestro motor de IA identificará vulnerabilidades,
                        generará un informe detallado y proporcionará escenarios de ataque ilustrativos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background"> <Info className="h-5 w-5 text-primary"/> Análisis de URL para vulnerabilidades web.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background"> <ServerIcon className="h-5 w-5 text-primary"/> Evaluación de configuración de servidor.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background"> <Database className="h-5 w-5 text-primary"/> Chequeo de seguridad de base de datos.</div>
                    </div>
                    <p className="text-muted-foreground mt-3">
                        Ideal para equipos de desarrollo, profesionales de seguridad y empresas que buscan proteger sus activos digitales de manera proactiva.
                    </p>
                     <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-sm text-primary font-medium">
                        <UserCheck className="h-5 w-5" />
                        <span>Funcionalidades Premium incluyen: Informes detallados, exportación de datos y más.</span>
                    </div>
                </CardContent>
               </Card>
            )}
          </section>
        </main>
        <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} Analizador de Seguridad Integral. Impulsado por GenAI. Herramienta educativa y de evaluación.
        </footer>
      </div>
    </TooltipProvider>
  );
}
