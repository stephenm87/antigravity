/**
 * generate_magazine.mjs
 * 
 * Generates the complete magazine HTML file with:
 * - Front cover (both Jade Dragon and Forbidden City variants)
 * - Introduction/methodology spread
 * - Table of Contents
 * - Thematic sections with divider pages, pull quotes, and gallery pages
 * - Colophon
 * - Back cover
 * 
 * The HTML is optimized for PDF export via Puppeteer.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = '/Users/stephenmartinez/.gemini/antigravity/magazine';
const manifest = JSON.parse(readFileSync(join(BASE, 'manifest.json'), 'utf8'));
const themes = JSON.parse(readFileSync(join(BASE, 'themes.json'), 'utf8'));

// Build a slug→student lookup
const studentBySlug = {};
for (const s of manifest) { studentBySlug[s.slug] = s; }

// ─── Image dimension data (from image_dims.txt) ───
const imageDims = {};
const dimsRaw = readFileSync(join(BASE, 'image_dims.txt'), 'utf8').trim().split('\n');
for (const line of dimsRaw) {
  const parts = line.trim().split(/\s+/);
  if (parts.length >= 3) {
    imageDims[parts[0]] = { w: parseInt(parts[1]), h: parseInt(parts[2]) };
  }
}

// Theme order for the magazine
const THEME_ORDER = ['opium', 'imperialism', 'rebellions', 'reform'];

// Section tint CSS classes
const SECTION_TINTS = {
  opium: '#f5f0e8',
  imperialism: '#edeef2',
  rebellions: '#f2ede4',
  reform: '#f0e8e8'
};

// Pull quotes between sections (before each section)
const SECTION_QUOTES = {
  opium: {
    text: 'If we continue to allow [opium] to be brought in, in a few dozen years we shall not only be without soldiers to resist the enemy, but also in want of silver to provide an army.',
    attribution: 'Lin Zexu, Memorial to the Daoguang Emperor, 1838'
  },
  imperialism: {
    text: 'China is like a body after a long illness… the foreigners are like the surgeons who cut without caring whether the patient lives.',
    attribution: 'Sun Yat-sen, Kidnapped in London, 1897'
  },
  rebellions: {
    text: 'The people fear not death; why threaten them with it?',
    attribution: 'Dao De Jing, Chapter 74 — invoked by Taiping and Boxer rebels'
  },
  reform: {
    text: 'We should adopt the foreigners\u2019 superior techniques in order to control them.',
    attribution: 'Feng Guifen, Protests from the Study of Jiaobin, 1861'
  }
};

// Section roman numerals and icon decorations
const ROMAN = { opium: 'I', imperialism: 'II', rebellions: 'III', reform: 'IV' };

/**
 * Generate a full-bleed section divider page
 */
function generateDividerPage(themeKey) {
  const section = themes[themeKey];
  const count = section.slugs.length;
  return `
    <div class="page divider-page">
      <div class="divider-content">
        <div class="divider-numeral">${ROMAN[themeKey]}</div>
        <div class="divider-rule"></div>
        <div class="divider-title">${section.title.toUpperCase()}</div>
        <div class="divider-subtitle">${section.subtitle}</div>
        <div class="divider-rule"></div>
        <div class="divider-intro">${section.intro}</div>
        <div class="divider-count">${count} Student Cartoons</div>
      </div>
    </div>`;
}

/**
 * Generate a full-page pull quote page
 */
function generateQuotePage(themeKey, pageNum, tint) {
  const quote = SECTION_QUOTES[themeKey];
  return `
    <div class="page quote-page" style="background: ${tint};">
      <div class="quote-content">
        <div class="quote-rule-top"></div>
        <div class="quote-mark">\u201C</div>
        <div class="quote-text">${quote.text}</div>
        <div class="quote-attribution">\u2014 ${quote.attribution}</div>
        <div class="quote-rule-bottom"></div>
      </div>
      <div class="page-number">${pageNum}</div>
    </div>`;
}

/**
 * Generate gallery pages for a given section - one full page per student
 */
