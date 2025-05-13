
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
  prompt: `You are a database security specialist with expertise in various database systems (SQL and NoSQL), focusing on enterprise security best practices.
  Analyze the following database description for potential security vulnerabilities, misconfigurations, and data protection issues.

  Database Description:
  {{{databaseDescription}}}

  Task:
  1.  Identify potential security issues based *solely* on the provided description. Consider:
      - **Authentication & Authorization:** Weak authentication mechanisms (e.g., default passwords, no MFA, shared accounts), excessive privileges for database users/roles, lack of principle of least privilege, insecure password storage if hinted.
      - **Network Security:** Unnecessary network exposure (e.g., database accessible from the internet without justification, lack of firewall rules for DB ports, connections from untrusted application servers).
      - **Data Protection:** Lack of encryption (at rest or in transit) if mentioned or implied, insecure handling of sensitive data (e.g., PII, financial data not masked or encrypted as per description), insecure backup procedures if mentioned.
      - **Injection Risks:** SQL Injection or NoSQL injection risks if query patterns, ORM usage descriptions, or lack of input sanitization are provided.
      - **Auditing & Logging:** Insufficient logging or auditing capabilities mentioned, lack of monitoring for suspicious database activities.
      - **Configuration & Patching:** Outdated database versions if specified (and known to have vulnerabilities), use of default or insecure configuration settings, missing security patches if implied.
      - **Specific Database Features:** Misuse or insecure configuration of database-specific features (e.g., public schemas in PostgreSQL, insecure stored procedures, default accounts in Oracle/SQL Server).
  2.  For each potential issue, create a finding object:
      - vulnerability: The general category (e.g., "Weak Authentication", "Excessive Privileges", "SQL Injection Risk", "Data Exposure via Network", "Lack of Encryption at Rest", "Outdated Database Version").
      - description: A detailed description of the *specific* observation from the input text and its security implication in an enterprise context.
      - isVulnerable: Boolean, true if the description strongly suggests a vulnerability. Use 'false' for informational points.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'. Assign 'Critical' for direct compromise or large-scale data exposure risks.
      - remediation: Suggested high-level remediation steps, including specific configuration changes or best practices.
  3.  Provide an 'overallRiskAssessment' based on the findings: 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (3-4 sentences) of the database's security posture based on your analysis of the description, suitable for a business audience.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  Do not include 'source' or 'potentialForAccountLockout' in the findings; these will be handled by the system.
  If the description is too vague or lacks actionable details for a security assessment, the findings array can be empty, risk should be 'Informational', and the summary should state that a proper assessment requires more details.
  Prioritize actionable findings relevant to enterprise database security.
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
            executiveSummary: "Database description is too brief or missing. Cannot perform a meaningful security analysis. Please provide detailed information about database type, version, authentication, network setup, and data handling practices.",
        };
    }
    const { output: promptOutput } = await analyzeDatabaseSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "Database security analysis could not be completed or returned no valid data from the AI model. This may be due to restrictive content filters or an issue with the AI service.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Database" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Analysis of database description completed. Review findings for details. If summary is brief, the AI may have had limited information to process.",
    };
  }
);

