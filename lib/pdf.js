/**
 * lib/pdf.js
 * Shared Puppeteer helper for all PDF generation scripts.
 *
 * Why this exists:
 *   - Chrome path detection in ONE place — fix once, works everywhere
 *   - Eliminates 20 lines of repeated boilerplate per script
 *   - Consistent font-loading and timing across all exports
 *
 * Usage (CJS):
 *   const { openPage, exportPDF, CHROME } = require('../lib/pdf');
 *
 * Usage (ESM .mjs):
 *   import { openPage, exportPDF, CHROME } from '../lib/pdf.js';
 */

const puppeteer = require('puppeteer-core');
const fs        = require('fs');
const path      = require('path');

// ─── Chrome auto-detection ─────────────────────────────────────────────────
// Checks common macOS locations in priority order.
// Override by setting CHROME_PATH in your .env file.
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
];

const CHROME = CHROME_CANDIDATES.find(p => p && fs.existsSync(p));

if (!CHROME) {
  console.error('❌  Chrome not found. Set CHROME_PATH in your .env file.');
  process.exit(1);
}

// ─── Core helpers ──────────────────────────────────────────────────────────

/** Small delay utility */
const delay = ms => new Promise(r => setTimeout(r, ms));

/**
 * Launch a browser and open a file:// or https:// page.
 * Always waits for fonts to be ready before returning.
 *
 * @param {string} filePath  - Absolute path to .html file (or full URL)
 * @param {object} [opts]
 * @param {number} [opts.width=1280]
 * @param {number} [opts.height=960]
 * @param {number} [opts.delayMs=500]  - Extra ms to wait after load
 * @returns {{ browser, page }}
 */
async function openPage(filePath, { width = 1280, height = 960, delayMs = 500 } = {}) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height });

  const url = filePath.startsWith('http') ? filePath : `file://${filePath}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // Always wait for fonts — prevents render flashes in PDF
  await page.evaluateHandle('document.fonts.ready');

  if (delayMs > 0) await delay(delayMs);

  return { browser, page };
}

/**
 * Export the current page to a PDF file.
 * Closes the browser when done.
 *
 * @param {object} browser   - Puppeteer browser instance
 * @param {object} page      - Puppeteer page instance
 * @param {string} outPath   - Absolute output path for the PDF
 * @param {object} [pdfOpts] - Puppeteer PDF options (merged with defaults)
 */
async function exportPDF(browser, page, outPath, pdfOpts = {}) {
  const defaults = {
    path: outPath,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  await page.pdf({ ...defaults, ...pdfOpts });
  await browser.close();

  const filename = path.basename(outPath);
  console.log(`✅  PDF saved → ${filename}`);
}

/**
 * One-shot helper: open a page and export it as a PDF.
 * Use this when you don't need access to the page object in between.
 *
 * @param {string} htmlPath  - Absolute path to .html file
 * @param {string} outPath   - Absolute path for output PDF
 * @param {object} [opts]
 * @param {object} [opts.page]  - openPage options
 * @param {object} [opts.pdf]   - exportPDF options
 */
async function htmlToPDF(htmlPath, outPath, { page: pageOpts = {}, pdf: pdfOpts = {} } = {}) {
  const { browser, page } = await openPage(htmlPath, pageOpts);
  await exportPDF(browser, page, outPath, pdfOpts);
}

module.exports = { CHROME, delay, openPage, exportPDF, htmlToPDF };
