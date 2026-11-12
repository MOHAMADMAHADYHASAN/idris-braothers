import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'production' | 'test';
const VALID_NODE_ENVS: readonly NodeEnv[] = ['development', 'production', 'test'];

function parsePositiveInt(raw: string | undefined, fallback: number, name: string): number {
  const value = parseInt(raw ?? String(fallback), 10);
  if (Number.isNaN(value) || value <= 0) {
    console.error(`❌ Invalid environment variable ${name}: expected positive integer, got "${raw}"`);
    process.exit(1);
  }
  return value;
}

const rawNodeEnv = (process.env.NODE_ENV || 'development') as NodeEnv;
if (!VALID_NODE_ENVS.includes(rawNodeEnv)) {
  console.error(`❌ Invalid NODE_ENV: "${rawNodeEnv}". Allowed: ${VALID_NODE_ENVS.join(', ')}`);
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error('❌ Invalid environment variable: DATABASE_URL is required');
  process.exit(1);
}

export const env = {
  PORT: parsePositiveInt(process.env.PORT, 5000, 'PORT'),
  NODE_ENV: rawNodeEnv,
  DATABASE_URL: databaseUrl,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT_WINDOW_MS: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 900000, 'RATE_LIMIT_WINDOW_MS'),
  RATE_LIMIT_MAX: parsePositiveInt(process.env.RATE_LIMIT_MAX, 2000, 'RATE_LIMIT_MAX'),
};
