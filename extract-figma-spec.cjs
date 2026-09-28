/**
 * extract-figma-spec.js
 *
 * Walks figma-export.json and produces one spec JSON per top-level page frame
 * (flight-search-spec.json, flight-selection-spec.json).
 *
 * Each entry contains the same "id" that should be present in the React app's
 * data-design-id attribute, plus layout/style expectations pulled from Figma.
 *
 * Usage:
 *   node extract-figma-spec.js
 */
const fs = require('fs');
const path = require('path');

const FIGMA_JSON_PATH = path.join(__dirname, 'figma-export.json');
const SRC_DIR = path.join(__dirname, 'src');

const figma = JSON.parse(fs.readFileSync(FIGMA_JSON_PATH, 'utf-8'));

// The Figma tree contains a lot of nodes that never become a distinct React
// element: decorative icon groups, plain text leaves ("$1,850", "08:15 AM",
// "Book", ...), etc. Only nodes whose name actually shows up as a
// `data-design-id` in the React source are meaningful to compare, so we
// derive an allow-list straight from src/ instead of guessing/hand-listing
// ids (which drifts the moment a component changes).
function collectAllowedIds(dir) {
  const staticIds = new Set();
  const patterns = [];

  function walkSrc(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walkSrc(full);
      } else if (/\.[jt]sx?$/.test(entry.name)) {
        const content = fs.readFileSync(full, 'utf-8');

        // Static ids: data-design-id="foo-bar"
        for (const match of content.matchAll(/data-design-id=["']([^"'{}]+)["']/g)) {
          staticIds.add(match[1]);
        }

        // Template-literal ids: data-design-id={`nav-item-${item}`}
        // Turn every ${...} placeholder into a wildcard so the derived
        // pattern still matches whatever value ends up rendered.
        for (const match of content.matchAll(/data-design-id=\{`([^`]+)`\}/g)) {
          const template = match[1];
          const regexSource =
            '^' +
            template
              .split(/\$\{[^}]+\}/)
              .map((literal) => literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
              .join('.+') +
            '$';
          patterns.push(new RegExp(regexSource));
        }

        // Arrays of string literals (e.g. tripTypes, navItems) that get
        // spread into data-design-id={item} inside a .map(). We don't try
        // to prove the array feeds a data-design-id — allow-listing a few
        // extra harmless strings is a low-risk trade-off for staying in
        // sync with source automatically.
        if (/data-design-id=\{[a-zA-Z_$][\w$]*\}/.test(content)) {
          for (const match of content.matchAll(/\[\s*((?:['"][^'"]+['"]\s*,?\s*)+)\]/g)) {
            for (const strMatch of match[1].matchAll(/['"]([^'"]+)['"]/g)) {
              staticIds.add(strMatch[1]);
            }
          }
        }
      }
    }
  }

  walkSrc(dir);
  return { staticIds, patterns };
}

const { staticIds: ALLOWED_STATIC_IDS, patterns: ALLOWED_ID_PATTERNS } =
  collectAllowedIds(SRC_DIR);

function isTrackedId(id) {
  if (!id) return false;
  return (
    ALLOWED_STATIC_IDS.has(id) ||
    ALLOWED_ID_PATTERNS.some((re) => re.test(id))
  );
}

function fillsToColor(node) {
  const fills = node.fills || [];
  const solid = fills.find((f) => f.type === 'SOLID');
  if (!solid) return null;
  const { r, g, b } = solid.color;
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Figma reuses layer names for repeated components (e.g. "dest-card",
// "flight-card-0" is already unique, but some like "filter-group",
// "divider", "airport-selector", "date-selector", "meta-item",
// "recent-card" are duplicated siblings). We index duplicates the same
// way the React code does, so the ids line up 1:1.
const DUPLICATE_INDEX_PARENTS = new Set([
  'recent-items',
  'grid-destinations',
  'flight-results-center',
  'filters-sidebar',
  'airports-group',
  'dates-group',
  'search-meta',
]);
// NOTE: 'nav-links' was previously in this set, but Figma already names each
// nav item uniquely (nav-item-Book, nav-item-Manage, ...), matching React's
// `nav-item-${item}`. Indexing them again produced ids like
// "nav-item-Book-0", which never exist in the DOM.

function buildSpecForFrame(frame) {
  const spec = [];
  const siblingCounters = new Map();

  function nextIndexedId(baseName, parentName) {
    const key = `${parentName}::${baseName}`;
    const count = siblingCounters.get(key) || 0;
    siblingCounters.set(key, count + 1);
    return count;
  }

  function walk(node, parentName, groupIndex) {
    if (!node) return;

    let id = node.name;
    let nextGroupIndex = groupIndex;

    if (node.name && parentName && DUPLICATE_INDEX_PARENTS.has(parentName)) {
      const index = nextIndexedId(node.name, parentName);
      id = `${node.name}-${index}`;
      if (node.name === 'filter-group') {
        nextGroupIndex = index;
      }
    } else if (node.name === 'filter-checkbox' && groupIndex != null) {
      const index = nextIndexedId(`${groupIndex}::filter-checkbox`, parentName);
      id = `filter-checkbox-${groupIndex}-${index}`;
    } else if (node.name === 'divider' && groupIndex != null) {
      id = `divider-${groupIndex}`;
    }

    if (node.name && node.type !== 'VECTOR' && isTrackedId(id)) {
      const bb = node.absoluteBoundingBox || {};
      const style = node.style || {};

      spec.push({
        id,
        type: node.type,
        parent: parentName,
        width: bb.width != null ? Math.round(bb.width) : null,
        height: bb.height != null ? Math.round(bb.height) : null,
        cornerRadius: node.cornerRadius ?? null,
        fill: fillsToColor(node),
        text: node.type === 'TEXT' ? node.characters : null,
        fontFamily: style.fontFamily || null,
        fontSize: style.fontSize || null,
        fontWeight: style.fontWeight || null,
      });
    }

    (node.children || []).forEach((child) =>
      walk(child, node.name, nextGroupIndex),
    );
  }

  walk(frame, null);
  return spec;
}

function slugFrames(document) {
  const frames = [];
  for (const page of document.children || []) {
    for (const frame of page.children || []) {
      frames.push(frame);
    }
  }
  return frames;
}

const frames = slugFrames(figma.document);

if (frames.length === 0) {
  console.error('No top-level frames found under document > page > children.');
  process.exit(1);
}

for (const frame of frames) {
  const spec = buildSpecForFrame(frame);
  const outFile = path.join(__dirname, `${frame.name}-spec.json`);
  fs.writeFileSync(outFile, JSON.stringify(spec, null, 2));
  console.log(`Spec generated: ${outFile} (${spec.length} nodes)`);
}
