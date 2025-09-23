#!/usr/bin/env node

// Test Fox News caption filtering
const { load } = require('cheerio');
const fetch = require('node-fetch');
const { extractArticleContent } = require('../services/scraper/dist/utils');

async function testFoxCaptionFiltering() {
  console.log('\n🔬 Testing Fox News Caption Filtering\n');
  console.log('='.repeat(60));

  // Get Fox News RSS feed
  const Parser = require('rss-parser');
  const parser = new Parser();

  const feed = await parser.parseURL('https://moxie.foxnews.com/google-publisher/latest.xml');
  const firstLink = feed.items[0]?.link;

  if (!firstLink) {
    console.error('Could not get article from RSS feed');
    return;
  }

  console.log(`\n📰 Testing article: ${firstLink}`);

  try {
    const response = await fetch(firstLink);
    const html = await response.text();
    const $article = load(html);

    // Check for captions in the raw HTML
    console.log('\n🔍 Analyzing raw HTML structure:');

    // Find caption elements
    const captions = [];
    $article('.caption, .video-caption, figcaption, .featured-video .caption').each((i, el) => {
      const text = $article(el).text().trim();
      if (text.length > 20) {
        captions.push(text.substring(0, 100));
      }
    });

    if (captions.length > 0) {
      console.log(`  Found ${captions.length} caption element(s):`);
      captions.forEach((caption, i) => {
        console.log(`    [${i + 1}] ${caption}...`);
      });
    } else {
      console.log('  No caption elements found');
    }

    // Extract with our improved function
    console.log('\n📊 Running extraction with caption filtering:');
    const result = extractArticleContent($article, firstLink, false);

    console.log(`  Title: ${result.title ? result.title.substring(0, 60) + '...' : 'N/A'}`);
    console.log(`  Content length: ${result.content.length} chars`);

    // Check for paragraph structure
    const paragraphs = result.content.split('\n\n');
    console.log(`  Number of paragraphs: ${paragraphs.length}`);

    // Show first 3 paragraphs
    console.log('\n📝 First 3 paragraphs of extracted content:');
    console.log('-'.repeat(60));
    paragraphs.slice(0, 3).forEach((para, i) => {
      console.log(`\nParagraph ${i + 1}:`);
      console.log(para.substring(0, 150) + (para.length > 150 ? '...' : ''));
    });

    // Check if captions were filtered out
    console.log('\n✅ Checking if captions were filtered:');
    let captionsFiltered = true;
    captions.forEach(caption => {
      // Check if caption text appears as first paragraph
      const captionStart = caption.substring(0, 50);
      if (paragraphs[0] && paragraphs[0].includes(captionStart)) {
        console.log(`  ❌ Caption still present: "${captionStart}..."`);
        captionsFiltered = false;
      }
    });

    if (captionsFiltered && captions.length > 0) {
      console.log('  ✅ All captions successfully filtered out!');
    } else if (captions.length === 0) {
      console.log('  ℹ️  No captions to filter in this article');
    }

    // Check for duplicate paragraphs (Fox often duplicates caption as first paragraph)
    console.log('\n🔍 Checking for duplicate paragraphs:');
    const duplicates = new Set();
    let hasDuplicates = false;

    paragraphs.forEach((para, i) => {
      if (para.length > 50) {
        const key = para.substring(0, 50);
        if (duplicates.has(key)) {
          console.log(`  ⚠️  Found duplicate at paragraph ${i + 1}`);
          hasDuplicates = true;
        }
        duplicates.add(key);
      }
    });

    if (!hasDuplicates) {
      console.log('  ✅ No duplicate paragraphs found');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    if (captionsFiltered && !hasDuplicates && paragraphs.length > 1) {
      console.log('✅ Fox News caption filtering is WORKING!');
      console.log(`   Clean extraction with ${paragraphs.length} paragraphs`);
    } else {
      console.log('⚠️  Some issues detected:');
      if (!captionsFiltered) console.log('   - Captions not fully filtered');
      if (hasDuplicates) console.log('   - Duplicate paragraphs found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFoxCaptionFiltering().catch(console.error);