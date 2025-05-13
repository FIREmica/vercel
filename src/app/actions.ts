"use server";

import { analyzeVulnerabilities, type AnalyzeVulnerabilitiesOutput } from "@/ai/flows/analyze-vulnerabilities";
import { generateVulnerabilityReport } from "@/ai/flows/generate-vulnerability-report";
import type { AnalysisResult } from "@/types";

export async function performAnalysisAction(url: string): Promise<AnalysisResult> {
  if (!url) {
    return { vulnerabilities: null, reportText: null, error: "URL cannot be empty." };
  }

  try {
    const vulnerabilities = await analyzeVulnerabilities({ url });

    let analysisSummaryForReport: string;
    if (vulnerabilities && vulnerabilities.length > 0) {
      analysisSummaryForReport = `Analysis of ${url} found the following potential issues:\n\n${vulnerabilities
        .map(
          (v, i) =>
            `${i + 1}. Vulnerability: ${v.vulnerability}\n   - Detected: ${v.isVulnerable}\n   - Potential for Account Lockout: ${v.potentialForAccountLockout}\n   - Remediation: ${v.remediation}`
        )
        .join("\n\n")}`;
    } else {
      analysisSummaryForReport = `Initial scan of ${url} found no specific vulnerabilities that typically lead to account lockouts. However, a general security review is always recommended.`;
    }
    
    const reportResult = await generateVulnerabilityReport({ analysis: analysisSummaryForReport });
    
    return { vulnerabilities, reportText: reportResult.report, error: null };

  } catch (error) {
    console.error("Error in performAnalysisAction:", error);
    let errorMessage = "An unexpected error occurred during analysis. The AI model might be unavailable or the input could be invalid.";
    if (error instanceof Error) {
      // Check for specific Genkit or network-related error messages if possible
      if (error.message.includes('fetch')) {
        errorMessage = "A network error occurred while trying to reach the analysis service. Please check your connection and try again.";
      } else if (error.message.includes('quota')) {
        errorMessage = "The analysis service quota has been exceeded. Please try again later.";
      } else {
        errorMessage = error.message;
      }
    }
    return { vulnerabilities: null, reportText: null, error: errorMessage };
  }
}