function generateSectionGallery(themeKey, startPageNum) {
  const section = themes[themeKey];
  const headerText = section.title.toUpperCase();
  let html = '';
  let pageNum = startPageNum;

  for (const slug of section.slugs) {
    const student = studentBySlug[slug];
    if (!student) {
      console.warn(`⚠️  Slug "${slug}" not found in manifest!`);
      continue;
    }

    // Compute aspect ratio class from image dimensions
    const dims = imageDims[student.file];
    let aspectClass = '';
    if (dims) {
      const ratio = dims.w / dims.h;
      if (ratio > 1.4) aspectClass = 'aspect-wide';
      else if (ratio > 1.05) aspectClass = 'aspect-landscape';
      else if (ratio < 0.85) aspectClass = 'aspect-tall';
      else aspectClass = 'aspect-square';
    }

    html += `
    <div class="page gallery-page section-${themeKey} ${aspectClass}">
      <div class="gallery-header">
        <div class="gallery-header-line"></div>
        <span class="gallery-header-text">${headerText}</span>
        <div class="gallery-header-line"></div>
      </div>
      <div class="gallery-image-area">
        <img src="gallery/${student.file}" alt="Political cartoon by ${student.name}" loading="lazy">
      </div>
      <div class="gallery-name">${student.name}</div>
      <div class="page-number">${pageNum}</div>
    </div>`;
    pageNum++;
  }

  return { html, pagesUsed: section.slugs.length };
}

/**
 * Generate the Table of Contents page
 */
function generateTOC(sectionStartPages, sectionEndPages) {
  let tocEntries = '';
  
  for (const themeKey of THEME_ORDER) {
    const section = themes[themeKey];
    const startPage = sectionStartPages[themeKey];
    const endPage = sectionEndPages[themeKey];
    
    tocEntries += `
      <div class="toc-section">
        <div class="toc-section-header">
          <span class="toc-section-numeral">${ROMAN[themeKey]}</span>
          <span class="toc-section-title">${section.title}</span>
          <span class="toc-dots"></span>
          <span class="toc-page-num">${startPage}\u2013${endPage}</span>
        </div>
        <div class="toc-students">
          ${section.slugs.map((slug, i) => {
            const student = studentBySlug[slug];
            if (!student) return '';
            return `<span class="toc-student">${student.name}</span>`;
          }).filter(Boolean).join('')}
        </div>
      </div>`;
  }

  return `
    <div class="page toc-page">
      <div class="toc-header">
        <h1>CONTENTS</h1>
        <div class="toc-header-rule"></div>
      </div>
      <div class="toc-body">
        ${tocEntries}
      </div>
      <div class="page-number">4</div>
    </div>`;
}

/**
 * Generate the Colophon page
 */
function generateColophon(pageNum) {
  return `
    <div class="page colophon-page">
      <div class="colophon-content">
        <div class="colophon-title">THE QING GAZETTE</div>
        <div class="colophon-rule"></div>
        <div class="colophon-details">
          <p><strong>Shanghai American School</strong></p>
          <p>Puxi Campus</p>
          <p>Grade 9 Asian History</p>
          <p>Spring 2026</p>
        </div>
        <div class="colophon-rule-thin"></div>
        <div class="colophon-credits">
          <p class="colophon-label">PRODUCED BY</p>
          <p>The Asian History Department</p>
        </div>
        <div class="colophon-credits">
          <p class="colophon-label">DESIGN</p>
          <p>Stephen F. Martinez</p>
        </div>
        <div class="colophon-credits">
          <p class="colophon-label">STUDENT CARTOONS</p>
          <p>Created by hand, digitally, or with AI assistance.<br>
          Each cartoon represents original historical research<br>
          and analytical interpretation by the student artist.</p>
        </div>
        <div class="colophon-credits">
          <p class="colophon-label">TYPOGRAPHY</p>
          <p>Cinzel \u00b7 Cormorant Garamond \u00b7 Inter</p>
        </div>
        <div class="colophon-credits">
          <p class="colophon-label">EXHIBITION FORMAT</p>
          <p>Published as a class exhibition catalogue<br>
          featuring ${manifest.length} student political cartoons<br>
          organized across four thematic sections.</p>
        </div>
        <div class="colophon-credits">
          <p class="colophon-label">EDITION</p>
          <p>First edition \u00b7 ${pageNum + 1} pages \u00b7 Letter format<br>
          Digitally typeset and exported to PDF</p>
        </div>
        <div class="colophon-rule-thin"></div>
        <div class="colophon-footer">
          <p>Issue No. 1</p>
          <p style="font-size: 7pt; margin-top: 0.08in; letter-spacing: 2px; color: #ccc;">\u00a9 2026 Shanghai American School</p>
        </div>
      </div>
      <div class="page-number">${pageNum}</div>
    </div>`;
}

