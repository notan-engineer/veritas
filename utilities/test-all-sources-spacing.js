#!/usr/bin/env node

// Comprehensive test for paragraph spacing across all news sources
const { load } = require('cheerio');
const fetch = require('node-fetch');
const { extractArticleContent } = require('../services/scraper/dist/utils');
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Veritas/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*'
  }
});

// Test sources configuration
const testSources = [
  { name: 'BBC News', rss_url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'CNN', rss_url: 'http://rss.cnn.com/rss/cnn_topstories.rss' },
  { name: 'The Guardian', rss_url: 'https://www.theguardian.com/world/rss' },
  { name: 'NY Times', rss_url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
  { name: 'Fox News', rss_url: 'https://moxie.foxnews.com/google-publisher/latest.xml' }
];

async function testSourceSpacing(source) {
  console.log(`\n📰 Testing: ${source.name}`);
  console.log('─'.repeat(60));

  try {
    // Fetch RSS feed
    const feed = await parser.parseURL(source.rss_url);
    const articles = feed.items.slice(0, 1); // Test first article

    if (articles.length === 0) {
      console.log('⚠️  No articles found in feed');
      return { source: source.name, status: 'no_articles' };
    }

    const article = articles[0];
    console.log(`📄 Article: ${article.title?.substring(0, 50)}...`);
    console.log(`🔗 URL: ${article.link}`);

    // Fetch and extract article content
    const response = await fetch(article.link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.log(`❌ Failed to fetch: ${response.status}`);
      return { source: source.name, status: 'fetch_failed' };
    }

    const html = await response.text();
    const $ = load(html);
    const result = extractArticleContent($, article.link, false);

    // Analyze spacing
    const paragraphs = result.content.split('\n\n\n');
    const tripleNewlines = (result.content.match(/\n\n\n/g) || []).length;
    const hasProperSpacing = tripleNewlines > 0 && paragraphs.length > 1;

    console.log(`\n📊 Spacing Analysis:`);
    console.log(`  Paragraphs extracted: ${paragraphs.length}`);
    console.log(`  Triple newlines: ${tripleNewlines}`);
    console.log(`  Content length: ${result.content.length} chars`);
    console.log(`  First paragraph: ${paragraphs[0]?.substring(0, 100)}...`);

    // Check for caption filtering
    const hasVideoCaptions = paragraphs[0]?.toLowerCase().includes('watch:') ||
                            paragraphs[0]?.toLowerCase().includes('video:');

    console.log(`\n✅ Validation:`);
    console.log(`  Proper spacing: ${hasProperSpacing ? '✓' : '✗'}`);
    console.log(`  Clean extraction: ${!hasVideoCaptions ? '✓' : '✗ (caption detected)'}`);
    console.log(`  Paragraph structure: ${paragraphs.length > 5 ? '✓' : '⚠️ (few paragraphs)'}`);

    return {
      source: source.name,
      status: 'success',
      paragraphs: paragraphs.length,
      tripleNewlines,
      hasProperSpacing,
      hasVideoCaptions
    };

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { source: source.name, status: 'error', error: error.message };
  }
}

async function runAllTests() {
  console.log('\n🚀 COMPREHENSIVE PARAGRAPH SPACING TEST');
  console.log('='.repeat(70));
  console.log('Testing paragraph separation across all configured news sources\n');

  const results = [];

  for (const source of testSources) {
    const result = await testSourceSpacing(source);
    results.push(result);

    // Small delay between sources
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📈 TEST SUMMARY\n');

  const successful = results.filter(r => r.status === 'success' && r.hasProperSpacing);
  const failed = results.filter(r => r.status !== 'success' || !r.hasProperSpacing);

  console.log('✅ Successful extractions with proper spacing:');
  successful.forEach(r => {
    console.log(`   ${r.source}: ${r.paragraphs} paragraphs, ${r.tripleNewlines} separators`);
  });

  if (failed.length > 0) {
    console.log('\n⚠️  Issues detected:');
    failed.forEach(r => {
      if (r.status === 'success') {
        console.log(`   ${r.source}: No proper spacing detected`);
      } else {
        console.log(`   ${r.source}: ${r.status} ${r.error ? `- ${r.error}` : ''}`);
      }
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log(`Overall: ${successful.length}/${testSources.length} sources working correctly`);

  if (successful.length === testSources.length) {
    console.log('🎉 All sources have proper paragraph spacing!');
  }
}

runAllTests().catch(console.error);