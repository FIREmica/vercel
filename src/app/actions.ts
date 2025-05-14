"use server";

import { analyzeUrlVulnerabilities } from "@/ai/flows/analyze-url-vulnerabilities";
import { analyzeServerSecurity } from "@/ai/flows/analyze-server-security";
import { analyzeDatabaseSecurity } from "@/ai/flows/analyze-database-security";
import { analyzeSastSecurity } from "@/ai/flows/analyze-sast-security";
import { analyzeDastSecurity } from "@/ai/flows/analyze-dast-security";
import { analyzeCloudConfig } from "@/ai/flows/analyze-cloud-config";
import { analyzeContainerSecurity } from "@/ai/flows/analyze-container-security";
import { analyzeDependencies } from "@/ai/flows/analyze-dependencies";
import { generateSecurityReport } from "@/ai/flows/generate-security-report";
import { generateAttackVectors } from "@/ai/flows/generate-attack-vectors";
import { generalQueryAssistant } from "@/ai/flows/general-query-assistant-flow";
import { generateRemediationPlaybook } from "@/ai/flows/generate-remediation-playbook";

import type {
  AnalysisResult,
  VulnerabilityFinding,
  UrlVulnerabilityAnalysisOutput,
  ServerSecurityAnalysisOutput,
  DatabaseSecurityAnalysisOutput,
  SastAnalysisOutput,
  DastAnalysisOutput,
  CloudConfigAnalysisOutput,
  ContainerAnalysisOutput,
  DependencyAnalysisOutput,
  GenerateAttackVectorsInput, // This is an array of VulnerabilityFinding
  RemediationPlaybookOutput
} from "@/types";
import type { 
  GeneralQueryInput, 
  GenerateSecurityReportInput,
  SastAnalysisInput,
  DastAnalysisInput,
  CloudConfigInput,
  ContainerAnalysisInput,
  DependencyAnalysisInput,
  RemediationPlaybookInput,
} from "@/types/ai-schemas";

interface PerformAnalysisParams {
  url?: string;
  serverDescription?: string;
  databaseDescription?: string;
  codeSnippet?: string;
  sastLanguage?: string;
  dastTargetUrl?: string;
  cloudProvider?: "AWS" | "Azure" | "GCP" | "Other";
  cloudConfigDescription?: string;
  containerImageName?: string;
  dockerfileContent?: string;
  kubernetesManifestContent?: string;
  dependencyFileContent?: string;
  dependencyFileType?: "npm" | "pip" | "maven" | "gem" | "other";
}

