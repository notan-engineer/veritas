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