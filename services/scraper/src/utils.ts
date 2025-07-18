import { CheerioAPI } from 'cheerio';
import * as crypto from 'crypto';
import { ArticleContent } from './types';

// Content extraction with multiple strategies
export function extractArticleContent($: CheerioAPI, url: string): ArticleContent {
  const strategies = [
    // 1. Structured data (JSON-LD)
    () => {
      const scripts = $('script[type="application/ld+json"]');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts.eq(i);
        try {
          const data = JSON.parse(script.text());
          if (data['@type'] === 'NewsArticle' || data['@type'] === 'Article') {
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
      const title = $('h1').first().text().trim() || 
                   $('meta[property="og:title"]').attr('content') || 
                   '';
      
      const content = $('article').text().trim() || 
                     $('.article-content').text().trim() || 
                     $('.story-body').text().trim() || 
                     $('.entry-content').text().trim() ||
                     $('.post-content').text().trim() ||
                     $('main').text().trim() ||
                     '';
      
      const author = $('.author').text().trim() || 
                    $('.by-author').text().trim() ||
                    $('.article-author').text().trim() ||
                    $('meta[name="author"]').attr('content') || 
                    null;
      
      const date = $('time').attr('datetime') || 
                  $('.date').text().trim() ||
                  $('.published').text().trim() ||
                  $('meta[property="article:published_time"]').attr('content') || 
                  null;
      
      return { title, content, author, date };
    },
    
    // 3. Fallback to meta tags
    () => ({
      title: $('meta[property="og:title"]').attr('content') || 
             $('meta[name="twitter:title"]').attr('content') ||
             $('title').text().trim() || 
             '',
      content: $('meta[property="og:description"]').attr('content') || 
              $('meta[name="description"]').attr('content') ||
              $('meta[name="twitter:description"]').attr('content') ||
              '',
      author: $('meta[name="author"]').attr('content') || null,
      date: $('meta[property="article:published_time"]').attr('content') || null
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
  
  return {
    title: $('title').text().trim() || 'Untitled',
    content: bodyText || 'No content extracted',
    author: null,
    date: null
  };
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
  const combined = `${title}:${content.substring(0, 1000)}`;
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