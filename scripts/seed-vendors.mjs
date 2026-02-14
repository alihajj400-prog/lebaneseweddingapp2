/**
 * Seed script: insert Lebanese wedding vendors into Supabase via REST API.
 * Uses SUPABASE_SERVICE_ROLE_KEY (Legacy service_role JWT recommended).
 *
 * Required in .env: VITE_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 * Run: npm run seed:vendors   or   node scripts/seed-vendors.mjs
 * Check: npm run seed:vendors -- --check
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildVendorRows } from './vendor-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      const val = m[2].replace(/^["']|["']$/g, '').replace(/\r$/, '').trim();
      process.env[m[1]] = val;
    }
  }
}

loadEnv();

const baseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
let apiKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\r$/, '').trim();

if (!baseUrl || !apiKey) {
  const missing = [];
  if (!baseUrl) missing.push('VITE_SUPABASE_URL or SUPABASE_URL');
  if (!apiKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  console.error('Missing in .env:', missing.join(', '));
  process.exit(1);
}

const PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000';
const CHUNK_SIZE = 20;

if (process.argv.includes('--check')) {
  console.log('URL:', baseUrl);
  console.log('Key length:', apiKey.length);
  console.log('Key starts with:', apiKey.slice(0, 20) + (apiKey.length > 20 ? '...' : ''));
  process.exit(0);
}

function rest(path, options = {}) {
  const url = `${baseUrl}/rest/v1${path}`;
  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}

async function main() {
  const rows = buildVendorRows(PLACEHOLDER_USER_ID);
  const skipCleanup = process.env.SEED_SKIP_CLEANUP === '1';

  if (!skipCleanup) {
    const listRes = await rest(
      `/vendors?user_id=eq.${PLACEHOLDER_USER_ID}&is_sample=eq.true&select=id`
    );
    if (!listRes.ok) {
      const err = await listRes.text();
      console.error('Cleanup list error:', listRes.status, err);
      if (listRes.status === 401) {
        console.error('\nInvalid API key. Use Legacy service_role JWT:');
        console.error('  Dashboard → Settings → API Keys → Legacy anon, service_role API keys → service_role');
      }
      throw new Error(listRes.statusText);
    }
    const existing = await listRes.json();
    if (existing.length > 0) {
      const delRes = await rest(
        `/vendors?user_id=eq.${PLACEHOLDER_USER_ID}&is_sample=eq.true`,
        { method: 'DELETE' }
      );
      if (!delRes.ok) {
        console.error('Cleanup delete error:', delRes.status, await delRes.text());
        throw new Error('Cleanup failed');
      }
      console.log(`Removed ${existing.length} existing sample vendors.`);
    }
  }

  console.log(`Seeding ${rows.length} vendors in chunks of ${CHUNK_SIZE}...`);

  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const res = await rest('/vendors', {
      method: 'POST',
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Insert error:', res.status, errText);
      if (res.status === 401) {
        console.error('\nInvalid API key. Use Legacy service_role JWT from API Keys → Legacy tab.');
      }
      throw new Error(res.statusText);
    }
    const data = await res.json();
    inserted += Array.isArray(data) ? data.length : 0;
    console.log(`  Inserted ${inserted}/${rows.length}`);
  }

  console.log(`Done. Total vendors inserted: ${inserted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
