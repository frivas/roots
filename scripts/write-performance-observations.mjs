import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

if (!process.env.PERFORMANCE_OBSERVATIONS_JSON) {
  throw new Error('PERFORMANCE_OBSERVATIONS_JSON is required');
}
let observations;
try {
  observations = JSON.parse(process.env.PERFORMANCE_OBSERVATIONS_JSON);
} catch {
  throw new Error('PERFORMANCE_OBSERVATIONS_JSON must be valid JSON');
}
if (observations.releaseSha !== process.env.RELEASE_SHA) {
  throw new Error('performance observations must identify the exact RELEASE_SHA');
}
writeFileSync(
  resolve(process.env.PERFORMANCE_OBSERVATIONS_FILE || 'performance-observations.json'),
  `${JSON.stringify(observations, null, 2)}\n`,
);
