
"use server";

import { analyzeUrlVulnerabilities } from "@/ai/flows/analyze-url-vulnerabilities";
import { analyzeServerSecurity } from "@/ai/flows/analyze-server-security";
import { analyzeDatabaseSecurity } from "@/ai/flows/analyze-database-security";
import { analyzeSastSecurity } from "@/ai/flows/analyze-sast-security";
import { analyzeDastSecurity } from "@/ai/flows/analyze-dast-security";
import { generateSecurityReport } from "@/ai/flows/generate-security-report";
import { generateAttackVectors } from "@/ai/flows/generate-attack-vectors";
import { generalQueryAssistant } from "@/ai/flows/general-query-assistant-flow";

import type {
  AnalysisResult,
  VulnerabilityFinding,
  UrlVulnerabilityAnalysisOutput,
  ServerSecurityAnalysisOutput,
  DatabaseSecurityAnalysisOutput,
  SastAnalysisOutput,
  DastAnalysisOutput,
  GenerateAttackVectorsInput
} from "@/types";
import type { 
  GeneralQueryInput, 
  GenerateSecurityReportInput,
  SastAnalysisInput,
  DastAnalysisInput
} from "@/types/ai-schemas";

interface PerformAnalysisParams {
  url?: string;
  serverDescription?: string;
  databaseDescription?: string;
  codeSnippet?: string;
  sastLanguage?: string;
  dastTargetUrl?: string;
  // dastScanProfile?: "Quick" | "Full"; // This will be handled by default in DastAnalysisInputSchema
}

