
'use server';
/**
 * @fileOverview Simulates Static Application Security Testing (SAST) analysis on a code snippet.
 *
 * - analyzeSastSecurity - A function that handles the SAST analysis process.
 */

import {ai} from '@/ai/genkit';
import {z}from 'zod';
import {
  SastAnalysisInputSchema,
  type SastAnalysisInput,
  SastAnalysisOutputSchema,
  type SastAnalysisOutput,
  VulnerabilityFindingSchema,
} from '@/types/ai-schemas';

export async function analyzeSastSecurity(input: SastAnalysisInput): Promise<SastAnalysisOutput> {
  return analyzeSastSecurityFlow(input);
}

// Schema for the direct output of the SAST prompt, before flow adds calculated fields or defaults.
const AnalyzeSastPromptOutputSchema = z.object({
  findings: z.array(
    VulnerabilityFindingSchema.omit({ source: true }) // Source will be "SAST"
    .extend({
        // SAST specific fields that the AI should focus on generating
        filePath: z.string().optional().describe("If applicable, the conceptual file path where the vulnerability might occur."),
        lineNumber: z.number().int().min(1).optional().describe("If applicable, the conceptual line number."),
        codeSnippetContext: z.string().optional().describe("A small snippet illustrating the vulnerable code pattern."),
    })
  ),
  overallRiskAssessment: z.enum(["Low", "Medium", "High", "Critical", "Informational"]),
  executiveSummary: z.string(),
});


const analyzeSastSecurityPrompt = ai.definePrompt({
  name: 'analyzeSastSecurityPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: SastAnalysisInputSchema},
  output: {schema: AnalyzeSastPromptOutputSchema},
  prompt: `You are a SAST (Static Application Security Testing) simulation tool.
  Analyze the following code snippet for potential security vulnerabilities.
  Language (if provided): {{{language}}}
  Code Snippet:
  \`\`\`
  {{{codeSnippet}}}
  \`\`\`

  Task:
  1.  Identify potential security issues based *solely* on the provided code snippet. Consider:
      - **Injection Flaws:** SQL Injection, Command Injection, NoSQL Injection, XSS (if code generates HTML/JS).
      - **Authentication/Authorization Bypass:** Hardcoded credentials, weak authorization checks.
      - **Sensitive Data Exposure:** Plaintext storage of passwords, API keys, or PII.
      - **Insecure Deserialization.**
      - **Security Misconfiguration:** Use of default credentials, debug features left enabled.
      - **Known Vulnerable Components/Libraries:** If patterns suggest use of outdated or known vulnerable functions (conceptual, as no real library scan is done).
      - **Buffer Overflows (Conceptual):** If code patterns suggest unsafe memory handling (e.g. in C/C++ like snippets).
  2.  For each potential issue, create a finding object:
      - vulnerability: General category (e.g., "SQL Injection", "Hardcoded Credentials", "Potential XSS").
      - description: Detailed observation of the insecure pattern in the code.
      - isVulnerable: Boolean, true if the snippet strongly suggests a vulnerability.
      - severity: 'Low', 'Medium', 'High', 'Critical', or 'Informational'.
      - cvssScore: (Optional) Estimated CVSS 3.1 base score.
      - cvssVector: (Optional) CVSS 3.1 vector string.
      - businessImpact: (Optional) Potential impact.
      - technicalDetails: (Optional) Technical nature of the vulnerability in the code.
      - evidence: (Optional) Quote the problematic part of the code snippet.
      - remediation: Suggested high-level code remediation.
      - filePath: (Optional) Conceptual file path (e.g., "auth/service.py", "utils/db_helpers.java").
      - lineNumber: (Optional) Conceptual line number within the snippet where the issue is.
      - codeSnippetContext: (Optional) A small, relevant part of the provided snippet that shows the vulnerability.
      (Do not include 'source' as it will be "SAST", or 'potentialForAccountLockout' as it's less relevant here).
  3.  Provide an 'overallRiskAssessment': 'Critical', 'High', 'Medium', 'Low', or 'Informational'.
  4.  Write a concise 'executiveSummary' (2-3 sentences) of the code snippet's security posture.

  Output Format:
  Return a JSON object with "findings", "overallRiskAssessment", and "executiveSummary".
  If the snippet is too short, generic, or seems secure, findings can be empty, risk 'Informational', and summary should state this.
  Prioritize findings directly observable in the provided code. This is a simulation.
  `,
});

const analyzeSastSecurityFlow = ai.defineFlow(
  {
    name: 'analyzeSastSecurityFlow',
    inputSchema: SastAnalysisInputSchema,
    outputSchema: SastAnalysisOutputSchema,
  },
  async (input): Promise<SastAnalysisOutput> => {
    if (!input.codeSnippet || input.codeSnippet.trim().length < 20) { // Increased min length
        return {
            findings: [],
            overallRiskAssessment: "Informational",
            executiveSummary: "El fragmento de código es demasiado breve o está ausente. No se puede realizar un análisis SAST simulado significativo. Proporcione un fragmento de código más sustancial.",
        };
    }
    const { output: promptOutput } = await analyzeSastSecurityPrompt(input);

    if (!promptOutput) {
      return {
        findings: [],
        overallRiskAssessment: "Informational",
        executiveSummary: "El análisis SAST simulado no pudo completarse o no devolvió datos válidos del modelo de IA. Esto puede deberse a filtros de contenido restrictivos o un problema con el servicio de IA.",
      };
    }

    const findingsWithSource = (promptOutput.findings || []).map(f => ({
      ...f,
      source: "SAST" as const,
    }));

    return {
      findings: findingsWithSource,
      overallRiskAssessment: promptOutput.overallRiskAssessment || "Informational",
      executiveSummary: promptOutput.executiveSummary || "El análisis SAST simulado está completo. Revise los hallazgos para obtener más detalles.",
    };
  }
);

