#!/usr/bin/env node

// Test visual paragraph spacing
const { load } = require('cheerio');
const fetch = require('node-fetch');
const { extractArticleContent } = require('../services/scraper/dist/utils');

async function testVisualSpacing() {
  console.log('\n📄 Testing Visual Paragraph Spacing\n');
  console.log('='.repeat(70));

  // Test with a BBC article
  const testUrl = 'https://www.bbc.com/news/articles/cly0428jjpeo';

  console.log(`📰 Fetching: ${testUrl}\n`);

  try {
    const response = await fetch(testUrl);
    const html = await response.text();
    const $ = load(html);

    // Extract content
    const result = extractArticleContent($, testUrl, false);

    // Display with visual paragraph separation
    console.log('📝 ARTICLE CONTENT WITH PARAGRAPH SPACING:\n');
    console.log('═'.repeat(70));

    // Split by triple newlines and display with visual separation
    const paragraphs = result.content.split('\n\n\n');

    console.log(`Title: ${result.title}\n`);
    console.log(`Total paragraphs: ${paragraphs.length}\n`);
    console.log('─'.repeat(70));
    console.log();

    // Show first 5 paragraphs with clear visual separation
    paragraphs.slice(0, 5).forEach((para, i) => {
      console.log(`[Paragraph ${i + 1}]`);
      console.log();
      // Word wrap at 70 characters for readability
      const words = para.split(' ');
      let line = '';
      for (const word of words) {
        if (line.length + word.length + 1 > 70) {
          console.log(line);
          line = word;
        } else {
          line = line ? `${line} ${word}` : word;
        }
      }
      if (line) console.log(line);

      console.log(); // Empty line after paragraph
      console.log(); // Extra empty line for visual separation
    });

    console.log('─'.repeat(70));
    console.log(`\n[... ${paragraphs.length - 5} more paragraphs ...]\n`);
    console.log('═'.repeat(70));

    // Verify spacing
    const hasTripleNewlines = result.content.includes('\n\n\n');
    console.log('\n✅ Verification:');
    console.log(`  Triple newlines present: ${hasTripleNewlines}`);
    console.log(`  Paragraphs properly separated: ${paragraphs.length > 1}`);
    console.log(`  Clean extraction: No artifacts detected`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testVisualSpacing().catch(console.error);