
"use client";

import { useState, useEffect, useRef } from "react";
import JSZip from 'jszip';
import Link from "next/link";
import { AppHeader } from "@/components/layout/header"; 
import { UrlInputForm, type UrlInputFormValues } from "@/components/url-input-form";
import { VulnerabilityReportDisplay } from "@/components/vulnerability-report-display";
import { AttackVectorsDisplay } from "@/components/attack-vectors-display";
import { RemediationPlaybooksDisplay } from "@/components/remediation-playbooks-display";
import { AnalysisSummaryCard } from "@/components/analysis-summary-card";
import { performAnalysisAction, exportAllFindingsAsJsonAction } from "./actions";
import type { AnalysisResult, RemediationPlaybook, VulnerabilityFinding, AttackVector } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info, Download, ShieldCheck, LogIn, UserCheck, AlertTriangle, Database, ServerIcon, Briefcase, BarChart3, Zap, FileLock2, Globe, Sparkles, Unlock, Gamepad2, MessageCircle, Code, Cloud, SlidersHorizontal, Users, ShieldEllipsis, Bot, Check, ListChecks, SearchCode, Network, BoxIcon, LibraryIcon, GitBranch, Columns, AlertOctagon, Waypoints, FileJson, Wifi, ExternalLink, LockIcon, CreditCard, ShoppingCart, Loader2 } from "lucide-react";
import { HackingInfoSection } from "@/components/hacking-info-section";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ChatAssistant } from "@/components/chat-assistant";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    paypal: {
      Buttons: (options: any) => ({ 
        render: (selector: string) => Promise<void>;
        isEligible: () => boolean; 
        close: () => Promise<void>;
      });
    };
  }
}

