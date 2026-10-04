/**
 * Authentication Utilities for Cloudflare Workers
 * Uses jose for JWT and Web Crypto API for password hashing
 */

import { SignJWT, jwtVerify } from 'jose';
import { Admin, JWTPayload, CloudflareEnv } from './types';
import { Database } from './db';

export class AuthService {
  private db: Database;
  private jwtSecret: Uint8Array;

  constructor(db: Database, jwtSecret: string) {
    this.db = db;
    // Convert secret string to Uint8Array for jose
    this.jwtSecret = new TextEncoder().encode(jwtSecret);
  }

  /**
   * Hash a password using PBKDF2 (Web Crypto API)
   */
  async hashPassword(password: string): Promise<string> {
    // Generate random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Hash password with PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']),
      { name: 'HMAC', hash: 'SHA-256' },
      true,
      ['sign']
    );

    const hashBuffer = await crypto.subtle.exportKey('raw', key);
    const hashArray = new Uint8Array(hashBuffer);
    const saltArray = new Uint8Array(salt);
    
    // Combine salt + hash and return as base64
    const combined = new Uint8Array(saltArray.length + hashArray.length);
    combined.set(saltArray);
    combined.set(hashArray, saltArray.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Verify a password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      // Decode hash
      const combined = new Uint8Array(
        atob(hash).split('').map(c => c.charCodeAt(0))
      );
      
      // Extract salt (first 16 bytes)
      const salt = combined.slice(0, 16);
      const storedHash = combined.slice(16);
      
      // Hash the provided password with the same salt
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']),
        { name: 'HMAC', hash: 'SHA-256' },
        true,
        ['sign']
      );

      const hashBuffer = await crypto.subtle.exportKey('raw', key);
      const hashArray = new Uint8Array(hashBuffer);
      
      // Compare hashes
      return this.constantTimeCompare(hashArray, storedHash);
    } catch {
      return false;
    }
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  private constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }

  /**
   * Create JWT token (async for jose)
   */
  async createToken(admin: Admin, expiresIn: number = 86400): Promise<string> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    return new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
      .sign(this.jwtSecret);
  }

  /**
   * Verify JWT token (async for jose)
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret);
      return payload as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Authenticate user with username and password
   */
  async authenticate(username: string, password: string): Promise<{ admin: Admin; token: string } | null> {
    try {
      const admin = await this.db.queryOne<Admin>(
        'SELECT * FROM admins WHERE username = ? OR email = ?',
        [username, username]
      );

      if (!admin || admin.is_active === 0) {
        return null;
      }

      const passwordValid = await this.verifyPassword(password, admin.password_hash);
      if (!passwordValid) {
        return null;
      }

      const token = await this.createToken(admin);

      // Update last login
      await this.db.execute(
        'UPDATE admins SET last_login = datetime("now") WHERE id = ?',
        [admin.id]
      );

      return { admin, token };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: number): Promise<Admin | null> {
    return this.db.queryOne<Admin>('SELECT * FROM admins WHERE id = ?', [id]);
  }

  /**
   * Get admin by username
   */
  async getAdminByUsername(username: string): Promise<Admin | null> {
    return this.db.queryOne<Admin>(
      'SELECT * FROM admins WHERE username = ? OR email = ?',
      [username, username]
    );
  }

  /**
   * Check if token is valid and return admin
   */
  async validateToken(token: string): Promise<Admin | null> {
    const payload = await this.verifyToken(token);
    if (!payload) {
      return null;
    }

    return this.getAdminById(payload.id);
  }

  /**
   * Create new admin user
   */
  async createAdmin(
    username: string,
    email: string,
    password: string,
    role: string = 'admin'
  ): Promise<Admin | null> {
    try {
      const existingAdmin = await this.getAdminByUsername(username);
      if (existingAdmin) {
        throw new Error('Username already exists');
      }

      const passwordHash = await this.hashPassword(password);
      const id = await this.db.insert(
        'INSERT INTO admins (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
        [username, email, passwordHash, role]
      );

      return this.getAdminById(id);
    } catch (error) {
      console.error('Create admin error:', error);
      return null;
    }
  }

  /**
   * Update admin password
   */
  async updatePassword(adminId: number, newPassword: string): Promise<boolean> {
    try {
      const passwordHash = await this.hashPassword(newPassword);
      const changes = await this.db.execute(
        'UPDATE admins SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
        [passwordHash, adminId]
      );
      return changes > 0;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  }

  /**
   * Verify authentication token from request
   */
  extractTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(
  request: Request,
  authService: AuthService
): Promise<{ admin: Admin; error: null } | { admin: null; error: string }> {
  const token = authService.extractTokenFromRequest(request);

  if (!token) {
    return { admin: null, error: 'Missing authorization token' };
  }

  const admin = await authService.validateToken(token);
  if (!admin) {
    return { admin: null, error: 'Invalid or expired token' };
  }

  return { admin, error: null };
}

/**
 * Middleware to check if user has specific role
 */
export function requireRole(admin: Admin | null, requiredRoles: string[]): boolean {
  if (!admin) return false;
  return requiredRoles.includes(admin.role);
}
