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
import type { AnalyzeVulnerabilitiesOutput, Vulnerability } from '@/types';

const AttackVectorItemSchema = z.object({
  vulnerabilityName: z.string().describe('The name of the vulnerability this attack vector is based on.'),
  attackScenarioDescription: z.string().describe('A description of how an attacker might exploit this vulnerability to cause an account lockout or other harm.'),
  examplePayloadOrTechnique: z.string().describe('An example of a malicious payload, code snippet, or technique an attacker might use. This should be illustrative and for educational purposes only.'),
  expectedOutcomeIfSuccessful: z.string().describe('The expected outcome if the attack is successful, e.g., "Account lockout for the targeted user", "Unauthorized access to user data".'),
});

// This schema is used internally and for the output type, but not exported directly.
const GenerateAttackVectorsOutputSchema = z.array(AttackVectorItemSchema);
export type GenerateAttackVectorsOutput = z.infer<typeof GenerateAttackVectorsOutputSchema>;

// Define a schema for the input to the individual prompt (a single vulnerability)
const SingleVulnerabilityInputSchema = z.object({
    vulnerability: z.string().describe('The identified vulnerability.'),
    isVulnerable: z.boolean().describe('Whether the URL is vulnerable to the identified vulnerability.'),
    potentialForAccountLockout: z
        .boolean()
        .describe('Whether the vulnerability could lead to account lockouts.'),
    remediation: z.string().describe('Suggested remediation steps to address the vulnerability.'),
});

// This schema is used internally and for the input type, but not exported directly.
const GenerateAttackVectorsInputSchema = z.array(SingleVulnerabilityInputSchema);
export type GenerateAttackVectorsInput = z.infer<typeof GenerateAttackVectorsInputSchema>;


export async function generateAttackVectors(
  input: GenerateAttackVectorsInput
): Promise<GenerateAttackVectorsOutput> {
  return generateAttackVectorsFlow(input);
}

const generateAttackVectorForVulnerabilityPrompt = ai.definePrompt({
  name: 'generateAttackVectorForVulnerabilityPrompt',
  input: { schema: SingleVulnerabilityInputSchema },
  output: { schema: AttackVectorItemSchema },
  prompt: `
    You are a cybersecurity expert. Given the following vulnerability, describe a potential attack vector.
    Focus on how an attacker could exploit this to cause account lockouts or related issues.
    Provide a brief, illustrative example of a payload or technique.
    Clearly state the expected outcome if the attack is successful.
    This information is for educational purposes to demonstrate risk. Do NOT generate actual harmful code or instructions that could be directly used for malicious activities. Keep payloads/techniques simple and illustrative.

    Vulnerability Details:
    - Name: {{{vulnerability}}}
    - Is Vulnerable: {{{isVulnerable}}}
    - Potential for Account Lockout: {{{potentialForAccountLockout}}}
    - Remediation: {{{remediation}}}

    Based on this, generate the attack vector information.
    If 'Is Vulnerable' is false, you can state that no direct attack vector is applicable for this specific item based on the current assessment, but briefly mention general risks if this type of vulnerability were present.
    Example Payload/Technique: Should be a conceptual example, e.g., "Sending 1000 login attempts with common passwords", "Injecting ' OR 1=1 -- " into username field", "Using a script to rapidly submit registration forms with slight variations of a target email".
    Expected Outcome: e.g., "Targeted account becomes locked", "Database reveals all usernames", "System resources exhausted, preventing new registrations".
  `,
});

const generateAttackVectorsFlow = ai.defineFlow(
  {
    name: 'generateAttackVectorsFlow',
    inputSchema: GenerateAttackVectorsInputSchema,
    outputSchema: GenerateAttackVectorsOutputSchema,
  },
  async (vulnerabilities) => {
    const attackVectors: z.infer<typeof AttackVectorItemSchema>[] = [];

    for (const vuln of vulnerabilities) {
      // Only generate attack vectors for vulnerabilities marked as 'isVulnerable'
      // or if it has potential for account lockout, as per user request to "probar posibles codigos malicioso luego del resultado de seguridad"
      if (vuln.isVulnerable || vuln.potentialForAccountLockout) {
        const { output } = await generateAttackVectorForVulnerabilityPrompt(vuln);
        if (output) {
          attackVectors.push(output);
        }
      }
    }
    return attackVectors;
  }
);
