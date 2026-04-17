/**
 * build_manifest.mjs
 * 
 * Parses the raw_manifest.json (from convert_all.mjs) and builds
 * a clean manifest with properly formatted student names.
 * 
 * Handles formats like:
 *   "Bomin Park_4BC_Political Cartoon.png"  → "Bomin Park"
 *   "Chen, Edison.pdf"                      → "Edison Chen"
 *   "EMILY_3BD_Political Cartoon.png"       → "Emily"
 *   "Yu Lucas_Class 3B_Political Cartoon.jpg" → "Lucas Yu"
 *   "Shelley Li (inaccurate).pdf"           → "Shelley Li"
 *   "Marcus Huang politcal cartoon.pdf"     → "Marcus Huang"
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const BASE = '/Users/stephenmartinez/.gemini/antigravity/magazine';
const raw = JSON.parse(readFileSync(join(BASE, 'raw_manifest.json'), 'utf8'));

// Suffixes / noise to strip (case-insensitive)
const STRIP_PATTERNS = [
  /[_\s]*political\s*cartoon/gi,
  /[_\s]*politcal\s*cartoon/gi,    // typo variant
  /\s*PC$/gi,                       // "Kelly Ren PC"
  /[_\s]*class\s*\d[A-Z]*/gi,      // "_Class 3B"
  /[_\s]+\d[A-Z]{1,3}$/gi,         // "_4BC", "_3BD" at end  
  /[_\s]+\d[A-Z]{1,3}[_\s]/gi,     // "_4BC_", "_3BD_" in middle
  /\s*\(.*?\)/g,                    // "(inaccurate)" etc.
  /\.png$/gi,                       // stray extensions in slug
];

// Manual overrides for names the parser can't auto-resolve
const NAME_OVERRIDES = {
  'EMILY_3BD_Political Cartoon.png': 'Emily',
  'ISABELLA_3BD_PoliticalCartoon.pdf': 'Isabella',
  'Kingston_3BD_Political Cartoon.png': 'Kingston',
  'KunwoongMoon_3B_Political Cartoon.png': 'Kunwoong Moon',
  'Macario_4B_Political Cartoon.png': 'Macario',
  'Rafaela_4BD_Political Cartoon.pdf': 'Rafaela',
};

function cleanName(originalFilename) {
  // Check manual overrides first
  if (NAME_OVERRIDES[originalFilename]) {
    return NAME_OVERRIDES[originalFilename];
  }

  // Remove file extension
  let name = originalFilename.replace(/\.[^.]+$/, '');
  
  // Apply strip patterns
  for (const pat of STRIP_PATTERNS) {
    name = name.replace(pat, '');
  }
  
  // Replace underscores with spaces
  name = name.replace(/_/g, ' ');
  
  // Trim whitespace
  name = name.trim();
  
  // Handle "Last, First" format → "First Last"
  if (name.includes(',')) {
    const parts = name.split(',').map(s => s.trim());
    if (parts.length === 2 && parts[0] && parts[1]) {
      name = `${parts[1]} ${parts[0]}`;
    }
  }
  
  // Split camelCase (e.g., "KunwoongMoon" → "Kunwoong Moon")
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Title case
  name = name
    .split(/\s+/)
    .map(word => {
      if (word.length <= 1) return word.toUpperCase();
      // Handle ALL-CAPS names
      if (word === word.toUpperCase() && word.length > 2) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      // Capitalize first letter, preserve rest
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
  
  return name;
}

// Build the clean manifest
const manifest = raw.map(entry => ({
  slug: entry.slug,
  original: entry.original,
  name: cleanName(entry.original),
  file: `${entry.slug}.jpg`,
  pages: entry.pages || 1,
}));

// Sort by last name (heuristic: last word in name)
manifest.sort((a, b) => {
  const lastA = a.name.split(' ').pop().toLowerCase();
  const lastB = b.name.split(' ').pop().toLowerCase();
  return lastA.localeCompare(lastB);
});

writeFileSync(join(BASE, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`\n📋 Manifest built: ${manifest.length} students\n`);
console.log('Sample entries:');
manifest.slice(0, 10).forEach(e => {
  console.log(`  "${e.original}" → "${e.name}" (${e.file})`);
});
console.log(`  ... (${manifest.length - 10} more)\n`);

// Print any suspicious entries (very short names, single words)
const suspicious = manifest.filter(e => e.name.split(' ').length < 2 || e.name.length < 3);
if (suspicious.length > 0) {
  console.log('⚠️  Suspicious names (may need manual review):');
  suspicious.forEach(e => {
    console.log(`  "${e.original}" → "${e.name}"`);
  });
}
