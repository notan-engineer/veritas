import { ExtractionRecorder } from '../extraction-recorder';
import * as cheerio from 'cheerio';

describe('ExtractionRecorder', () => {
  const html = `
    <html>
      <head>
        <title>Test Title</title>
        <meta property="og:title" content="OG Title">
        <meta name="author" content="Jane Doe">
        <meta property="article:published_time" content="2024-01-15">
      </head>
      <body>
        <h1>Article Headline</h1>
        <div class="author">John Doe</div>
        <time datetime="2024-01-15T10:00:00Z">January 15, 2024</time>
        <article>Article content here with some text to make it longer than 100 characters for testing purposes</article>
      </body>
    </html>
  `;

  test('records text extraction when enabled', () => {
    const $ = cheerio.load(html);
    const recorder = new ExtractionRecorder(true);

    const title = recorder.text($, 'h1', 'title');

    expect(title).toBe('Article Headline');
    expect(recorder.getTraces()).toHaveLength(1);
    expect(recorder.getTraces()[0]).toEqual({
      field: 'title',
      selector: 'h1',
      method: 'text',
      value: 'Article Headline'
    });
  });

  test('records attribute extraction when enabled', () => {
    const $ = cheerio.load(html);
    const recorder = new ExtractionRecorder(true);

    const ogTitle = recorder.attr($, 'meta[property="og:title"]', 'content', 'title');

    expect(ogTitle).toBe('OG Title');
    expect(recorder.getTraces()).toHaveLength(1);
    expect(recorder.getTraces()[0]).toEqual({
      field: 'title',
      selector: 'meta[property="og:title"][content]',
      method: 'attr',
      value: 'OG Title'
    });
  });

  test('does not record when disabled', () => {
    const $ = cheerio.load(html);
    const recorder = new ExtractionRecorder(false);

    const title = recorder.text($, 'h1', 'title');
    const author = recorder.text($, '.author', 'author');

    expect(title).toBe('Article Headline');
    expect(author).toBe('John Doe');
    expect(recorder.getTraces()).toHaveLength(0);
  });

  test('only records non-empty values', () => {
    const $ = cheerio.load(html);
    const recorder = new ExtractionRecorder(true);

    // This selector doesn't exist
    const missing = recorder.text($, '.non-existent', 'test');
    // This one exists
    const author = recorder.text($, '.author', 'author');

    expect(missing).toBe('');
    expect(author).toBe('John Doe');
    expect(recorder.getTraces()).toHaveLength(1);
    expect(recorder.getTraces()[0].field).toBe('author');
  });

  test('records multiple extractions in order', () => {
    const $ = cheerio.load(html);
    const recorder = new ExtractionRecorder(true);

    recorder.text($, 'h1', 'title');
    recorder.text($, '.author', 'author');
    recorder.attr($, 'time', 'datetime', 'date');
    recorder.text($, 'article', 'content');

    const traces = recorder.getTraces();
    expect(traces).toHaveLength(4);
    expect(traces[0].field).toBe('title');
    expect(traces[1].field).toBe('author');
    expect(traces[2].field).toBe('date');
    expect(traces[3].field).toBe('content');
  });

  test('records JSON-LD extraction', () => {
    const recorder = new ExtractionRecorder(true);

    const jsonLdData = {
      '@type': 'NewsArticle',
      headline: 'Test Article',
      articleBody: 'Test content'
    };

    recorder.recordJsonLd('script[type="application/ld+json"]:eq(0)', 'json-ld', jsonLdData);

    const traces = recorder.getTraces();
    expect(traces).toHaveLength(1);
    expect(traces[0]).toEqual({
      field: 'json-ld',
      selector: 'script[type="application/ld+json"]:eq(0)',
      method: 'json-ld',
      value: JSON.stringify(jsonLdData)
    });
  });

  test('isEnabled returns correct state', () => {
    const enabledRecorder = new ExtractionRecorder(true);
    const disabledRecorder = new ExtractionRecorder(false);
    const defaultRecorder = new ExtractionRecorder();

    expect(enabledRecorder.isEnabled()).toBe(true);
    expect(disabledRecorder.isEnabled()).toBe(false);
    expect(defaultRecorder.isEnabled()).toBe(false);
  });
});