// ─── Build the full magazine structure ───

// First pass: compute page numbers
// Page 1: Front cover (jade)
// Page 2-3: Intro spread
// Page 4: TOC
// Then for each section: Quote page, Divider page, gallery pages
let currentPage = 5;
const sectionStartPages = {};
const sectionLayout = [];

for (const themeKey of THEME_ORDER) {
  const section = themes[themeKey];
  // Quote page
  const quotePage = currentPage;
  currentPage++;
  // Divider page
  const dividerPage = currentPage;
  currentPage++;
  // Gallery pages
  const galleryStart = currentPage;
  sectionStartPages[themeKey] = galleryStart;
  currentPage += section.slugs.length;
  
  sectionLayout.push({
    themeKey,
    quotePage,
    dividerPage,
    galleryStart,
    galleryEnd: currentPage - 1
  });
}

// Colophon
const colophonPage = currentPage;
currentPage++;
// Back cover
const backCoverPage = currentPage;

// ─── Generate TOC ───
const sectionEndPages = {};
for (const layout of sectionLayout) {
  sectionEndPages[layout.themeKey] = layout.galleryEnd;
}
const tocHtml = generateTOC(sectionStartPages, sectionEndPages);

// ─── Generate all section content ───
let sectionsHtml = '';
for (const layout of sectionLayout) {
  const themeKey = layout.themeKey;
  const tint = SECTION_TINTS[themeKey];
  
  // Quote page
  sectionsHtml += generateQuotePage(themeKey, layout.quotePage, tint);
  
  // Divider page
  sectionsHtml += generateDividerPage(themeKey);
  
  // Gallery pages
  const { html: galleryHtml } = generateSectionGallery(themeKey, layout.galleryStart);
  sectionsHtml += galleryHtml;
}

// ─── Colophon ───
const colophonHtml = generateColophon(colophonPage);

