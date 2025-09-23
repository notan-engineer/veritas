import { CheerioAPI } from 'cheerio';
import * as crypto from 'crypto';
import { ArticleContent } from './types';
import { ExtractionRecorder, ExtractionTrace } from './extraction-recorder';

// Extended type for extraction with optional traces
export interface ArticleContentWithTraces extends ArticleContent {
  traces?: ExtractionTrace[];
}

// Content extraction with multiple strategies and optional tracking
export function extractArticleContent($: CheerioAPI, url: string, enableTracking: boolean = false): ArticleContentWithTraces {
  const recorder = new ExtractionRecorder(enableTracking);
  const strategies = [
    // 1. Structured data (JSON-LD)
    () => {
      const scripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts.eq(i);
        try {
          const data = JSON.parse(script.text());
          if (data['@type'] === 'NewsArticle' || data['@type'] === 'Article') {
            // Record JSON-LD extraction if tracking is enabled
            if (recorder.isEnabled()) {
              recorder.recordJsonLd(`script[type="application/ld+json"]:eq(${i})`, 'json-ld', data);
            }
            return {
              title: data.headline || '',
              content: data.articleBody || '',
              author: data.author?.name || null,
              date: data.datePublished || null
            };
          }
        } catch (e) {
          // Continue to next script
        }
      }
      return null;
    },
    
    // 2. Common article selectors
    () => {
      // Try title selectors in order
      const title = recorder.text($, 'h1', 'title') ||
                   recorder.attr($, 'meta[property="og:title"]', 'content', 'title') ||
                   '';

      // Try content selectors and find the best one
      let content = '';
      const contentSelectors = [
        'article', '.article-content', '.story-body',
        '.entry-content', '.post-content', 'main'
      ];

      for (const selector of contentSelectors) {
        const extracted = recorder.text($, selector, 'content');
        if (extracted && extracted.length > 100) {
          content = extracted;
          break;
        }
      }

      // Try author selectors
      const author = recorder.text($, '.author', 'author') ||
                    recorder.text($, '.by-author', 'author') ||
                    recorder.text($, '.article-author', 'author') ||
                    recorder.attr($, 'meta[name="author"]', 'content', 'author') ||
                    null;

      // Try date selectors
      const date = recorder.attr($, 'time', 'datetime', 'date') ||
                  recorder.text($, '.date', 'date') ||
                  recorder.text($, '.published', 'date') ||
                  recorder.attr($, 'meta[property="article:published_time"]', 'content', 'date') ||
                  null;

      return { title, content, author, date };
    },
    
    // 3. Fallback to meta tags
    () => ({
      title: recorder.attr($, 'meta[property="og:title"]', 'content', 'title') ||
             recorder.attr($, 'meta[name="twitter:title"]', 'content', 'title') ||
             recorder.text($, 'title', 'title') ||
             '',
      content: recorder.attr($, 'meta[property="og:description"]', 'content', 'content') ||
              recorder.attr($, 'meta[name="description"]', 'content', 'content') ||
              recorder.attr($, 'meta[name="twitter:description"]', 'content', 'content') ||
              '',
      author: recorder.attr($, 'meta[name="author"]', 'content', 'author') || null,
      date: recorder.attr($, 'meta[property="article:published_time"]', 'content', 'date') || null
    })
  ];
  
  for (const strategy of strategies) {
    try {
      const result = strategy();
      if (result && result.content && result.content.length > 100) {
        // Clean up the content
        result.content = result.content
          .replace(/\s+/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        // Add traces if tracking is enabled
        if (enableTracking) {
          return { ...result, traces: recorder.getTraces() };
        }
        return result;
      }
    } catch (e) {
      // Try next strategy
    }
  }

  // Last resort - get raw text
  const bodyText = $('body').text()
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 5000);

  const fallbackResult = {
    title: recorder.text($, 'title', 'title') || 'Untitled',
    content: bodyText || 'No content extracted',
    author: null,
    date: null
  };

  // Add traces if tracking is enabled
  if (enableTracking) {
    return { ...fallbackResult, traces: recorder.getTraces() };
  }
  return fallbackResult;
}

// Language detection
export function detectLanguage(text: string): string {
  if (!text || text.length < 20) return 'en';
  
  // Check for RTL characters
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/;
  if (rtlRegex.test(text)) {
    // Further distinguish Hebrew vs Arabic
    const hebrewRegex = /[\u0590-\u05FF]/;
    const arabicRegex = /[\u0600-\u06FF]/;
    
    const hebrewCount = (text.match(hebrewRegex) || []).length;
    const arabicCount = (text.match(arabicRegex) || []).length;
    
    return hebrewCount > arabicCount ? 'he' : 'ar';
  }
  
  // Check for common language patterns
  const languagePatterns: Record<string, RegExp[]> = {
    'en': [/\b(the|and|of|to|in|is|that|it|was|for|with|as|on|at|by|from|this|have|been|are|were)\b/gi],
    'fr': [/\b(le|la|les|un|une|de|du|des|et|est|pour|que|dans|avec)\b/gi],
    'es': [/\b(el|la|los|las|un|una|de|del|y|es|en|que|por|para|con)\b/gi],
    'de': [/\b(der|die|das|ein|eine|und|ist|von|mit|für|auf|den|dem)\b/gi],
    'it': [/\b(il|la|lo|gli|le|un|una|di|del|della|e|è|per|che|con|da)\b/gi],
    'pt': [/\b(o|a|os|as|um|uma|de|do|da|e|é|para|que|com|por|em|no|na|nos|nas)\b/gi],
    'nl': [/\b(de|het|een|van|en|is|in|op|voor|met|te|dat|die)\b/gi],
    'ru': [/[\u0400-\u04FF]/], // Cyrillic characters
    'zh': [/[\u4e00-\u9fff]/], // Chinese characters
    'ja': [/[\u3040-\u309f\u30a0-\u30ff]/], // Hiragana and Katakana
    'ko': [/[\uac00-\ud7af]/], // Korean characters
  };
  
  const scores: Record<string, number> = {};
  
  for (const [lang, patterns] of Object.entries(languagePatterns)) {
    scores[lang] = 0;
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        scores[lang] += matches.length;
      }
    }
  }
  
  // Find language with highest score
  let maxScore = 0;
  let detectedLang = 'en';
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }
  
  // If score is too low, default to English
  if (maxScore < 5) {
    return 'en';
  }
  
  return detectedLang;
}

// Content hashing for duplicate detection
export function generateContentHash(title: string, content: string): string {
  // Normalize content for better duplicate detection
  const normalizedTitle = title.trim().toLowerCase().replace(/\s+/g, ' ');
  const normalizedContent = content.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Use more content for better uniqueness while avoiding very long strings
  const contentSample = normalizedContent.substring(0, 2000);
  const combined = `${normalizedTitle}:${contentSample}`;
  
  return crypto.createHash('sha256').update(combined).digest('hex');
}

// Format duration for display
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Validate RSS feed URL
export async function validateRSSFeed(url: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Veritas/1.0' }
    });
    
    if (!response.ok) {
      return { valid: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const text = await response.text();
    
    // Basic RSS/Atom feed validation
    if (!text.includes('<rss') && !text.includes('<feed') && !text.includes('<channel')) {
      return { valid: false, error: 'Not a valid RSS/Atom feed' };
    }
    
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message || 'Failed to validate feed' };
  }
} 