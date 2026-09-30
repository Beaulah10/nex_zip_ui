/**
 * compare-with-figma.cjs
 *
 * Loads the running React app (Vite dev server) and, for each Figma spec
 * entry, looks up the matching [data-design-id] element and compares its
 * bounding box against the Figma-exported width/height.
 *
 * Usage:
 *   1. npm run dev            (in another terminal, keep it running)
 *   2. node compare-with-figma.cjs
 *
 * Output:
 *   report.json
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const nspell = require('nspell');

const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const SIZE_TOLERANCE_PX = 2; // allow a couple px of rounding drift

// Words that are correct in this app's domain but aren't in a general
// English dictionary (brand names, city names, airport/currency codes),
// so the spell checker shouldn't flag them.
const SPELL_ALLOWLIST = new Set([
  'aeroflow', 'jfk', 'lhr', 'cdg', 'mia', 'hnd', 'lax', 'sfo',
  'usd', 'reykjavik', "int'l", 'heathrow', 'wi-fi',
]);

const spell = nspell(
  fs.readFileSync(path.join(__dirname, 'node_modules/dictionary-en/index.aff')),
  fs.readFileSync(path.join(__dirname, 'node_modules/dictionary-en/index.dic')),
);

function findMisspelledWords(text) {
  if (!text) return [];
  const words = text.match(/[A-Za-z']+/g) || [];
  const misspelled = [];

  for (const word of words) {
    if (word.length < 3) continue; // skip short words/initials
    if (word === word.toUpperCase()) continue; // skip acronyms e.g. "USD"
    if (SPELL_ALLOWLIST.has(word.toLowerCase())) continue;
    if (!spell.correct(word)) misspelled.push(word);
  }

  return misspelled;
}

const PAGES = require('./figma-diff.config.cjs').PAGES;

// Warn (don't fail) if a *-spec.json exists in the folder but isn't wired
// up in figma-diff.config.cjs yet, so new Figma pages are never silently
// skipped.
function warnAboutUndiscoveredSpecs() {
  const knownSpecFiles = new Set(PAGES.map((p) => p.specFile));
  const specFiles = fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith('-spec.json'));

  for (const file of specFiles) {
    if (!knownSpecFiles.has(file)) {
      console.warn(
        `⚠ Found ${file} but it isn't registered in figma-diff.config.cjs — add it to the PAGES list so it gets compared.`,
      );
    }
  }
}

function rgbStringToHex(rgbString) {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(rgbString || '');
  if (!match) return null;
  const toHex = (v) => Number(v).toString(16).padStart(2, '0');
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}

function loadSpec(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Spec file not found, skipping: ${fileName}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Delete any existing file at this path first. Some image writers refuse to
// overwrite a file that's still held open by another process (e.g. an image
// viewer, antivirus scan, or file indexer on Windows) with a cryptic
// "unable to open for write" error; removing it first avoids that.
async function safeUnlink(filePath) {
  try {
    fs.unlinkSync(path.join(__dirname, filePath));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function comparePage(browser, pageConfig) {
  const spec = loadSpec(pageConfig.specFile);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
  const occurrenceByNode = new Map();
  // App.jsx routes purely off window.location.hash (e.g. "#selection"), not
  // real paths, so navigating to "/selection" 404s and never renders the
  // page. Navigate with the hash instead, matching App.jsx's pageFromHash().
  const url = pageConfig.route
    ? `${BASE_URL}/#${pageConfig.route}`
    : BASE_URL;
  await page.goto(url, { waitUntil: 'networkidle' });

  const results = [];

  for (const element of spec) {
    const matches = page.locator(`[data-design-id="${element.id}"]`);
    const count = await matches.count();
    const occurrenceKey = `${element.id}:${element.type}`;
    const occurrence = occurrenceByNode.get(occurrenceKey) || 0;
    occurrenceByNode.set(occurrenceKey, occurrence + 1);

    if (count === 0 || occurrence >= count) {
      results.push({
        page: pageConfig.name,
        id: element.id,
        status: 'missing',
      });
      continue;
    }

    const locator = matches.nth(occurrence);

    const measurement = await locator.evaluate((el, nodeType) => {
      const css = window.getComputedStyle(el);
      let rect = el.getBoundingClientRect();

      if (nodeType === 'TEXT') {
        const textNode = [...el.childNodes].find(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
        );

        if (textNode) {
          const range = document.createRange();
          range.selectNodeContents(textNode);
          rect = range.getBoundingClientRect();
        }
      }

      return {
        box: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        styles: {
          fontSize: css.fontSize,
          fontWeight: css.fontWeight,
          color: css.color,
          backgroundColor: css.backgroundColor,
          borderRadius: css.borderRadius,
          backgroundImage: css.backgroundImage,
          text: el.innerText?.trim(),
          // Only the text directly inside this element (not text belonging
          // to nested children), so spell-checking a FRAME doesn't re-flag
          // the same words on every ancestor up the tree.
          ownText: [...el.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent)
            .join(' ')
            .trim(),
        },
      };
    }, element.type);
    const { box, styles } = measurement;

    if (!box.width && !box.height) {
      results.push({
        page: pageConfig.name,
        id: element.id,
        status: 'not-visible',
      });
      continue;
    }

    const widthDiff =
      element.width != null ? Math.abs(box.width - element.width) : null;
    const heightDiff =
      element.height != null ? Math.abs(box.height - element.height) : null;

    const widthMismatch = widthDiff != null && widthDiff > SIZE_TOLERANCE_PX;
    const heightMismatch = heightDiff != null && heightDiff > SIZE_TOLERANCE_PX;

    // Style checks against the Figma-exported values, using the computed
    // styles gathered above (previously computed but never compared).
    const styleIssues = [];

    const actualFontSize = parseFloat(styles.fontSize);
    if (
      element.fontSize != null &&
      !Number.isNaN(actualFontSize) &&
      Math.abs(actualFontSize - element.fontSize) > 1
    ) {
      styleIssues.push('fontSize');
    }

    const actualFontWeight = parseInt(styles.fontWeight, 10);
    if (
      element.fontWeight != null &&
      !Number.isNaN(actualFontWeight) &&
      actualFontWeight !== element.fontWeight
    ) {
      styleIssues.push('fontWeight');
    }

    const actualFill = rgbStringToHex(
      element.type === 'TEXT' ? styles.color : styles.backgroundColor,
    );
    if (
      element.fill &&
      actualFill &&
      actualFill.toLowerCase() !== element.fill.toLowerCase()
    ) {
      styleIssues.push('fill');
    }

    if (
      element.text != null &&
      styles.text != null &&
      styles.text !== element.text.trim()
    ) {
      styleIssues.push('text');
    }

    // Image-content check: Figma RECTANGLE nodes represent photo fills.
    // CSS gradients also populate background-image, so only a url(...)
    // counts as a real photo — anything else (none, or a gradient-only
    // background) means the photo is still a placeholder.
    const imageMissing =
      element.type === 'RECTANGLE' &&
      !/url\(/i.test(styles.backgroundImage || '');

    // Spell-check only the text rendered directly by this element (not
    // aggregated from children) to avoid duplicate flags on parent frames.
    const misspelledWords = findMisspelledWords(styles.ownText);
    const spellingMismatch = misspelledWords.length > 0;

    const sizeMismatch = widthMismatch || heightMismatch;
    const styleMismatch = styleIssues.length > 0;

    const problemCount = [
      sizeMismatch,
      styleMismatch,
      imageMissing,
      spellingMismatch,
    ].filter(Boolean).length;

    let status = 'found';
    if (problemCount > 1) status = 'mismatch';
    else if (sizeMismatch) status = 'size-mismatch';
    else if (styleMismatch) status = 'style-mismatch';
    else if (imageMissing) status = 'image-missing';
    else if (spellingMismatch) status = 'spelling-issue';

    results.push({
      page: pageConfig.name,
      id: element.id,
      status,
      expectedWidth: element.width,
      actualWidth: Math.round(box.width),
      expectedHeight: element.height,
      actualHeight: Math.round(box.height),
      widthDiff: widthDiff != null ? Math.round(widthDiff) : null,
      heightDiff: heightDiff != null ? Math.round(heightDiff) : null,
      styleIssues: styleMismatch ? styleIssues : undefined,
      box:box,
      imageMissing: imageMissing || undefined,
      misspelledWords: spellingMismatch ? misspelledWords : undefined,
      expectedStyle: styleMismatch
        ? {
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
          fill: element.fill,
          text: element.text,
        }
        : undefined,
      actualStyle: styleMismatch
        ? {
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          fill: actualFill,
          text: styles.text,
        }
        : undefined,
    });
  }

  await safeUnlink(`${pageConfig.name}-react.png`);
  await page.screenshot({
    path: `${pageConfig.name}-react.png`,
    fullPage: true
  });

  await page.close();
  return results;
}

async function main() {
  warnAboutUndiscoveredSpecs();

  const browser = await chromium.launch();
  const allResults = [];

  for (const pageConfig of PAGES) {
    console.log(`Comparing ${pageConfig.name} (${pageConfig.route}) ...`);
    const results = await comparePage(browser, pageConfig);
    allResults.push(...results);
  }

  await browser.close();

  const summary = {
    total: allResults.length,
    found: allResults.filter((r) => r.status === 'found').length,
    missing: allResults.filter((r) => r.status === 'missing').length,
    sizeMismatch: allResults.filter((r) => r.status === 'size-mismatch').length,
    styleMismatch: allResults.filter((r) => r.status === 'style-mismatch').length,
    imageMissing: allResults.filter((r) => r.status === 'image-missing').length,
    spellingIssue: allResults.filter((r) => r.status === 'spelling-issue').length,
    mismatch: allResults.filter((r) => r.status === 'mismatch').length,
    duplicate: allResults.filter((r) => r.status === 'duplicate').length,
    notVisible: allResults.filter((r) => r.status === 'not-visible').length,
  };

  const report = { summary, results: allResults };

  fs.writeFileSync(
    path.join(__dirname, 'report.json'),
    JSON.stringify(report, null, 2),
  );

  console.log('\nSummary:', summary);
  console.log('Report written to report.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