// ─── Assemble final HTML ───

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Qing Gazette — Asian History Political Cartoon Exhibition</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet">
  <style>
    /* ================================================
       RESET & BASE
       ================================================ */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --page-width: 8.5in;
      --page-height: 11in;
      --charcoal: #1a1a1a;
      --warm-black: #0d0d0d;
      --gold: #c9a84c;
      --gold-light: #dfc070;
      --imperial-red: #8b1a1a;
      --crimson: #cc3333;
      --parchment: #f5f0e8;
      --parchment-dark: #e8e0d0;
      --ink: #2a2420;
      --caption: #555;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: #333;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
    }

    /* ================================================
       PAGE SYSTEM
       ================================================ */
    .page {
      width: var(--page-width);
      height: var(--page-height);
      margin: 1rem auto;
      position: relative;
      overflow: hidden;
      background: var(--parchment);
      box-shadow: 0 8px 40px rgba(0,0,0,0.3);
    }

    @media print {
      body { background: none; margin: 0; padding: 0; }
      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
        page-break-inside: avoid;
      }
      .page:last-child { page-break-after: auto; }
      .cover-selector { display: none !important; }
    }

    @page {
      size: letter;
      margin: 0;
    }

    /* ================================================
       COVER PAGES — SHARED
       ================================================ */
    .cover-page {
      background: #000;
    }
    .cover-page img.cover-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      position: absolute;
      inset: 0;
    }
    .cover-overlay {
      position: absolute;
      inset: 0;
      z-index: 2;
    }

    /* ── Option C — Centered bottom gradient band ── */
    .jade-cover .cover-overlay {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding: 0 0.8in 0.5in;
      background: linear-gradient(180deg,
        rgba(0,0,0,0.6) 0%,
        rgba(0,0,0,0.15) 8%,
        transparent 15%,
        transparent 55%,
        rgba(0,0,0,0.25) 68%,
        rgba(0,0,0,0.7) 82%,
        rgba(0,0,0,0.92) 100%
      );
    }
    /* ── Top metadata bar: Issue No. left, Spring 2026 right ── */
    .jade-cover .cover-top-meta {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 3;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0.35in 0.45in 0 0.45in;
    }
    .jade-cover .cover-top-meta .meta-left,
    .jade-cover .cover-top-meta .meta-right {
      font-family: 'Inter', sans-serif;
      font-size: 7pt;
      font-weight: 500;
      letter-spacing: 3.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
      text-shadow: 0 1px 6px rgba(0,0,0,0.5);
    }
    .jade-cover .title-line {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 21pt;
      letter-spacing: 4px;
      color: #fff;
      text-shadow: 0 2px 12px rgba(0,0,0,0.5);
      text-align: center;
      line-height: 1.4;
    }
    .jade-cover .title-line .accent { color: var(--gold); font-weight: 900; }
    .jade-cover .cover-rule {
      width: 45px; height: 2px;
      background: var(--gold);
      margin: 0.1in auto;
    }
    .jade-cover .subject {
      font-family: 'Cinzel', serif;
      font-weight: 600;
      font-size: 17pt;
      letter-spacing: 5px;
      color: rgba(255,255,255,0.9);
      text-shadow: 0 2px 12px rgba(0,0,0,0.5);
    }
    .jade-cover .sub {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 12pt;
      color: rgba(255,255,255,0.75);
      margin-top: 0.06in;
    }



    /* ================================================
       INTRODUCTION SPREAD
       ================================================ */
    .intro-page {
      padding: 0.7in 0.75in 0.6in;
      display: flex;
      flex-direction: column;
    }

    .intro-header {
      text-align: center;
      margin-bottom: 0.3in;
      padding-bottom: 0.2in;
      border-bottom: 1px solid rgba(0,0,0,0.12);
    }
    .intro-header h1 {
      font-family: 'Cinzel', serif;
      font-weight: 600;
      font-size: 18pt;
      color: var(--charcoal);
      letter-spacing: 3px;
      margin-bottom: 0.06in;
    }
    .intro-header h1 .accent { color: var(--imperial-red); }
    .intro-header .intro-sub {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 11pt;
      color: #777;
      letter-spacing: 1px;
    }

    .intro-content {
      flex: 1;
      column-count: 2;
      column-gap: 0.35in;
      column-rule: 1px solid rgba(0,0,0,0.08);
      font-family: 'Cormorant Garamond', serif;
      font-size: 11pt;
      line-height: 1.65;
      color: var(--ink);
      text-align: justify;
    }

    .intro-content h2 {
      font-family: 'Cinzel', serif;
      font-size: 10pt;
      font-weight: 600;
      letter-spacing: 2px;
      color: var(--charcoal);
      margin: 0.18in 0 0.06in;
      text-transform: uppercase;
      break-after: avoid;
    }
    .intro-content h2:first-child { margin-top: 0; }

    .intro-content .drop-cap::first-letter {
      font-family: 'Cinzel', serif;
      font-size: 36pt;
      font-weight: 700;
      float: left;
      line-height: 0.85;
      margin: 0 0.06in 0 0;
      color: var(--imperial-red);
    }

    .intro-content p {
      margin-bottom: 0.1in;
    }

    .intro-content .pull-quote {
      break-inside: avoid;
      margin: 0.15in 0;
      padding: 0.12in 0.15in;
      border-left: 3px solid var(--gold);
      background: rgba(201,168,76,0.06);
      font-style: italic;
      font-size: 10.5pt;
      color: #555;
    }

    .intro-content .tool-tag {
      font-family: 'Inter', sans-serif;
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--imperial-red);
      margin-bottom: 0.03in;
      display: block;
    }

    .intro-page .page-number {
      position: absolute;
      bottom: 0.4in;
      right: 0.6in;
      font-family: 'Cormorant Garamond', serif;
      font-size: 9pt;
      color: #aaa;
    }
    .intro-page .page-number-left {
      position: absolute;
      bottom: 0.4in;
      left: 0.6in;
      font-family: 'Cormorant Garamond', serif;
      font-size: 9pt;
      color: #aaa;
    }

    /* ================================================
       TABLE OF CONTENTS
       ================================================ */
    .toc-page {
      padding: 0.7in 0.65in 0.6in;
      display: flex;
      flex-direction: column;
    }
    .toc-header {
      text-align: center;
      margin-bottom: 0.3in;
    }
    .toc-header h1 {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 22pt;
      letter-spacing: 8px;
      color: var(--charcoal);
    }
    .toc-header-rule {
      width: 40px;
      height: 2px;
      background: var(--gold);
      margin: 0.12in auto 0;
    }
    .toc-body {
      flex: 1;
    }
    .toc-section {
      margin-bottom: 0.22in;
    }
    .toc-section-header {
      display: flex;
      align-items: baseline;
      gap: 0.1in;
      margin-bottom: 0.06in;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      padding-bottom: 0.04in;
    }
    .toc-section-numeral {
      font-family: 'Cinzel', serif;
      font-size: 10pt;
      font-weight: 700;
      color: var(--imperial-red);
      min-width: 0.3in;
    }
    .toc-section-title {
      font-family: 'Cinzel', serif;
      font-size: 12pt;
      font-weight: 600;
      letter-spacing: 2px;
      color: var(--charcoal);
    }
    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted rgba(0,0,0,0.2);
      margin: 0 0.05in;
      min-width: 0.3in;
      align-self: flex-end;
      margin-bottom: 0.04in;
    }
    .toc-page-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10pt;
      color: #888;
      min-width: 0.4in;
      text-align: right;
    }
    .toc-students {
      padding-left: 0.4in;
      font-family: 'Cormorant Garamond', serif;
      font-size: 9pt;
      color: #666;
      line-height: 1.65;
    }
    .toc-student {
      display: inline;
    }
    .toc-student:not(:last-child)::after {
      content: " · ";
      color: #bbb;
    }

    /* ================================================
       SECTION DIVIDER PAGES
       ================================================ */
    .divider-page {
      background: var(--warm-black) !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Subtle gold border inset on divider pages */
    .divider-page::before {
      content: '';
      position: absolute;
      inset: 0.4in;
      border: 1px solid rgba(201,168,76,0.15);
      pointer-events: none;
    }
    .divider-content {
      text-align: center;
      max-width: 5.5in;
      padding: 0 0.5in;
    }
    .divider-numeral {
      font-family: 'Cinzel', serif;
      font-weight: 400;
      font-size: 14pt;
      letter-spacing: 6px;
      color: rgba(255,255,255,0.45);
      margin-bottom: 0.25in;
    }
    .divider-rule {
      width: 50px;
      height: 2px;
      background: var(--gold);
      margin: 0.2in auto;
    }
    .divider-title {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 24pt;
      letter-spacing: 5px;
      color: var(--gold);
      margin-bottom: 0.08in;
    }
    .divider-subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 14pt;
      color: rgba(255,255,255,0.75);
      margin-bottom: 0.15in;
    }
    .divider-count {
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
      margin-top: 0.35in;
    }
    .divider-intro {
      font-family: 'Cormorant Garamond', serif;
      font-size: 11.5pt;
      line-height: 1.7;
      color: rgba(255,255,255,0.7);
      margin-top: 0.15in;
      max-width: 5in;
      margin-left: auto;
      margin-right: auto;
    }

    /* ================================================
       PULL QUOTE PAGES
       ================================================ */
    .quote-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .quote-content {
      max-width: 5in;
      text-align: center;
      padding: 0 0.5in;
    }
    .quote-rule-top, .quote-rule-bottom {
      width: 30px;
      height: 1px;
      background: rgba(0,0,0,0.2);
      margin: 0 auto;
    }
    .quote-mark {
      font-family: 'Cormorant Garamond', serif;
      font-size: 72pt;
      line-height: 0.6;
      color: var(--gold);
      margin: 0.25in 0 0.1in;
    }
    .quote-text {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 16pt;
      line-height: 1.7;
      color: var(--ink);
      margin-bottom: 0.25in;
    }
    .quote-attribution {
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 0.25in;
    }

    /* ================================================
       GALLERY PAGES — UNIFIED LAYOUT
       All images use the same structure:
       - Header at top (fixed height)
       - Image area fills center (flex: 1)
       - Student name in reserved band at bottom (fixed height)
       - Page number below name (absolute)
       ================================================ */
    .gallery-page {
      padding: 0.15in 0.15in 0.2in;
      display: flex;
      flex-direction: column;
    }

    /* Section-specific background tints */
    .section-opium { background: ${SECTION_TINTS.opium}; }
    .section-imperialism { background: ${SECTION_TINTS.imperialism}; }
    .section-rebellions { background: ${SECTION_TINTS.rebellions}; }
    .section-reform { background: ${SECTION_TINTS.reform}; }

    /* ── Decorative corner flourishes on gallery pages ── */
    .gallery-page::before,
    .gallery-page::after {
      content: '';
      position: absolute;
      width: 0.3in;
      height: 0.3in;
      border-color: rgba(0,0,0,0.08);
      border-style: solid;
      z-index: 1;
      pointer-events: none;
    }
    .gallery-page::before {
      top: 0.25in;
      left: 0.25in;
      border-width: 1px 0 0 1px;
    }
    .gallery-page::after {
      top: 0.25in;
      right: 0.25in;
      border-width: 1px 1px 0 0;
    }

    .gallery-header {
      display: flex;
      align-items: center;
      gap: 0.12in;
      margin-bottom: 0.08in;
      flex-shrink: 0;
      padding: 0 0.15in;
    }
    .gallery-header-line {
      flex: 1;
      height: 1px;
      background: rgba(0,0,0,0.12);
    }
    .gallery-header-text {
      font-family: 'Cinzel', serif;
      font-size: 7pt;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--charcoal);
      white-space: nowrap;
    }

    .gallery-image-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 0;
      overflow: hidden;
      padding: 0.02in;
    }

    .gallery-image-area img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      /* Subtle shadow lifts the artwork off the parchment */
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
    }

    /* ── Aspect-ratio overrides ── */
    .aspect-wide .gallery-image-area img {
      object-fit: contain;
    }
    .aspect-wide .gallery-image-area {
      align-items: flex-start;
      padding-top: 0.15in;
    }

    .aspect-landscape .gallery-image-area {
      align-items: center;
    }

    .aspect-square .gallery-image-area {
      align-items: center;
    }

    .aspect-tall .gallery-image-area {
      align-items: center;
    }

    /* ================================================
       Student Name — reserved band, never overlaps image
       ================================================ */
    .gallery-name {
      margin-top: 0.04in;
      padding-top: 0.02in;
      font-family: 'Cinzel', serif;
      font-size: 14pt;
      font-weight: 600;
      color: var(--charcoal);
      text-align: center;
      letter-spacing: 2px;
      flex-shrink: 0;
      min-height: 0.25in;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-number {
      text-align: center;
      font-family: 'Cormorant Garamond', serif;
      font-size: 8pt;
      color: #bbb;
      flex-shrink: 0;
      padding-bottom: 0.02in;
    }

    /* ================================================
       COLOPHON PAGE
       ================================================ */
    .colophon-page {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--parchment);
    }
    .colophon-content {
      text-align: center;
      max-width: 4.5in;
    }
    .colophon-title {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 16pt;
      letter-spacing: 5px;
      color: var(--charcoal);
      margin-bottom: 0.2in;
    }
    .colophon-rule {
      width: 40px;
      height: 2px;
      background: var(--gold);
      margin: 0 auto 0.3in;
    }
    .colophon-rule-thin {
      width: 60px;
      height: 1px;
      background: rgba(0,0,0,0.15);
      margin: 0.25in auto;
    }
    .colophon-details {
      font-family: 'Cormorant Garamond', serif;
      font-size: 11pt;
      line-height: 1.8;
      color: var(--ink);
    }
    .colophon-credits {
      margin-top: 0.2in;
    }
    .colophon-label {
      font-family: 'Inter', sans-serif;
      font-size: 7pt;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--imperial-red);
      margin-bottom: 0.04in;
    }
    .colophon-credits p {
      font-family: 'Cormorant Garamond', serif;
      font-size: 10pt;
      line-height: 1.6;
      color: #666;
    }
    .colophon-footer {
      margin-top: 0.1in;
      font-family: 'Cinzel', serif;
      font-size: 9pt;
      letter-spacing: 3px;
      color: #bbb;
    }

    /* ================================================
       BACK COVER — Fallen Dynasty (rain-slicked palace)
       ================================================ */
    .back-cover {
      background: #000;
      position: relative;
    }
    .back-cover img.back-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      position: absolute;
      inset: 0;
    }
    .back-cover .back-overlay {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      text-align: center;
      padding-bottom: 1.2in;
      background: linear-gradient(180deg,
        rgba(0,0,0,0.3) 0%,
        rgba(0,0,0,0.0) 25%,
        rgba(0,0,0,0.0) 55%,
        rgba(0,0,0,0.65) 100%
      );
    }
    .back-cover .back-title {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 14pt;
      color: rgba(255,255,255,0.9);
      letter-spacing: 4px;
    }
    .back-cover .back-rule {
      width: 45px;
      height: 2px;
      background: var(--gold);
      margin: 0.25in auto;
    }
    .back-cover .back-sub {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: 11pt;
      color: rgba(255,255,255,0.6);
      line-height: 1.7;
      max-width: 4in;
    }
    .back-cover .back-school {
      font-family: 'Cinzel', serif;
      font-size: 12pt;
      font-weight: 600;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.85);
      margin-top: 0.5in;
      text-shadow: 0 2px 10px rgba(0,0,0,0.6);
    }

    /* ================================================
       COVER SELECTOR (screen only)
       ================================================ */
  </style>
