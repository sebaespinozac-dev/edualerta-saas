import { Pool } from 'pg';
import { env } from './env';
import { logger } from './logger';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  application_name: 'edualerta-api',
});

pool.on('error', (err) => {
  logger.error({ err }, 'unexpected pg pool error');
});

export async function pingDatabase(): Promise<boolean> {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    return r.rows[0]?.ok === 1;
  } catch (err) {
    logger.error({ err }, 'db ping failed');
    return false;
  }
}
