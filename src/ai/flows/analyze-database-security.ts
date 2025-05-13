
'use server';
/**
 * @fileOverview Analyzes a textual description of a database's configuration for potential security vulnerabilities.
 *
 * - analyzeDatabaseSecurity - A function that handles the database security analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  DatabaseConfigInputSchema,
  type DatabaseConfigInput,
  DatabaseSecurityAnalysisOutputSchema,
  type DatabaseSecurityAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeDatabaseSecurity(input: DatabaseConfigInput): Promise<DatabaseSecurityAnalysisOutput> {
  return analyzeDatabaseSecurityFlow(input);
}

// Schema for the direct output of the prompt, source will be added by the flow.
const AnalyzeDatabasePromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.omit({ source: true, potentialForAccountLockout: true })), // Source and potentialForAccountLockout added/handled by flow
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});


const analyzeDatabaseSecurityPrompt = ai.definePrompt({
  name: 'analyzeDatabaseSecurityPrompt',
  input: {schema: DatabaseConfigInputSchema},
  output: {schema: AnalyzeDatabasePromptOutputSchema},
  prompt: `You are a database security specialist with expertise in various database systems (SQL and NoSQL).
  Analyze the following database description for potential security vulnerabilities, misconfigurations, and data protection issues.

  Database Description:
  {{{databaseDescription}}}

  Task:
  1.  Identify potential security issues based *solely* on the provided description. Consider:
      - Weak authentication mechanisms if described (e.g., default passwords, no MFA).
      - Excessive privileges for database users if inferable.
      - Network exposure risks (e.g., database accessible from the internet without justification).
      - SQL Injection or NoSQL injection risks if query patterns or ORM usage descriptions are provided.
      - Lack of encryption (at rest or in transit) if mentioned or implied.
      - Outdated database versions if specified and known to have vulnerabilities.
      - Insufficient logging or auditing if mentioned.
      - Sensitive data handling issues if schema details suggest poor practices.
  2.  For each potential issue, create a finding object:
      - vulnerability: The general category (e.g., "Weak Authentication", "Excessive Privileges", "SQL Injection Risk", "Data Exposure").
      - description: A brief description of the *specific* observation from the input.
      - isVulnerable: Boolean, true if the description strongly suggests a vulnerability. Use 'false' for informational points.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - remediation: Suggested high-level remediation steps.
  3.  Provide an 'overallRiskAssessment' based on the findings: 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (2-3 sentences) of the database's security posture based on your analysis of the description.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  Do not include 'source' or 'potentialForAccountLockout' in the findings; these will be handled by the system.
  If the description is too vague or lacks actionable details for a security assessment, the findings array can be empty, risk should be 'Informational', and the summary should state that a proper assessment requires more details.
  `,
});

const analyzeDatabaseSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeDatabaseSecurityFlow',
    inputSchema: DatabaseConfigInputSchema,
    outputSchema: DatabaseSecurityAnalysisOutputSchema,
  },
  async (input): Promise<DatabaseSecurityAnalysisOutput> => {
    if (!input.databaseDescription || input.databaseDescription.trim().length < 50) {
        return {
            findings: [],
            overallRiskAssessment: "Informational",
            executiveSummary: "Database description is too brief or missing. Cannot perform a meaningful security analysis.",
        };
    }
    const { output: promptOutput } = await analyzeDatabaseSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "Database security analysis could not be completed or returned no valid data from the AI model.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Database" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Analysis of database description completed. Review findings for details.",
    };
  }
);
