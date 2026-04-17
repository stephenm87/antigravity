/**
 * convert_all.mjs
 * 
 * Converts all 130 student submissions into uniform JPEG files.
 * - For PDFs: extracts the LAST page (where the cartoon lives) via pdf-lib,
 *   writes a single-page temp PDF, then converts with sips.
 * - For HEIC/AVIF/PNG: converts directly with sips.
 * - For JPG/JPEG: copies as-is (already compatible).
 * 
 * Output goes to /magazine/gallery/ with clean filenames.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, unlinkSync } from 'fs';
import { join, extname, basename } from 'path';
import { execSync } from 'child_process';
import { PDFDocument } from 'pdf-lib';

const BASE = '/Users/stephenmartinez/.gemini/antigravity/magazine';
const INPUT_DIR = join(BASE, 'images');
const OUTPUT_DIR = join(BASE, 'gallery');
const TEMP_DIR = join(BASE, '.temp_pdf');
const MAX_DIM = 1200; // max pixel dimension for gallery images

// Ensure output directories exist
mkdirSync(OUTPUT_DIR, { recursive: true });
mkdirSync(TEMP_DIR, { recursive: true });

/**
 * Clean a filename into a safe, filesystem-friendly slug.
 */
function safeSlug(name) {
  return name
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .substring(0, 80);
}

/**
 * Extract the last page of a PDF using pdf-lib, save as single-page PDF.
 */
async function extractLastPage(inputPath, tempPath) {
  const pdfBytes = readFileSync(inputPath);
  const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = srcDoc.getPageCount();
  
  // Create a new document with just the last page
  const newDoc = await PDFDocument.create();
  const [lastPage] = await newDoc.copyPages(srcDoc, [pageCount - 1]);
  newDoc.addPage(lastPage);
  
  const newBytes = await newDoc.save();
  writeFileSync(tempPath, Buffer.from(newBytes));
  
  return pageCount;
}

/**
 * Convert any image/PDF to JPEG using macOS sips.
 * Resizes to fit within MAX_DIM while preserving aspect ratio.
 */
function convertToJpeg(inputPath, outputPath) {
  try {
    execSync(
      `/usr/bin/sips -s format jpeg -s formatOptions 90 "${inputPath}" --out "${outputPath}"`,
      { stdio: 'pipe' }
    );
    
    // Get dimensions and resize if needed
    const info = execSync(`/usr/bin/sips -g pixelWidth -g pixelHeight "${outputPath}"`, { encoding: 'utf8' });
    const wMatch = info.match(/pixelWidth:\s*([\d.]+)/);
    const hMatch = info.match(/pixelHeight:\s*([\d.]+)/);
    
    if (wMatch && hMatch) {
      const w = parseFloat(wMatch[1]);
      const h = parseFloat(hMatch[1]);
      
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w >= h) {
          execSync(`/usr/bin/sips --resampleWidth ${MAX_DIM} "${outputPath}"`, { stdio: 'pipe' });
        } else {
          execSync(`/usr/bin/sips --resampleHeight ${MAX_DIM} "${outputPath}"`, { stdio: 'pipe' });
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error(`  ❌ sips failed: ${err.message}`);
    return false;
  }
}

// ── Main ──
async function main() {
  const files = readdirSync(INPUT_DIR).filter(f => !f.startsWith('.'));
  console.log(`\n📁 Found ${files.length} files in /images/\n`);
  
  let success = 0;
  let failed = 0;
  const manifest = [];
  
  for (const file of files) {
    const inputPath = join(INPUT_DIR, file);
    const ext = extname(file).toLowerCase();
    const nameBase = basename(file, extname(file));
    const slug = safeSlug(nameBase);
    const outputPath = join(OUTPUT_DIR, `${slug}.jpg`);
    
    process.stdout.write(`  🔄 ${file} → ${slug}.jpg ... `);
    
    try {
      if (ext === '.pdf') {
        // Extract last page first
        const tempPdf = join(TEMP_DIR, `${slug}_lastpage.pdf`);
        const pageCount = await extractLastPage(inputPath, tempPdf);
        process.stdout.write(`(${pageCount} pages, using last) `);
        
        if (convertToJpeg(tempPdf, outputPath)) {
          success++;
          manifest.push({ slug, original: file, pages: pageCount });
          console.log('✅');
        } else {
          failed++;
          console.log('❌');
        }
        
        // Clean up temp file
        try { unlinkSync(tempPdf); } catch {}
        
      } else if (['.png', '.heic', '.avif'].includes(ext)) {
        if (convertToJpeg(inputPath, outputPath)) {
          success++;
          manifest.push({ slug, original: file });
          console.log('✅');
        } else {
          failed++;
          console.log('❌');
        }
        
      } else if (['.jpg', '.jpeg', '.jpe'].includes(ext)) {
        // Already JPEG — copy and resize if needed
        copyFileSync(inputPath, outputPath);
        
        // Still resize if oversized
        const info = execSync(`/usr/bin/sips -g pixelWidth -g pixelHeight "${outputPath}"`, { encoding: 'utf8' });
        const wMatch = info.match(/pixelWidth:\s*([\d.]+)/);
        const hMatch = info.match(/pixelHeight:\s*([\d.]+)/);
        if (wMatch && hMatch) {
          const w = parseFloat(wMatch[1]);
          const h = parseFloat(hMatch[1]);
          if (w > MAX_DIM || h > MAX_DIM) {
            if (w >= h) {
              execSync(`/usr/bin/sips --resampleWidth ${MAX_DIM} "${outputPath}"`, { stdio: 'pipe' });
            } else {
              execSync(`/usr/bin/sips --resampleHeight ${MAX_DIM} "${outputPath}"`, { stdio: 'pipe' });
            }
          }
        }
        success++;
        manifest.push({ slug, original: file });
        console.log('✅');
        
      } else {
        console.log(`⚠️ Unknown format: ${ext}`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
      failed++;
    }
  }
  
  // Write raw manifest (will be enriched by build_manifest.mjs)
  writeFileSync(join(BASE, 'raw_manifest.json'), JSON.stringify(manifest, null, 2));
  
  // Clean up temp dir
  try { 
    const tempFiles = readdirSync(TEMP_DIR);
    for (const f of tempFiles) unlinkSync(join(TEMP_DIR, f));
  } catch {}
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`📄 Raw manifest: ${manifest.length} entries`);
  console.log(`📂 Output: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