export async function performAnalysisAction(params: PerformAnalysisParams): Promise<AnalysisResult> {
  const { url, serverDescription, databaseDescription, codeSnippet, sastLanguage, dastTargetUrl } = params;

  if (!url && !serverDescription && !databaseDescription && !codeSnippet && !dastTargetUrl) {
    return { 
      urlAnalysis: null, 
      serverAnalysis: null, 
      databaseAnalysis: null,
      sastAnalysis: null,
      dastAnalysis: null, 
      reportText: null, 
      attackVectors: null, 
      error: "Al menos uno de los objetivos de análisis (URL, Descripción del Servidor/BD, Fragmento de Código, URL DAST) debe ser proporcionado." 
    };
  }

  let errorOccurred = false;
  let collectedErrorMessages = "";

  let urlAnalysisResult: UrlVulnerabilityAnalysisOutput | null = null;
  let serverAnalysisResult: ServerSecurityAnalysisOutput | null = null;
  let databaseAnalysisResult: DatabaseSecurityAnalysisOutput | null = null;
  let sastAnalysisResult: SastAnalysisOutput | null = null;
  let dastAnalysisResult: DastAnalysisOutput | null = null;
  
  const allFindings: VulnerabilityFinding[] = [];

  try {
    // Step 1: Perform individual analyses
    if (url) {
      try {
        urlAnalysisResult = await analyzeUrlVulnerabilities({ url });
        if (urlAnalysisResult?.findings) {
          allFindings.push(...urlAnalysisResult.findings);
        }
      } catch (e: any) {
        console.error("Error en el análisis de URL:", e);
        collectedErrorMessages += `Error en Análisis de URL: ${e.message}. `;
        errorOccurred = true;
      }
    }

    if (serverDescription) {
      try {
        serverAnalysisResult = await analyzeServerSecurity({ serverDescription });
        if (serverAnalysisResult?.findings) {
          allFindings.push(...serverAnalysisResult.findings);
        }
      } catch (e: any) {
        console.error("Error en el análisis de Servidor:", e);
        collectedErrorMessages += `Error en Análisis de Servidor: ${e.message}. `;
        errorOccurred = true;
      }
    }

    if (databaseDescription) {
      try {
        databaseAnalysisResult = await analyzeDatabaseSecurity({ databaseDescription });
        if (databaseAnalysisResult?.findings) {
          allFindings.push(...databaseAnalysisResult.findings);
        }
      } catch (e: any) {
        console.error("Error en el análisis de Base de Datos:", e);
        collectedErrorMessages += `Error en Análisis de Base de Datos: ${e.message}. `;
        errorOccurred = true;
      }
    }

    if (codeSnippet) {
      try {
        const sastInput: SastAnalysisInput = { codeSnippet };
        if (sastLanguage) sastInput.language = sastLanguage;
        sastAnalysisResult = await analyzeSastSecurity(sastInput);
        if (sastAnalysisResult?.findings) {
          allFindings.push(...sastAnalysisResult.findings);
        }
      } catch (e: any) {
        console.error("Error en el análisis SAST:", e);
        collectedErrorMessages += `Error en Análisis SAST: ${e.message}. `;
        errorOccurred = true;
      }
    }

    if (dastTargetUrl) {
      try {
        // scanProfile defaults to "Quick" in the schema if not provided
        const dastInput: DastAnalysisInput = { targetUrl: dastTargetUrl };
        dastAnalysisResult = await analyzeDastSecurity(dastInput);
        if (dastAnalysisResult?.findings) {
          allFindings.push(...dastAnalysisResult.findings);
        }
      } catch (e: any) {
        console.error("Error en el análisis DAST:", e);
        collectedErrorMessages += `Error en Análisis DAST: ${e.message}. `;
        errorOccurred = true;
      }
    }


    if (errorOccurred && allFindings.length === 0) {
       return { urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, sastAnalysis: null, dastAnalysis: null, reportText: null, attackVectors: null, error: `Todos los análisis fallaron. Errores: ${collectedErrorMessages}` };
    }

    // Step 2: Generate the comprehensive report using all available structured analysis results
    let targetDescParts = [];
    if (url) targetDescParts.push(`URL (${url})`);
    if (serverDescription) targetDescParts.push('Servidor');
    if (databaseDescription) targetDescParts.push('Base de Datos');
    if (codeSnippet) targetDescParts.push('Fragmento de Código (SAST)');
    if (dastTargetUrl) targetDescParts.push(`Aplicación en URL DAST (${dastTargetUrl})`);
    
    const reportInput: GenerateSecurityReportInput = {
        analyzedTargetDescription: `Análisis para ${targetDescParts.join(', ')}`.replace(/, $/, ''),
        urlAnalysis: urlAnalysisResult ?? undefined,
        serverAnalysis: serverAnalysisResult ?? undefined,
        databaseAnalysis: databaseAnalysisResult ?? undefined,
        sastAnalysis: sastAnalysisResult ?? undefined,
        dastAnalysis: dastAnalysisResult ?? undefined,
        overallVulnerableFindings: allFindings.filter(f => f.isVulnerable)
    };
    
    let reportResultText: string | null = "La generación del informe falló o no hay resultados de análisis para informar.";
    try {
        const reportOutput = await generateSecurityReport(reportInput);
        reportResultText = reportOutput.report;
    } catch (e: any) {
        console.error("Error al generar el informe de seguridad:", e);
        collectedErrorMessages += `Error en Generación de Informe: ${e.message}. `;
        errorOccurred = true; 
    }


    // Step 3: Generate attack vectors ONLY for findings marked as vulnerable from ANY source
    let attackVectorsResult: GenerateAttackVectorsInput | null = null; 
    const vulnerableFindingsForAttackVectors = allFindings.filter(v => v.isVulnerable);
    if (vulnerableFindingsForAttackVectors.length > 0) {
      try {
        attackVectorsResult = await generateAttackVectors(vulnerableFindingsForAttackVectors);
      } catch (e: any) {
        console.error("Error al generar vectores de ataque:", e);
        collectedErrorMessages += `Error en Generación de Vectores de Ataque: ${e.message}. `;
      }
    }

    // Step 4: Return combined results
    return {
        urlAnalysis: urlAnalysisResult,
        serverAnalysis: serverAnalysisResult,
        databaseAnalysis: databaseAnalysisResult,
        sastAnalysis: sastAnalysisResult,
        dastAnalysis: dastAnalysisResult,
        reportText: reportResultText,
        attackVectors: attackVectorsResult,
        allFindings: allFindings,
        error: errorOccurred ? `Uno o más pasos del análisis fallaron. Se pueden mostrar resultados parciales. Errores: ${collectedErrorMessages}` : (collectedErrorMessages ? `Ocurrieron problemas menores: ${collectedErrorMessages}`: null)
    };

  } catch (error: any) { 
    console.error("Error crítico en performAnalysisAction:", error);
    let errorMessage = "Ocurrió un error crítico inesperado durante el proceso de análisis. El modelo de IA podría no estar disponible o la entrada podría ser inválida.";
     if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = "Ocurrió un error de red al intentar contactar un servicio de análisis. Por favor, verifica tu conexión e inténtalo de nuevo.";
      } else if (error.message.includes('quota')) {
        errorMessage = "Se ha excedido una cuota del servicio de análisis. Por favor, inténtalo de nuevo más tarde.";
      } else if (error.message.toLowerCase().includes('json') || error.message.includes('Unexpected token') || error.message.includes('output.findings')) {
          errorMessage = "La IA devolvió un formato inválido o inesperado. Por favor, inténtalo de nuevo. Si el problema persiste, el modelo podría estar temporalmente no disponible o mal configurado.";
      } else if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "Error de Configuración del Servidor: La clave API para el servicio de Inteligencia Artificial no está configurada o no es válida. Por favor, contacte al administrador de la plataforma.";
      }
       else {
        errorMessage = `El análisis falló catastróficamente: ${error.message}`;
      }
    return { urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, sastAnalysis: null, dastAnalysis: null, reportText: null, attackVectors: null, error: errorMessage, allFindings: null };
  }
}

// Standalone action for SAST - could be used if UI had a separate SAST form
export async function performSastAnalysisAction(input: SastAnalysisInput): Promise<SastAnalysisOutput> {
    try {
        return await analyzeSastSecurity(input);
    } catch (error: any) {
        console.error("Error en performSastAnalysisAction:", error);
        return {
            findings: [],
            overallRiskAssessment: "Informational",
            executiveSummary: `Error al realizar el análisis SAST: ${error.message}`,
        };
    }
}

// Standalone action for DAST - could be used if UI had a separate DAST form
export async function performDastAnalysisAction(input: DastAnalysisInput): Promise<DastAnalysisOutput> {
    try {
        return await analyzeDastSecurity(input);
    } catch (error: any) {
        console.error("Error en performDastAnalysisAction:", error);
        return {
            findings: [],
            overallRiskAssessment: "Informational",
            executiveSummary: `Error al realizar el análisis DAST: ${error.message}`,
        };
    }
}


export async function askGeneralAssistantAction(input: GeneralQueryInput): Promise<string> {
  try {
    const result = await generalQueryAssistant(input);
    return result.aiResponse;
  } catch (error: any) {
    console.error("Error interacting with General Assistant:", error);
    return "Lo siento, no pude procesar tu pregunta en este momento. Por favor, intenta de nuevo más tarde.";
  }
}

