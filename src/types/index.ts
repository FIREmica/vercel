
import type {
  UrlVulnerabilityAnalysisOutput,
  ServerSecurityAnalysisOutput,
  DatabaseSecurityAnalysisOutput,
  VulnerabilityFinding as SingleVulnerabilityFinding,
  GenerateAttackVectorsOutput as FullGenerateAttackVectorsOutput,
  AttackVectorItem as SingleAttackVectorItem
} from "@/types/ai-schemas";

// Re-exporting the structured output from analyze-url-vulnerabilities directly
export type { UrlVulnerabilityAnalysisOutput };
export type { ServerSecurityAnalysisOutput };
export type { DatabaseSecurityAnalysisOutput };


export interface AnalysisResult {
  urlAnalysis: UrlVulnerabilityAnalysisOutput | null;
  serverAnalysis: ServerSecurityAnalysisOutput | null;
  databaseAnalysis: DatabaseSecurityAnalysisOutput | null;
  // The comprehensive report text generated from all available analyses
  reportText: string | null;
  // Attack vectors generated from any vulnerable findings across all analyses
  attackVectors: FullGenerateAttackVectorsOutput | null;
  error: string | null;
  // Combined list of all findings from all sources for easier top-level access if needed by UI
  allFindings?: SingleVulnerabilityFinding[] | null;
}

/**
 * Represents a single identified vulnerability finding from any source.
 * This type alias points to the one defined in ai-schemas.ts
 */
export type VulnerabilityFinding = SingleVulnerabilityFinding;

/**
 * Represents a single attack vector generated based on a vulnerability.
 * This type alias points to the one defined in ai-schemas.ts
 */
export type AttackVector = SingleAttackVectorItem;
