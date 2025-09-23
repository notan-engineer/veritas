#!/usr/bin/env node

/**
 * Extraction Debugger - Quick & Dirty HTML Export Tool
 *
 * This utility runs an actual scraping job and exports the results
 * as a single HTML file showing source HTML and extracted content
 * side-by-side for debugging purposes.
 *
 * Output files are stored in: utilities/utility-output/
 *
 * Usage: node 07-extraction-analyzer.js [source-name] [output-file]
 *
 * Examples:
 *   node 07-extraction-analyzer.js                    # Interactive mode
 *   node 07-extraction-analyzer.js "BBC News"         # Specific source
 *   node 07-extraction-analyzer.js "BBC News" debug.html  # Custom filename
 */

const { Pool } = require('pg');
const readline = require('readline');
const path = require('path');
const fs = require('fs').promises;
const { load } = require('cheerio');
const Parser = require('rss-parser');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '../services/scraper/.env') });

// Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veritas_local';
const OUTPUT_DIR = path.join(__dirname, 'utility-output');
const OUTPUT_FILENAME = process.argv[3] || `extraction-debug-${Date.now()}.html`;
const OUTPUT_FILE = path.join(OUTPUT_DIR, OUTPUT_FILENAME.includes('/') || OUTPUT_FILENAME.includes('\\') ? path.basename(OUTPUT_FILENAME) : OUTPUT_FILENAME);

// Database connection
const pool = new Pool({
  connectionString: DATABASE_URL
});

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Enhanced extraction function that uses the same logic as the scraper with real-time tracking
function extractWithDebug($, url, rawHtml) {
  // Import the compiled TypeScript module
  const { extractArticleContent } = require('../services/scraper/dist/utils');

  // Use the same extraction function with tracking enabled
  const result = extractArticleContent($, url, true);

  // Build debug info from the extraction result
  const debug = {
    url,
    rawHtml,
    selectors: [],
    jsonLd: [],
    extraction: {
      title: result.title,
      content: result.content,
      author: result.author,
      date: result.date,
      source: determineExtractionSource(result.traces || [])
    },
    usedPaths: (result.traces || []).map(trace => ({
      type: trace.method === 'json-ld' ? 'json-ld' : 'selector',
      selector: trace.selector,
      field: trace.field,
      value: trace.value.substring(0, 100) // Truncate for display
    })),
    traces: result.traces || []
  };

  // Try to extract JSON-LD info for display (not for extraction)
  const scripts = $('script[type="application/ld+json"]');
  scripts.each((i, elem) => {
    try {
      const data = JSON.parse($(elem).text());
      debug.jsonLd.push({
        index: i,
        type: data['@type'],
        data: data
      });
    } catch (e) {
      debug.jsonLd.push({ index: i, error: e.message });
    }
  });

  // Build selector analysis for display
  const selectorMap = {
    title: [
      { sel: 'h1', val: $('h1').first().text().trim() },
      { sel: 'meta[property="og:title"]', val: $('meta[property="og:title"]').attr('content') },
      { sel: '.headline', val: $('.headline').text().trim() },
      { sel: 'title', val: $('title').text().trim() }
    ],
    content: [
      { sel: 'article', val: $('article').text().trim() },
      { sel: '.article-content', val: $('.article-content').text().trim() },
      { sel: '.story-body', val: $('.story-body').text().trim() },
      { sel: '.entry-content', val: $('.entry-content').text().trim() },
      { sel: 'main', val: $('main').text().trim() }
    ],
    author: [
      { sel: '.author', val: $('.author').text().trim() },
      { sel: '.by-author', val: $('.by-author').text().trim() },
      { sel: 'meta[name="author"]', val: $('meta[name="author"]').attr('content') }
    ],
    date: [
      { sel: 'time', val: $('time').attr('datetime') },
      { sel: '.date', val: $('.date').text().trim() },
      { sel: 'meta[property="article:published_time"]', val: $('meta[property="article:published_time"]').attr('content') }
    ]
  };
  debug.selectors = selectorMap;

  return debug;
}

