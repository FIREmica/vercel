
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
  You are a senior cybersecurity consultant tasked with creating a comprehensive and professional security report.
  This report synthesizes findings from automated scans and analyses of different aspects of a system: a web URL, a server configuration, and/or a database configuration.

  Target Description: {{#if analyzedTargetDescription}} {{{analyzedTargetDescription}}} {{else}} Not specified {{/if}}

  {{#if urlAnalysis}}
  URL Analysis Summary ({{{urlAnalysis.findings.length}}} findings, {{urlAnalysis.vulnerableFindingsCount}} vulnerable):
  - Analyzed URL: {{{urlAnalysis.findings.0.source}}} (Assuming all URL findings have the same URL, or refer to original input if available) - FIXME: Need a way to pass the actual URL if urlAnalysis is present. For now, we'll use the target description or imply from findings.
  - Overall Risk for URL: {{{urlAnalysis.overallRiskAssessment}}}
  - URL Scan Executive Summary: {{{urlAnalysis.executiveSummary}}}
    {{#if urlAnalysis.findings.length}}
  Key URL Vulnerable Findings:
      {{#each urlAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Category: {{this.vulnerability}} (Severity: {{this.severity}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{/if}}
  {{/if}}

  {{#if serverAnalysis}}
  Server Analysis Summary ({{{serverAnalysis.findings.length}}} findings):
  - Overall Risk for Server: {{{serverAnalysis.overallRiskAssessment}}}
  - Server Scan Executive Summary: {{{serverAnalysis.executiveSummary}}}
    {{#if serverAnalysis.findings.length}}
  Key Server Vulnerable Findings:
      {{#each serverAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Category: {{this.vulnerability}} (Severity: {{this.severity}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
    {{/if}}
  {{/if}}

  {{#if databaseAnalysis}}
  Database Analysis Summary ({{{databaseAnalysis.findings.length}}} findings):
  - Overall Risk for Database: {{{databaseAnalysis.overallRiskAssessment}}}
  - Database Scan Executive Summary: {{{databaseAnalysis.executiveSummary}}}
    {{#if databaseAnalysis.findings.length}}
  Key Database Vulnerable Findings:
      {{#each databaseAnalysis.findings}}
        {{#if this.isVulnerable}}
  - Category: {{this.vulnerability}} (Severity: {{this.severity}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
        {{/if}}
      {{/each}}
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
      {{#unless serverAnalysis.findings.length}} {{!This checks any findings, not just vulnerable}}
        {{#unless databaseAnalysis.findings.length}} {{!Same here}}
  No specific active vulnerabilities were reported by the performed scans/analyses.
        {{/unless}}
      {{/unless}}
    {{/unless}}
  {{/if}}


  Instructions for the Report:
  Generate a comprehensive security report based *only* on the provided scan results. Structure the report logically:
  1.  **Overall Executive Summary (Report):** Write a new, holistic executive summary for this report.
      - Start by stating the overall security posture, considering all analyzed components. If a 'Critical' or 'High' risk exists in any component, highlight that.
      - Briefly elaborate on the most significant risks identified across URL, server, and/or database.
      - Mention the total number of active vulnerabilities found across all sources.
  2.  **Detailed Findings Section:** This section should be organized by source (URL, Server, Database if data provided for them).
      For each source:
      *   Restate its specific executive summary and overall risk assessment.
      *   For each *vulnerable* finding ('isVulnerable' is true) from that source:
          *   Clearly state the **Vulnerability Category** and **Severity**.
          *   Explain the **Specific Finding** (from 'description').
          *   Describe the **Potential Impact** in simple terms, tailored to the source (e.g., "Could allow attackers to steal user session cookies via the URL," "Might enable attackers to gain unauthorized access to the server," "Could lead to exposure of sensitive customer data from the database").
          *   List the **Recommended Remediation**.
  3.  **Conclusion and Prioritized Recommendations:**
      *   Briefly reiterate the key overall risks.
      *   Emphasize the importance of addressing the identified vulnerabilities, prioritizing by severity and potential impact (Critical > High > Medium > Low).
      *   If no active vulnerabilities were found, recommend general security best practices like regular audits, defense-in-depth, secure coding, and continuous monitoring.

  Format the report using markdown for readability (e.g., use headings like # Overall Executive Summary, ## URL Analysis, ### [Vulnerability Category], bullet points for lists).
  If no data was provided for a specific section (e.g., no serverAnalysis), omit that section gracefully or state "No server analysis performed."
  Focus solely on the information provided. Do not invent new vulnerabilities or impacts.
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

    const promptInput = {
      analyzedTargetDescription: input.analyzedTargetDescription || "System components",
      urlAnalysis: input.urlAnalysis,
      serverAnalysis: input.serverAnalysis,
      databaseAnalysis: input.databaseAnalysis,
      overallVulnerableFindings: overallVulnerableFindings
    };

    const {output} = await generateSecurityReportPrompt(promptInput);
    
    if (!output || !output.report) {
        const defaultMessage = overallVulnerableFindings.length > 0 ?
            "Security analysis was performed, but the AI could not generate a formatted report. Please review individual findings." :
            "No vulnerabilities were detected in this scan, or the analysis could not generate a report.";
        return { report: defaultMessage };
    }
    return output;
  }
);
