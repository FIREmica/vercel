
'use server';
/**
 * @fileOverview Analyzes a textual description of a database's configuration (including game databases) for potential security vulnerabilities.
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

const AnalyzeDatabasePromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.omit({ source: true, potentialForAccountLockout: true })),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});


const analyzeDatabaseSecurityPrompt = ai.definePrompt({
  name: 'analyzeDatabaseSecurityPrompt',
  input: {schema: DatabaseConfigInputSchema},
  output: {schema: AnalyzeDatabasePromptOutputSchema},
  prompt: `You are a database security specialist with expertise in various database systems (SQL and NoSQL), focusing on enterprise security best practices and specific considerations for game databases.
  Analyze the following database description for potential security vulnerabilities, misconfigurations, and data protection issues.

  Database Description:
  {{{databaseDescription}}}

  Task:
  1.  Identify potential security issues based *solely* on the provided description. Consider:
      - **Authentication & Authorization:** Weak authentication, excessive privileges, lack of principle of least privilege, insecure password storage.
      - **Network Security:** Unnecessary network exposure, lack of firewall rules for DB ports, connections from untrusted sources.
      - **Data Protection:** Lack of encryption (at rest/transit), insecure handling of sensitive data (PII, financial data, player credentials, virtual currency/items).
      - **Injection Risks:** SQL/NoSQL injection risks if query patterns or lack of input sanitization are hinted.
      - **Auditing & Logging:** Insufficient logging/auditing, lack of monitoring for suspicious activities (e.g., unusual item duplication, account takeovers).
      - **Configuration & Patching:** Outdated database versions, default/insecure configurations, missing security patches.
      - **Specific Database Features:** Misuse or insecure configuration of database-specific features.
      - **Game Database Specifics:**
          - Vulnerabilities allowing item/currency duplication or manipulation.
          - Insecure storage of player account credentials or session data.
          - Lack of integrity checks for game state or player progression.
          - Insufficient logging for player actions or transactions that could aid in cheat detection or dispute resolution.
          - Risks related to insecure direct database access from game clients (if implied).
  2.  For each potential issue, create a finding object:
      - vulnerability: General category (e.g., "Weak Authentication", "SQL Injection Risk", "Player Data Exposure", "Item Duplication Vulnerability").
      - description: Detailed observation and its security implication in an enterprise or game database context.
      - isVulnerable: Boolean, true if description strongly suggests a vulnerability.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - cvssScore: (Optional) Estimated CVSS 3.1 base score.
      - cvssVector: (Optional) CVSS 3.1 vector string.
      - businessImpact: (Optional) Potential impact (e.g., "Unauthorized access to player accounts", "Compromise of virtual economy", "Game data corruption").
      - technicalDetails: (Optional) Technical nature of the vulnerability.
      - evidence: (Optional) Reference to input description.
      - remediation: Suggested high-level remediation.
      (Do not include 'source' or 'potentialForAccountLockout' in these finding objects; they are handled by the system for database analysis.)
  3.  Provide an 'overallRiskAssessment': 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (3-4 sentences) of the database's security posture, suitable for a business audience.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  If the description is too vague, findings can be empty, risk 'Informational', and summary should state this.
  Prioritize actionable findings relevant to enterprise and game database security.
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
            executiveSummary: "Database description is too brief or missing. Cannot perform a meaningful security analysis. Please provide detailed information about database type, version, authentication, network setup, data handling practices, and any game-specific considerations.",
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

