#!/usr/bin/env node

// Test paragraph spacing
const { load } = require('cheerio');
const fetch = require('node-fetch');
const { extractArticleContent } = require('../services/scraper/dist/utils');

async function testParagraphSpacing() {
  console.log('\n📏 Testing Paragraph Spacing\n');
  console.log('='.repeat(60));

  // Test with a BBC article
  const testUrl = 'https://www.bbc.com/news/articles/cly0428jjpeo';

  console.log(`📰 Fetching: ${testUrl}\n`);

  try {
    const response = await fetch(testUrl);
    const html = await response.text();
    const $ = load(html);

    // Extract content
    const result = extractArticleContent($, testUrl, false);

    // Analyze spacing
    const paragraphs = result.content.split('\n\n\n');  // Split by triple newlines
    console.log(`✅ Extracted ${paragraphs.length} paragraphs with empty lines between\n`);

    // Show first 3 paragraphs with visual spacing
    console.log('📝 First 3 paragraphs with spacing visualization:\n');
    console.log('─'.repeat(60));

    paragraphs.slice(0, 3).forEach((para, i) => {
      console.log(`[Paragraph ${i + 1}]`);
      console.log(para.substring(0, 150) + (para.length > 150 ? '...' : ''));
      if (i < 2) {
        console.log('');  // Empty line to show the spacing
      }
    });

    console.log('─'.repeat(60));

    // Check actual newline counts
    const doubleNewlines = (result.content.match(/\n\n(?!\n)/g) || []).length;
    const tripleNewlines = (result.content.match(/\n\n\n/g) || []).length;
    const quadNewlines = (result.content.match(/\n\n\n\n/g) || []).length;

    console.log('\n📊 Newline Analysis:');
    console.log(`  Double newlines (\\n\\n): ${doubleNewlines}`);
    console.log(`  Triple newlines (\\n\\n\\n): ${tripleNewlines}`);
    console.log(`  Quad+ newlines (\\n\\n\\n\\n): ${quadNewlines}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    if (tripleNewlines > 0 && quadNewlines === 0) {
      console.log('✅ Paragraph spacing is CORRECT!');
      console.log(`   ${tripleNewlines} empty lines between paragraphs`);
      console.log('   Each paragraph separated by one blank line');
    } else {
      console.log('⚠️  Spacing may need adjustment');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testParagraphSpacing().catch(console.error);