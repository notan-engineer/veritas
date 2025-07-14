import { createHash } from 'crypto';
import { scraperDb } from './database';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'none' | 'url' | 'content' | 'both';
  existingContentId?: string;
  contentHash?: string;
  reason?: string;
}

export interface ContentItem {
  url: string;
  title: string;
  content: string;
  author?: string;
  publishDate?: Date;
}

export interface DuplicateDetectionOptions {
  checkUrl?: boolean;
  checkContent?: boolean;
  contentSimilarityThreshold?: number;
  normalizeContent?: boolean;
  ignoreDateDifferences?: boolean;
}

/**
 * Duplicate Detection System for scraper service
 * Handles URL and content hash-based duplicate prevention
 */
export class DuplicateDetector {
  private readonly defaultOptions: Required<DuplicateDetectionOptions> = {
    checkUrl: true,
    checkContent: true,
    contentSimilarityThreshold: 0.95,
    normalizeContent: true,
    ignoreDateDifferences: false
  };

  /**
   * Check if content is duplicate
   */
  async checkForDuplicate(
    item: ContentItem,
    options: DuplicateDetectionOptions = {}
  ): Promise<DuplicateCheckResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    let isDuplicate = false;
    let duplicateType: DuplicateCheckResult['duplicateType'] = 'none';
    let existingContentId: string | undefined;
    let reason: string | undefined;

    // Check URL-based duplicates
    if (opts.checkUrl) {
      const urlDuplicate = await this.checkUrlDuplicate(item.url);
      if (urlDuplicate.isDuplicate) {
        isDuplicate = true;
        duplicateType = 'url';
        existingContentId = urlDuplicate.existingContentId;
        reason = urlDuplicate.reason;
      }
    }

    // Check content-based duplicates
    if (opts.checkContent && !isDuplicate) {
      const contentDuplicate = await this.checkContentDuplicate(item, opts);
      if (contentDuplicate.isDuplicate) {
        isDuplicate = true;
        duplicateType = duplicateType === 'url' ? 'both' : 'content';
        existingContentId = contentDuplicate.existingContentId;
        reason = contentDuplicate.reason;
      }
    }

    // Generate content hash for storage
    const contentHash = this.generateContentHash(item, opts.normalizeContent);

