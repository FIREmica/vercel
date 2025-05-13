
'use server';
/**
 * @fileOverview Analyzes a textual description of a server's configuration (including game servers) for potential security vulnerabilities.
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

const AnalyzeServerPromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.omit({ source: true, potentialForAccountLockout: true })),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeServerSecurityPrompt = ai.definePrompt({
  name: 'analyzeServerSecurityPrompt',
  input: {schema: ServerConfigInputSchema},
  output: {schema: AnalyzeServerPromptOutputSchema},
  prompt: `You are a senior cybersecurity architect specializing in server and infrastructure hardening for enterprise environments, including dedicated game servers.
  Analyze the following server description for potential security vulnerabilities, misconfigurations, and areas for improvement, paying close attention to common enterprise security concerns and game server specific risks.

  Server Description:
  {{{serverDescription}}}

  Task:
  1.  Identify potential security issues based *solely* on the provided description. Consider:
      - **OS Hardening:** Outdated OS/kernel versions, unnecessary services/daemons, default credentials, weak password policies, lack of centralized authentication.
      - **Network Security:** Exposed management interfaces (SSH, RDP, web consoles) to untrusted networks, overly permissive firewall rules (including game-specific ports), lack of network segmentation, default SNMP, DDoS vulnerability if implied by lack of protection.
      - **Application/Service Security (Web/Generic):** Outdated web/app server versions (Apache, Nginx, Tomcat, etc.), insecure service configurations (directory listing, weak SSL/TLS, default error pages), missing security headers, known CVEs.
      - **Game Server Specifics:**
          - Vulnerabilities in game server software itself (e.g., specific engine exploits if version is hinted).
          - Insecure handling of game protocols or real-time communication channels.
          - Lack of or poorly configured anti-cheat mechanisms if mentioned.
          - Exposure of sensitive game server commands or APIs.
          - Risks related to player data handling on the server (if described).
          - Vulnerabilities to denial-of-service (DoS/DDoS) attacks specific to game servers (e.g., reflection/amplification attacks via game protocols).
      - **Logging and Monitoring:** Absence of robust logging, centralized log management, or IDS/IPS.
      - **Patch Management:** Lack of explicit mention of a patch management process.
      - **Data Protection:** If server hosts databases or sensitive data (e.g., player accounts, game state), look for implications of insecure storage or access.
      - **Access Control:** Weaknesses in user account management, privilege separation.
  2.  For each potential issue, create a finding object:
      - vulnerability: The general category (e.g., "Outdated OS", "Exposed Insecure Game Port", "Weak Anti-Cheat Implementation", "DDoS Amplification Risk", "Default Game Server Credentials").
      - description: Detailed observation and its security implication in an enterprise or game server context.
      - isVulnerable: Boolean, true if description strongly suggests a vulnerability.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - cvssScore: (Optional) Estimated CVSS 3.1 base score.
      - cvssVector: (Optional) CVSS 3.1 vector string.
      - businessImpact: (Optional) Potential impact (e.g., "Server compromise leading to game cheating", "Player data exfiltration", "Game service downtime due to DDoS").
      - technicalDetails: (Optional) Technical nature of the vulnerability.
      - evidence: (Optional) Reference to input description.
      - remediation: Suggested high-level remediation.
      (Do not include 'source' or 'potentialForAccountLockout' in these finding objects; they are handled by the system for server analysis.)
  3.  Provide an 'overallRiskAssessment': 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (3-4 sentences) of the server's security posture, suitable for a business audience.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  If the description is too vague, findings can be empty, risk 'Informational', and summary should state this.
  Prioritize actionable findings relevant to enterprise and game server security.
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
            executiveSummary: "Server description is too brief or missing. Cannot perform a meaningful security analysis. Please provide detailed information about OS, services (including game server details if applicable), configurations, and any security measures in place.",
        };
    }
    const { output: promptOutput } = await analyzeServerSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "Server security analysis could not be completed or returned no valid data from the AI model. This may be due to restrictive content filters or an issue with the AI service.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "Server" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Analysis of server description completed. Review findings for details. If summary is brief, the AI may have had limited information to process.",
    };
  }
);

