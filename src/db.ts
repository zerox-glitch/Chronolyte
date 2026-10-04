/**
 * Database Utilities for Cloudflare D1
 */

import { CloudflareEnv } from './types';

export class Database {
  constructor(private db: D1Database) {}

  /**
   * Execute a SELECT query
   */
  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const statement = this.db.prepare(sql);
      const result = await statement.bind(...params).all();
      return (result.results || []) as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a SELECT query and return first result
   */
  async queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE query
   */
  async execute(sql: string, params: any[] = []): Promise<number> {
    try {
      const statement = this.db.prepare(sql);
      const result = await statement.bind(...params).run();
      return result.meta.changes;
    } catch (error) {
      console.error('Database execute error:', error);
      throw new Error(`Execute failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute an INSERT and return the last inserted ID
   */
  async insert(sql: string, params: any[] = []): Promise<number> {
    try {
      const statement = this.db.prepare(sql);
      const result = await statement.bind(...params).run();
      return result.meta.last_row_id as number;
    } catch (error) {
      console.error('Database insert error:', error);
      throw new Error(`Insert failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Begin a transaction
   */
  async transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    try {
      await this.execute('BEGIN TRANSACTION');
      const result = await callback(this);
      await this.execute('COMMIT');
      return result;
    } catch (error) {
      await this.execute('ROLLBACK');
      throw error;
    }
  }

  /**
   * Count rows with optional WHERE clause
   */
  async count(table: string, where: string = ''): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM ${table} ${where}`;
    const result = await this.queryOne<{ count: number }>(sql);
    return result?.count || 0;
  }

  /**
   * Helper to build paginated queries
   */
  buildPaginationSQL(baseSql: string, page: number = 1, limit: number = 10): string {
    const offset = (page - 1) * limit;
    return `${baseSql} LIMIT ${limit} OFFSET ${offset}`;
  }
}

/**
 * Get database instance from environment
 */
export function getDB(env: CloudflareEnv): Database {
  return new Database(env.DB);
}

/**
 * Parse JSON safely
 */
export function parseJSON<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Stringify JSON safely
 */
export function stringifyJSON(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}