</head>
<body>



  <!-- ════════════════ FRONT COVER: JADE DRAGON (Option C) ════════════════ -->
  <div class="page cover-page jade-cover" id="cover-jade">
    <img class="cover-bg" src="covers/v3b_kintsugi.png" alt="Cracked jade dragon with kintsugi gold veins on crimson">
    <div class="cover-top-meta">
      <span class="meta-left">Issue No. 1</span>
      <span class="meta-right">Spring 2026</span>
    </div>
    <div class="cover-overlay">
      <div class="title-line">POLITICAL CARTOON <span class="accent">GAZETTE</span></div>
      <div class="cover-rule"></div>
      <div class="subject">ASIAN HISTORY</div>
      <div class="sub">The Fall of the Qing Dynasty</div>
    </div>
  </div>


  <!-- ════════════════ INTRODUCTION (Page 2) ════════════════ -->
  <div class="page intro-page">
    <div class="intro-header">
      <h1>THE FALL OF THE <span class="accent">QING</span></h1>
      <div class="intro-sub">A Visual Inquiry into the End of Imperial China</div>
    </div>
    <div class="intro-content">
      <p class="drop-cap">The Qing Dynasty, China's last imperial house, ruled for over 260 years before its dramatic collapse in 1912. Through the lens of political cartooning, our Grade 9 historians have investigated the forces — internal and external — that brought down one of the world's most enduring civilizations. Each cartoon in this exhibition represents a student's analytical interpretation of a pivotal moment in Qing history.</p>

      <h2>The Historical Themes</h2>
      <p>Students explored four interconnected dimensions of the Qing's decline:</p>

      <div class="pull-quote">
        <span class="tool-tag">The Opium Trade</span>
        The devastating economic and social impact of the opium trade, from the Opium Wars to the Treaty of Nanjing, which forced open China's ports and ceded Hong Kong to Britain.
      </div>

      <div class="pull-quote">
        <span class="tool-tag">Foreign Imperialism</span>
        The scramble for concessions, extraterritorial rights, and spheres of influence that carved China into zones of foreign control, undermining Qing sovereignty.
      </div>

      <div class="pull-quote">
        <span class="tool-tag">Internal Rebellions</span>
        From the Taiping Rebellion — one of history's deadliest conflicts — to the Boxer Uprising, internal movements that shook the dynasty's foundations.
      </div>

      <div class="pull-quote">
        <span class="tool-tag">Reform &amp; Revolution</span>
        The desperate modernization attempts of the Hundred Days' Reform and the Self-Strengthening Movement, and the revolutionary forces that ultimately toppled the throne.
      </div>

      <div style="break-before: column;"></div>
      <h2>The Visual Toolbox</h2>
      <p>Each student was challenged to employ at least one of three classic cartooning techniques to convey their historical argument:</p>

      <p><strong>Analogy &amp; Symbols</strong> — Using visual metaphors to represent abstract political concepts. A crumbling wall might stand for the weakening dynasty; a puppet on strings for foreign manipulation.</p>

      <p><strong>Caricature &amp; Exaggeration</strong> — Amplifying physical or behavioral traits to make a political point. The exaggeration of power dynamics, greed, or suffering forces the viewer to confront uncomfortable truths.</p>

      <p><strong>Contrast &amp; Juxtaposition</strong> — Placing opposing elements side by side to reveal contradictions — wealth beside poverty, rhetoric beside reality, tradition beside modernity.</p>

      <h2>The Assignment</h2>
      <p>Students were asked to judge their chosen historical event or trend as <em>positive, negative, short-sighted, wise,</em> or <em>ironic</em> — and to communicate that judgment visually. The result is a rich tapestry of perspectives, each offering a unique window into one of history's most consequential transformations.</p>
    </div>
    <div class="page-number">2</div>
  </div>

  <!-- ════════════════ INTRODUCTION (Page 3) — About This Exhibition ════════════════ -->
  <div class="page intro-page">
    <div class="intro-header">
      <h1>ABOUT THIS <span class="accent">EXHIBITION</span></h1>
      <div class="intro-sub">Perspectives on the End of Empire</div>
    </div>
    <div class="intro-content">
      <p class="drop-cap">This gazette collects the work of student-historians from our Grade 9 Asian History program. Working individually, each student selected a specific aspect of the Qing Dynasty's decline and crafted a political cartoon that communicates their historical analysis through visual argument.</p>

      <p>The cartoons on the following pages represent an extraordinary range of approaches — from dark satire to hopeful commentary, from ink-brush minimalism to vivid digital illustration. What unites them is their commitment to thinking historically: not merely describing the past, but interrogating it, evaluating it, and making a visual argument about its significance.</p>

      <h2>How to Read These Cartoons</h2>
      <p>As you explore the gallery, consider the following questions:</p>

      <p>• What <strong>symbols</strong> has the artist chosen, and what do they represent?</p>
      <p>• What is being <strong>exaggerated</strong>, and why?</p>
      <p>• What <strong>contrasts</strong> or juxtapositions are present?</p>
      <p>• What <strong>judgment</strong> is the artist making about the historical event?</p>
      <p>• Do you <strong>agree</strong> with the artist's interpretation? What evidence would you cite?</p>

      <div class="pull-quote">
        "A political cartoon is an argument in miniature — a historian's thesis distilled into a single, unforgettable image."
      </div>

      <h2>Acknowledgments</h2>
      <p>This exhibition would not have been possible without the dedication and creative risk-taking of every student who contributed. Each cartoon represents historical research, conceptual planning, and artistic execution.</p>

      <p>We invite you to linger over these pages, to read the cartoons closely, and to engage with the historical arguments they present. The best political cartoons don't just illustrate history — they make you <em>think</em> about it differently.</p>

      <p style="margin-top: 0.25in; font-style: italic; text-align: right; color: #888;">
        — The Asian History Department<br>
        <span style="font-size: 9pt;">Spring 2026</span>
      </p>
    </div>
    <div class="page-number">3</div>
  </div>

  <!-- ════════════════ TABLE OF CONTENTS (Page 4) ════════════════ -->
  ${tocHtml}

  <!-- ════════════════ THEMATIC SECTIONS ════════════════ -->
  ${sectionsHtml}

  <!-- ════════════════ COLOPHON ════════════════ -->
  ${colophonHtml}

  <!-- ════════════════ BACK COVER ════════════════ -->
  <div class="page back-cover">
    <img class="back-bg" src="covers/back_rear_intact.png" alt="Jade dragon rear view, turned away, intact with kintsugi veins">
    <div class="back-overlay">
      <div class="back-sub">
        The dynasty fell. The stories remain.
      </div>
      <div class="back-school">Asian History · Grade 9 · Spring 2026</div>
    </div>
  </div>



</body>
</html>`;

writeFileSync(join(BASE, 'magazine.html'), html);

// ─── Summary ───
const totalGalleryPages = manifest.length;
const totalQuotePages = THEME_ORDER.length;
const totalDividerPages = THEME_ORDER.length;
const totalEditorialPages = 1 + 2 + 1 + totalQuotePages + totalDividerPages + 1; // cover + intro + toc + quotes + dividers + colophon
const totalPages = totalEditorialPages + totalGalleryPages + 1; // + back cover

console.log(`\n📰 Magazine generated!`);
console.log(`   Structure:`);
console.log(`     1  Front cover`);
console.log(`     2  Introduction spread`);
console.log(`     1  Table of Contents`);
for (const layout of sectionLayout) {
  const section = themes[layout.themeKey];
  console.log(`     1  Quote page → Section ${ROMAN[layout.themeKey]}`);
  console.log(`     1  Section divider: ${section.title}`);
  console.log(`     ${section.slugs.length}  Gallery pages`);
}
console.log(`     1  Colophon`);
console.log(`     1  Back cover`);
console.log(`   ─────────────────────`);
console.log(`   ${totalPages} total pages`);
console.log(`   → ${join(BASE, 'magazine.html')}`);
