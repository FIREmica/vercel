// 'use server'

'use server';

/**
 * @fileOverview Analyzes a user registration page URL for vulnerabilities that could lead to account lockouts.
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
  vulnerability: z.string().describe('The identified vulnerability.'),
  isVulnerable: z.boolean().describe('Whether the URL is vulnerable to the identified vulnerability.'),
  potentialForAccountLockout: z
    .boolean()
    .describe('Whether the vulnerability could lead to account lockouts.'),
  remediation: z.string().describe('Suggested remediation steps to address the vulnerability.'),
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
  prompt: `You are a security expert analyzing user registration pages for vulnerabilities.

  Analyze the provided URL to identify potential vulnerabilities that could lead to account lockouts.
  Present your findings in a JSON array of objects with the following properties:
  - vulnerability: The identified vulnerability.
  - isVulnerable: A boolean indicating whether the URL is vulnerable to the identified vulnerability. Always set this to true or false.
  - potentialForAccountLockout: A boolean indicating whether the vulnerability could lead to account lockouts. Always set this to true or false.
  - remediation: Suggested remediation steps to address the vulnerability.

  Ensure the output is a valid JSON array.

  URL: {{{url}}}
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
    return output!;
  }
);
