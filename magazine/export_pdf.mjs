/**
 * export_pdf.mjs
 * 
 * Exports the magazine HTML to PDF using puppeteer-core + system Chrome.
 * Generates two PDF variants: one with the Jade Dragon cover, one with the Forbidden City cover.
 * 
 * Key fix: Forces all lazy-loaded images to load eagerly before generating PDF.
 */

import puppeteer from 'puppeteer-core';
import { join } from 'path';

const BASE = '/Users/stephenmartinez/.gemini/antigravity/magazine';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function exportPDF() {
  const outputName = 'Qing_Gazette.pdf';
  console.log(`\n🖨️  Exporting ${outputName}...`);
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',          // allow file:// image loading
      '--allow-file-access-from-files',  // allow cross-origin file access
    ],
  });
  
  const page = await browser.newPage();
  
  // Set a large viewport so more content is "visible" for lazy loading
  await page.setViewport({ width: 816, height: 100000 });
  
  // Load the magazine HTML
  const fileUrl = `file://${join(BASE, 'magazine.html')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 120000 });
  
  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  
  // Force ALL images to load by removing lazy loading and setting src eagerly
  const imageCount = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
      // Remove lazy loading
      img.removeAttribute('loading');
      img.loading = 'eager';
      // Force decode
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    return imgs.length;
  });
  console.log(`   📷 Found ${imageCount} images, forcing eager load...`);
  
  // Scroll through the entire page to trigger any remaining lazy loads
  await page.evaluate(async () => {
    const pages = document.querySelectorAll('.page');
    for (const p of pages) {
      p.scrollIntoView({ behavior: 'instant' });
      await new Promise(r => setTimeout(r, 100));
    }
    // Scroll back to top
    window.scrollTo(0, 0);
  });
  
  // Wait for all images to actually finish loading
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const promises = imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true }); // don't block on broken images
        // Safety timeout per image
        setTimeout(resolve, 10000);
      });
    });
    await Promise.all(promises);
  });
  
  // Extra buffer for rendering
  await new Promise(r => setTimeout(r, 3000));
  
  // Verify image load status
  const loadReport = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('.gallery-page img'));
    const loaded = imgs.filter(img => img.complete && img.naturalWidth > 0).length;
    const broken = imgs.filter(img => img.complete && img.naturalWidth === 0).length;
    const pending = imgs.filter(img => !img.complete).length;
    return { total: imgs.length, loaded, broken, pending };
  });
  console.log(`   📊 Gallery images: ${loadReport.loaded}/${loadReport.total} loaded, ${loadReport.broken} broken, ${loadReport.pending} pending`);
  
  // Wait for layout to settle
  await new Promise(r => setTimeout(r, 1000));
  
  // Generate PDF
  const outputPath = join(BASE, outputName);
  await page.pdf({
    path: outputPath,
    width: '8.5in',
    height: '11in',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
    timeout: 180000,  // 3 minutes for 144 pages
  });
  
  console.log(`   ✅ Saved: ${outputPath}`);
  await browser.close();
  return outputPath;
}

async function main() {
  try {
    const pdfPath = await exportPDF();
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 Final PDF exported!');
    console.log(`   → ${pdfPath}`);
  } catch (err) {
    console.error('❌ Export failed:', err.message);
    process.exit(1);
  }
}

main();
