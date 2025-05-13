
/**
 * @fileOverview Centralized Zod schemas and TypeScript types for AI flows.
 * This file does not use 'use server' and can be safely imported by server components/actions
 * and AI flow definitions.
 */
import { z } from 'zod';

// Schemas and types for analyze-url-vulnerabilities flow (renamed from analyze-vulnerabilities)
export const VulnerabilityFindingSchema = z.object({
  source: z.enum(["URL", "Server", "Database"]).optional().describe("The source of the finding."),
  vulnerability: z.string().describe('The identified vulnerability category (e.g., Cross-Site Scripting (XSS), SQL Injection, Weak Password Policy, Missing Rate Limiting, Insecure Configuration, Outdated OS, Exposed Database Port).'),
  description: z.string().describe('A brief description of the specific finding related to the vulnerability category.'),
  isVulnerable: z.boolean().describe('Whether the target shows signs of being vulnerable to this specific finding.'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical', 'Informational']).describe('The estimated severity of the vulnerability finding. Critical may be used by AI if multiple Highs or exceptionally severe single High.'),
  potentialForAccountLockout: z
    .boolean()
    .optional() // Making this optional as it's more relevant to URL auth flows
    .describe('Whether this specific finding could directly contribute to account lockouts (primarily for URL auth vulnerabilities).'),
  remediation: z.string().describe('Suggested remediation steps to address the finding.'),
});
export type VulnerabilityFinding = z.infer<typeof VulnerabilityFindingSchema>;

export const AnalyzeUrlVulnerabilitiesInputSchema = z.object({
  url: z.string().url().describe('The URL of the user registration page or web application endpoint to analyze.'),
});
export type AnalyzeUrlVulnerabilitiesInput = z.infer<typeof AnalyzeUrlVulnerabilitiesInputSchema>;

export const UrlVulnerabilityAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("URL").default("URL") })).describe("A list of all identified vulnerability findings for the URL."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("An overall risk assessment for the analyzed URL based on its findings."),
  executiveSummary: z.string().describe("A concise executive summary (2-3 sentences) of the security posture of the URL."),
  vulnerableFindingsCount: z.number().optional().describe("The total count of findings where isVulnerable is true."),
  highSeverityCount: z.number().optional().describe("Count of high severity vulnerable findings."),
  mediumSeverityCount: z.number().optional().describe("Count of medium severity vulnerable findings."),
  lowSeverityCount: z.number().optional().describe("Count of low severity vulnerable findings."),
});
export type UrlVulnerabilityAnalysisOutput = z.infer<typeof UrlVulnerabilityAnalysisOutputSchema>;


// Schemas and types for server security analysis
export const ServerConfigInputSchema = z.object({
  serverDescription: z.string().min(50).describe(
    'A detailed textual description of the server configuration. Include OS type and version, running services (web server, app server, SSH, RDP, etc.) with versions if known, open ports, firewall rules summary, any known security software, and excerpts from relevant configuration files or tool outputs (e.g., Nmap scan summary, list of installed packages, snippet from hardening guides used).'
  ),
});
export type ServerConfigInput = z.infer<typeof ServerConfigInputSchema>;

export const ServerSecurityAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("Server").default("Server") })).describe("A list of potential vulnerabilities and misconfigurations identified from the server description."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Overall risk assessment for the described server configuration."),
  executiveSummary: z.string().describe("Concise summary of the server's security posture based on the provided description."),
});
export type ServerSecurityAnalysisOutput = z.infer<typeof ServerSecurityAnalysisOutputSchema>;

// Schemas and types for database security analysis
export const DatabaseConfigInputSchema = z.object({
  databaseDescription: z.string().min(50).describe(
    'A detailed textual description of the database configuration. Include database type (e.g., PostgreSQL, MySQL, MongoDB) and version, authentication methods, network exposure (e.g., accessible from where), user privilege model, relevant snippets of configuration files, examples of concerning query patterns observed in application code, or output from database security assessment tools.'
  ),
});
export type DatabaseConfigInput = z.infer<typeof DatabaseConfigInputSchema>;

export const DatabaseSecurityAnalysisOutputSchema = z.object({
  findings: z.array(VulnerabilityFindingSchema.extend({ source: z.literal("Database").default("Database") })).describe("A list of potential vulnerabilities and misconfigurations identified from the database description."),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]).describe("Overall risk assessment for the described database configuration."),
  executiveSummary: z.string().describe("Concise summary of the database's security posture based on the provided description."),
});
export type DatabaseSecurityAnalysisOutput = z.infer<typeof DatabaseSecurityAnalysisOutputSchema>;


// Schemas and types for generate-attack-vectors flow
export const AttackVectorItemSchema = z.object({
  vulnerabilityName: z.string().describe('The name/category of the vulnerability this attack vector is based on.'),
  source: z.enum(["URL", "Server", "Database", "Unknown"]).optional().describe("The source of the original finding for this attack vector."),
  attackScenarioDescription: z.string().describe('A description of how an attacker might exploit this vulnerability. Tailor to the vulnerability type and source.'),
  examplePayloadOrTechnique: z.string().describe('An example of a malicious payload, code snippet, or technique an attacker might use. This should be illustrative and for educational purposes only.'),
  expectedOutcomeIfSuccessful: z.string().describe('The expected outcome if the attack is successful, e.g., "Account lockout", "Unauthorized data access", "Cross-Site Scripting execution", "SQL Injection successful", "Server compromise".'),
});
export type AttackVectorItem = z.infer<typeof AttackVectorItemSchema>;

// Input for generating attack vectors can be a single finding or an array of findings.
// The flow itself will process an array.
export const GenerateAttackVectorsInputSchema = z.array(VulnerabilityFindingSchema);
export type GenerateAttackVectorsInput = z.infer<typeof GenerateAttackVectorsInputSchema>;

export const GenerateAttackVectorsOutputSchema = z.array(AttackVectorItemSchema);
export type GenerateAttackVectorsOutput = z.infer<typeof GenerateAttackVectorsOutputSchema>;


// Schemas and types for the comprehensive security report
export const GenerateSecurityReportInputSchema = z.object({
  analyzedTargetDescription: z.string().optional().describe("A brief overall description of what was targeted for analysis, e.g., 'Registration page for MyService', 'Production Web Server', 'Customer Database Server'"),
  urlAnalysis: UrlVulnerabilityAnalysisOutputSchema.optional().describe("Results from the URL vulnerability analysis, if performed."),
  serverAnalysis: ServerSecurityAnalysisOutputSchema.optional().describe("Results from the server security analysis, if performed."),
  databaseAnalysis: DatabaseSecurityAnalysisOutputSchema.optional().describe("Results from the database security analysis, if performed."),
  overallVulnerableFindings: z.array(VulnerabilityFindingSchema).optional().describe("A combined list of all findings marked as isVulnerable from all analysis types.")
});
export type GenerateSecurityReportInput = z.infer<typeof GenerateSecurityReportInputSchema>;

export const GenerateSecurityReportOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A comprehensive, well-structured security report in Markdown. It should synthesize findings from all provided analyses (URL, server, database), offer an overall executive summary, detail findings with impacts and remediations, and conclude with prioritized recommendations.'
    ),
});
export type GenerateSecurityReportOutput = z.infer<typeof GenerateSecurityReportOutputSchema>;
