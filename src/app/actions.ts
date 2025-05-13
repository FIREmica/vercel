"use server";

import { analyzeVulnerabilities, type AnalyzeVulnerabilitiesOutput } from "@/ai/flows/analyze-vulnerabilities";
import { generateVulnerabilityReport } from "@/ai/flows/generate-vulnerability-report";
import { generateAttackVectors, type GenerateAttackVectorsOutput } from "@/ai/flows/generate-attack-vectors";
import type { AnalysisResult, Vulnerability } from "@/types"; // Import Vulnerability type

export async function performAnalysisAction(url: string): Promise<AnalysisResult> {
  if (!url) {
    return { vulnerabilities: null, reportText: null, attackVectors: null, error: "URL cannot be empty." };
  }

  try {
    // Step 1: Analyze for vulnerabilities (broader scope)
    const vulnerabilities: AnalyzeVulnerabilitiesOutput | null = await analyzeVulnerabilities({ url });

    // Step 2: Prepare summary for the report generation flow
    let analysisSummaryForReport: string;
    if (vulnerabilities && vulnerabilities.length > 0) {
       const vulnerableFindings = vulnerabilities.filter(v => v.isVulnerable);
       if (vulnerableFindings.length > 0) {
         analysisSummaryForReport = `Analysis of ${url} found the following potential issues:\n\n${vulnerabilities // Include all findings in the summary for the report AI
           .map(
             (v: Vulnerability, i: number) => // Use Vulnerability type
               `${i + 1}. Category: ${v.vulnerability}\n` +
               `   - Finding: ${v.description}\n` +
               `   - Detected: ${v.isVulnerable}\n` +
               `   - Severity: ${v.severity}\n` +
               `   - Potential for Account Lockout: ${v.potentialForAccountLockout}\n` +
               `   - Remediation: ${v.remediation}`
           )
           .join("\n\n")}`;
       } else {
           analysisSummaryForReport = `Scan of ${url} completed. No specific vulnerabilities were detected based on the performed checks. A general security review is always recommended.`;
       }
    } else if (vulnerabilities?.length === 0){
         analysisSummaryForReport = `Scan of ${url} completed. No specific vulnerabilities were detected based on the performed checks. A general security review is always recommended.`;
    }
     else {
      // Handle case where vulnerabilities is null (error occurred in analysis)
      analysisSummaryForReport = `Analysis of ${url} could not be completed or returned no results.`;
       // We might return early here or let report generation handle it
       // For now, let's allow report generation to proceed and state no findings.
    }

    // Step 3: Generate the comprehensive report
    const reportResult = await generateVulnerabilityReport({
      url: url, // Pass URL to the report generator
      analysisSummary: analysisSummaryForReport
    });

    // Step 4: Generate attack vectors ONLY for findings marked as vulnerable
    let attackVectors: GenerateAttackVectorsOutput | null = null;
    if (vulnerabilities && vulnerabilities.length > 0) {
        // Filter specifically for findings where isVulnerable is true
        const vulnerableFindingsForAttackVectors = vulnerabilities.filter(v => v.isVulnerable);
        if (vulnerableFindingsForAttackVectors.length > 0) {
            // Pass the detailed vulnerable findings to the attack vector generator
            attackVectors = await generateAttackVectors(vulnerableFindingsForAttackVectors);
        }
    }

    // Step 5: Return combined results
    return {
        vulnerabilities, // Return the full list of findings (vulnerable or not)
        reportText: reportResult.report,
        attackVectors, // Only includes vectors for isVulnerable=true findings
        error: null
    };

  } catch (error) {
    console.error("Error in performAnalysisAction:", error);
    let errorMessage = "An unexpected error occurred during analysis. The AI model might be unavailable or the input could be invalid.";
    if (error instanceof Error) {
      // Check for specific Genkit or network-related error messages if possible
      if (error.message.includes('fetch')) {
        errorMessage = "A network error occurred while trying to reach the analysis service. Please check your connection and try again.";
      } else if (error.message.includes('quota')) {
        errorMessage = "The analysis service quota has been exceeded. Please try again later.";
      } else if (error.message.includes('JSON')) {
          errorMessage = "The AI returned an invalid format. Please try again.";
      }
      else {
        // Use the specific error message if available and not too generic
        errorMessage = `Analysis failed: ${error.message}`;
      }
    }
    return { vulnerabilities: null, reportText: null, attackVectors: null, error: errorMessage };
  }
}
