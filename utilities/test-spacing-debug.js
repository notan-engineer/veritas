#!/usr/bin/env node

// Debug paragraph spacing
const { load } = require('cheerio');
const fetch = require('node-fetch');
const { extractArticleContent } = require('../services/scraper/dist/utils');

async function debugSpacing() {
  console.log('\n🔍 Debugging Paragraph Spacing\n');
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

    // Show raw content with visible newlines
    console.log('📝 RAW CONTENT (first 500 chars with visible \\n):\n');
    console.log('─'.repeat(60));
    const first500 = result.content.substring(0, 500);
    // Replace newlines with visible markers
    const withVisibleNewlines = first500
      .replace(/\n/g, '[NEWLINE]\n');
    console.log(withVisibleNewlines);
    console.log('─'.repeat(60));

    // Count newlines
    const singleNewlines = (result.content.match(/(?<!\n)\n(?!\n)/g) || []).length;
    const doubleNewlines = (result.content.match(/(?<!\n)\n\n(?!\n)/g) || []).length;
    const tripleNewlines = (result.content.match(/\n\n\n/g) || []).length;

    console.log('\n📊 Newline Count:');
    console.log(`  Single newlines (\\n): ${singleNewlines}`);
    console.log(`  Double newlines (\\n\\n): ${doubleNewlines}`);
    console.log(`  Triple newlines (\\n\\n\\n): ${tripleNewlines}`);

    // Try different splitting methods
    console.log('\n🔧 Split Analysis:');
    const splitByTriple = result.content.split('\n\n\n');
    const splitByDouble = result.content.split('\n\n');
    console.log(`  Split by \\n\\n\\n: ${splitByTriple.length} parts`);
    console.log(`  Split by \\n\\n: ${splitByDouble.length} parts`);

    // Show what's between paragraphs
    console.log('\n📏 What\'s between first two paragraphs:');
    const firstPara = result.content.split(/\n{2,}/)[0];
    const betweenIndex = firstPara.length;
    const between = result.content.substring(betweenIndex, betweenIndex + 10);
    console.log(`  Characters: [${between}]`);
    console.log(`  Character codes: ${Array.from(between).map(c => c.charCodeAt(0)).join(', ')}`);

    // Display with proper formatting
    console.log('\n📄 PROPERLY FORMATTED OUTPUT:');
    console.log('─'.repeat(60));
    const paragraphs = result.content.split(/\n{2,}/);
    paragraphs.slice(0, 3).forEach((para, i) => {
      console.log(`Paragraph ${i + 1}:`);
      console.log(para.substring(0, 150) + (para.length > 150 ? '...' : ''));
      if (i < 2) {
        console.log(); // Empty line for visual separation
      }
    });
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugSpacing().catch(console.error);