
'use server';

/**
 * @fileOverview A Genkit flow for generating a detailed and comprehensive security report
 * from various analysis results (URL, server, database).
 *
 * - generateSecurityReport - A function that handles the generation of the security report.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateSecurityReportInputSchema,
  type GenerateSecurityReportInput,
  GenerateSecurityReportOutputSchema,
  type GenerateSecurityReportOutput,
} from '@/types/ai-schemas';

export async function generateSecurityReport(
  input: GenerateSecurityReportInput
): Promise<GenerateSecurityReportOutput> {
  return generateSecurityReportFlow(input);
}

const generateSecurityReportPrompt = ai.definePrompt({
  name: 'generateSecurityReportPrompt',
  input: {schema: GenerateSecurityReportInputSchema},
  output: {schema: GenerateSecurityReportOutputSchema},
  prompt: `
  You are a senior cybersecurity consultant tasked with creating a comprehensive, professional, and actionable security report for an enterprise client.
  This report synthesizes findings from automated scans and analyses of different aspects of a system: a web URL, a server configuration, and/or a database configuration.

  Target Description: {{#if analyzedTargetDescription}} {{{analyzedTargetDescription}}} {{else}} Not specified {{/if}}

  {{#if urlAnalysis}}
  URL Analysis Summary:
  - Analyzed URL: {{{input.urlAnalysis.findings.0.source}}} (This should reflect the actual input URL if available, otherwise use this placeholder if only one source is present for URL findings.)
  - Overall Risk for URL: {{{urlAnalysis.overallRiskAssessment}}}
  - URL Scan Executive Summary: {{{urlAnalysis.executiveSummary}}}
    {{#if urlAnalysis.vulnerableFindingsCount}}
  Key URL Vulnerable Findings ({{urlAnalysis.vulnerableFindingsCount}}):
      {{#each urlAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Source: URL, Category: {{this.vulnerability}} (Severity: {{this.severity}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{else}}
  No active vulnerabilities identified in the URL analysis.
    {{/if}}
  {{/if}}

  {{#if serverAnalysis}}
  Server Analysis Summary:
  - Overall Risk for Server: {{{serverAnalysis.overallRiskAssessment}}}
  - Server Scan Executive Summary: {{{serverAnalysis.executiveSummary}}}
    {{#if serverAnalysis.findings.length}}
      {{#if (lookup (filter serverAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
  Key Server Vulnerable Findings:
        {{#each serverAnalysis.findings}}
          {{#if this.isVulnerable}}
  - Source: Server, Category: {{this.vulnerability}} (Severity: {{this.severity}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
          {{/if}}
        {{/each}}
      {{else}}
  No active vulnerabilities identified in the server analysis.
      {{/if}}
    {{else}}
  No findings reported from server analysis.
    {{/if}}
  {{/if}}

  {{#if databaseAnalysis}}
  Database Analysis Summary:
  - Overall Risk for Database: {{{databaseAnalysis.overallRiskAssessment}}}
  - Database Scan Executive Summary: {{{databaseAnalysis.executiveSummary}}}
    {{#if databaseAnalysis.findings.length}}
      {{#if (lookup (filter databaseAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
  Key Database Vulnerable Findings:
        {{#each databaseAnalysis.findings}}
          {{#if this.isVulnerable}}
  - Source: Database, Category: {{this.vulnerability}} (Severity: {{this.severity}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
          {{/if}}
        {{/each}}
      {{else}}
  No active vulnerabilities identified in the database analysis.
      {{/if}}
    {{else}}
  No findings reported from database analysis.
    {{/if}}
  {{/if}}

  {{#if overallVulnerableFindings.length}}
  Consolidated List of All Vulnerable Findings ({{overallVulnerableFindings.length}} total):
    {{#each overallVulnerableFindings}}
  - Source: {{this.source}}, Category: {{this.vulnerability}} (Severity: {{this.severity}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
    {{/each}}
  {{else}}
    {{#unless urlAnalysis.vulnerableFindingsCount}}
      {{#unless (lookup (filter serverAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
        {{#unless (lookup (filter databaseAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
  No specific active vulnerabilities were identified by the performed scans/analyses based on the provided descriptions.
        {{/unless}}
      {{/unless}}
    {{/unless}}
  {{/if}}


  Instructions for the Report:
  Generate a comprehensive security report based *only* on the provided scan results. Structure the report logically using Markdown:
  1.  **# Overall Executive Summary (Report):**
      - Start by stating the overall security posture of the analyzed components, considering the highest risk identified.
      - Briefly summarize the most significant risks across URL, server, and/or database. Mention key themes if apparent (e.g., widespread patching issues, common misconfigurations).
      - State the total number of *active* vulnerabilities found across all sources.
      - Conclude with a call to action regarding remediation.
  2.  **# Detailed Findings and Analysis:**
      Organize this section by source (e.g., ## URL Analysis, ## Server Configuration Analysis, ## Database Security Analysis).
      If analysis for a source was not performed or yielded no findings, state "No URL/Server/Database analysis was performed or no findings were reported for this component."
      For each source with *vulnerable* findings:
      *   Restate its specific executive summary and overall risk assessment from the input, if available.
      *   For *each vulnerable* finding ('isVulnerable' is true):
          *   **### [Vulnerability Category] (Severity: [Severity])**
          *   **Specific Finding:** Detail the observation from the 'description' field of the finding.
          *   **Potential Business Impact:** Explain, in clear business terms, the potential consequences if this vulnerability is exploited (e.g., "Data breach of customer PII leading to regulatory fines and reputational damage," "Denial of service for critical application, impacting revenue," "Unauthorized server access enabling lateral movement within the network"). Tailor this to the source and vulnerability type.
          *   **Recommended Remediation:** List the specific, actionable remediation steps.
  3.  **# Prioritized Recommendations:**
      - List the top 3-5 vulnerabilities that should be addressed first, based on a combination of severity and potential business impact. Explain the rationale for this prioritization.
      - For each prioritized item, briefly reiterate the vulnerability and the core action needed.
  4.  **# Compliance Considerations (General Overview):**
      - Briefly mention general areas where findings might impact common compliance standards (e.g., "Identified data exposure risks could affect GDPR or CCPA compliance.", "Weak access controls may not align with PCI DSS requirements.").
      - *This is a general overview; specific compliance mapping is outside this scope.*
  5.  **# Conclusion:**
      - Briefly reiterate the overall security posture and the importance of a proactive security approach.
      - Recommend ongoing security practices such as regular automated scanning, penetration testing, security awareness training, and maintaining a robust patch management program.
      - If no active vulnerabilities were found, commend this but still advise vigilance and continuous monitoring.

  Format the report using markdown for excellent readability (headings, subheadings, bold text for emphasis, bullet points for lists).
  Ensure a professional and objective tone throughout the report.
  Focus solely on the information provided in the input. Do not invent new vulnerabilities, impacts, or remediations not supported by the input data.
  If a specific analysis (URL, Server, Database) was not provided in the input, gracefully omit its detailed section or state that the analysis was not performed for that component.
  `,
});


const generateSecurityReportFlow = ai.defineFlow(
  {
    name: 'generateSecurityReportFlow',
    inputSchema: GenerateSecurityReportInputSchema,
    outputSchema: GenerateSecurityReportOutputSchema,
  },
  async (input): Promise<GenerateSecurityReportOutput> => {
    // Consolidate all vulnerable findings for the prompt
    let overallVulnerableFindings: any[] = [];
    if (input.urlAnalysis?.findings) {
      overallVulnerableFindings = overallVulnerableFindings.concat(input.urlAnalysis.findings.filter(f => f.isVulnerable));
    }
    if (input.serverAnalysis?.findings) {
      overallVulnerableFindings = overallVulnerableFindings.concat(input.serverAnalysis.findings.filter(f => f.isVulnerable));
    }
    if (input.databaseAnalysis?.findings) {
      overallVulnerableFindings = overallVulnerableFindings.concat(input.databaseAnalysis.findings.filter(f => f.isVulnerable));
    }

    // Ensure `source` is correctly set for all findings being passed to the report prompt
    // The individual analysis flows should already do this, but this is a good place for a fallback or consistency check.
    overallVulnerableFindings = overallVulnerableFindings.map(f => {
        let findingSource = f.source; // Keep original if already set
        if (!findingSource) { // Attempt to infer if not set
            if (input.urlAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "URL";
            else if (input.serverAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Server";
            else if (input.databaseAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Database";
        }
        return { ...f, source: findingSource || "Unknown" };
    });


    const promptInput = {
      analyzedTargetDescription: input.analyzedTargetDescription || "System components",
      urlAnalysis: input.urlAnalysis,
      serverAnalysis: input.serverAnalysis,
      databaseAnalysis: input.databaseAnalysis,
      overallVulnerableFindings: overallVulnerableFindings,
      // Pass the original input to allow the prompt to access nested fields like input.urlAnalysis.findings.0.source correctly
      input: input 
    };

    const {output} = await generateSecurityReportPrompt(promptInput);
    
    if (!output || !output.report) {
        const defaultMessage = overallVulnerableFindings.length > 0 ?
            "Security analysis was performed, but the AI could not generate a formatted report. Please review individual findings. This may be due to restrictive content filters or an issue with the AI service." :
            "No vulnerabilities were detected in this scan, or the analysis could not generate a report. If input descriptions were too brief, the AI may not have had enough information.";
        return { report: defaultMessage };
    }
    return output;
  }
);

