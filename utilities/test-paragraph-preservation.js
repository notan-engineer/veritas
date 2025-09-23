#!/usr/bin/env node

// Test if paragraph preservation is working
const { load } = require('cheerio');
const fetch = require('node-fetch');
const { extractArticleContent } = require('../services/scraper/dist/utils');

async function testParagraphPreservation() {
  console.log('\n🔬 Testing Paragraph Preservation\n');
  console.log('='.repeat(60));

  // Test with a real BBC article
  const testUrl = 'https://www.bbc.com/news/articles/cly0428jjpeo';

  console.log(`\n📰 Fetching: ${testUrl}`);

  try {
    const response = await fetch(testUrl);
    const html = await response.text();
    const $ = load(html);

    // Extract with our improved function
    const result = extractArticleContent($, testUrl, false);

    console.log('\n📊 Extraction Results:');
    console.log(`  Title: ${result.title ? result.title.substring(0, 60) + '...' : 'N/A'}`);
    console.log(`  Content length: ${result.content.length} chars`);

    // Check for paragraph preservation
    const paragraphs = result.content.split('\n\n');
    console.log(`  Number of paragraphs: ${paragraphs.length}`);
    console.log(`  Has double newlines: ${result.content.includes('\n\n')}`);

    // Show first 3 paragraphs
    console.log('\n📝 First 3 paragraphs:');
    console.log('-'.repeat(60));
    paragraphs.slice(0, 3).forEach((para, i) => {
      console.log(`\nParagraph ${i + 1}:`);
      console.log(para.substring(0, 200) + (para.length > 200 ? '...' : ''));
    });

    // Check for artifacts
    console.log('\n🔍 Checking for artifacts:');
    const artifacts = [
      'Share', 'Newsletter', 'Subscribe', 'Follow',
      'Cookie', 'Advertisement', 'Related'
    ];

    let foundArtifacts = false;
    artifacts.forEach(artifact => {
      if (result.content.includes(artifact)) {
        console.log(`  ⚠️  Found: "${artifact}"`);
        foundArtifacts = true;
      }
    });

    if (!foundArtifacts) {
      console.log('  ✅ No common artifacts found');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    if (paragraphs.length > 1 && result.content.includes('\n\n')) {
      console.log('✅ Paragraph preservation is WORKING!');
      console.log(`   Successfully extracted ${paragraphs.length} distinct paragraphs`);
    } else {
      console.log('❌ Paragraph preservation is NOT working');
      console.log('   Content is still collapsed into a single block');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testParagraphPreservation().catch(console.error);