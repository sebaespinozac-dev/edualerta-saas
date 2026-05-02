/**
 * Tiny query helper around the pg Pool — no ORM bloat.
 * Use:
 *   const rows = await db.many<User>('SELECT * FROM users WHERE org=$1', [orgId]);
 *   const u    = await db.one<User>('SELECT * FROM users WHERE id=$1', [id]);
 *   await db.tx(async (q) => { ... });
 */
import { pool } from '../config/database';
import type { PoolClient, QueryResultRow } from 'pg';

export const db = {
  async query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
    return pool.query<T>(text, params as unknown[]);
  },

  async many<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
    const r = await pool.query<T>(text, params as unknown[]);
    return r.rows;
  },

  async one<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
    const r = await pool.query<T>(text, params as unknown[]);
    return r.rows[0] ?? null;
  },

  async oneRequired<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
    notFoundMsg = 'not found'
  ): Promise<T> {
    const row = await this.one<T>(text, params);
    if (!row) {
      const e = new Error(notFoundMsg) as Error & { status?: number };
      e.status = 404;
      throw e;
    }
    return row;
  },

  async tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const out = await fn(client);
      await client.query('COMMIT');
      return out;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
