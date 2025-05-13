"use client";

import { useState, useEffect } from "react";
import JSZip from 'jszip';
import { AppHeader } from "@/components/layout/header";
import { UrlInputForm } from "@/components/url-input-form";
import { VulnerabilityReportDisplay } from "@/components/vulnerability-report-display";
import { AttackVectorsDisplay } from "@/components/attack-vectors-display";
import { performAnalysisAction } from "./actions";
import type { AnalysisResult } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, BugPlay, Download } from "lucide-react";
import { HackingInfoSection } from "@/components/hacking-info-section";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState<string>(""); // Store the URL that was submitted
  const { toast } = useToast();

  // Example URL - Can be updated or removed if not needed
  const exampleUrl = "http://testphp.vulnweb.com/userinfo.php"; // Example vulnerable site (use cautiously)

  // Clean up blob URL on unmount or when zipUrl changes
  useEffect(() => {
    const currentZipUrl = zipUrl;
    return () => {
      if (currentZipUrl) {
        URL.revokeObjectURL(currentZipUrl);
      }
    };
  }, [zipUrl]);

  const generateZipFile = async (result: AnalysisResult, url: string) => {
    if (!result || result.error) return;

    const zip = new JSZip();
    // Sanitize URL for filename (replace non-alphanumeric chars)
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
      // Save report as Markdown for better readability
      folder.file("informe_seguridad.md", result.reportText);
    }
    if (result.vulnerabilities) {
      folder.file("hallazgos_detallados.json", JSON.stringify(result.vulnerabilities, null, 2));
    }
    if (result.attackVectors) {
      folder.file("vectores_ataque_ilustrativos.json", JSON.stringify(result.attackVectors, null, 2));
    }

    try {
      const blob = await zip.generateAsync({ type: "blob" });
      const newZipUrl = URL.createObjectURL(blob);

      // Clean up previous URL if it exists
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
       setZipUrl(null); // Reset on error
    }
  };


  const handleFormSubmit = async (url: string) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setSubmittedUrl(url); // Store submitted URL
    // Reset zip URL for new analysis
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
          duration: 8000, // Show error longer
        });
      } else {
          // Generate ZIP only if analysis was successful
          await generateZipFile(result, url);

           const vulnerableCount = result.vulnerabilities?.filter(v => v.isVulnerable).length ?? 0;

           if (vulnerableCount > 0) {
            toast({
              title: "Análisis Completo",
              description: `${vulnerableCount} vulnerabilidad(es) potencial(es) encontrada(s). Revisa el informe y descarga el ZIP.`,
              variant: "default", // Could be destructive or accent based on severity if needed
            });
          } else {
             toast({
              title: "Análisis Completo",
              description: "Escaneo finalizado. No se detectaron vulnerabilidades críticas con las verificaciones actuales. Revisa el informe y descarga el ZIP.",
              variant: "default", // Consider 'success' variant if available/added
            });
          }
      }
    } catch (e) {
      const error = e as Error;
      console.error("Error en el envío del formulario:", error);
      const errorMessage = error.message || "Ocurrió un error inesperado.";
      setAnalysisResult({ vulnerabilities: null, reportText: null, attackVectors: null, error: errorMessage });
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
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <section className="max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Escanear Página de Registro
            </h2>
            <p className="text-muted-foreground mb-6">
              Ingresa la URL de una página de registro de usuarios para analizarla en busca de vulnerabilidades web comunes
              (como XSS, SQLi, problemas de rate limiting, etc.). Los resultados detallados y un informe se pueden descargar como archivo ZIP.
            </p>
            <UrlInputForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              defaultUrl={exampleUrl} // Provide an example if desired
            />
          </section>

          <Separator className="my-8 md:my-12" />

          <HackingInfoSection />
          <Separator className="my-8 md:my-12" />


          {/* Analysis Results Section */}
          <section className="max-w-4xl mx-auto">
            {isLoading && (
              <div className="space-y-8 mt-8">
                {/* Skeleton for Vulnerability Report */}
                <Card className="shadow-lg animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                     <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
                 {/* Skeleton for Detailed Findings Table */}
                 <Card className="shadow-lg animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 border-b py-3 last:border-b-0">
                        <Skeleton className="h-6 w-1/5" /> {/* Vulnerability */}
                        <Skeleton className="h-6 w-1/5" /> {/* Severity */}
                        <Skeleton className="h-6 w-1/5" /> {/* Detected */}
                        <Skeleton className="h-6 w-1/5" /> {/* Lockout Risk */}
                        <Skeleton className="h-6 w-1/5" /> {/* Remediation */}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                {/* Skeleton for Attack Vectors */}
                <Card className="shadow-lg animate-pulse">
                  <CardHeader>
                     <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-3/4" />
                     </div>
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="border p-4 rounded-md">
                        <Skeleton className="h-6 w-1/2 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-3" />
                        <Skeleton className="h-10 w-full bg-muted" />
                         <Skeleton className="h-4 w-full mt-3" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                {/* Skeleton for Download Button Area */}
                 <div className="text-center mt-8">
                   <Skeleton className="h-10 w-48 inline-block" />
                 </div>
              </div>
            )}

            {!isLoading && analysisResult && (
              <div className="space-y-8">
                {/* Display Vulnerability Report and Detailed Findings */}
                <VulnerabilityReportDisplay result={analysisResult} />

                {/* Display Attack Vectors if available */}
                {analysisResult.attackVectors && analysisResult.attackVectors.length > 0 && (
                   <>
                     <Separator className="my-8 md:my-12" />
                     <AttackVectorsDisplay attackVectors={analysisResult.attackVectors} />
                   </>
                 )}


                 {/* Download Button - Only show if analysis is done, not loading, and zip URL exists */}
                 {zipUrl && !analysisResult.error && (
                   <div className="text-center mt-8">
                      <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                          <a href={zipUrl} download={`analisis_seguridad_${submittedUrl ? new URL(submittedUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_') : 'resultado'}_${new Date().toISOString().split('T')[0]}.zip`}>
                              <Download className="mr-2 h-5 w-5" />
                              Descargar Resultados (ZIP)
                          </a>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                          El ZIP contiene el informe (.md), detalles (.json) y vectores de ataque (.json).
                      </p>
                   </div>
                 )}
              </div>
            )}

            {/* Initial state message */}
            {!isLoading && !analysisResult && (
               <Card className="mt-8 shadow-lg max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Info className="h-6 w-6 text-primary" />
                        Listo para Escanear
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Los resultados de tu análisis de seguridad aparecerán aquí una vez que envíes una URL.
                        Esto incluirá un informe general, hallazgos detallados, posibles escenarios de ataque ilustrativos (si aplica) y una opción para descargar todo en un archivo ZIP.
                    </p>
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
