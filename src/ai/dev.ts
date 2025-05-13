
import { config } from 'dotenv';
config();

// Order might matter if there are dependencies, but these are typically independent flow definitions.
import '@/ai/flows/analyze-url-vulnerabilities.ts';
import '@/ai/flows/analyze-server-security.ts';
import '@/ai/flows/analyze-database-security.ts';
import '@/ai/flows/generate-attack-vectors.ts';
import '@/ai/flows/generate-security-report.ts';
