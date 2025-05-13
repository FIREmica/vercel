import type { AnalyzeVulnerabilitiesOutput } from "@/ai/flows/analyze-vulnerabilities";

export interface AnalysisResult {
  vulnerabilities: AnalyzeVulnerabilitiesOutput | null;
  reportText: string | null;
  error: string | null;
}
