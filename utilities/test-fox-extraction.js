#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');

async function testFoxExtraction() {
  const url = 'https://www.foxnews.com/tech/social-media-verification-systems-lose-power-scammers-purchase-checkmarks-appear-legitimate';

  console.log('Fetching article:', url);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    console.log('\n=== Testing Selectors ===\n');

    // Test each selector
    const selectors = [
      '.article-wrap .article-body',
      '.article-body:has(p)',
      '.article-body',
      '.article-content',
      'article',
      '[class*="article-body"]'
    ];

    for (const selector of selectors) {
      const element = $(selector);
      console.log(`Selector: ${selector}`);
      console.log(`  Found: ${element.length > 0}`);

      if (element.length > 0) {
        // Count paragraphs
        const paragraphs = element.find('p');
        console.log(`  Paragraphs: ${paragraphs.length}`);

        // Try to extract text
        let extractedText = '';
        paragraphs.each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 30) {
            extractedText += text + '\n\n';
          }
        });

        console.log(`  Extracted length: ${extractedText.length} characters`);
        if (extractedText.length > 0) {
          console.log(`  First 200 chars: ${extractedText.substring(0, 200)}...`);
        }
      }
      console.log('');
    }

    // Test the actual extraction function logic
    console.log('\n=== Testing Extraction Logic ===\n');

    // Check if :has selector works
    const hasTest = $('.article-body:has(p)');
    console.log('Does :has(p) selector work in Cheerio?', hasTest.length > 0);

    // Try manual extraction
    const articleBody = $('.article-body');
    if (articleBody.length > 0) {
      console.log('Found .article-body');
      const paragraphs = articleBody.find('p');
      console.log(`Found ${paragraphs.length} paragraphs`);

      const texts = [];
      paragraphs.each((i, el) => {
        const $el = $(el);
        const parent = $el.parent();

        // Check if we're filtering it out
        const isCaption = parent.hasClass('caption') ||
          parent.hasClass('video-caption') ||
          parent.is('figcaption') ||
          parent.closest('figure').length > 0 ||
          parent.closest('.featured-video').length > 0 ||
          parent.closest('.video-container').length > 0;

        const text = $el.text().trim();

        if (isCaption) {
          console.log(`  Skipped (caption): ${text.substring(0, 50)}...`);
        } else if (text.length <= 30) {
          console.log(`  Skipped (too short): ${text}`);
        } else {
          texts.push(text);
        }
      });

      console.log(`\nExtracted ${texts.length} valid paragraphs`);
      console.log(`Total content length: ${texts.join('\n\n').length} characters`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFoxExtraction();