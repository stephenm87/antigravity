/**
 * generate-day8-pdf.js
 * Generates a high-clarity PDF of the Day 8 presentation.
 * Uses Puppeteer native PDF rendering so text stays as vectors (sharp/selectable).
 * Each slide is rendered as its own landscape page at maximum clarity.
 *
 * Usage: node generate-day8-pdf.js
 */
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const htmlPath = path.resolve(__dirname, 'day8-ccw-presentation.html');
  const outputPath = path.resolve(__dirname, 'day8-ccw-presentation.pdf');
  const fileUrl = `file://${htmlPath}`;

  // Find Chrome on macOS
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (!fs.existsSync(chromePath)) {
    console.error('Google Chrome not found at', chromePath);
    process.exit(1);
  }

  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(3000);

  // Get total slide count and extract all slide HTML
  const totalSlides = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log(`Found ${totalSlides} slides`);

  // Extract the full page HTML and styles, then build a print-optimized version
  const printHtml = await page.evaluate(() => {
    // Get all stylesheets from the document
    const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.outerHTML).join('\n');
    
    // Get all slides' outer HTML
    const slides = Array.from(document.querySelectorAll('.slide'));
    const slideHtmls = slides.map(s => {
      // Clone the slide and force it to be visible
      const clone = s.cloneNode(true);
      clone.classList.add('active');
      return clone.outerHTML;
    });

    return { styles, links, slideHtmls };
  });

  // Build a print-optimized HTML document
  const printPage = await browser.newPage();
  
  const printDocument = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
${printHtml.links}
<style>
${printHtml.styles}

/* ─── Print Overrides for CLASSROOM TV ─── */
@page {
  size: 1920px 1080px;
  margin: 0;
}

*, *::before, *::after {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}

body {
  margin: 0;
  padding: 0;
  background: transparent;
}

/* === MASSIVE FONT BOOST for classroom readability === */
/* The HTML uses rem units rooted at 16px. Bumping to 28px scales everything. */
html { font-size: 28px !important; }

/* Headings: ~48pt for main, ~40pt for section */
h1 { font-size: 48pt !important; line-height: 1.15 !important; }
h2 { font-size: 40pt !important; line-height: 1.2 !important; }
h3 { font-size: 24pt !important; }

/* Body text: ~28pt for max readability */
.content-list > li {
  font-size: 28pt !important;
  line-height: 1.35 !important;
  padding: 0.3rem 0 0.3rem 1.2rem !important;
}
.content-list > li::before {
  width: 10px !important;
  height: 10px !important;
  top: 1rem !important;
}

/* Sub-lists: ~24pt */
.content-list .sub-list > li {
  font-size: 24pt !important;
  line-height: 1.35 !important;
}
.content-list .sub-list .sub-list > li {
  font-size: 22pt !important;
}

/* Title slide */
.slide-title h1 { font-size: 52pt !important; max-width: none !important; }
.slide-title .title-date-range { font-size: 40pt !important; }
.slide-title .title-badge { font-size: 18pt !important; padding: 0.3rem 1.5rem !important; }
.slide-title .subtitle { font-size: 20pt !important; }

/* Agenda slide – dense layout, needs tighter spacing */
.slide-agenda h2 { font-size: 28pt !important; margin-bottom: 0.5rem !important; padding-bottom: 0.4rem !important; }
.slide-agenda h3 { font-size: 18pt !important; margin-bottom: 0.3rem !important; }
.slide-agenda .content-list > li {
  font-size: 20pt !important;
  line-height: 1.3 !important;
  padding: 0.15rem 0 0.15rem 1rem !important;
}
.slide-agenda .content-list > li::before {
  width: 8px !important; height: 8px !important; top: 0.7rem !important;
}
.slide-agenda .agenda-grid { gap: 0.8rem !important; margin-top: 0.3rem !important; }
.slide-agenda .agenda-card { padding: 1rem 1.2rem !important; }
.slide-agenda { padding: 1.8rem 3rem !important; }

/* Connections cells */
.conn-cell { font-size: 22pt !important; font-weight: 700 !important; min-height: 5rem !important; }
.conn-left h2 { font-size: 38pt !important; }
.conn-left p { font-size: 18pt !important; }

/* Focus question */
.focus-question-box h3 { font-size: 20pt !important; }
.focus-question-box p { font-size: 24pt !important; }
.focus-image-caption { font-size: 14pt !important; }

/* WWII panel */
.wwii-title-panel h2 { font-size: 36pt !important; }
.wwii-content .content-list > li { font-size: 26pt !important; }

/* Activity */
.activity-box h2 { font-size: 32pt !important; }
.activity-box .content-list > li { font-size: 24pt !important; }

/* Work Time */
.worktime-label h2 { font-size: 42pt !important; }
.wt-card { font-size: 22pt !important; }
.wt-card .wt-icon { font-size: 28pt !important; }

/* Map caption */
.resumed-map-caption { font-size: 14pt !important; }

/* Highlight spans */
.highlight, .highlight-red, .highlight-cyan { font-size: inherit !important; }

/* Slide padding for larger text */
.slide {
  padding: 2.5rem 3rem !important;
  display: flex !important;
  position: relative !important;
  opacity: 1 !important;
  transform: none !important;
  width: 1920px !important;
  height: 1080px !important;
  page-break-after: always;
  page-break-inside: avoid;
  overflow: hidden;
}
.slide:last-child { page-break-after: avoid; }
.slide::after { display: none !important; }

/* Hide navigation */
.nav-hud { display: none !important; }/* Ensure animations are disabled */
.slide * {
  animation: none !important;
  transition: none !important;
}
</style>
</head>
<body>
${printHtml.slideHtmls.join('\n')}
</body>
</html>`;

  await printPage.setContent(printDocument, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(2000);

  console.log('Generating PDF with vector text...');
  await printPage.pdf({
    path: outputPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log(`✅ PDF saved to: ${outputPath}`);
  console.log('   Text is rendered as vectors (sharp & selectable)');
  
  await browser.close();
})();
