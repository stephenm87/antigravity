const path = require('path');
const { htmlToPDF } = require('../lib/pdf');

const ROOT    = path.resolve(__dirname, '..');
const htmlPath = path.join(ROOT, 'r2p-case-study-review.html');
const outPath  = path.resolve(__dirname, 'R2P_Case_Study_Review.pdf');

htmlToPDF(htmlPath, outPath, {
  pdf: {
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
  }
}).catch(err => { console.error(err); process.exit(1); });
