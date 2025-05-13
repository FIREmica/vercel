"use server";

import { analyzeVulnerabilities } from "@/ai/flows/analyze-vulnerabilities";
import { generateVulnerabilityReport } from "@/ai/flows/generate-vulnerability-report";
import { generateAttackVectors } from "@/ai/flows/generate-attack-vectors";

// Import types from the main types entry point
import type { 
  AnalysisResult, 
  VulnerabilityFinding, 
  AnalyzeVulnerabilitiesOutput, 
  GenerateAttackVectorsOutput,
  GenerateAttackVectorsInput // Import if needed, though it's constructed internally
} from "@/types";
import type { GenerateVulnerabilityReportInput } from "@/types/ai-schemas"; // Specific input type for report generation

export async function performAnalysisAction(url: string): Promise<AnalysisResult> {
  if (!url) {
    return { analysis: null, reportText: null, attackVectors: null, error: "URL cannot be empty." };
  }

  try {
    // Step 1: Analyze for vulnerabilities (returns structured object)
    const analysisResults: AnalyzeVulnerabilitiesOutput | null = await analyzeVulnerabilities({ url });

    if (!analysisResults) {
      // This case should ideally be handled within analyzeVulnerabilitiesFlow to return a default structure
      return { analysis: null, reportText: null, attackVectors: null, error: "Vulnerability analysis failed to return results." };
    }

    // Step 2: Generate the comprehensive report using structured analysis results
    const reportInput: GenerateVulnerabilityReportInput = { // Use the specific input type
        url: url,
        analysisResults: {
            findings: analysisResults.findings,
            overallRiskAssessment: analysisResults.overallRiskAssessment,
            executiveSummaryFromScan: analysisResults.executiveSummary, 
            vulnerableFindingsCount: analysisResults.vulnerableFindingsCount,
            highSeverityCount: analysisResults.highSeverityCount,
            mediumSeverityCount: analysisResults.mediumSeverityCount,
            lowSeverityCount: analysisResults.lowSeverityCount,
        }
    };
    const reportResult = await generateVulnerabilityReport(reportInput);

    // Step 3: Generate attack vectors ONLY for findings marked as vulnerable
    let attackVectorsResult: GenerateAttackVectorsOutput | null = null; // Renamed to avoid conflict
    if (analysisResults.findings && analysisResults.findings.length > 0) {
        const vulnerableFindingsForAttackVectors: VulnerabilityFinding[] = analysisResults.findings.filter(v => v.isVulnerable);
        if (vulnerableFindingsForAttackVectors.length > 0) {
            // The input to generateAttackVectors is directly an array of VulnerabilityFinding objects (matching its input schema)
            attackVectorsResult = await generateAttackVectors(vulnerableFindingsForAttackVectors);
        }
    }

    // Step 4: Return combined results
    return {
        analysis: analysisResults, 
        reportText: reportResult.report,
        attackVectors: attackVectorsResult, 
        error: null
    };

  } catch (error) {
    console.error("Error in performAnalysisAction:", error);
    let errorMessage = "An unexpected error occurred during analysis. The AI model might be unavailable or the input could be invalid.";
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = "A network error occurred while trying to reach the analysis service. Please check your connection and try again.";
      } else if (error.message.includes('quota')) {
        errorMessage = "The analysis service quota has been exceeded. Please try again later.";
      } else if (error.message.includes('JSON') || error.message.includes('Unexpected token') || error.message.includes('output.findings')) {
          errorMessage = "The AI returned an invalid or unexpected format. Please try again. If the problem persists, the model might be temporarily unavailable or misconfigured.";
      }
      else {
        errorMessage = `Analysis failed: ${error.message}`;
      }
    }
    return { analysis: null, reportText: null, attackVectors: null, error: errorMessage };
  }
}