export async function performAnalysisAction(params: PerformAnalysisParams, isPremium: boolean): Promise<AnalysisResult> {
  const { 
    url, serverDescription, databaseDescription, 
    codeSnippet, sastLanguage, dastTargetUrl,
    cloudProvider, cloudConfigDescription,
    containerImageName, dockerfileContent, kubernetesManifestContent,
    dependencyFileContent, dependencyFileType
  } = params;

  if (!url && !serverDescription && !databaseDescription && !codeSnippet && !dastTargetUrl && !cloudConfigDescription && (!containerImageName && !dockerfileContent && !kubernetesManifestContent) && !dependencyFileContent) {
    return { 
      urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null,
      sastAnalysis: null, dastAnalysis: null, 
      cloudAnalysis: null, containerAnalysis: null, dependencyAnalysis: null,
      reportText: null, attackVectors: null, remediationPlaybooks: null,
      error: "Al menos uno de los objetivos de análisis debe ser proporcionado." 
    };
  }

  let errorOccurred = false;
  let collectedErrorMessages = "";

  let urlAnalysisResult: UrlVulnerabilityAnalysisOutput | null = null;
  let serverAnalysisResult: ServerSecurityAnalysisOutput | null = null;
  let databaseAnalysisResult: DatabaseSecurityAnalysisOutput | null = null;
  let sastAnalysisResult: SastAnalysisOutput | null = null;
  let dastAnalysisResult: DastAnalysisOutput | null = null;
  let cloudAnalysisResult: CloudConfigAnalysisOutput | null = null;
  let containerAnalysisResult: ContainerAnalysisOutput | null = null;
  let dependencyAnalysisResult: DependencyAnalysisOutput | null = null;
  
  const allFindings: VulnerabilityFinding[] = [];

  try {
    // Step 1: Perform individual analyses
    if (url) {
      try {
        urlAnalysisResult = await analyzeUrlVulnerabilities({ url });
        if (urlAnalysisResult?.findings) allFindings.push(...urlAnalysisResult.findings);
      } catch (e: any) { collectedErrorMessages += `URL: ${e.message}. `; errorOccurred = true; }
    }

    if (serverDescription) {
      try {
        serverAnalysisResult = await analyzeServerSecurity({ serverDescription });
        if (serverAnalysisResult?.findings) allFindings.push(...serverAnalysisResult.findings);
      } catch (e: any) { collectedErrorMessages += `Servidor: ${e.message}. `; errorOccurred = true; }
    }

    if (databaseDescription) {
      try {
        databaseAnalysisResult = await analyzeDatabaseSecurity({ databaseDescription });
        if (databaseAnalysisResult?.findings) allFindings.push(...databaseAnalysisResult.findings);
      } catch (e: any) { collectedErrorMessages += `BD: ${e.message}. `; errorOccurred = true; }
    }

    if (codeSnippet) {
      try {
        const sastInput: SastAnalysisInput = { codeSnippet };
        if (sastLanguage) sastInput.language = sastLanguage;
        sastAnalysisResult = await analyzeSastSecurity(sastInput);
        if (sastAnalysisResult?.findings) allFindings.push(...sastAnalysisResult.findings);
      } catch (e: any) { collectedErrorMessages += `SAST: ${e.message}. `; errorOccurred = true; }
    }

    if (dastTargetUrl) {
      try {
        const dastInput: DastAnalysisInput = { targetUrl: dastTargetUrl };
        dastAnalysisResult = await analyzeDastSecurity(dastInput);
        if (dastAnalysisResult?.findings) allFindings.push(...dastAnalysisResult.findings);
      } catch (e: any) { collectedErrorMessages += `DAST: ${e.message}. `; errorOccurred = true; }
    }

    if (cloudConfigDescription && cloudProvider) {
      try {
        const cloudInput: CloudConfigInput = { provider: cloudProvider, configDescription: cloudConfigDescription };
        cloudAnalysisResult = await analyzeCloudConfig(cloudInput);
        if (cloudAnalysisResult?.findings) allFindings.push(...cloudAnalysisResult.findings);
      } catch (e: any) { collectedErrorMessages += `Cloud: ${e.message}. `; errorOccurred = true; }
    }

    if (containerImageName || dockerfileContent || kubernetesManifestContent) {
      try {
        const containerInput: ContainerAnalysisInput = {};
        if (containerImageName) containerInput.imageName = containerImageName;
        if (dockerfileContent) containerInput.dockerfileContent = dockerfileContent;
        if (kubernetesManifestContent) containerInput.kubernetesManifestContent = kubernetesManifestContent;
        
        // Check if any actual value was provided to avoid calling flow with empty object if logic error in UI
        if(Object.keys(containerInput).length > 0) {
            containerAnalysisResult = await analyzeContainerSecurity(containerInput);
            if (containerAnalysisResult?.findings) allFindings.push(...containerAnalysisResult.findings);
        }
      } catch (e: any) { collectedErrorMessages += `Contenedor: ${e.message}. `; errorOccurred = true; }
    }

    if (dependencyFileContent && dependencyFileType) {
      try {
        const depInput: DependencyAnalysisInput = { dependencyFileContent, fileType: dependencyFileType };
        dependencyAnalysisResult = await analyzeDependencies(depInput);
        if (dependencyAnalysisResult?.findings) allFindings.push(...dependencyAnalysisResult.findings);
      } catch (e: any) { collectedErrorMessages += `Dependencias: ${e.message}. `; errorOccurred = true; }
    }

    if (errorOccurred && allFindings.length === 0) {
       return { 
         urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, sastAnalysis: null, dastAnalysis: null, 
         cloudAnalysis: null, containerAnalysis: null, dependencyAnalysis: null,
         reportText: null, attackVectors: null, remediationPlaybooks: null, 
         error: `Todos los análisis fallaron. Errores: ${collectedErrorMessages}` 
       };
    }

    // Step 2: Generate the comprehensive report
    let targetDescParts = [];
    if (url) targetDescParts.push(`URL (${url})`);
    if (serverDescription) targetDescParts.push('Servidor');
    if (databaseDescription) targetDescParts.push('Base de Datos');
    if (codeSnippet) targetDescParts.push('Fragmento de Código (SAST)');
    if (dastTargetUrl) targetDescParts.push(`Aplicación URL DAST (${dastTargetUrl})`);
    if (cloudConfigDescription) targetDescParts.push(`Configuración Cloud (${cloudProvider})`);
    if (containerImageName || dockerfileContent || kubernetesManifestContent) targetDescParts.push('Contenedor/K8s');
    if (dependencyFileContent) targetDescParts.push('Dependencias de Software');
    
    const reportInput: GenerateSecurityReportInput = {
        analyzedTargetDescription: `Análisis para ${targetDescParts.join(', ')}`.replace(/, $/, ''),
        urlAnalysis: urlAnalysisResult ?? undefined,
        serverAnalysis: serverAnalysisResult ?? undefined,
        databaseAnalysis: databaseAnalysisResult ?? undefined,
        sastAnalysis: sastAnalysisResult ?? undefined,
        dastAnalysis: dastAnalysisResult ?? undefined,
        cloudAnalysis: cloudAnalysisResult ?? undefined,
        containerAnalysis: containerAnalysisResult ?? undefined,
        dependencyAnalysis: dependencyAnalysisResult ?? undefined,
        overallVulnerableFindings: allFindings.filter(f => f.isVulnerable)
    };
    
    let reportResultText: string | null = "La generación del informe falló o no hay resultados de análisis para informar.";
    try {
        const reportOutput = await generateSecurityReport(reportInput);
        reportResultText = reportOutput.report;
    } catch (e: any) {
        collectedErrorMessages += `Informe: ${e.message}. `;
        errorOccurred = true; 
    }

    // Step 3 & 4: Generate attack vectors and remediation playbooks (Premium Features)
    let attackVectorsResult: GenerateAttackVectorsInput | null = null; 
    let remediationPlaybooksResult: RemediationPlaybookOutput[] = [];
    const vulnerableFindingsForPremium = allFindings.filter(v => v.isVulnerable);

    if (isPremium && vulnerableFindingsForPremium.length > 0) {
      try {
        attackVectorsResult = await generateAttackVectors(vulnerableFindingsForPremium);
      } catch (e: any) {
        collectedErrorMessages += `Vectores de Ataque: ${e.message}. `;
      }
      
      try {
        for (const finding of vulnerableFindingsForPremium) {
          const playbookInput: RemediationPlaybookInput = { vulnerabilityFinding: finding };
          const playbook = await generateRemediationPlaybook(playbookInput);
          remediationPlaybooksResult.push(playbook);
        }
      } catch (e: any) {
         collectedErrorMessages += `Playbooks Remediación: ${e.message}. `;
      }
    }

    // Step 5: Return combined results
    return {
        urlAnalysis: urlAnalysisResult,
        serverAnalysis: serverAnalysisResult,
        databaseAnalysis: databaseAnalysisResult,
        sastAnalysis: sastAnalysisResult,
        dastAnalysis: dastAnalysisResult,
        cloudAnalysis: cloudAnalysisResult,
        containerAnalysis: containerAnalysisResult,
        dependencyAnalysis: dependencyAnalysisResult,
        reportText: reportResultText,
        attackVectors: attackVectorsResult,
        remediationPlaybooks: remediationPlaybooksResult.length > 0 ? remediationPlaybooksResult : null,
        allFindings: allFindings,
        error: errorOccurred ? `Uno o más pasos del análisis fallaron. Se pueden mostrar resultados parciales. Errores: ${collectedErrorMessages}` : (collectedErrorMessages ? `Ocurrieron problemas menores: ${collectedErrorMessages}`: null)
    };

  } catch (error: any) { 
    console.error("Error crítico en performAnalysisAction:", error);
    let errorMessage = "Ocurrió un error crítico inesperado durante el proceso de análisis. El modelo de IA podría no estar disponible o la entrada podría ser inválida.";
     if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "Error de Configuración del Servidor: La clave API para el servicio de Inteligencia Artificial no está configurada o no es válida. Por favor, contacte al administrador de la plataforma.";
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = "Ocurrió un error de red al intentar contactar un servicio de análisis. Por favor, verifica tu conexión e inténtalo de nuevo.";
      } else if (error.message.includes('quota')) {
        errorMessage = "Se ha excedido una cuota del servicio de análisis. Por favor, inténtalo de nuevo más tarde.";
      } else if (error.message.toLowerCase().includes('json') || error.message.includes('Unexpected token') || error.message.includes('output.findings')) {
          errorMessage = "La IA devolvió un formato inválido o inesperado. Por favor, inténtalo de nuevo. Si el problema persiste, el modelo podría estar temporalmente no disponible o mal configurado.";
      } else {
        errorMessage = `El análisis falló catastróficamente: ${error.message}`;
      }
    return { 
      urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, sastAnalysis: null, dastAnalysis: null, 
      cloudAnalysis: null, containerAnalysis: null, dependencyAnalysis: null,
      reportText: null, attackVectors: null, remediationPlaybooks: null, error: errorMessage, allFindings: null 
    };
  }
}

export async function askGeneralAssistantAction(input: GeneralQueryInput): Promise<string> {
  try {
    const result = await generalQueryAssistant(input);
    return result.aiResponse;
  } catch (error: any) {
    console.error("Error interacting with General Assistant:", error);
    let errorMessage = "Lo siento, no pude procesar tu pregunta en este momento. Por favor, intenta de nuevo más tarde.";
    if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "Error de Configuración del Asistente: La clave API para el servicio de Inteligencia Artificial no está configurada o no es válida. Por favor, contacte al administrador de la plataforma.";
    }
    return errorMessage;
  }
}