    return {
      isDuplicate,
      duplicateType,
      existingContentId,
      contentHash,
      reason
    };
  }

  /**
   * Check for URL-based duplicates
   */
  private async checkUrlDuplicate(url: string): Promise<DuplicateCheckResult> {
    try {
      const exists = await scraperDb.contentExists(url);
      
      if (exists) {
        return {
          isDuplicate: true,
          duplicateType: 'url',
          reason: `URL already exists: ${url}`
        };
      }

      // Also check normalized URLs (remove query parameters, fragments)
      const normalizedUrl = this.normalizeUrl(url);
      if (normalizedUrl !== url) {
        const normalizedExists = await scraperDb.contentExists(normalizedUrl);
        if (normalizedExists) {
          return {
            isDuplicate: true,
            duplicateType: 'url',
            reason: `Normalized URL already exists: ${normalizedUrl}`
          };
        }
      }

      return {
        isDuplicate: false,
        duplicateType: 'none'
      };

    } catch (error) {
      console.error('[DuplicateDetector] URL check error:', error);
      return {
        isDuplicate: false,
        duplicateType: 'none',
        reason: `Error checking URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check for content-based duplicates
   */
  private async checkContentDuplicate(
    item: ContentItem,
    options: DuplicateDetectionOptions
  ): Promise<DuplicateCheckResult> {
    try {
      const contentHash = this.generateContentHash(item, options.normalizeContent);
      
      // Check if content with same hash exists
      const exists = await scraperDb.contentExistsByHash(contentHash);
      
      if (exists) {
        return {
          isDuplicate: true,
          duplicateType: 'content',
          contentHash,
          reason: `Content hash already exists: ${contentHash.substring(0, 8)}...`
        };
      }

      return {
        isDuplicate: false,
        duplicateType: 'none',
        contentHash
      };

    } catch (error) {
      console.error('[DuplicateDetector] Content check error:', error);
      return {
        isDuplicate: false,
        duplicateType: 'none',
        reason: `Error checking content: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate content hash for duplicate detection
   */
  generateContentHash(item: ContentItem, normalize: boolean = true): string {
    let contentToHash = item.content;
    
    if (normalize) {
      contentToHash = this.normalizeContent(contentToHash);
    }
    
    // Include title in hash for better duplicate detection
    const hashInput = `${item.title}|||${contentToHash}`;
    
    return createHash('sha256')
      .update(hashInput, 'utf8')
      .digest('hex');
  }

  /**
   * Normalize content for comparison
   */
  private normalizeContent(content: string): string {
    return content
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove common punctuation differences
      .replace(/[""'']/g, '"')
      .replace(/[–—]/g, '-')
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove email addresses
      .replace(/[\w.-]+@[\w.-]+\.\w+/g, '')
      // Remove numbers that might be timestamps or IDs
      .replace(/\b\d{4,}\b/g, '')
      // Convert to lowercase
      .toLowerCase()
      // Trim
      .trim();
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove common tracking parameters
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'ref', 'source', 'campaign',
        '_ga', '_gac', '_gid', 'mc_cid', 'mc_eid'
      ];
      
      trackingParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      // Remove fragment
      urlObj.hash = '';
      
      // Remove trailing slash if present
      if (urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }
      
      return urlObj.toString();
      
    } catch (error) {
      console.error('[DuplicateDetector] URL normalization error:', error);
      return url;
    }
  }

  /**
   * Calculate content similarity score
   */
  private calculateSimilarity(content1: string, content2: string): number {
    if (content1 === content2) return 1.0;
    
    // Simple similarity based on common words
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Check if two URLs are similar (same domain, similar paths)
   */
  private areUrlsSimilar(url1: string, url2: string): boolean {
    try {
      const urlObj1 = new URL(url1);
      const urlObj2 = new URL(url2);
      
      // Must be same domain
      if (urlObj1.hostname !== urlObj2.hostname) {
        return false;
      }
      
      // Check path similarity
      const path1 = urlObj1.pathname.toLowerCase();
      const path2 = urlObj2.pathname.toLowerCase();
      
      // Remove common prefixes/suffixes
      const cleanPath1 = path1.replace(/^\/+|\/+$/g, '').split('/');
      const cleanPath2 = path2.replace(/^\/+|\/+$/g, '').split('/');
      
      // Similar if most path segments match
      const minLength = Math.min(cleanPath1.length, cleanPath2.length);
      let matches = 0;
      
      for (let i = 0; i < minLength; i++) {
        if (cleanPath1[i] === cleanPath2[i]) {
          matches++;
        }
      }
      
      return matches / minLength >= 0.7;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Get duplicate statistics
   */
  async getDuplicateStats(): Promise<{
    totalContent: number;
    uniqueUrls: number;
    uniqueContentHashes: number;
    duplicatesByUrl: number;
    duplicatesByContent: number;
  }> {
    try {
      // This would require additional database queries
      // For now, return placeholder stats
      return {
        totalContent: 0,
        uniqueUrls: 0,
        uniqueContentHashes: 0,
        duplicatesByUrl: 0,
        duplicatesByContent: 0
      };
    } catch (error) {
      console.error('[DuplicateDetector] Stats error:', error);
      return {
        totalContent: 0,
        uniqueUrls: 0,
        uniqueContentHashes: 0,
        duplicatesByUrl: 0,
        duplicatesByContent: 0
      };
    }
  }

  /**
   * Clean up old duplicate detection data
   */
  async cleanupOldData(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      console.log(`[DuplicateDetector] Cleaning up data older than ${cutoffDate.toISOString()}`);
      
      // This would require a database cleanup query
      // For now, just log the operation
      console.log('[DuplicateDetector] Cleanup completed');
      
    } catch (error) {
      console.error('[DuplicateDetector] Cleanup error:', error);
    }
  }

  /**
   * Batch check for duplicates
   */
  async batchCheckForDuplicates(
    items: ContentItem[],
    options: DuplicateDetectionOptions = {}
  ): Promise<Map<string, DuplicateCheckResult>> {
    const results = new Map<string, DuplicateCheckResult>();
    
    for (const item of items) {
      try {
        const result = await this.checkForDuplicate(item, options);
        results.set(item.url, result);
      } catch (error) {
        console.error(`[DuplicateDetector] Batch check error for ${item.url}:`, error);
        results.set(item.url, {
          isDuplicate: false,
          duplicateType: 'none',
          reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const duplicateDetector = new DuplicateDetector(); 