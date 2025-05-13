
'use server';
/**
 * @fileOverview Analyzes a textual description of a server's configuration for potential security vulnerabilities.
 *
 * - analyzeServerSecurity - A function that handles the server security analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  ServerConfigInputSchema,
  type ServerConfigInput,
  ServerSecurityAnalysisOutputSchema,
  type ServerSecurityAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeServerSecurity(input: ServerConfigInput): Promise<ServerSecurityAnalysisOutput> {
  return analyzeServerSecurityFlow(input);
}

// Schema for the direct output of the prompt, source will be added by the flow.
const AnalyzeServerPromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.omit({ source: true, potentialForAccountLockout: true })), // Source and potentialForAccountLockout added/handled by flow
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeServerSecurityPrompt = ai.definePrompt({
  name: 'analyzeServerSecurityPrompt',
  input: {schema: ServerConfigInputSchema},
  output: {schema: AnalyzeServerPromptOutputSchema},
  prompt: `You are a senior cybersecurity architect specializing in server and infrastructure hardening.
  Analyze the following server description for potential security vulnerabilities, misconfigurations, and areas for improvement.

  Server Description:
  {{{serverDescription}}}

  Task:
  1.  Identify potential security issues based *solely* on the provided description. Consider:
      - Outdated OS or software versions if mentioned.
      - Unnecessary or insecure services exposed (based on open ports or service list).
      - Weak configurations if inferable (e.g., default credentials mentioned, lack of HTTPS on web services).
      - Missing security best practices (e.g., lack of firewall, no mention of security patching).
      - Common vulnerabilities associated with the described technologies (e.g., known Apache vulnerabilities for a given version if stated).
  2.  For each potential issue, create a finding object:
      - vulnerability: The general category (e.g., "Outdated OS", "Exposed Insecure Service", "Weak Configuration", "Missing Security Patching").
      - description: A brief description of the *specific* observation from the input.
      - isVulnerable: Boolean, true if the description strongly suggests a vulnerability. Use 'false' for informational points or general recommendations if no direct vulnerability is evident from the text.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - remediation: Suggested high-level remediation steps.
  3.  Provide an 'overallRiskAssessment' based on the findings: 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (2-3 sentences) of the server's security posture based on your analysis of the description.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  Do not include 'source' or 'potentialForAccountLockout' in the findings; these will be handled by the system.
  If the description is too vague or lacks actionable details for a security assessment, findings array can be empty, risk should be 'Informational', and summary should state that a proper assessment requires more details.
  `,
});

const analyzeServerSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeServerSecurityFlow',
    inputSchema: ServerConfigInputSchema,
    outputSchema: ServerSecurityAnalysisOutputSchema,
  },
  async (input): Promise<ServerSecurityAnalysisOutput> => {
    if (!input.serverDescription || input.serverDescription.trim().length < 50) {
        return {
            findings: [],
            overallRiskAssessment: "Informational",
            executiveSummary: "Server description is too brief or missing. Cannot perform a meaningful security analysis.",
        };
    }
    const { output: promptOutput } = await analyzeServerSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "Server security analysis could not be completed or returned no valid data from the AI model.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Server" as const,
      // potentialForAccountLockout is not typically relevant for general server findings unless specified
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Analysis of server description completed. Review findings for details.",
    };
  }
);
