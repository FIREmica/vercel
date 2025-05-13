import { config } from 'dotenv';
config();

import '@/ai/flows/generate-vulnerability-report.ts';
import '@/ai/flows/analyze-vulnerabilities.ts';
import '@/ai/flows/generate-attack-vectors.ts';