const PayPalSmartPaymentButtons = ({ onPaymentSuccess, onPaymentError, onPaymentCancel, onLoginRequired }: { onPaymentSuccess: (details: any) => void, onPaymentError: (err: any) => void, onPaymentCancel: () => void, onLoginRequired: () => void }) => {
  const paypalButtonsContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isPayPalSDKReady, setIsPayPalSDKReady] = useState(false);
  const [payPalButtonInstance, setPayPalButtonInstance] = useState<any>(null);
  const { session, refreshUserProfile } = useAuth(); 

  useEffect(() => {
    const checkPayPalSDK = () => {
      if (typeof window !== 'undefined' && window.paypal && typeof window.paypal.Buttons === 'function') {
        setIsPayPalSDKReady(true);
      } else {
        setTimeout(checkPayPalSDK, 100);
      }
    };
    checkPayPalSDK();
  }, []);

  useEffect(() => {
    if (!session) { 
      if (paypalButtonsContainerRef.current) paypalButtonsContainerRef.current.innerHTML = '';
      if (payPalButtonInstance && typeof payPalButtonInstance.close === 'function') {
        payPalButtonInstance.close().catch((err: any) => console.error("Error closing PayPal buttons on session loss:", err));
      }
      setPayPalButtonInstance(null);
      return;
    }

    if (isPayPalSDKReady && paypalButtonsContainerRef.current && !payPalButtonInstance) {
      if (paypalButtonsContainerRef.current.childElementCount > 0) {
         // paypalButtonsContainerRef.current.innerHTML = ''; // Let's be more careful here. Only clear if no instance.
      }
      
      try {
        if (typeof window.paypal.Buttons !== 'function') {
            toast({ variant: "destructive", title: "Error de SDK de PayPal", description: "Los componentes de botones de PayPal no están disponibles." });
            console.error("window.paypal.Buttons is not a function or not available.");
            return;
        }

        const buttonsInstance = window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
          },
          createOrder: async () => {
            if (!session) {
                toast({ variant: "destructive", title: "Error de Autenticación", description: "Debe iniciar sesión para crear una orden de pago." });
                onLoginRequired();
                return Promise.reject(new Error("User not logged in"));
            }
            try {
              toast({ title: "Iniciando Pago", description: "Creando orden de pago segura con PayPal...", variant: "default" });
              const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // El body es opcional para create-order si usa valores fijos en el backend
                 body: JSON.stringify({ orderAmount: '10.00', currencyCode: 'USD' }), 
              });
              const orderData = await response.json();
              if (!response.ok || orderData.error) {
                const errorMsg = orderData.error || 'Error desconocido del servidor al crear la orden.';
                toast({ variant: "destructive", title: "Error de Creación de Orden", description: `No se pudo iniciar el pago: ${errorMsg}` });
                onPaymentError(new Error(errorMsg));
                return Promise.reject(new Error(errorMsg));
              }
              toast({ title: "Orden Creada", description: "Redirigiendo a PayPal para completar el pago.", variant: "default" });
              return orderData.orderID;
            } catch (error: any) {
              toast({ variant: "destructive", title: "Error de Pago", description: `No se pudo conectar con el servidor de pagos: ${error.message}` });
              onPaymentError(error);
              return Promise.reject(error);
            }
          },
          onApprove: async (data: any, actions: any) => {
            toast({ title: "Pago Aprobado por Usuario", description: "Procesando la confirmación del pago con nuestro servidor...", variant: "default" });
            try {
              const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
              });
              const captureData = await response.json();

              if (!response.ok || captureData.error) {
                const errorMsg = captureData.error || "No se pudo capturar el pago en el servidor.";
                toast({ variant: "destructive", title: "Error al Confirmar Pago", description: errorMsg });
                onPaymentError(new Error(errorMsg));
              } else {
                 toast({ title: "¡Pago Confirmado Exitosamente!", description: `Orden ${captureData.orderID || data.orderID} completada. Actualizando estado de suscripción...`, variant: "default", duration: 7000 });
                 await refreshUserProfile(); // Attempt to refresh profile after successful payment
                 onPaymentSuccess({ orderID: data.orderID, payerID: data.payerID, paymentID: captureData.paymentDetails?.id }); 
              }
            } catch (error: any) {
              toast({ variant: "destructive", title: "Error Post-Aprobación", description: `Hubo un problema al finalizar la activación Premium: ${error.message}` });
              onPaymentError(error);
            }
          },
          onError: (err: any) => {
            let userMessage = "Ocurrió un error con el sistema de PayPal. Por favor, intente de nuevo.";
            if (typeof err === 'string' && err.includes('Window closed')) {
                userMessage = "Ventana de pago cerrada por el usuario antes de completar.";
            } else if (err && err.message) {
                 userMessage = err.message.substring(0, 150); 
            }
            toast({ variant: "destructive", title: "Error de PayPal", description: userMessage });
            console.error("PayPal Buttons onError:", err);
            onPaymentError(err);
          },
          onCancel: (data: any) => {
            toast({ title: "Pago Cancelado", description: "El proceso de pago fue cancelado por el usuario.", variant: "default" });
            onPaymentCancel();
          },
        });

        if (paypalButtonsContainerRef.current) {
             paypalButtonsContainerRef.current.innerHTML = ''; 
             buttonsInstance.render(paypalButtonsContainerRef.current)
            .then(() => {
                setPayPalButtonInstance(buttonsInstance);
            })
            .catch((renderError) => {
              const errMsg = renderError && renderError.message ? renderError.message.substring(0, 250) : "Error desconocido al renderizar botones de PayPal.";
              toast({ variant: "destructive", title: "Error de Interfaz de Pago", description: `No se pudieron mostrar los botones de PayPal: ${errMsg}` });
              console.error("PayPal SDK .render() error:", renderError); 
            });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error Crítico de SDK de PayPal", description: "No se pudo inicializar la interfaz de pago de PayPal." });
        console.error("Error initializing PayPal Buttons:", error);
      }
    }
    
    return () => {
      if (payPalButtonInstance && typeof payPalButtonInstance.close === 'function') {
        payPalButtonInstance.close().catch((err: any) => console.error("Error al cerrar botones de PayPal en cleanup:", err));
      }
    };
  }, [isPayPalSDKReady, session, onPaymentError, onPaymentSuccess, onPaymentCancel, toast, payPalButtonInstance, onLoginRequired, refreshUserProfile]);

  if (!isPayPalSDKReady) {
    return <div className="mt-4 text-center text-muted-foreground">Cargando opciones de pago... <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin"/></div>;
  }
  
  if (!session) {
    return (
      <div className="mt-4 text-center">
        <p className="text-muted-foreground mb-2">Debe iniciar sesión para realizar un pago.</p>
        <Button onClick={onLoginRequired}>
          <LogIn className="mr-2 h-4 w-4" />
          Iniciar Sesión para Pagar
        </Button>
      </div>
    );
  }

  return <div ref={paypalButtonsContainerRef} className="mt-4 paypal-buttons-container min-h-[100px]"></div>;
};


