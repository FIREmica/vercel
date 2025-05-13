'use server';
/**
 * @fileOverview Generates potential attack vectors based on identified vulnerabilities.
 *
 * - generateAttackVectors - A function that takes vulnerability analysis output and generates corresponding attack vectors.
 */

import { ai } from '@/ai/genkit';
// Import schemas and types from the centralized ai-schemas.ts file
import {
  VulnerabilityFindingSchema, // Used as SingleVulnerabilityFindingInputSchema
  type GenerateAttackVectorsInput,
  GenerateAttackVectorsInputSchema,
  type GenerateAttackVectorsOutput,
  GenerateAttackVectorsOutputSchema,
  AttackVectorItemSchema, // For individual attack vector items
  type AttackVectorItem,
} from '@/types/ai-schemas';


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
  input: { schema: VulnerabilityFindingSchema }, // Uses the imported schema directly
  output: { schema: AttackVectorItemSchema }, // Uses the imported schema
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
    - Is Vulnerable: {{{isVulnerable}}} (This will always be true for inputs to this prompt as they are pre-filtered)
    - Potential for Account Lockout: {{{potentialForAccountLockout}}}
    - Remediation (for context, not direct use): {{{remediation}}}

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
    inputSchema: GenerateAttackVectorsInputSchema, 
    outputSchema: GenerateAttackVectorsOutputSchema,
  },
  async (vulnerableFindings): Promise<GenerateAttackVectorsOutput> => {
    const attackVectors: AttackVectorItem[] = []; // Use the imported type

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
