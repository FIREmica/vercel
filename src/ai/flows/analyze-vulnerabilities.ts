'use server';

/**
 * @fileOverview Analyzes a user registration page URL for common web application vulnerabilities.
 *
 * - analyzeVulnerabilities - A function that handles the vulnerability analysis process.
 * - AnalyzeVulnerabilitiesInput - The input type for the analyzeVulnerabilities function.
 * - AnalyzeVulnerabilitiesOutput - The return type for the analyzeVulnerabilities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVulnerabilitiesInputSchema = z.object({
  url: z.string().url().describe('The URL of the user registration page to analyze.'),
});
export type AnalyzeVulnerabilitiesInput = z.infer<typeof AnalyzeVulnerabilitiesInputSchema>;

const VulnerabilityReportSchema = z.object({
  vulnerability: z.string().describe('The identified vulnerability category (e.g., Cross-Site Scripting (XSS), SQL Injection, Weak Password Policy, Missing Rate Limiting, Insecure Configuration).'),
  description: z.string().describe('A brief description of the specific finding related to the vulnerability category.'),
  isVulnerable: z.boolean().describe('Whether the URL shows signs of being vulnerable to this specific finding.'),
  severity: z.enum(['Low', 'Medium', 'High', 'Informational']).describe('The estimated severity of the vulnerability finding.'),
  potentialForAccountLockout: z
    .boolean()
    .describe('Whether this specific finding could directly contribute to account lockouts.'),
  remediation: z.string().describe('Suggested remediation steps to address the finding.'),
});

const AnalyzeVulnerabilitiesOutputSchema = z.array(VulnerabilityReportSchema);
export type AnalyzeVulnerabilitiesOutput = z.infer<typeof AnalyzeVulnerabilitiesOutputSchema>;

export async function analyzeVulnerabilities(input: AnalyzeVulnerabilitiesInput): Promise<AnalyzeVulnerabilitiesOutput> {
  return analyzeVulnerabilitiesFlow(input);
}

const analyzeVulnerabilitiesPrompt = ai.definePrompt({
  name: 'analyzeVulnerabilitiesPrompt',
  input: {schema: AnalyzeVulnerabilitiesInputSchema},
  output: {schema: AnalyzeVulnerabilitiesOutputSchema},
  prompt: `You are a security expert analyzing user registration pages for common web application vulnerabilities.

  Analyze the provided URL: {{{url}}}

  Identify potential vulnerabilities focusing on the context of a user registration process. Consider common risks including, but not limited to:
  - Cross-Site Scripting (XSS)
  - SQL Injection (SQLi)
  - Weak Password Policies
  - Lack of Rate Limiting (on registration attempts, password resets)
  - Missing or Weak CAPTCHA
  - Information Disclosure (e.g., verbose error messages, user enumeration)
  - Insecure Configuration (e.g., exposed directories, default credentials - if observable)
  - Input Validation Issues (beyond XSS/SQLi)

  Present your findings as a JSON array of objects. Each object should represent a specific finding and include:
  - vulnerability: The general category of the vulnerability (e.g., "Cross-Site Scripting (XSS)", "Rate Limiting").
  - description: A brief description of the *specific* observation or finding related to the category at the given URL.
  - isVulnerable: A boolean indicating whether the URL appears vulnerable to this *specific* finding based on your analysis. Always set this to true or false.
  - severity: Estimate the severity of the finding as 'Low', 'Medium', 'High', or 'Informational'.
  - potentialForAccountLockout: A boolean indicating ONLY if this *specific* finding could *directly* lead to or facilitate account lockouts (e.g., lack of rate limiting on login attempts inferred from registration page patterns, user enumeration). Set to false otherwise.
  - remediation: Suggested high-level remediation steps for the specific finding.

  Focus on vulnerabilities observable or inferable from the registration page's behavior and source code (if accessible, though you cannot execute code or browse extensively).
  Assume standard web technologies unless otherwise indicated by the page content.
  Be objective and base findings on potential indicators.

  Ensure the output is a valid JSON array. If no specific vulnerabilities are confidently identified, return an empty array [].
  `,
});

const analyzeVulnerabilitiesFlow = ai.defineFlow(
  {
    name: 'analyzeVulnerabilitiesFlow',
    inputSchema: AnalyzeVulnerabilitiesInputSchema,
    outputSchema: AnalyzeVulnerabilitiesOutputSchema,
  },
  async input => {
    const {output} = await analyzeVulnerabilitiesPrompt(input);
    // Ensure we always return an array, even if the AI fails to produce valid JSON matching the schema.
    // The schema validation might catch this earlier, but this is a fallback.
    return Array.isArray(output) ? output : [];
  }
);
