# Tier 3 Reference: Node.js Modules + Print Pipeline
> Quick reference for the antigravity workspace

---

## ESM vs CJS — The Simple Rule

| File extension | Module system | Use `require`? | Use `import`? | `__dirname` works? |
|---|---|---|---|---|
| `.js` | **CJS** (default) | ✅ Yes | ❌ No | ✅ Yes |
| `.mjs` | **ESM** | ❌ No | ✅ Yes | ❌ No* |

**Your workspace uses both — this is correct:**
- `.js` scripts in `scratch/`, `slp-worksheet/`, root = CJS → use `require()`
- `.mjs` scripts in `magazine/` = ESM → use `import`

**The one gotcha with ESM:** no `__dirname`. Use this instead:
```js
// .mjs equivalent of __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
```

**When to use which:**
- Writing a standalone PDF/docx script? → `.js` (CJS, simpler)
- Working inside a Vite/React project? → ESM (the framework decides)
- Don't mix `require()` and `import` in the same file

---

## PDF Script Pattern (use for every new script)

```js
const path = require('path');
const { htmlToPDF } = require('../lib/pdf');

const ROOT    = path.resolve(__dirname, '..');
const htmlPath = path.join(ROOT, 'my-file.html');
const outPath  = path.join(ROOT, 'my-file.pdf');

// Simple one-shot export
htmlToPDF(htmlPath, outPath, {
  pdf: { format: 'Letter', printBackground: true }
}).catch(err => { console.error(err); process.exit(1); });
```

**Need to manipulate the page before exporting?** Use `openPage` + `exportPDF`:
```js
const { openPage, exportPDF } = require('../lib/pdf');

(async () => {
  const { browser, page } = await openPage(htmlPath);

  // Do things to the page — click buttons, inject CSS, etc.
  await page.evaluate(() => document.querySelector('.no-print').remove());

  await exportPDF(browser, page, outPath, { format: 'A4' });
})();
```

---

## Print CSS Cheat Sheet

The most important rules for your HTML → PDF pipeline:

```css
/* 1. Page size and margins — always set this */
@page {
  size: letter;          /* or A4, or 1920px 1080px for slides */
  margin: 0;             /* control margins via body padding instead */
}

/* 2. Force background colors and images to print */
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* 3. Page breaks */
.page {
  page-break-after: always;    /* old syntax — still needed for Chrome */
  break-after: page;           /* modern syntax */
  page-break-inside: avoid;    /* don't split this element across pages */
}
.page:last-child {
  page-break-after: avoid;     /* no blank final page */
}

/* 4. Screen-only / print-only */
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  body { background: none; }
}

/* 5. Font loading — always wait in your script */
await page.evaluateHandle('document.fonts.ready');
```

**Common gotchas:**
- `box-shadow` doesn't print — use `border` for print versions
- `background-image` requires `print-color-adjust: exact`
- Google Fonts need `networkidle0` wait or they'll be blank
- Animations should be disabled: `animation: none !important`

---

## lib/pdf.js API Reference

```js
const { CHROME, delay, openPage, exportPDF, htmlToPDF } = require('./lib/pdf');

// CHROME           — detected Chrome path (string)
// delay(ms)        — simple Promise-based sleep
// openPage(path)   — launch browser, load HTML, wait for fonts
// exportPDF(...)   — save PDF and close browser
// htmlToPDF(...)   — one-shot: openPage + exportPDF
```

**PDF format options:**
```js
// Letter (US)
{ format: 'Letter' }

// A4 (international)
{ format: 'A4' }

// Custom size (slides, posters)
{ width: '1920px', height: '1080px' }

// With margins
{ format: 'Letter', margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' } }
```