// Helper to determine extraction source from traces
function determineExtractionSource(traces) {
  if (traces.length === 0) return 'Fallback';

  const hasJsonLd = traces.some(t => t.method === 'json-ld');
  if (hasJsonLd) return 'JSON-LD';

  const hasSelectors = traces.some(t => t.method === 'text' || t.method === 'attr');
  if (hasSelectors) return 'Selectors';

  return 'Fallback';
}

// Scrape and analyze a single article
async function scrapeAndAnalyze(articleUrl, sourceName) {
  log(`\n📥 Fetching: ${articleUrl}`, 'cyan');

  try {
    const response = await fetch(articleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Veritas/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const analysis = extractWithDebug($, articleUrl, html);
    analysis.sourceName = sourceName;
    analysis.timestamp = new Date().toISOString();

    log(`✅ Extracted: ${analysis.extraction.title?.substring(0, 60)}...`, 'green');
    log(`   Method: ${analysis.extraction.source}`, 'gray');
    log(`   Content: ${analysis.extraction.content?.length || 0} chars`, 'gray');

    return analysis;
  } catch (error) {
    log(`❌ Failed: ${error.message}`, 'red');
    return null;
  }
}

// Generate the HTML export
function generateHTMLExport(analyses) {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extraction Debug Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #0a0a0a;
            color: #e0e0e0;
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .header .stats {
            display: flex;
            gap: 30px;
            margin-top: 20px;
            font-size: 0.9em;
            opacity: 0.9;
        }

        .nav {
            background: #1a1a1a;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            position: sticky;
            top: 10px;
            z-index: 100;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .nav-pills {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .nav-pill {
            padding: 8px 16px;
            background: #2a2a2a;
            border: 1px solid #3a3a3a;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 0.9em;
        }

        .nav-pill:hover {
            background: #3a3a3a;
            transform: translateY(-2px);
        }

        .nav-pill.active {
            background: #667eea;
            border-color: #667eea;
        }

        .article-container {
            display: none;
            animation: fadeIn 0.5s;
        }

        .article-container.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .split-view {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        @media (max-width: 1024px) {
            .split-view {
                grid-template-columns: 1fr;
            }
        }

        .panel {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .panel-header {
            background: #252525;
            padding: 15px 20px;
            border-bottom: 1px solid #2a2a2a;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .panel-body {
            padding: 20px;
            max-height: 700px;
            overflow-y: auto;
        }

        .panel-body::-webkit-scrollbar {
            width: 8px;
        }

        .panel-body::-webkit-scrollbar-track {
            background: #1a1a1a;
        }

        .panel-body::-webkit-scrollbar-thumb {
            background: #3a3a3a;
            border-radius: 4px;
        }

        .source-viewer {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.85em;
            background: #0a0a0a;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #2a2a2a;
            overflow-x: auto;
            overflow-y: auto;
            max-height: 700px;
        }

        /* Simplified Code Display */
        .html-tree {
            line-height: 1.6;
            color: #abb2bf;
            font-size: 0.9em;
        }

        .code-line {
            padding: 2px 0;
            white-space: nowrap;
        }

        .code-line:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        /* Syntax Highlighting */
        .tag-bracket { color: #56b6c2; }
        .tag-name { color: #e06c75; font-weight: 600; }
        .attr-name { color: #d19a66; }
        .attr-equals { color: #abb2bf; }
        .attr-value { color: #98c379; }
        .text-content { color: #abb2bf; }
        .comment { color: #5c6370; font-style: italic; }
        .doctype { color: #c678dd; }

        /* Extraction Highlighting */
        .highlight-extraction {
            background: rgba(255, 235, 59, 0.3) !important;
            border: 2px solid #ffd600;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(255, 235, 59, 0.4);
            position: relative;
        }

        .highlight-extraction::before {
            content: attr(data-field);
            position: absolute;
            top: -20px;
            left: -2px;
            background: #ffd600;
            color: #000;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.75em;
            font-weight: bold;
            white-space: nowrap;
        }

        .highlight-title { background: rgba(59, 130, 246, 0.3) !important; border-color: #3b82f6; }
        .highlight-title::before { background: #3b82f6; color: white; }

        .highlight-content { background: rgba(34, 197, 94, 0.3) !important; border-color: #22c55e; }
        .highlight-content::before { background: #22c55e; color: white; }

        .highlight-author { background: rgba(168, 85, 247, 0.3) !important; border-color: #a855f7; }
        .highlight-author::before { background: #a855f7; color: white; }

        .highlight-date { background: rgba(249, 115, 22, 0.3) !important; border-color: #f97316; }
        .highlight-date::before { background: #f97316; color: white; }

        .article-preview {
            background: #0a0a0a;
            padding: 20px;
            border-radius: 8px;
        }

        .article-preview h1 {
            font-size: 1.8em;
            margin-bottom: 15px;
            color: #fff;
            line-height: 1.3;
        }

        .article-meta {
            display: flex;
            gap: 20px;
            padding: 15px 0;
            border-bottom: 1px solid #2a2a2a;
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #888;
        }

        .article-meta strong {
            color: #ccc;
        }

        .article-content {
            line-height: 1.8;
            color: #d0d0d0;
        }

        .article-content p {
            margin-bottom: 1em;  /* One line of space between paragraphs */
            margin-top: 0;
        }

        .extraction-info {
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }

        .extraction-info h3 {
            margin-bottom: 15px;
            color: #667eea;
        }

        .extraction-method {
            display: inline-block;
            padding: 4px 12px;
            background: #2a2a2a;
            border-radius: 4px;
            font-size: 0.85em;
            margin-bottom: 15px;
        }

        .selector-list {
            background: #0a0a0a;
            padding: 15px;
            border-radius: 6px;
            margin-top: 10px;
        }

        .selector-item {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #1a1a1a;
            font-size: 0.9em;
        }

        .selector-item:last-child {
            border-bottom: none;
        }

        .selector-field {
            color: #667eea;
            font-weight: 600;
        }

        .selector-value {
            color: #888;
            font-family: monospace;
            font-size: 0.95em;
        }

        .selector-match {
            color: #4ade80;
        }

        .json-viewer {
            background: #0a0a0a;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.85em;
            max-height: 400px;
            overflow-y: auto;
        }

        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
        }

        .badge-success { background: #10b981; color: #fff; }
        .badge-warning { background: #f59e0b; color: #fff; }
        .badge-error { background: #ef4444; color: #fff; }
        .badge-info { background: #3b82f6; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Extraction Debug Report</h1>
            <div>Generated: ${new Date().toLocaleString()}</div>
            <div class="stats">
                <div>📊 Articles: ${analyses.length}</div>
                <div>✅ Successful: ${analyses.filter(a => a.extraction.content).length}</div>
                <div>🔧 Methods: ${[...new Set(analyses.map(a => a.extraction.source))].join(', ')}</div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid #333;">
                <strong style="display: block; margin-bottom: 10px; color: #aaa;">Extraction Highlighting Guide:</strong>
                <div style="display: flex; gap: 20px; flex-wrap: wrap; font-size: 0.9em;">
                    <span style="padding: 4px 10px; background: rgba(59, 130, 246, 0.3); border: 2px solid #3b82f6; border-radius: 4px;">📘 TITLE - Article headline</span>
                    <span style="padding: 4px 10px; background: rgba(34, 197, 94, 0.3); border: 2px solid #22c55e; border-radius: 4px;">📗 CONTENT - Article body</span>
                    <span style="padding: 4px 10px; background: rgba(168, 85, 247, 0.3); border: 2px solid #a855f7; border-radius: 4px;">📜 AUTHOR - Writer name</span>
                    <span style="padding: 4px 10px; background: rgba(249, 115, 22, 0.3); border: 2px solid #f97316; border-radius: 4px;">📅 DATE - Publication date</span>
                    <span style="padding: 4px 10px; background: rgba(255, 235, 59, 0.3); border: 2px solid #ffd600; border-radius: 4px;">📊 JSON-LD - Structured data</span>
                </div>
            </div>
        </div>

        <div class="nav">
            <div class="nav-pills">
                ${analyses.map((analysis, i) => `
                    <div class="nav-pill ${i === 0 ? 'active' : ''}" onclick="showArticle(${i})">
                        ${analysis.sourceName} #${i + 1}
                    </div>
                `).join('')}
            </div>
        </div>

        ${analyses.map((analysis, i) => `
        <div class="article-container ${i === 0 ? 'active' : ''}" id="article-${i}">
            <div class="split-view">
                <!-- Source Panel -->
                <div class="panel">
                    <div class="panel-header">
                        <span>📄 Source HTML</span>
                        <span class="badge badge-info">${analysis.rawHtml.length} chars</span>
                    </div>
                    <div class="panel-body">
                        <div class="source-viewer">
                            <div class="html-tree" id="tree-${i}">
                                ${formatHtmlAsTree(analysis.rawHtml, analysis.usedPaths, i, analysis.extraction, analysis.traces || [])}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Extracted Panel -->
                <div class="panel">
                    <div class="panel-header">
                        <span>📝 Extracted Content</span>
                        <span class="extraction-method badge badge-${analysis.extraction.source === 'Fallback' ? 'warning' : 'success'}">
                            ${analysis.extraction.source}
                        </span>
                    </div>
                    <div class="panel-body">
                        <div class="article-preview">
                            <h1>${escapeHtml(analysis.extraction.title || 'No Title')}</h1>
                            <div style="font-size: 0.85em; color: #888; margin-top: -10px; margin-bottom: 15px;">
                                <strong>Article ID:</strong> <code style="background: #2a2a2a; padding: 2px 6px; border-radius: 4px; color: #98c379;">${generateArticleId(analysis.sourceName, i + 1)}</code>
                            </div>
                            <div class="article-meta">
                                ${analysis.extraction.author ? `<div><strong>Author:</strong> ${escapeHtml(analysis.extraction.author)}</div>` : ''}
                                ${analysis.extraction.date ? `<div><strong>Date:</strong> ${new Date(analysis.extraction.date).toLocaleDateString()}</div>` : ''}
                                <div><strong>Length:</strong> ${analysis.extraction.content?.length || 0} chars</div>
                                <div><strong>Source:</strong> <a href="${analysis.url}" target="_blank" style="color: #667eea; text-decoration: underline;">View Original Article</a></div>
                            </div>
                            <div class="article-content">
                                ${formatContent(analysis.extraction.content || 'No content extracted')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Extraction Details -->
            <div class="extraction-info">
                <h3>Extraction Details</h3>

                ${analysis.jsonLd.length > 0 ? `
                    <div>
                        <strong>JSON-LD Scripts Found:</strong> ${analysis.jsonLd.length}
                        <div class="json-viewer">
                            ${analysis.jsonLd.map(ld => `
                                <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #2a2a2a; border-radius: 4px;">
                                    <div>Script #${ld.index + 1}: <span class="badge badge-info">${ld.type || ld.error || 'Unknown'}</span></div>
                                    ${ld.data ? `<pre style="margin-top: 10px;">${JSON.stringify(ld.data, null, 2)}</pre>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${analysis.selectors ? `
                    <div style="margin-top: 20px;">
                        <strong>Selector Analysis:</strong>
                        <div class="selector-list">
                            ${Object.entries(analysis.selectors).map(([field, selectors]) => `
                                <div class="selector-item">
                                    <div class="selector-field">${field}:</div>
                                    <div>
                                        ${selectors.map(s => `
                                            <div class="${s.val ? 'selector-match' : ''}">
                                                <span class="selector-value">${s.sel}</span>
                                                ${s.val ? ` → "${escapeHtml(String(s.val).substring(0, 100))}..."` : ' (no match)'}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="margin-top: 20px;">
                    <strong>Used Extraction Paths:</strong>
                    <div class="selector-list">
                        ${analysis.usedPaths.map(path => `
                            <div class="selector-item">
                                <div class="selector-field">${path.field}:</div>
                                <div class="selector-value">${path.selector}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        `).join('')}
    </div>

    <script>
        function showArticle(index) {
            // Hide all articles
            document.querySelectorAll('.article-container').forEach(el => {
                el.classList.remove('active');
            });

            // Remove active from all pills
            document.querySelectorAll('.nav-pill').forEach(el => {
                el.classList.remove('active');
            });

            // Show selected article
            document.getElementById('article-' + index).classList.add('active');
            document.querySelectorAll('.nav-pill')[index].classList.add('active');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Removed toggleNode - no longer needed with flat structure

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Flat structure - no expand/collapse needed
    </script>
</body>
</html>`;

  // Helper functions embedded in template
  function generateArticleId(sourceName, articleNumber) {
    // Create unique ID: sourcename_article#_timestamp
    const cleanSource = sourceName.toLowerCase().replace(/\s+/g, '');
    const timestamp = Date.now();
    return `${cleanSource}_article${articleNumber}_${timestamp}`;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatContent(content) {
    if (!content) return '';
    // Split by triple newlines to preserve paragraph spacing
    return content
      .split('\n\n\n')
      .map(para => `<p>${escapeHtml(para.trim())}</p>`)
      .join(''); // Paragraphs already have margin
  }

  function formatHtmlAsTree(html, usedPaths, treeIndex, extractedContent, traces) {
    // Format HTML with syntax highlighting and extraction markers
    // Now uses accurate traces from the extraction recorder

    // First, escape the HTML for display
    let displayHtml = escapeHtml(html);

    // Format with line breaks - no limit, show entire HTML
    let lines = displayHtml
      .replace(/(&lt;)/g, '\n$1')
      .split('\n')
      .filter(line => line.trim());

    // Use traces for accurate highlighting
    const extractedPatterns = [];
    if (traces && traces.length > 0) {
      traces.forEach(trace => {
        extractedPatterns.push({
          selector: trace.selector,
          field: trace.field.toLowerCase(),
          value: escapeHtml(trace.value.substring(0, 100)) // For matching
        });
      });
    } else {
      // Fallback to usedPaths if no traces (backward compatibility)
      usedPaths.forEach(path => {
        if (path.selector && path.field) {
          extractedPatterns.push({
            selector: path.selector,
            field: path.field.toLowerCase()
          });
        }
      });
    }

    // Create array of text snippets from the extracted content for matching
    const bodyTextSnippets = [];
    if (extractedContent && extractedContent.content) {
      // Clean the content text
      const cleanContent = extractedContent.content
        .replace(/<[^>]*>/g, '') // Remove any HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Split into sentences or phrases
      const sentences = cleanContent.split(/[.!?]/).filter(s => s.trim().length > 20);

      // Add first 50 sentences/phrases for matching
      sentences.slice(0, 50).forEach(sentence => {
        const cleaned = sentence.trim();
        if (cleaned.length > 20) {
          // Escape for HTML matching
          bodyTextSnippets.push(escapeHtml(cleaned.substring(0, 100)));

          // Also add first few words for partial matches
          const words = cleaned.split(' ').slice(0, 8).join(' ');
          if (words.length > 20) {
            bodyTextSnippets.push(escapeHtml(words));
          }
        }
      });

      // Also add some unique longer phrases
      const words = cleanContent.split(/\s+/);
      for (let i = 0; i < Math.min(words.length - 3, 100); i += 10) {
        const phrase = words.slice(i, i + 4).join(' ');
        if (phrase.length > 15) {
          bodyTextSnippets.push(escapeHtml(phrase));
        }
      }
    }

    // Process each line with syntax highlighting and extraction markers
    let nodeCounter = 0;
    const formattedLines = lines.map((line, index) => {
      nodeCounter++;
      const nodeId = `node-${treeIndex}-${nodeCounter}`;
      const trimmed = line.trim();

      // Detect what type of content this line contains using traces
      let isExtracted = false;
      let extractionField = '';

      // Check if this line matches any of our extraction patterns
      for (const pattern of extractedPatterns) {
        // Check for selector match
        const selectorBase = pattern.selector.split('[')[0]; // Remove attributes for matching

        if (trimmed.includes(selectorBase.replace('.', '').replace('#', ''))) {
          // Check if the value is also present (for more accuracy)
          if (pattern.value && trimmed.includes(pattern.value.substring(0, 50))) {
            isExtracted = true;
            extractionField = pattern.field;
            break;
          }
          // For structural elements, just the selector match is enough
          else if (trimmed.includes('&lt;' + selectorBase.replace('.', '').replace('#', ''))) {
            isExtracted = true;
            extractionField = pattern.field;
            break;
          }
        }

        // Special case for meta tags
        if (pattern.selector.includes('meta') && trimmed.includes('meta')) {
          if (pattern.selector.includes('og:title') && trimmed.includes('og:title')) {
            isExtracted = true;
            extractionField = pattern.field;
            break;
          } else if (pattern.selector.includes('author') && trimmed.includes('author')) {
            isExtracted = true;
            extractionField = pattern.field;
            break;
          } else if (pattern.selector.includes('article:published_time') && trimmed.includes('article:published_time')) {
            isExtracted = true;
            extractionField = pattern.field;
            break;
          }
        }
      }

      // Additional check for JSON-LD
      if (!isExtracted && trimmed.includes('application/ld+json')) {
        const hasJsonTrace = extractedPatterns.some(p => p.field === 'json-ld');
        if (hasJsonTrace) {
          isExtracted = true;
          extractionField = 'json-ld';
        }
      }

      // If still not extracted, check body text snippets for content
      if (!isExtracted) {
        for (const snippet of bodyTextSnippets) {
          if (trimmed.includes(snippet)) {
            isExtracted = true;
            extractionField = 'content';
            break;
          }
        }
      }

      // Apply syntax highlighting
      let highlighted = trimmed
        // Comments
        .replace(/(&lt;!--.*?--&gt;)/g, '<span class="comment">$1</span>')
        // DOCTYPE
        .replace(/(&lt;!DOCTYPE.*?&gt;)/gi, '<span class="doctype">$1</span>')
        // Opening tags
        .replace(/(&lt;)(\/?)([a-zA-Z0-9]+)(.*?)(&gt;)/g, (match, lt, slash, tag, attrs, gt) => {
          // Highlight attributes
          let highlightedAttrs = attrs.replace(
            /\s+([a-zA-Z-]+)(=)(&quot;[^&]*&quot;|&#039;[^&]*&#039;)?/g,
            ' <span class="attr-name">$1</span><span class="attr-equals">$2</span><span class="attr-value">$3</span>'
          );
          return `<span class="tag-bracket">${lt}</span><span class="tag-bracket">${slash}</span><span class="tag-name">${tag}</span>${highlightedAttrs}<span class="tag-bracket">${gt}</span>`;
        });

      // Check if this looks like it has children
      const hasChildren = trimmed.includes('&gt;') && !trimmed.includes('/&gt;') && !trimmed.startsWith('&lt;/') && index < lines.length - 1;

      // Build flat line with indentation (no complex tree structure)
      let result = '<div class="code-line">';

      // Add extraction highlighting
      if (isExtracted) {
        result += `<span class="highlight-extraction highlight-${extractionField}" data-field="${extractionField.toUpperCase()}">`;
      }

      // Add the content with simple indentation based on nesting depth
      const indent = Math.min(Math.floor(index / 10) * 2, 10); // Simple progressive indentation
      result += '<span style="margin-left: ' + (indent * 10) + 'px; display: inline-block;">' + highlighted + '</span>';

      if (isExtracted) {
        result += '</span>';
      }

      result += '</div>'; // Close code-line

      return result;
    });

    return formattedLines.join('');
  }

  return htmlTemplate;
}

// Main execution
async function main() {
  log('\n🔍 Extraction Debugger', 'blue');
  log('=' .repeat(50), 'gray');

  try {
    // Get sources from database
    const sourcesResult = await pool.query(`
      SELECT name, rss_url, user_agent
      FROM sources
      WHERE rss_url IS NOT NULL
      ORDER BY name
    `);

    if (sourcesResult.rows.length === 0) {
      log('❌ No sources found in database', 'red');
      process.exit(1);
    }

    // Select source
    let selectedSource;
    const sourceArg = process.argv[2];

    if (sourceArg) {
      selectedSource = sourcesResult.rows.find(s => s.name === sourceArg);
      if (!selectedSource) {
        log(`❌ Source "${sourceArg}" not found`, 'red');
        log('\nAvailable sources:', 'yellow');
        sourcesResult.rows.forEach(s => log(`  - ${s.name}`, 'gray'));
        process.exit(1);
      }
    } else {
      // Interactive selection
      log('\nAvailable sources:', 'cyan');
      sourcesResult.rows.forEach((s, i) => {
        log(`  ${i + 1}. ${s.name}`, 'gray');
      });

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question('\nSelect source number: ', resolve);
      });
      rl.close();

      const sourceIndex = parseInt(answer) - 1;
      if (sourceIndex < 0 || sourceIndex >= sourcesResult.rows.length) {
        log('❌ Invalid selection', 'red');
        process.exit(1);
      }

      selectedSource = sourcesResult.rows[sourceIndex];
    }

    log(`\n📰 Selected source: ${selectedSource.name}`, 'green');
    log(`🔗 RSS URL: ${selectedSource.rss_url}`, 'gray');

    // Fetch RSS feed
    log('\n📡 Fetching RSS feed...', 'cyan');
    const parser = new Parser();
    const rssResponse = await fetch(selectedSource.rss_url, {
      headers: {
        'User-Agent': selectedSource.user_agent || 'Veritas/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!rssResponse.ok) {
      throw new Error(`RSS fetch failed: ${rssResponse.status}`);
    }

    const rssText = await rssResponse.text();
    const feed = await parser.parseString(rssText);

    log(`✅ Found ${feed.items.length} articles in feed`, 'green');

    // Ask how many to analyze
    const articlesToAnalyze = Math.min(3, feed.items.length); // Default to 3
    log(`\n🔬 Analyzing first ${articlesToAnalyze} articles...`, 'yellow');

    // Analyze articles
    const analyses = [];
    for (let i = 0; i < articlesToAnalyze; i++) {
      const item = feed.items[i];
      if (!item.link) continue;

      const analysis = await scrapeAndAnalyze(item.link, selectedSource.name);
      if (analysis) {
        analysis.rssTitle = item.title;
        analysis.rssDescription = item.contentSnippet || item.description;
        analyses.push(analysis);
      }
    }

    if (analyses.length === 0) {
      log('❌ No articles could be analyzed', 'red');
      process.exit(1);
    }

    // Generate HTML export
    log('\n📄 Generating HTML export...', 'cyan');
    const htmlContent = generateHTMLExport(analyses);

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Write to file
    await fs.writeFile(OUTPUT_FILE, htmlContent, 'utf-8');
    const fullPath = path.resolve(OUTPUT_FILE);

    log(`\n✅ Export complete!`, 'green');
    log(`📁 File: ${fullPath}`, 'cyan');
    log(`📊 Articles analyzed: ${analyses.length}`, 'gray');
    log(`\n💡 Open the HTML file in your browser to view the analysis`, 'yellow');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}