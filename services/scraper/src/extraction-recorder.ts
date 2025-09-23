import { CheerioAPI } from 'cheerio';

export interface ExtractionTrace {
  field: string;
  selector: string;
  method: string;
  value: string;
}

export class ExtractionRecorder {
  private traces: ExtractionTrace[] = [];
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  // Wrap text extraction
  text($: CheerioAPI, selector: string, field: string): string {
    const element = $(selector);
    const value = element.length > 0 ? element.first().text().trim() : '';
    return this.record(field, selector, 'text', value);
  }

  // Extract content with paragraph preservation
  extractContent($: CheerioAPI, selector: string, field: string): string {
    const elements = $(selector);
    if (elements.length === 0) return this.record(field, selector, 'content', '');

    // Extract paragraphs to preserve structure
    const paragraphs: string[] = [];
    const seenTexts = new Set<string>(); // Track duplicates

    // Handle multiple matching elements (e.g., multiple BBC text blocks)
    elements.each((index, element) => {
      const $element = $(element);

      // First try to get all <p> tags within the element, excluding captions
      $element.find('p').each((i, el) => {
      const $el = $(el);
      const parent = $el.parent();

      // Skip if this paragraph is inside a caption or figure
      if (parent.hasClass('caption') ||
          parent.hasClass('video-caption') ||
          parent.is('figcaption') ||
          parent.closest('figure').length > 0 ||
          parent.closest('.featured-video').length > 0 ||
          parent.closest('.video-container').length > 0 ||
          $el.hasClass('caption') ||
          $el.hasClass('video-caption')) {
        return; // Skip this paragraph
      }

      const text = $el.text().trim();

      // Skip if entire paragraph is a link AND in ALL CAPS (related article pattern)
      const link = $el.find('a').first();
      if (link.length > 0) {
        const linkText = link.text().trim();
        if (linkText === text && text === text.toUpperCase() && text.length > 20) {
          return; // Skip this paragraph - it's a related article link
        }
      }

      // Skip short text and duplicates
      if (text.length > 30 && !seenTexts.has(text)) {
        seenTexts.add(text);
        paragraphs.push(text);
      }
    });

      // If no paragraphs found in this element, try getting its direct text
      if (paragraphs.length === 0) {
        const directText = $element.text().trim();
        if (directText.length > 100 && !seenTexts.has(directText)) {
          seenTexts.add(directText);
          paragraphs.push(directText);
        }
      }
    });

    // If still no paragraphs found, fall back to all text
    if (paragraphs.length === 0) {
      const text = elements.text().trim();
      return this.record(field, selector, 'content', text);
    }

    // Join paragraphs with triple newlines (empty line between)
    const value = paragraphs.join('\n\n\n');
    return this.record(field, selector, 'content', value);
  }

  // Wrap attribute extraction
  attr($: CheerioAPI, selector: string, attribute: string, field: string): string {
    const element = $(selector);
    const value = element.length > 0 ? (element.attr(attribute) || '') : '';
    return this.record(field, `${selector}[${attribute}]`, 'attr', value);
  }

  // Wrap HTML extraction
  html($: CheerioAPI, selector: string, field: string): string {
    const element = $(selector);
    const value = element.length > 0 ? (element.html() || '') : '';
    return this.record(field, selector, 'html', value);
  }

  // Record JSON-LD extraction
  recordJsonLd(selector: string, field: string, value: any): void {
    if (this.enabled && value) {
      this.traces.push({
        field,
        selector,
        method: 'json-ld',
        value: typeof value === 'string' ? value : JSON.stringify(value)
      });
    }
  }

  private record(field: string, selector: string, method: string, value: string): string {
    if (this.enabled && value) {
      this.traces.push({ field, selector, method, value });
    }
    return value;
  }

  getTraces(): ExtractionTrace[] {
    return this.traces;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}