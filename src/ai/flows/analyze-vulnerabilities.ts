'use server';

/**
 * @fileOverview Analyzes a user registration page URL for common web application vulnerabilities.
 *
 * - analyzeVulnerabilities - A function that handles the vulnerability analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  AnalyzeVulnerabilitiesInputSchema,
  type AnalyzeVulnerabilitiesInput,
  AnalyzeVulnerabilitiesOutputSchema,
  type AnalyzeVulnerabilitiesOutput,
  VulnerabilityFindingSchema,
  // type VulnerabilityFinding // Not directly exported, but its schema is used.
} from '@/types/ai-schemas';


export async function analyzeVulnerabilities(input: AnalyzeVulnerabilitiesInput): Promise<AnalyzeVulnerabilitiesOutput> {
  return analyzeVulnerabilitiesFlow(input);
}

// This schema is specific to the prompt's direct output, before flow adds calculated fields.
const AnalyzeVulnerabilitiesPromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema), // Uses imported VulnerabilityFindingSchema
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeVulnerabilitiesPrompt = ai.definePrompt({
  name: 'analyzeVulnerabilitiesPrompt',
  input: {schema: AnalyzeVulnerabilitiesInputSchema},
  output: {schema: AnalyzeVulnerabilitiesPromptOutputSchema},
  prompt: `You are a security expert analyzing user registration pages for common web application vulnerabilities.

  Analyze the provided URL: {{{url}}}

  Task:
  1.  Identify potential vulnerabilities focusing on the context of a user registration process. Consider common risks including, but not limited to:
      - Cross-Site Scripting (XSS)
      - SQL Injection (SQLi)
      - Weak Password Policies
      - Lack of Rate Limiting (on registration attempts, password resets)
      - Missing or Weak CAPTCHA
      - Information Disclosure (e.g., verbose error messages, user enumeration)
      - Insecure Configuration (e.g., exposed directories, default credentials - if observable)
      - Input Validation Issues (beyond XSS/SQLi)
  2.  For each potential issue, create a finding object with:
      - vulnerability: The general category (e.g., "Cross-Site Scripting (XSS)", "Rate Limiting").
      - description: A brief description of the *specific* observation or finding.
      - isVulnerable: Boolean, true if the URL appears vulnerable to this *specific* finding.
      - severity: 'Low', 'Medium', 'High', or 'Informational'.
      - potentialForAccountLockout: Boolean, ONLY if this *specific* finding could *directly* lead to or facilitate account lockouts.
      - remediation: Suggested high-level remediation steps.
  3.  Based on all findings, provide an 'overallRiskAssessment': 'Critical' (if multiple High severity vulnerable findings or one High with significant impact), 'High' (if at least one High severity vulnerable finding), 'Medium' (if Medium severity vulnerable findings exist without any High), 'Low' (if only Low severity vulnerable findings), or 'Informational' (if no active vulnerabilities are found, only informational findings).
  4.  Write a concise 'executiveSummary' (2-3 sentences) of the page's security posture, highlighting the most critical risks if any. If no active vulnerabilities, state that.

  Output Format:
  Return a JSON object with three top-level keys: "findings" (an array of finding objects as described above), "overallRiskAssessment" (string enum), and "executiveSummary" (string).

  Focus on vulnerabilities observable or inferable from the registration page.
  If no specific vulnerabilities are confidently identified, "findings" should be an empty array, "overallRiskAssessment" should be "Informational", and "executiveSummary" should reflect this.
  `,
});

const analyzeVulnerabilitiesFlow = ai.defineFlow(
  {
    name: 'analyzeVulnerabilitiesFlow',
    inputSchema: AnalyzeVulnerabilitiesInputSchema,
    outputSchema: AnalyzeVulnerabilitiesOutputSchema, // The full schema including calculated counts
  },
  async (input): Promise<AnalyzeVulnerabilitiesOutput> => {
    const { output } = await analyzeVulnerabilitiesPrompt(input);

    if (!output) {
      // Handle cases where AI output is null or undefined
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "Analysis could not be completed or returned no valid data from the AI model.",
        vulnerableFindingsCount: 0,
        highSeverityCount: 0,
        mediumSeverityCount: 0,
        lowSeverityCount: 0,
      };
    }
    
    const findings = Array.isArray(output.findings) ? output.findings : [];
    
    const vulnerableFindings = findings.filter(f => f.isVulnerable);
    const vulnerableFindingsCount = vulnerableFindings.length;
    const highSeverityCount = vulnerableFindings.filter(f => f.severity === 'High').length;
    const mediumSeverityCount = vulnerableFindings.filter(f => f.severity === 'Medium').length;
    const lowSeverityCount = vulnerableFindings.filter(f => f.severity === 'Low').length;

    // Ensure overallRiskAssessment and executiveSummary are present, even if AI fails to provide them
    const overallRiskAssessment = output.overallRiskAssessment || (vulnerableFindingsCount > 0 ? "Medium" : "Informational");
    const executiveSummary = output.executiveSummary || (vulnerableFindingsCount > 0 ? "Vulnerabilities were identified. Please review the findings." : "No active vulnerabilities were identified in this scan.");


    return {
      findings: findings,
      overallRiskAssessment: overallRiskAssessment,
      executiveSummary: executiveSummary,
      vulnerableFindingsCount: vulnerableFindingsCount,
      highSeverityCount: highSeverityCount,
      mediumSeverityCount: mediumSeverityCount,
      lowSeverityCount: lowSeverityCount,
    };
  }
);
