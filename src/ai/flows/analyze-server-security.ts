
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
// `potentialForAccountLockout` is typically not set by this flow unless specific auth service on server is described.
const AnalyzeServerPromptOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.omit({ source: true, potentialForAccountLockout: true })),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});

const analyzeServerSecurityPrompt = ai.definePrompt({
  name: 'analyzeServerSecurityPrompt',
  input: {schema: ServerConfigInputSchema},
  output: {schema: AnalyzeServerPromptOutputSchema},
  prompt: `You are a senior cybersecurity architect specializing in server and infrastructure hardening for enterprise environments.
  Analyze the following server description for potential security vulnerabilities, misconfigurations, and areas for improvement, paying close attention to common enterprise security concerns.

  Server Description:
  {{{serverDescription}}}

  Task:
  1.  Identify potential security issues based *solely* on the provided description. Consider:
      - **OS Hardening:** Outdated OS/kernel versions (if mentioned), unnecessary services/daemons running, default credentials, weak password policies implied, lack of centralized authentication (e.g., LDAP/AD integration hints).
      - **Network Security:** Exposed management interfaces (SSH, RDP, web consoles) to untrusted networks, overly permissive firewall rules (if described), lack of network segmentation, default SNMP community strings.
      - **Application/Service Security:** Outdated web server/app server versions (Apache, Nginx, Tomcat, etc.), insecure service configurations (e.g., directory listing, weak SSL/TLS ciphers, default error pages), missing security headers for web services, vulnerabilities in common applications (e.g., known CVEs if versions are hinted).
      - **Logging and Monitoring:** Absence of mentions of robust logging, centralized log management, or intrusion detection/prevention systems (IDS/IPS).
      - **Patch Management:** Lack of explicit mention of a patch management process or schedule.
      - **Data Protection:** If server hosts databases or sensitive data, look for implications of insecure storage or access.
      - **Access Control:** Weaknesses in user account management, privilege separation, or use of shared accounts if inferable.
  2.  For each potential issue, create a finding object:
      - vulnerability: The general category (e.g., "Outdated OS", "Exposed Insecure Service", "Weak TLS Configuration", "Missing Patch Management Process", "Default SNMP Community String").
      - description: A detailed description of the *specific* observation from the input text and its security implication in an enterprise context.
      - isVulnerable: Boolean, true if the description strongly suggests a vulnerability. Use 'false' for informational points or general recommendations if no direct vulnerability is evident from the text.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'. Assign 'Critical' for issues with widespread impact or high exploitability.
      - cvssScore: (Optional) If related to a known CVE or CWE, provide an estimated CVSS 3.1 base score.
      - cvssVector: (Optional) The CVSS 3.1 vector string for the score.
      - businessImpact: (Optional) Describe the potential business impact (e.g., "Server compromise leading to data exfiltration and service downtime.").
      - technicalDetails: (Optional) Explain the technical nature of the vulnerability, e.g., "The specified Apache version 2.4.x is known to be vulnerable to CVE-YYYY-ZZZZ, allowing remote code execution via a crafted request."
      - evidence: (Optional) Point to specific parts of the input description that led to this finding, e.g., "Description states 'Server running Apache 2.4.x'."
      - remediation: Suggested high-level remediation steps, including specific configuration changes or processes where appropriate.
      (Do not include 'source' or 'potentialForAccountLockout' in these finding objects; they are handled by the system for server analysis.)
  3.  Provide an 'overallRiskAssessment' based on the findings: 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (3-4 sentences) of the server's security posture based on your analysis of the description, suitable for a business audience.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  If the description is too vague or lacks actionable details for a security assessment, findings array can be empty, risk should be 'Informational', and summary should state that a proper assessment requires more details.
  Prioritize actionable findings relevant to enterprise security.
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
            executiveSummary: "Server description is too brief or missing. Cannot perform a meaningful security analysis. Please provide detailed information about OS, services, configurations, and any security measures in place.",
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
      // potentialForAccountLockout is not typically relevant for general server findings unless specified in description
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "Analysis of server description completed. Review findings for details. If summary is brief, the AI may have had limited information to process.",
    };
  }
);