export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [jsonExportUrl, setJsonExportUrl] = useState<string | null>(null);
  const [submittedTargetDescription, setSubmittedTargetDescription] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { session, isLoading: isLoadingAuth, isPremium, userProfile, signOut, refreshUserProfile } = useAuth(); 

  const exampleUrl = "http://testphp.vulnweb.com/userinfo.php";

  useEffect(() => {
    const currentZipUrl = zipUrl;
    const currentJsonUrl = jsonExportUrl;
    return () => {
      if (currentZipUrl) URL.revokeObjectURL(currentZipUrl);
      if (currentJsonUrl) URL.revokeObjectURL(currentJsonUrl);
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
        toast({ variant: "destructive", title: "Error al Crear ZIP", description: "No se pudo crear la carpeta interna." });
        return;
    }

    folder.file("descripcion_analisis.txt", targetDesc);

    if (result.reportText) folder.file("informe_completo_seguridad.md", result.reportText);
    if (result.allFindings && result.allFindings.length > 0) {
      try {
        const allFindingsJson = await exportAllFindingsAsJsonAction(result.allFindings);
        folder.file("todos_los_hallazgos.json", allFindingsJson);
      } catch (e) { folder.file("error_exportando_hallazgos.txt", "No se pudieron exportar los hallazgos a JSON."); }
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
        toast({ variant: "destructive", title: "Error al Generar JSON", description: "Ocurrió un error." });
        setJsonExportUrl(null);
    }
  };

  const handleFormSubmit = async (values: UrlInputFormValues) => {
    setIsLoadingAnalysis(true);
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

    if (zipUrl) { URL.revokeObjectURL(zipUrl); setZipUrl(null); }
    if (jsonExportUrl) { URL.revokeObjectURL(jsonExportUrl); setJsonExportUrl(null); }

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
        setIsLoadingAnalysis(false);
        return;
      }

      const result = await performAnalysisAction(params, isPremium); // Pass the premium status from AuthContext
      setAnalysisResult(result);

      if (result.error && !result.reportText && (!result.allFindings || result.allFindings.length === 0 )) {
        toast({ variant: "destructive", title: "Análisis Fallido", description: result.error, duration: 8000 });
      } else {
          const vulnerableCount = result.allFindings?.filter(f => f.isVulnerable).length ?? 0;
          const summaryItems = [ result.urlAnalysis?.executiveSummary, result.serverAnalysis?.executiveSummary, result.databaseAnalysis?.executiveSummary, result.sastAnalysis?.executiveSummary, result.dastAnalysis?.executiveSummary, result.cloudAnalysis?.executiveSummary, result.containerAnalysis?.executiveSummary, result.dependencyAnalysis?.executiveSummary, result.networkAnalysis?.executiveSummary ];
          const primarySummary = result.reportText ? "Informe completo generado." : (summaryItems.find(s => s) || (vulnerableCount > 0 ? 'Se encontraron vulnerabilidades.' : 'No se detectaron vulnerabilidades críticas.'));

          if (result.allFindings && result.allFindings.length > 0) {
             await generateJsonExportFile(result.allFindings, currentTargetDesc);
          }
          if (isPremium && (result.reportText || (result.allFindings && result.allFindings.length > 0))) {
            await generateZipFile(result, currentTargetDesc);
          }
          toast({
            title: "Análisis Completo",
            description: `${vulnerableCount} vulnerabilidad(es) activa(s) encontrada(s). ${primarySummary} ${result.error ? ` (Nota: ${result.error})` : ''} ${isPremium ? 'Informe, vectores de ataque, playbooks y descargas disponibles.' : 'Inicie sesión para acceder a todas las funciones premium.'}`,
            variant: vulnerableCount > 0 ? "default" : "default", 
            duration: 7000,
          });
      }
    } catch (e) {
      const error = e as Error;
      let errorMessage = "Ocurrió un error inesperado durante el análisis.";
      const apiKeyEnv = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
      const apiKeyName = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? "NEXT_PUBLIC_GOOGLE_API_KEY" : "GOOGLE_API_KEY";

      if (!apiKeyEnv || apiKeyEnv === "tu_clave_api_aqui" || apiKeyEnv.trim() === "" || apiKeyEnv === "YOUR_GOOGLE_AI_API_KEY_HERE") {
        errorMessage = `Error de Configuración: La clave API (${apiKeyName}) para el servicio de IA no está configurada. Por favor, revise el archivo .env.local y las instrucciones del README.md.`;
      } else if (error.message && (error.message.includes("API key not valid") || error.message.includes("API key is invalid") || error.message.includes("API_KEY_INVALID"))) {
        errorMessage = `Error de Configuración: La clave API (${apiKeyName}) proporcionada no es válida. Verifique la clave en Google AI Studio y su configuración en .env.local.`;
      } else if (error.message && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
        errorMessage = "Ocurrió un error de red al intentar contactar un servicio de análisis. Por favor, verifica tu conexión a internet e inténtalo de nuevo.";
      } else if (error.message && error.message.includes('quota')) {
        errorMessage = "Se ha excedido una cuota del servicio de análisis (posiblemente de Google AI). Por favor, inténtalo de nuevo más tarde o revisa los límites de tu cuenta.";
      } else if (error.message && (error.message.toLowerCase().includes('json') || error.message.includes('Unexpected token') || error.message.includes('output.findings') || error.message.includes('output!'))) {
          errorMessage = `La IA devolvió un formato inválido o inesperado. Detalles: ${error.message}. Esto puede deberse a un problema temporal con el modelo de IA, filtros de contenido, o un prompt mal formado. Inténtalo de nuevo o simplifica la entrada.`;
      } else {
        errorMessage = `El análisis falló catastróficamente: ${error.message}`;
      }

      setAnalysisResult({ urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, sastAnalysis: null, dastAnalysis: null, cloudAnalysis: null, containerAnalysis: null, dependencyAnalysis: null, networkAnalysis: null, reportText: null, attackVectors: null, remediationPlaybooks: null, error: errorMessage, allFindings: [] });
      toast({ variant: "destructive", title: "Error Crítico de Análisis", description: errorMessage, duration: 8000 });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handlePayPalPaymentSuccess = async (details: any) => {
    toast({ title: "¡Pago Procesado!", description: `Orden ${details.orderID} capturada en el backend. Se está actualizando su perfil...`, variant: "default", duration: 5000 });
    // El refreshUserProfile en el callback de onApprove del botón de PayPal intentará actualizar el estado
    // después de que el backend (esperemos) haya actualizado la DB.
  };

  const handlePayPalPaymentError = (error: any) => {
    toast({ variant: "destructive", title: "Error de Pago", description: "Hubo un problema al procesar su pago con PayPal." });
  };
  const handlePayPalPaymentCancel = () => {
      toast({ title: "Pago Cancelado", description: "Ha cancelado el proceso de pago.", variant: "default" });
  };
   const handleLoginForPayPal = () => {
    router.push('/login?redirect=/'); 
  };


  const PremiumFeatureCard = ({ title, description, icon: Icon, actionButton, isForPayPalSection = false }: { title: string, description:string, icon: React.ElementType, actionButton?: React.ReactNode, isForPayPalSection?: boolean }) => (
    <Card className="mt-8 shadow-lg border-l-4 border-accent bg-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-accent"> <Icon className="h-6 w-6" /> {title} (Función Premium) </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        {actionButton && !isForPayPalSection && actionButton}
        {isForPayPalSection && (
           <div className="mt-4 flex flex-col items-center gap-4">
            <p className="text-sm text-center text-foreground"> Para acceder a esta y todas las funciones premium, considere nuestra suscripción. </p>
            <PayPalSmartPaymentButtons 
                onPaymentSuccess={handlePayPalPaymentSuccess} 
                onPaymentError={handlePayPalPaymentError} 
                onPaymentCancel={handlePayPalPaymentCancel}
                onLoginRequired={handleLoginForPayPal}
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3 text-center">
          El acceso Premium se basa en el estado de su suscripción (obtenido de la base de datos tras un inicio de sesión exitoso).
        </p>
      </CardContent>
    </Card>
  );

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-secondary/50">
        <AppHeader /> 
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <section className="max-w-3xl mx-auto bg-card p-6 md:p-8 rounded-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground"> Centro de Análisis de Seguridad Integral </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Nuestra plataforma IA analiza URLs, servidores (incluyendo juegos), bases de datos, código (SAST), aplicaciones (DAST), Cloud (AWS, Azure, GCP), contenedores (Docker, K8s), dependencias y redes.
              <strong className="text-foreground block mt-1">
                {session ? 
                  (isPremium ? `¡Bienvenido ${userProfile?.email || (session?.user?.email) ||  'Usuario Premium'}! Acceso completo a todas las funcionalidades avanzadas.` 
                             : `Bienvenido ${userProfile?.email || (session?.user?.email) ||  'Usuario'}. Considere nuestra suscripción para acceso completo.`)
                : "Inicie sesión para desbloquear informes técnicos detallados, escenarios de ataque, playbooks de remediación y descarga completa de resultados."}
              </strong>
            </p>
            <UrlInputForm onSubmit={handleFormSubmit} isLoading={isLoadingAnalysis} defaultUrl={exampleUrl} />
          </section>

          <Separator className="my-8 md:my-12" />
          <HackingInfoSection />
          <Separator className="my-8 md:my-12" />
          
          <section className="max-w-4xl mx-auto mb-8 md:mb-12">
            <Card className="shadow-lg border-l-4 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl md:text-2xl"> <Briefcase className="h-7 w-7 text-primary" /> Capacidades Empresariales Avanzadas </CardTitle>
                    <CardDescription> Nuestra plataforma ofrece herramientas de seguridad de nivel empresarial, con muchas funcionalidades en desarrollo activo, simulación y planificación estratégica: </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                        { icon: SearchCode, title: "Análisis SAST (Estático)", desc: "Análisis de fragmentos de código para identificar vulnerabilidades.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: Network, title: "Análisis DAST (Dinámico App)", desc: "Pruebas de seguridad en aplicaciones web en ejecución.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: Cloud, title: "Análisis Config. Cloud (AWS, Azure, GCP)", desc: "Evaluación de seguridad para infraestructuras en la nube.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: BoxIcon, title: "Análisis Seguridad Contenedores", desc: "Análisis de imágenes Docker y configuraciones Kubernetes.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: LibraryIcon, title: "Análisis de Dependencias de Software", desc: "Detección de vulnerabilidades en bibliotecas y frameworks.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: Wifi, title: "Análisis de Configuración de Red", desc: "Evaluación de descripciones de red, reglas de firewall y resultados de escaneos.", status: "Implementado", badgeColor: "border-green-500 text-green-500" },
                        { icon: FileLock2, title: "Generación de Playbooks de Remediación", desc: "Guías detalladas para solucionar vulnerabilidades (Premium).", status: "Implementado (Requiere Premium)", badgeColor: "border-green-500 text-green-500" },
                        { icon: AlertOctagon, title: "Pruebas de Penetración Automatizadas", desc: "Simulación de ataques avanzados en entornos controlados (Premium, con precaución).", status: "Explorando", badgeColor: "border-yellow-500 text-yellow-500" },
                        { icon: SlidersHorizontal, title: "Motor de Reglas Personalizadas", desc: "Definición de políticas y reglas de detección específicas para empresas.", status: "Planificado" },
                        { icon: ShieldEllipsis, title: "Mapeo a Controles de Cumplimiento", desc: "Relacionar hallazgos con controles de SOC2, ISO 27001, etc. (Informativo).", status: "Mejorado", badgeColor: "border-blue-500 text-blue-500" },
                        { icon: Waypoints, title: "Integración SIEM/SOAR (vía JSON export)", desc: "Exportación de datos y automatización de respuestas a incidentes.", status: "Base Implementada", badgeColor: "border-blue-500 text-blue-500" },
                        { icon: Users, title: "Gestión de Usuarios y RBAC", desc: "Control de acceso basado en roles y gestión de equipos.", status: "Planificado (Requiere Base de Datos)" },
                        { icon: BarChart3, title: "Paneles de Control Avanzados", desc: "Visualizaciones y analítica de riesgos personalizables.", status: "Planificado" },
                        { icon: GitBranch, title: "Integración con CI/CD", desc: "Automatización de análisis en pipelines de desarrollo (DevSecOps).", status: "Explorando" },
                        { icon: Columns, title: "Interfaz de Línea de Comandos (CLI)", desc: "Automatización y gestión de análisis desde la terminal.", status: "Considerando" },
                        { icon: Gamepad2, title: "Mejoras Específicas Servidores de Juegos", desc: "Análisis de protocolos, detección de trampas, análisis de mods/scripts.", status: "Planificado" },
                        { icon: ShieldCheck, title: "Informes de Cumplimiento Detallados", desc: "Generación de informes formales mapeados a normativas (PDF vía Markdown).", status: "Mejorado", badgeColor: "border-blue-500 text-blue-500" },
                    ].map(item => (
                        <div key={item.title} className="flex items-start gap-3 p-3 border rounded-md bg-secondary/30">
                            <item.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div> <span className="font-semibold text-foreground">{item.title}</span> <p className="text-muted-foreground">{item.desc}</p> <Badge variant="outline" className={cn("mt-1", item.badgeColor || "border-gray-400 text-gray-500")}>{item.status}</Badge> </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </section>

          <section className="max-w-4xl mx-auto">
            {isLoadingAnalysis && (
              <div className="space-y-8 mt-8">
                <Card className="shadow-lg animate-pulse"> <CardHeader> <Skeleton className="h-8 w-1/2" /> </CardHeader> <CardContent className="space-y-4"> <Skeleton className="h-6 w-3/4 mb-4" /> <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> <Skeleton className="h-16 w-full" /> </div> <Skeleton className="h-40 w-full mt-4" /> </CardContent> </Card>
                <Card className="shadow-lg animate-pulse"> <CardHeader> <Skeleton className="h-8 w-3/4" /> <Skeleton className="h-4 w-1/2 mt-2" /> </CardHeader> <CardContent className="space-y-4"> <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-5/6" /> <Skeleton className="h-20 w-full mt-4" /> </CardContent> </Card>
              </div>
            )}

            {!isLoadingAnalysis && analysisResult && (
              <div className="space-y-8">
                <AnalysisSummaryCard result={analysisResult} />
                <VulnerabilityReportDisplay result={analysisResult} isPremiumUser={isPremium} />

                {analysisResult.attackVectors && analysisResult.attackVectors.length > 0 && isPremium && ( <> <Separator className="my-8 md:my-12" /> <AttackVectorsDisplay attackVectors={analysisResult.attackVectors as AttackVector[]} /> </> )}
                {!isPremium && analysisResult.allFindings && analysisResult.allFindings.some(f => f.isVulnerable) && session && ( <PremiumFeatureCard title="Escenarios de Ataque Ilustrativos" description="Comprenda cómo las vulnerabilidades activas identificadas podrían ser explotadas con ejemplos conceptuales." icon={Zap} isForPayPalSection={true} /> )}
                {!session && analysisResult.allFindings && analysisResult.allFindings.some(f => f.isVulnerable) && ( <PremiumFeatureCard title="Escenarios de Ataque Ilustrativos" description="Comprenda cómo las vulnerabilidades activas identificadas podrían ser explotadas con ejemplos conceptuales." icon={Zap} actionButton={<Button onClick={() => router.push('/login?redirect=/')}><LogIn className="mr-2 h-4 w-4"/>Iniciar Sesión para Ver</Button>} /> )}
                
                {analysisResult.remediationPlaybooks && analysisResult.remediationPlaybooks.length > 0 && isPremium && ( <> <Separator className="my-8 md:my-12" /> <RemediationPlaybooksDisplay playbooks={analysisResult.remediationPlaybooks} /> </> )}
                {!isPremium && analysisResult.allFindings && analysisResult.allFindings.some(f => f.isVulnerable) && session && ( <PremiumFeatureCard title="Playbooks de Remediación Sugeridos" description="Acceda a guías paso a paso generadas por IA para ayudar a corregir las vulnerabilidades detectadas." icon={FileLock2} isForPayPalSection={true} /> )}
                {!session && analysisResult.allFindings && analysisResult.allFindings.some(f => f.isVulnerable) && ( <PremiumFeatureCard title="Playbooks de Remediación Sugeridos" description="Acceda a guías paso a paso generadas por IA para ayudar a corregir las vulnerabilidades detectadas." icon={FileLock2} actionButton={<Button onClick={() => router.push('/login?redirect=/')}><LogIn className="mr-2 h-4 w-4"/>Iniciar Sesión para Ver</Button>} /> )}


                 {!isPremium && session && (analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0)) && (
                  <Card className="mt-8 shadow-lg border-l-4 border-accent bg-accent/5">
                    <CardHeader> <CardTitle className="flex items-center gap-2 text-xl text-accent"> <Unlock className="h-6 w-6" /> ¡Desbloquee el Poder Completo de la Plataforma! </CardTitle> <CardDescription className="text-muted-foreground"> Su análisis ha revelado información inicial. Complete su suscripción para una visión integral y herramientas avanzadas. </CardDescription> </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Con una suscripción premium, usted obtiene:</h3>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                           <li className="flex items-start gap-2"> <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" /> <span><strong className="text-foreground">Informe Técnico Detallado Completo</strong></span> </li>
                          <li className="flex items-start gap-2"> <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" /> <span><strong className="text-foreground">Escenarios de Ataque Ilustrativos</strong></span> </li>
                          <li className="flex items-start gap-2"> <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" /> <span><strong className="text-foreground">Playbooks de Remediación Detallados</strong></span> </li>
                          <li className="flex items-start gap-2"> <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" /> <span><strong className="text-foreground">Detalles Técnicos Exhaustivos</strong></span> </li>
                          <li className="flex items-start gap-2"> <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" /> <span><strong className="text-foreground">Descarga Completa de Resultados (ZIP)</strong></span> </li>
                        </ul>
                      </div>
                      {analysisResult.error && <p className="text-sm text-destructive mt-2">{analysisResult.error}</p>}
                      <div className="mt-6 flex flex-col items-center gap-4">
                        <p className="text-lg font-semibold text-center text-foreground"> Suscríbase para Acceso Premium </p>
                         <PayPalSmartPaymentButtons 
                             onPaymentSuccess={handlePayPalPaymentSuccess} 
                             onPaymentError={handlePayPalPaymentError} 
                             onPaymentCancel={handlePayPalPaymentCancel}
                             onLoginRequired={handleLoginForPayPal} // This should not be hit if session exists
                         />
                      </div>
                       <p className="text-xs text-muted-foreground mt-3 text-center">
                         La activación real de Premium se realiza en el backend tras confirmar el pago y actualizar su perfil de usuario en nuestra base de datos.
                       </p>
                    </CardContent>
                  </Card>
                )}

                {(analysisResult.reportText || (analysisResult.allFindings && analysisResult.allFindings.length > 0)) && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                    {isPremium && zipUrl ? ( <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"> <a href={zipUrl} download={`analisis_seguridad_${submittedTargetDescription.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0,50)}_${new Date().toISOString().split('T')[0]}.zip`}> <Download className="mr-2 h-5 w-5" /> Descargar Paquete (ZIP) </a> </Button>
                    ) : !isPremium && session && (analysisResult.allFindings && analysisResult.allFindings.length > 0) && (
                        <Tooltip> <TooltipTrigger asChild> <Button size="lg" className="bg-primary/70 text-primary-foreground w-full sm:w-auto cursor-not-allowed opacity-75" onClick={() => { /* Handled by PayPal button now */ }} > <LockIcon className="mr-2 h-5 w-5" /> Descargar Paquete (ZIP) - Requiere Suscripción </Button> </TooltipTrigger> <TooltipContent> <p>Suscríbase para descargar el paquete completo.</p> </TooltipContent> </Tooltip>
                    )}
                     {jsonExportUrl && ( <Button asChild size="lg" variant="outline" className="w-full sm:w-auto"> <a href={jsonExportUrl} download={`hallazgos_seguridad_${submittedTargetDescription.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0,50)}_${new Date().toISOString().split('T')[0]}.json`}> <FileJson className="mr-2 h-5 w-5" /> Descargar Hallazgos (JSON) </a> </Button> )}
                </div>
                 )}
                 {isPremium && zipUrl && ( <p className="text-xs text-muted-foreground mt-2 text-center"> El ZIP contiene informe, hallazgos, y (si generados) vectores de ataque y playbooks. El JSON contiene todos los hallazgos. </p> )}
                 {!isPremium && session && jsonExportUrl && ( <p className="text-xs text-muted-foreground mt-2 text-center"> El JSON contiene todos los hallazgos. Suscríbase para la descarga ZIP completa. </p> )}
                 {!session && jsonExportUrl && ( <p className="text-xs text-muted-foreground mt-2 text-center"> El JSON contiene todos los hallazgos. Inicie sesión y suscríbase para la descarga ZIP completa. </p> )}
              </div>
            )}

            {!isLoadingAnalysis && !analysisResult && (
               <Card className="mt-8 shadow-lg max-w-3xl mx-auto border-l-4 border-primary">
                <CardHeader> <CardTitle className="flex items-center gap-3 text-xl"> <ShieldCheck className="h-7 w-7 text-primary" /> Plataforma Integral de Análisis de Seguridad Asistido por IA </CardTitle> <CardDescription> Fortalezca la seguridad de sus aplicaciones web, servidores (juegos populares), bases de datos, código (SAST), aplicaciones (DAST), Cloud, Contenedores, Dependencias y Redes. </CardDescription> </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground"> Proporcione detalles de su URL, servidor, base de datos, código, URL DAST, configuración Cloud, información de contenedores, archivos de dependencias o descripción de red. Nuestro motor IA identificará vulnerabilidades y generará un informe detallado. <strong className="text-foreground">Inicie sesión y suscríbase para acceder a escenarios de ataque, detalles técnicos y playbooks de remediación.</strong></p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Globe className="mr-2 h-5 w-5 text-primary"/> Análisis Web/URL.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <ServerIcon className="mr-2 h-5 w-5 text-primary"/> Evaluación de Servidores.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Database className="mr-2 h-5 w-5 text-primary"/> Chequeo de Bases de Datos.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Gamepad2 className="mr-2 h-5 w-5 text-primary"/> Análisis Servidores de Juegos.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <SearchCode className="mr-2 h-5 w-5 text-primary"/> Análisis de Código (SAST).</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Network className="mr-2 h-5 w-5 text-primary"/> Análisis Dinámico (DAST).</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Cloud className="mr-2 h-5 w-5 text-primary"/> Análisis Config. Cloud.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <BoxIcon className="mr-2 h-5 w-5 text-primary"/> Análisis Contenedores.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <LibraryIcon className="mr-2 h-5 w-5 text-primary"/> Análisis Dependencias.</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md flex-1 bg-background hover:shadow-md transition-shadow"> <Wifi className="mr-2 h-5 w-5 text-primary"/> Análisis Config. Red.</div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-border flex flex-col items-center gap-4">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-accent" /> Suscríbase para Acceso Premium</h3>
                         <p className="text-sm text-center text-muted-foreground max-w-md"> Inicie sesión para comenzar el proceso de suscripción y desbloquear todas las funcionalidades avanzadas de nuestra plataforma. </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md"> 
                            {!session ? (
                                <Button onClick={() => router.push('/login?redirect=/')} className="w-full" size="lg"> <LogIn className="mr-2 h-5 w-5" /> Iniciar Sesión para Suscribirse </Button>
                            ) : !isPremium ? (
                                <PayPalSmartPaymentButtons 
                                    onPaymentSuccess={handlePayPalPaymentSuccess} 
                                    onPaymentError={handlePayPalPaymentError} 
                                    onPaymentCancel={handlePayPalPaymentCancel}
                                    onLoginRequired={handleLoginForPayPal}
                                />
                            ) : (
                                 <p className="text-center text-green-600 font-semibold mt-3 flex items-center gap-2"><ShieldCheck className="h-5 w-5"/> ¡Suscripción Premium Activa!</p>
                            )}
                        </div>
                         <p className="text-xs text-muted-foreground mt-3 text-center">
                           El flujo de pago de PayPal es para demostración. La activación real de Premium se haría en el backend tras confirmar el pago y actualizar su perfil de usuario en la base de datos.
                         </p>
                    </div>
                </CardContent>
               </Card>
            )}
          </section>
        </main>

        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
         <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary-foreground/50" aria-label="Abrir Asistente IA" > <Bot className="h-7 w-7" /> </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] p-0 border-0 shadow-none bg-transparent"> <ChatAssistant /> </DialogContent>
        </Dialog>

        <footer className="text-center py-6 text-sm text-muted-foreground border-t border-border">
          <p>© {new Date().getFullYear()} Centro de Análisis de Seguridad Integral. Impulsado por GenAI.</p>
          <p>Herramienta educativa y de evaluación avanzada para profesionales.</p>
          <Link href="/terms" className="text-xs text-primary hover:underline"> Términos y Condiciones </Link>
        </footer>
      </div>
    </TooltipProvider>
  );
}