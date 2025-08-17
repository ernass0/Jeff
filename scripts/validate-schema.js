import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function tryRead(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const leaguePath = path.join(process.cwd(), 'data', 'league.json');
const schemaPath = path.join(process.cwd(), 'data', 'schema.json');
const league = tryRead(leaguePath);
if (!league) {
  console.log('No data/league.json yet — skipping.');
  process.exit(0);
}
const schema = tryRead(schemaPath);
if (!schema) {
  console.log('No data/schema.json — skipping.');
  process.exit(0);
}
// Light validation: check required top-level keys
const required = schema.required || [];
const missing = required.filter((k) => !(k in league));
if (missing.length) {
  console.error('Schema check failed. Missing keys:', missing.join(', '));
  process.exit(1);
}
console.log('Schema check: OK');
