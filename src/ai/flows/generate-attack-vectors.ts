'use server';
/**
 * @fileOverview Generates potential attack vectors based on identified vulnerabilities.
 *
 * - generateAttackVectors - A function that takes vulnerability analysis output and generates corresponding attack vectors.
 * - GenerateAttackVectorsInput - The input type for the generateAttackVectors function.
 * - GenerateAttackVectorsOutput - The return type for the generateAttackVectors function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AnalyzeVulnerabilitiesOutput, Vulnerability } from '@/types'; // Vulnerability type now includes severity and description

const AttackVectorItemSchema = z.object({
  vulnerabilityName: z.string().describe('The name/category of the vulnerability this attack vector is based on.'),
  attackScenarioDescription: z.string().describe('A description of how an attacker might exploit this vulnerability. Tailor to the vulnerability type.'),
  examplePayloadOrTechnique: z.string().describe('An example of a malicious payload, code snippet, or technique an attacker might use. This should be illustrative and for educational purposes only.'),
  expectedOutcomeIfSuccessful: z.string().describe('The expected outcome if the attack is successful, e.g., "Account lockout", "Unauthorized data access", "Cross-Site Scripting execution", "SQL Injection successful".'),
});

// This schema is used internally and for the output type, but not exported directly.
const GenerateAttackVectorsOutputSchema = z.array(AttackVectorItemSchema);
export type GenerateAttackVectorsOutput = z.infer<typeof GenerateAttackVectorsOutputSchema>;

// Define a schema for the input to the individual prompt (a single vulnerability finding)
const SingleVulnerabilityFindingInputSchema = z.object({
    vulnerability: z.string().describe('The identified vulnerability category (e.g., Cross-Site Scripting (XSS), SQL Injection, Weak Password Policy).'),
    description: z.string().describe('A brief description of the specific finding related to the vulnerability category.'),
    isVulnerable: z.boolean().describe('Whether the URL shows signs of being vulnerable to this specific finding.'),
    severity: z.enum(['Low', 'Medium', 'High', 'Informational']).describe('The estimated severity of the vulnerability finding.'),
    potentialForAccountLockout: z
        .boolean()
        .describe('Whether this specific finding could directly contribute to account lockouts.'),
    remediation: z.string().describe('Suggested remediation steps for the finding.'),
});

// This schema is used internally and for the input type, but not exported directly.
// The input to the main flow is an array of these findings.
const GenerateAttackVectorsInputSchema = z.array(SingleVulnerabilityFindingInputSchema);
export type GenerateAttackVectorsInput = z.infer<typeof GenerateAttackVectorsInputSchema>;


export async function generateAttackVectors(
  input: GenerateAttackVectorsInput
): Promise<GenerateAttackVectorsOutput> {
  // Filter out non-vulnerable findings before calling the flow
  const vulnerableFindings = input.filter(v => v.isVulnerable);
  if (vulnerableFindings.length === 0) {
    return [];
  }
  return generateAttackVectorsFlow(vulnerableFindings);
}

const generateAttackVectorForVulnerabilityPrompt = ai.definePrompt({
  name: 'generateAttackVectorForVulnerabilityPrompt',
  input: { schema: SingleVulnerabilityFindingInputSchema },
  output: { schema: AttackVectorItemSchema },
  prompt: `
    You are a cybersecurity expert. Given the following vulnerability finding, describe a potential *illustrative* attack vector.
    Focus on how an attacker could exploit this specific finding. Tailor the scenario, payload/technique, and outcome to the vulnerability type and description.
    If 'potentialForAccountLockout' is true, ensure the scenario reflects this possibility where appropriate for the vulnerability type.

    Provide a brief, illustrative example of a payload or technique.
    Clearly state the expected outcome if the attack is successful (e.g., XSS execution, data exposure, account lockout).
    This information is strictly for educational purposes to demonstrate risk. Do NOT generate overly complex or directly executable harmful code. Keep payloads/techniques simple and conceptual.

    Vulnerability Finding Details:
    - Category: {{{vulnerability}}}
    - Specific Finding: {{{description}}}
    - Severity: {{{severity}}}
    - Is Vulnerable: {{{isVulnerable}}} (This will always be true for inputs to this prompt)
    - Potential for Account Lockout: {{{potentialForAccountLockout}}}
    - Remediation: {{{remediation}}}

    Based on this, generate the attack vector information:
    - vulnerabilityName: Use the 'Category' (e.g., "Cross-Site Scripting (XSS)").
    - attackScenarioDescription: Describe the attack based on the 'Specific Finding'.
    - examplePayloadOrTechnique: Provide a conceptual example relevant to the 'Category' and 'Specific Finding' (e.g., "Injecting <script>alert(1)</script> into a form field", "Sending 1000 registration requests rapidly", "Trying SQL query ' OR 1=1 -- '").
    - expectedOutcomeIfSuccessful: State the likely result (e.g., "Execute arbitrary script in user's browser", "Overwhelm server resources", "Bypass authentication").
  `,
});

const generateAttackVectorsFlow = ai.defineFlow(
  {
    name: 'generateAttackVectorsFlow',
    inputSchema: GenerateAttackVectorsInputSchema, // Expects an array of *vulnerable* findings
    outputSchema: GenerateAttackVectorsOutputSchema,
  },
  async (vulnerableFindings) => {
    const attackVectors: z.infer<typeof AttackVectorItemSchema>[] = [];

    // Process only the findings passed in (which should already be filtered for isVulnerable=true)
    for (const vulnFinding of vulnerableFindings) {
        const { output } = await generateAttackVectorForVulnerabilityPrompt(vulnFinding);
        if (output) {
          // Ensure the output vulnerabilityName matches the input category for consistency
          attackVectors.push({ ...output, vulnerabilityName: vulnFinding.vulnerability });
        }
    }
    return attackVectors;
  }
);
