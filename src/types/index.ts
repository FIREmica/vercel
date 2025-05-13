import type {
  AnalyzeVulnerabilitiesOutput as FullAnalyzeVulnerabilitiesOutput,
  VulnerabilityFinding as SingleVulnerabilityFinding,
  GenerateAttackVectorsOutput as FullGenerateAttackVectorsOutput,
  AttackVectorItem as SingleAttackVectorItem
} from "@/types/ai-schemas"; // Updated import path

// Re-exporting the structured output from analyze-vulnerabilities directly
export type AnalyzeVulnerabilitiesOutput = FullAnalyzeVulnerabilitiesOutput;

export interface AnalysisResult {
  analysis: AnalyzeVulnerabilitiesOutput | null; 
  reportText: string | null;
  attackVectors: FullGenerateAttackVectorsOutput | null; // Use the full output type
  error: string | null;
}

/**
 * Represents a single identified vulnerability finding.
 * This type alias points to the one defined in ai-schemas.ts
 */
export type VulnerabilityFinding = SingleVulnerabilityFinding;

/**
 * Represents a single attack vector generated based on a vulnerability.
 * This type alias points to the one defined in ai-schemas.ts
 */
export type AttackVector = SingleAttackVectorItem;
