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

      // Try content selectors with improved extraction
      let content = '';
      const contentSelectors = [
        // More specific selectors first
        '[itemprop="articleBody"]',
        'article [class*="body"]:not([class*="meta"])',
        'article [class*="content"]:not([class*="header"])',
        'main [class*="story-body"]',
        '.article-text',
        '.story-content',
        // BBC specific - Try multiple BBC selectors
        '[data-component="text-block"]',
        '[data-testid="article-body"]',
        'div[class*="Text-sc"]', // BBC's styled components pattern
        'article div[class*="Paragraph"]',
        // NYTimes specific
        'section[name="articleBody"]',
        // Guardian specific
        '.content__article-body',
        // General fallbacks
        'article', '.article-content', '.story-body',
        '.entry-content', '.post-content', 'main'
      ];

      for (const selector of contentSelectors) {
        const extracted = recorder.extractContent($, selector, 'content');
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
        // Preserve paragraph structure while cleaning
        const isHtml = result.content.includes('<') || result.content.includes('&');

        if (isHtml) {
          // Load content as HTML and extract structured text
          const $temp = $.load(result.content);
          result.content = preserveContentStructure($temp.html() || result.content, $);
        } else if (!result.content.includes('\n\n')) {
          // If no paragraph breaks exist, try to add them intelligently
          result.content = preserveContentStructure(result.content, $);
        } else {
          // Already has paragraph structure, just clean
          result.content = result.content
            .replace(/\r\n/g, '\n')
            .replace(/\n{4,}/g, '\n\n\n')  // Max 3 newlines (one empty line)
            .trim();
        }

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

/**
 * Preserves paragraph structure while cleaning content
 * Maintains readability without aggressive whitespace collapse
 */
function preserveContentStructure(html: string, $: CheerioAPI): string {
  // If already plain text, detect natural breaks
  if (!html.includes('<')) {
    return html
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\n{4,}/g, '\n\n\n')     // Max 3 newlines (one empty line)
      .replace(/([.!?])\s+([A-Z])/g, '$1\n\n\n$2')  // Detect sentence->paragraph boundaries with empty line
      .trim();
  }

  // Load HTML content for processing
  const $content = $.load(`<div id="wrapper">${html}</div>`);

  // First, remove non-content elements
  $content('#wrapper').find(`
    nav, .navigation, .nav-menu,
    .social-share, .share-buttons, .sharing,
    .newsletter-signup, .newsletter, .subscribe,
    .advertisement, .ad-container, .ads,
    .related-articles, .recommended, .more-on,
    aside:not(.article-aside), footer,
    .comments, .comment-section,
    [class*="promo"], [class*="banner"],
    .caption, .video-caption, figcaption,
    .featured-video, .video-container,
    .video-player, .video-wrap,
    [class*="caption"], figure
  `).remove();

  // Convert block elements to text with proper spacing
  const paragraphs: string[] = [];

  // Process paragraph tags first
  $content('#wrapper p').each((i, elem) => {
    const $elem = $content(elem);
    const text = $elem.text().trim();

    // Check if entire paragraph is a link AND in ALL CAPS
    // This is a structural pattern that indicates related article links
    const link = $elem.find('a').first();
    if (link.length > 0) {
      const linkText = link.text().trim();
      // If the link contains all the paragraph text AND it's ALL CAPS, skip it
      if (linkText === text && text === text.toUpperCase() && text.length > 20) {
        return; // Skip this paragraph - it's a related article link
      }
    }

    if (text.length > 30 && !isBoilerplate(text)) {
      paragraphs.push(text);
    }
  });

  // If no paragraphs found, try div-based content
  if (paragraphs.length === 0) {
    $content('#wrapper > div, #wrapper article > div').each((i, elem) => {
      const text = $content(elem).text().trim();
      if (text.length > 50 && !isBoilerplate(text)) {
        // Split on natural breaks
        const parts = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
        paragraphs.push(...parts.filter(p => p.length > 30));
      }
    });
  }

  return paragraphs.join('\n\n\n').trim();
}

/**
 * Detects common boilerplate text patterns
 * Note: Only using structural patterns, not content-based filtering
 * to avoid accidentally removing legitimate article content
 */
function isBoilerplate(text: string): boolean {
  // Only filter based on clear structural patterns that are unlikely
  // to appear in legitimate article content
  const patterns = [
    /^\d+\s+(minute|hour|day)s?\s+ago$/i,        // Timestamp patterns
    /^(image source|getty images)/i,              // Image attribution
    /^©\s*\d{4}/i,                               // Copyright notices
    /^\[.*\]$/                                    // Square bracket annotations
  ];

  return patterns.some(pattern => pattern.test(text));
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