
"use server";

import { analyzeUrlVulnerabilities } from "@/ai/flows/analyze-url-vulnerabilities";
import { analyzeServerSecurity } from "@/ai/flows/analyze-server-security";
import { analyzeDatabaseSecurity } from "@/ai/flows/analyze-database-security";
import { generateSecurityReport } from "@/ai/flows/generate-security-report";
import { generateAttackVectors } from "@/ai/flows/generate-attack-vectors";
import { generalQueryAssistant } from "@/ai/flows/general-query-assistant-flow";

import type {
  AnalysisResult,
  VulnerabilityFinding,
  UrlVulnerabilityAnalysisOutput,
  ServerSecurityAnalysisOutput,
  DatabaseSecurityAnalysisOutput,
  GenerateAttackVectorsInput
} from "@/types";
import type { GeneralQueryInput, GenerateSecurityReportInput } from "@/types/ai-schemas";

interface PerformAnalysisParams {
  url?: string;
  serverDescription?: string;
  databaseDescription?: string;
}

export async function performAnalysisAction(params: PerformAnalysisParams): Promise<AnalysisResult> {
  const { url, serverDescription, databaseDescription } = params;

  if (!url && !serverDescription && !databaseDescription) {
    return { 
      urlAnalysis: null, 
      serverAnalysis: null, 
      databaseAnalysis: null, 
      reportText: null, 
      attackVectors: null, 
      error: "Al menos uno de los objetivos de análisis (URL, Descripción del Servidor o Descripción de la Base de Datos) debe ser proporcionado." 
    };
  }

  let errorOccurred = false;
  let collectedErrorMessages = "";

  let urlAnalysisResult: UrlVulnerabilityAnalysisOutput | null = null;
  let serverAnalysisResult: ServerSecurityAnalysisOutput | null = null;
  let databaseAnalysisResult: DatabaseSecurityAnalysisOutput | null = null;
  
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

    if (errorOccurred && allFindings.length === 0) {
       return { urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, reportText: null, attackVectors: null, error: `Todos los análisis fallaron. Errores: ${collectedErrorMessages}` };
    }


    // Step 2: Generate the comprehensive report using all available structured analysis results
    const reportInput: GenerateSecurityReportInput = {
        analyzedTargetDescription: `Análisis para ${url ? `URL (${url}), ` : ''}${serverDescription ? 'Servidor, ' : ''}${databaseDescription ? 'Base de Datos' : ''}`.replace(/, $/, ''),
        urlAnalysis: urlAnalysisResult ?? undefined,
        serverAnalysis: serverAnalysisResult ?? undefined,
        databaseAnalysis: databaseAnalysisResult ?? undefined,
        overallVulnerableFindings: allFindings.filter(f => f.isVulnerable)
    };
    
    let reportResultText: string | null = "La generación del informe falló o no hay resultados de análisis para informar.";
    try {
        const reportOutput = await generateSecurityReport(reportInput);
        reportResultText = reportOutput.report;
    } catch (e: any) {
        console.error("Error al generar el informe de seguridad:", e);
        collectedErrorMessages += `Error en Generación de Informe: ${e.message}. `;
        errorOccurred = true; // This error might mean the main output is compromised
    }


    // Step 3: Generate attack vectors ONLY for findings marked as vulnerable from ANY source
    let attackVectorsResult: GenerateAttackVectorsInput | null = null; // This should be AttackVector[] or null
    const vulnerableFindingsForAttackVectors = allFindings.filter(v => v.isVulnerable);
    if (vulnerableFindingsForAttackVectors.length > 0) {
      try {
        // The generateAttackVectors function expects VulnerabilityFinding[] and returns AttackVector[]
        attackVectorsResult = await generateAttackVectors(vulnerableFindingsForAttackVectors);
      } catch (e: any) {
        console.error("Error al generar vectores de ataque:", e);
        collectedErrorMessages += `Error en Generación de Vectores de Ataque: ${e.message}. `;
        // Don't set errorOccurred to true for this, as it's supplementary
      }
    }

    // Step 4: Return combined results
    return {
        urlAnalysis: urlAnalysisResult,
        serverAnalysis: serverAnalysisResult,
        databaseAnalysis: databaseAnalysisResult,
        reportText: reportResultText,
        attackVectors: attackVectorsResult, // This is now AttackVector[] | null
        allFindings: allFindings,
        error: errorOccurred ? `Uno o más pasos del análisis fallaron. Se pueden mostrar resultados parciales. Errores: ${collectedErrorMessages}` : (collectedErrorMessages ? `Ocurrieron problemas menores: ${collectedErrorMessages}`: null)
    };

  } catch (error: any) { // Catch-all for unexpected errors during orchestration
    console.error("Error crítico en performAnalysisAction:", error);
    let errorMessage = "Ocurrió un error crítico inesperado durante el proceso de análisis. El modelo de IA podría no estar disponible o la entrada podría ser inválida.";
     if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = "Ocurrió un error de red al intentar contactar un servicio de análisis. Por favor, verifica tu conexión e inténtalo de nuevo.";
      } else if (error.message.includes('quota')) {
        errorMessage = "Se ha excedido una cuota del servicio de análisis. Por favor, inténtalo de nuevo más tarde.";
      } else if (error.message.toLowerCase().includes('json') || error.message.includes('Unexpected token') || error.message.includes('output.findings')) {
          errorMessage = "La IA devolvió un formato inválido o inesperado. Por favor, inténtalo de nuevo. Si el problema persiste, el modelo podría estar temporalmente no disponible o mal configurado.";
      } else {
        errorMessage = `El análisis falló catastróficamente: ${error.message}`;
      }
    return { urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, reportText: null, attackVectors: null, error: errorMessage, allFindings: null };
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
