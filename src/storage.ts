/**
 * R2 Storage Utilities for Cloudflare Workers
 */

import { CloudflareEnv } from './types';

export class StorageService {
  private bucket: R2Bucket;

  constructor(bucket: R2Bucket) {
    this.bucket = bucket;
  }

  /**
   * Upload file to R2
   */
  async uploadFile(
    key: string,
    file: ArrayBuffer | ReadableStream<Uint8Array>,
    contentType: string = 'application/octet-stream',
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    try {
      await this.bucket.put(key, file, {
        httpMetadata: {
          contentType,
          contentDisposition: `inline; filename="${key.split('/').pop()}"`
        },
        customMetadata: metadata
      });

      // Generate public URL
      // Note: Replace YOUR_ACCOUNT_ID and YOUR_BUCKET_NAME with actual values
      const url = `https://r2.chronolyte.com/${key}`;

      return { url, key };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Upload with category prefix
   */
  async uploadToCategory(
    category: string,
    filename: string,
    file: ArrayBuffer,
    contentType: string = 'application/octet-stream'
  ): Promise<{ url: string; key: string }> {
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${category}/${timestamp}_${sanitizedName}`;

    return this.uploadFile(key, file, contentType, { uploadedAt: new Date().toISOString() });
  }

  /**
   * Download file from R2
   */
  async downloadFile(key: string): Promise<ArrayBuffer | null> {
    try {
      const object = await this.bucket.get(key);
      if (!object) {
        return null;
      }
      return object.arrayBuffer();
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.bucket.delete(key);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * List files in R2
   */
  async listFiles(prefix: string = '', limit: number = 100): Promise<Array<{ key: string; size: number; uploaded: Date }>> {
    try {
      const result = await this.bucket.list({ prefix, limit });
      return result.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
      }));
    } catch (error) {
      console.error('List error:', error);
      return [];
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const object = await this.bucket.get(key, { onlyMetadata: true });
      return object !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<{ size: number; contentType?: string; customMetadata?: Record<string, string> } | null> {
    try {
      const object = await this.bucket.get(key, { onlyMetadata: true });
      if (!object) {
        return null;
      }
      return {
        size: object.size,
        contentType: object.httpMetadata?.contentType,
        customMetadata: object.customMetadata
      };
    } catch {
      return null;
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: number = 10 * 1024 * 1024 // 10MB
  ): { valid: boolean; error?: string } {
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  }
}

/**
 * Get storage service instance
 */
export function getStorageService(env: CloudflareEnv): StorageService {
  return new StorageService(env.UPLOADS);
}

/**
 * Generate public URL for R2 object
 */
export function getR2PublicUrl(key: string, domain: string = 'r2.chronolyte.com'): string {
  return `https://${domain}/${key}`;
}

/**
 * Generate R2 cache key for KV caching
 */
export function getCacheKey(key: string, prefix: string = 'file:'): string {
  return `${prefix}${key}`;
}
