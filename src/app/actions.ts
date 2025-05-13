
"use server";

import { analyzeUrlVulnerabilities } from "@/ai/flows/analyze-url-vulnerabilities";
import { analyzeServerSecurity } from "@/ai/flows/analyze-server-security";
import { analyzeDatabaseSecurity } from "@/ai/flows/analyze-database-security";
import { generateSecurityReport } from "@/ai/flows/generate-security-report";
import { generateAttackVectors } from "@/ai/flows/generate-attack-vectors";

import type {
  AnalysisResult,
  VulnerabilityFinding,
  UrlVulnerabilityAnalysisOutput,
  ServerSecurityAnalysisOutput,
  DatabaseSecurityAnalysisOutput,
  GenerateAttackVectorsInput
} from "@/types";
import type { GenerateSecurityReportInput } from "@/types/ai-schemas";

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
      error: "At least one analysis target (URL, Server Description, or Database Description) must be provided." 
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
        console.error("Error in URL analysis:", e);
        collectedErrorMessages += `URL Analysis Error: ${e.message}. `;
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
        console.error("Error in Server analysis:", e);
        collectedErrorMessages += `Server Analysis Error: ${e.message}. `;
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
        console.error("Error in Database analysis:", e);
        collectedErrorMessages += `Database Analysis Error: ${e.message}. `;
        errorOccurred = true;
      }
    }

    if (errorOccurred && allFindings.length === 0) {
       return { urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, reportText: null, attackVectors: null, error: `All analyses failed. Errors: ${collectedErrorMessages}` };
    }


    // Step 2: Generate the comprehensive report using all available structured analysis results
    const reportInput: GenerateSecurityReportInput = {
        analyzedTargetDescription: `Analysis for ${url ? `URL (${url}), ` : ''}${serverDescription ? 'Server, ' : ''}${databaseDescription ? 'Database' : ''}`.replace(/, $/, ''),
        urlAnalysis: urlAnalysisResult ?? undefined,
        serverAnalysis: serverAnalysisResult ?? undefined,
        databaseAnalysis: databaseAnalysisResult ?? undefined,
        overallVulnerableFindings: allFindings.filter(f => f.isVulnerable)
    };
    
    let reportResultText: string | null = "Report generation failed or no analysis results to report on.";
    try {
        const reportOutput = await generateSecurityReport(reportInput);
        reportResultText = reportOutput.report;
    } catch (e: any) {
        console.error("Error in generating security report:", e);
        collectedErrorMessages += `Report Generation Error: ${e.message}. `;
        errorOccurred = true; // This error might mean the main output is compromised
    }


    // Step 3: Generate attack vectors ONLY for findings marked as vulnerable from ANY source
    let attackVectorsResult: GenerateAttackVectorsInput | null = null;
    const vulnerableFindingsForAttackVectors = allFindings.filter(v => v.isVulnerable);
    if (vulnerableFindingsForAttackVectors.length > 0) {
      try {
        attackVectorsResult = await generateAttackVectors(vulnerableFindingsForAttackVectors);
      } catch (e: any) {
        console.error("Error in generating attack vectors:", e);
        collectedErrorMessages += `Attack Vector Generation Error: ${e.message}. `;
        // Don't set errorOccurred to true for this, as it's supplementary
      }
    }

    // Step 4: Return combined results
    return {
        urlAnalysis: urlAnalysisResult,
        serverAnalysis: serverAnalysisResult,
        databaseAnalysis: databaseAnalysisResult,
        reportText: reportResultText,
        attackVectors: attackVectorsResult,
        allFindings: allFindings,
        error: errorOccurred ? `One or more analysis steps failed. Partial results may be shown. Errors: ${collectedErrorMessages}` : (collectedErrorMessages ? `Minor issues occurred: ${collectedErrorMessages}`: null)
    };

  } catch (error: any) { // Catch-all for unexpected errors during orchestration
    console.error("Critical error in performAnalysisAction:", error);
    let errorMessage = "An unexpected critical error occurred during the analysis process. The AI model might be unavailable or the input could be invalid.";
     if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = "A network error occurred while trying to reach an analysis service. Please check your connection and try again.";
      } else if (error.message.includes('quota')) {
        errorMessage = "An analysis service quota has been exceeded. Please try again later.";
      } else if (error.message.toLowerCase().includes('json') || error.message.includes('Unexpected token') || error.message.includes('output.findings')) {
          errorMessage = "The AI returned an invalid or unexpected format. Please try again. If the problem persists, the model might be temporarily unavailable or misconfigured.";
      } else {
        errorMessage = `Analysis failed catastrophically: ${error.message}`;
      }
    return { urlAnalysis: null, serverAnalysis: null, databaseAnalysis: null, reportText: null, attackVectors: null, error: errorMessage, allFindings: null };
  }
}
