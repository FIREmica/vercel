
"use client";

import { useState, useEffect } from "react";
import JSZip from 'jszip';
import { AppHeader } from "@/components/layout/header";
import { UrlInputForm } from "@/components/url-input-form";
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
import { Info, Download, ShieldCheck, LogIn, UserCheck, AlertTriangle } from "lucide-react";
import { HackingInfoSection } from "@/components/hacking-info-section";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState<string>(""); 
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock authentication state
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

  const generateZipFile = async (result: AnalysisResult, url: string) => {
    if (!result || result.error || !result.analysis) return;

    const zip = new JSZip();
    const safeHostname = url ? new URL(url).hostname.replace(/[^a-zA-Z0-9.-]/g, '_') : 'analisis';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderName = `analisis_seguridad_${safeHostname}_${timestamp}`;
    const folder = zip.folder(folderName);

    if (!folder) {
        console.error("Failed to create zip folder");
        toast({
          variant: "destructive",
          title: "Error al Crear ZIP",
          description: "No se pudo crear la carpeta interna del archivo ZIP.",
        });
        return;
    }

    folder.file("url_analizada.txt", url);

    if (result.reportText) {
      folder.file("informe_seguridad.md", result.reportText);
    }
    if (result.analysis && result.analysis.findings) {
      folder.file("hallazgos_detallados.json", JSON.stringify(result.analysis.findings, null, 2));
    }
    if (result.attackVectors) {
      folder.file("vectores_ataque_ilustrativos.json", JSON.stringify(result.attackVectors, null, 2));
    }

    try {
      const blob = await zip.generateAsync({ type: "blob" });
      const newZipUrl = URL.createObjectURL(blob);

      if (zipUrl) {
        URL.revokeObjectURL(zipUrl);
      }
      setZipUrl(newZipUrl);
       toast({
          title: "Archivo ZIP Listo",
          description: "El archivo ZIP con los resultados está listo para descargar.",
          variant: "default",
        });

    } catch (error) {
      console.error("Error generating ZIP file:", error);
       toast({
          variant: "destructive",
          title: "Error al Generar ZIP",
          description: "Ocurrió un error al crear el archivo ZIP.",
        });
       setZipUrl(null); 
    }
  };


  const handleFormSubmit = async (url: string) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setSubmittedUrl(url); 
    if (zipUrl) {
        URL.revokeObjectURL(zipUrl);
        setZipUrl(null);
    }

    toast({
        title: "Iniciando Análisis...",
        description: `Escaneando ${url} en busca de vulnerabilidades.`,
        variant: "default",
    });

    try {
      const result = await performAnalysisAction(url);
      setAnalysisResult(result);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Análisis Fallido",
          description: result.error,
          duration: 8000, 
        });
      } else {
          if (result.analysis) {
            if (isAuthenticated) { // Only generate ZIP if authenticated
              await generateZipFile(result, url);
            }

            const vulnerableCount = result.analysis.vulnerableFindingsCount ?? 0;
            const summaryMessage = result.analysis.executiveSummary || (vulnerableCount > 0 ? 'Se encontraron vulnerabilidades.' : 'No se detectaron vulnerabilidades críticas con las verificaciones actuales.');

            if (vulnerableCount > 0) {
              toast({
                title: "Análisis Completo",
                description: `${vulnerableCount} vulnerabilidad(es) potencial(es) encontrada(s). ${summaryMessage} ${isAuthenticated ? 'Revisa el informe y descarga el ZIP.' : 'Inicia sesión para ver el informe completo.'}`,
                variant: "default", 
              });
            } else {
              toast({
                title: "Análisis Completo",
                description: `Escaneo finalizado. ${summaryMessage} ${isAuthenticated ? 'Revisa el informe y descarga el ZIP.' : 'Inicia sesión para ver el informe completo.'}`,
                variant: "default",
              });
            }
          } else {
             toast({
              variant: "destructive",
              title: "Error de Análisis",
              description: "El análisis no produjo resultados válidos.",
            });
          }
      }
    } catch (e) {
      const error = e as Error;
      console.error("Error en el envío del formulario:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado.";
      setAnalysisResult({ analysis: null, reportText: null, attackVectors: null, error: errorMessage });
      toast({
        variant: "destructive",
        title: "Error de Envío",
        description: errorMessage,
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                Escanear Página de Registro
                </h2>
                <Button variant="outline" onClick={() => setIsAuthenticated(!isAuthenticated)} size="sm">
                    {isAuthenticated ? <UserCheck className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                    {isAuthenticated ? "Simular Cierre Sesión" : "Simular Inicio Sesión"}
                </Button>
            </div>
            <p className="text-muted-foreground mb-6">
              Ingresa la URL de una página de registro de usuarios para analizarla en busca de vulnerabilidades web comunes.
              Los usuarios autenticados obtienen acceso a informes detallados, vectores de ataque y descarga de resultados.
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
                <AnalysisSummaryCard analysisResults={analysisResult.analysis} />
                
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
                    {zipUrl && !analysisResult.error && (
                      <div className="text-center mt-8">
                        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                          <a href={zipUrl} download={`analisis_seguridad_${submittedUrl ? new URL(submittedUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_') : 'resultado'}_${new Date().toISOString().split('T')[0]}.zip`}>
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
                  // Display for non-authenticated users after analysis
                  analysisResult.analysis && (
                    <Card className="mt-8 shadow-lg border-l-4 border-accent">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-accent">
                          <AlertTriangle className="h-6 w-6" />
                          Acceso Limitado al Informe
                        </CardTitle>
                        <CardDescription>
                          Has recibido un resumen del análisis. Para acceder al informe detallado, vectores de ataque y la opción de descarga, por favor inicia sesión o considera nuestros planes premium.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold text-foreground mb-2">Resumen Ejecutivo del Escaneo:</h3>
                        <p className="text-muted-foreground bg-secondary/30 p-3 rounded-md">
                          {analysisResult.analysis.executiveSummary || "No se proporcionó un resumen ejecutivo."}
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
                        Plataforma de Análisis de Seguridad Web
                    </CardTitle>
                    <CardDescription>
                        Potencie la seguridad de sus aplicaciones con nuestra solución de análisis inteligente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Ingrese la URL de su página de registro para iniciar un escaneo exhaustivo. Nuestro motor de IA identificará vulnerabilidades comunes,
                        generará un informe detallado y proporcionará escenarios de ataque ilustrativos.
                    </p>
                    <p className="text-muted-foreground">
                        Ideal para equipos de desarrollo, profesionales de seguridad y empresas que buscan proteger sus activos digitales.
                    </p>
                     <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-sm text-primary font-medium">
                        <UserCheck className="h-5 w-5" />
                        <span>Funcionalidades Premium incluyen: Informes detallados, análisis de vectores de ataque, exportación de datos y más.</span>
                    </div>
                </CardContent>
               </Card>
            )}
          </section>
        </main>
        <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} Analizador de Seguridad Web. Impulsado por GenAI. Herramienta educativa.
        </footer>
      </div>
    </TooltipProvider>
  );
}
