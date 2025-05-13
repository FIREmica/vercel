import type { AnalyzeVulnerabilitiesOutput } from "@/ai/flows/analyze-vulnerabilities";
import type { GenerateAttackVectorsOutput } from "@/ai/flows/generate-attack-vectors";

export interface AnalysisResult {
  vulnerabilities: AnalyzeVulnerabilitiesOutput | null;
  reportText: string | null;
  attackVectors: GenerateAttackVectorsOutput | null;
  error: string | null;
}

/**
 * Represents a single identified vulnerability from the analyzeVulnerabilities flow.
 */
export type Vulnerability = {
  vulnerability: string;
  isVulnerable: boolean;
  potentialForAccountLockout: boolean;
  remediation: string;
};

/**
 * Represents a single attack vector generated based on a vulnerability.
 */
export type AttackVector = {
  vulnerabilityName: string;
  attackScenarioDescription: string;
  examplePayloadOrTechnique: string;
  expectedOutcomeIfSuccessful: string;
};
