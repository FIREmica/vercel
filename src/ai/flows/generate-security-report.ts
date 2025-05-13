
'use server';

/**
 * @fileOverview A Genkit flow for generating a detailed and comprehensive security report
 * from various analysis results (URL, server, database, SAST, DAST).
 *
 * - generateSecurityReport - A function that handles the generation of the security report.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateSecurityReportInputSchema,
  type GenerateSecurityReportInput,
  GenerateSecurityReportOutputSchema,
  type GenerateSecurityReportOutput,
  VulnerabilityFindingSchema, 
  SastAnalysisOutputSchema, // Import for typing
  DastAnalysisOutputSchema, // Import for typing
} from '@/types/ai-schemas';

export async function generateSecurityReport(
  input: GenerateSecurityReportInput
): Promise<GenerateSecurityReportOutput> {
  return generateSecurityReportFlow(input);
}

const generateSecurityReportPrompt = ai.definePrompt({
  name: 'generateSecurityReportPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateSecurityReportInputSchema},
  output: {schema: GenerateSecurityReportOutputSchema},
  prompt: `
  You are a senior cybersecurity consultant tasked with creating a comprehensive, professional, and actionable security report for an enterprise client.
  This report synthesizes findings from automated scans and analyses of different aspects of a system: a web URL, a server configuration, a database configuration, a code snippet (SAST), and/or a dynamic application scan (DAST).

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
  - Source: URL, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
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
  - Source: Server, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
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
  - Source: Database, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
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

  {{#if sastAnalysis}}
  SAST Analysis (Code Snippet) Summary:
  - Overall Risk for Code: {{{sastAnalysis.overallRiskAssessment}}}
  - SAST Scan Executive Summary: {{{sastAnalysis.executiveSummary}}}
    {{#if sastAnalysis.findings.length}}
      {{#if (lookup (filter sastAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
  Key SAST Vulnerable Findings:
        {{#each sastAnalysis.findings}}
          {{#if this.isVulnerable}}
  - Source: SAST, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
            {{#if this.filePath}}- File: {{this.filePath}} {{/if}}{{#if this.lineNumber}}Line: {{this.lineNumber}}{{/if}}
    - Remediation: {{this.remediation}}
          {{/if}}
        {{/each}}
      {{else}}
  No active vulnerabilities identified in the SAST analysis of the code snippet.
      {{/if}}
    {{else}}
  No findings reported from SAST analysis.
    {{/if}}
  {{/if}}

  {{#if dastAnalysis}}
  DAST Analysis (Dynamic Application Scan) Summary:
  - Overall Risk for Application: {{{dastAnalysis.overallRiskAssessment}}}
  - DAST Scan Executive Summary: {{{dastAnalysis.executiveSummary}}}
    {{#if dastAnalysis.findings.length}}
      {{#if (lookup (filter dastAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
  Key DAST Vulnerable Findings:
        {{#each dastAnalysis.findings}}
          {{#if this.isVulnerable}}
  - Source: DAST, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
            {{#if this.affectedParameter}}- Parameter: {{this.affectedParameter}}{{/if}}
    - Remediation: {{this.remediation}}
          {{/if}}
        {{/each}}
      {{else}}
  No active vulnerabilities identified in the DAST analysis.
      {{/if}}
    {{else}}
  No findings reported from DAST analysis.
    {{/if}}
  {{/if}}

  {{#if overallVulnerableFindings.length}}
  Consolidated List of All Vulnerable Findings ({{overallVulnerableFindings.length}} total):
    {{#each overallVulnerableFindings}}
  - Source: {{this.source}}, Category: {{this.vulnerability}} (Severity: {{this.severity}}{{#if this.cvssScore}}, CVSS: {{this.cvssScore}}{{/if}})
    - Observation: {{this.description}}
    - Remediation: {{this.remediation}}
    {{/each}}
  {{else}}
    {{#unless urlAnalysis.vulnerableFindingsCount}}
      {{#unless (lookup (filter serverAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
        {{#unless (lookup (filter databaseAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
          {{#unless (lookup (filter sastAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
            {{#unless (lookup (filter dastAnalysis.findings (lookupPath 'isVulnerable')) 'length')}}
  No specific active vulnerabilities were identified by the performed scans/analyses based on the provided descriptions or inputs.
            {{/unless}}
          {{/unless}}
        {{/unless}}
      {{/unless}}
    {{/unless}}
  {{/if}}


  Instructions for the Report:
  Generate a comprehensive security report based *only* on the provided scan results. Structure the report logically using Markdown:
  1.  **# Overall Executive Summary (Report):**
      - Start by stating the overall security posture of the analyzed components, considering the highest risk identified (Severity and CVSS score if available).
      - Briefly summarize the most significant risks across URL, server, database, SAST, and/or DAST. Mention key themes if apparent.
      - State the total number of *active* vulnerabilities found across all sources.
      - Conclude with a call to action regarding remediation.
  2.  **# Detailed Findings and Analysis:**
      Organize this section by source (e.g., ## URL Analysis, ## Server Configuration Analysis, ## Database Security Analysis, ## SAST Analysis, ## DAST Analysis).
      If analysis for a source was not performed or yielded no findings, state "No [Source Type] analysis was performed or no findings were reported for this component."
      For each source with *vulnerable* findings:
      *   Restate its specific executive summary and overall risk assessment from the input, if available.
      *   For *each vulnerable* finding ('isVulnerable' is true):
          *   **### [Vulnerability Category] (Severity: [Severity]{{#if cvssScore}}, CVSS: {{cvssScore}} {{cvssVector}}{{/if}})**
          *   **Source Specifics:** {{#if filePath}}(File: {{filePath}}, Line: {{lineNumber}}){{/if}}{{#if affectedParameter}}(Parameter: {{affectedParameter}}){{/if}}
          *   **Specific Finding:** Detail the observation from the 'description' field of the finding.
          *   **Potential Business Impact:** (Use 'businessImpact' field if available) Explain.
          *   **Technical Details:** (Use 'technicalDetails' field if available) Provide technical explanation.
          *   **Evidence:** (Use 'evidence', 'codeSnippetContext', 'requestExample', 'responseExample' fields as appropriate) List or quote specific evidence.
          *   **Recommended Remediation:** List the specific, actionable remediation steps from the 'remediation' field.
  3.  **# Prioritized Recommendations:**
      - List the top 3-5 vulnerabilities that should be addressed first.
  4.  **# Compliance Considerations (General Overview):**
      - Briefly mention general compliance impacts.
  5.  **# Conclusion:**
      - Reiterate overall posture and importance of proactive security.
      - Recommend ongoing practices.

  Format the report using markdown. Ensure a professional tone. Focus solely on provided input.
  If a specific analysis (URL, Server, Database, SAST, DAST) was not provided, gracefully omit its detailed section.
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
    let overallVulnerableFindings: VulnerabilityFinding[] = []; 
    if (input.urlAnalysis?.findings) {
      overallVulnerableFindings = overallVulnerableFindings.concat(input.urlAnalysis.findings.filter(f => f.isVulnerable));
    }
    if (input.serverAnalysis?.findings) {
      overallVulnerableFindings = overallVulnerableFindings.concat(input.serverAnalysis.findings.filter(f => f.isVulnerable));
    }
    if (input.databaseAnalysis?.findings) {
      overallVulnerableFindings = overallVulnerableFindings.concat(input.databaseAnalysis.findings.filter(f => f.isVulnerable));
    }
    if (input.sastAnalysis?.findings) {
      overallVulnerableFindings = overallVulnerableFindings.concat(input.sastAnalysis.findings.filter(f => f.isVulnerable));
    }
    if (input.dastAnalysis?.findings) {
      overallVulnerableFindings = overallVulnerableFindings.concat(input.dastAnalysis.findings.filter(f => f.isVulnerable));
    }
    
    overallVulnerableFindings = overallVulnerableFindings.map(f => {
        let findingSource = f.source; 
        if (!findingSource) { 
            if (input.urlAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "URL";
            else if (input.serverAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Server";
            else if (input.databaseAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "Database";
            else if (input.sastAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "SAST";
            else if (input.dastAnalysis?.findings.some(item => item.description === f.description && item.vulnerability === f.vulnerability)) findingSource = "DAST";
        }
        return { ...f, source: findingSource || "Unknown" as const };
    });


    const promptInput = {
      analyzedTargetDescription: input.analyzedTargetDescription || "System components",
      urlAnalysis: input.urlAnalysis,
      serverAnalysis: input.serverAnalysis,
      databaseAnalysis: input.databaseAnalysis,
      sastAnalysis: input.sastAnalysis,
      dastAnalysis: input.dastAnalysis,
      overallVulnerableFindings: overallVulnerableFindings,
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

