/**
 * highlight-mismatches.cjs
 *
 * Draws colored boxes/labels directly on top of the React screenshot for
 * every element in report.json that isn't a clean "found" match, making
 * mismatches easy to see at a glance instead of relying on a noisy
 * pixel-diff image.
 *
 * Usage:
 *   node compare-with-figma.cjs   (regenerates report.json + *-react.png)
 *   node highlight-mismatches.cjs
 *
 * Output:
 *   flight-search-annotated.png
 *   flight-selection-annotated.png
 */
const fs = require("fs");
const sharp = require("sharp");

const { PAGES: CONFIG_PAGES } = require("./figma-diff.config.cjs");

// highlight-mismatches only needs the screenshot filename per page, derived
// from the shared page name so this list never drifts from compare-with-figma.
const PAGES = CONFIG_PAGES.map((p) => ({
  name: p.name,
  screenshot: `${p.name}-react.png`,
}));

const COLORS = {
  missing: "#ff0000", // element not found in the DOM at all
  "not-visible": "#ff00ff", // present but has zero width/height
  "size-mismatch": "#ff9900", // wrong dimensions
  "style-mismatch": "#3b82f6", // wrong font/color/text
  "image-missing": "#a855f7", // placeholder gradient/color instead of a real photo
  "spelling-issue": "#eab308", // misspelled rendered text
  mismatch: "#ff0000", // multiple problems at once
};

function escapeXml(str) {
  return String(str).replace(/[<>&"']/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
  }[c]));
}

function describeIssue(item) {
  const parts = [item.status];
  if (item.imageMissing) parts.push('no real photo, placeholder gradient/color');
  if (item.misspelledWords && item.misspelledWords.length > 0) {
    parts.push(`spelling: ${item.misspelledWords.join(', ')}`);
  }
  if (item.styleIssues && item.styleIssues.length > 0) {
    parts.push(`style: ${item.styleIssues.join(', ')}`);
  }
  if (item.widthDiff || item.heightDiff) {
    parts.push(`size off by ${item.widthDiff || 0}x${item.heightDiff || 0}px`);
  }
  return parts.join(' | ');
}

async function annotatePage(pageConfig, allResults) {
  if (!fs.existsSync(pageConfig.screenshot)) {
    console.warn(`Skipping ${pageConfig.name}: ${pageConfig.screenshot} not found`);
    return;
  }

  const image = sharp(pageConfig.screenshot);
  const { width, height } = await image.metadata();

  const issues = allResults.filter(
    (r) => r.page === pageConfig.name && r.status !== "found"
  );

  if (issues.length === 0) {
    console.log(`${pageConfig.name}: no mismatches to highlight.`);
    return;
  }

  const withBox = issues.filter((r) => r.box);
  const withoutBox = issues.filter((r) => !r.box); // e.g. "missing" elements

  let overlayEls = "";

  for (const item of withBox) {
    const { x, y, width: w, height: h } = item.box;
    const color = COLORS[item.status] || "#ff0000";
    const label = `${item.id}: ${describeIssue(item)}`;
    const labelWidth = Math.min(Math.max(w, 60), Math.max(label.length * 6.2 + 8, 60));

    overlayEls += `
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            fill="none" stroke="${color}" stroke-width="3" />
      <rect x="${x}" y="${Math.max(0, y - 18)}" width="${labelWidth}" height="16"
            fill="${color}" opacity="0.9" />
      <text x="${x + 4}" y="${Math.max(12, y - 6)}" font-size="11" font-family="sans-serif" fill="#ffffff">
        ${escapeXml(label)}
      </text>
    `;
  }

  // Elements that don't exist in the DOM at all (no box to draw), listed in
  // a legend box in the corner instead of on top of the screenshot.
  if (withoutBox.length > 0) {
    const legendHeight = 20 + withoutBox.length * 16;
    overlayEls += `
      <rect x="10" y="10" width="320" height="${legendHeight}" fill="#111827" opacity="0.85" />
      <text x="18" y="26" font-size="13" font-family="sans-serif" fill="#ffffff" font-weight="bold">
        Missing / not rendered elements:
      </text>
    `;
    withoutBox.forEach((item, i) => {
      overlayEls += `
        <text x="18" y="${44 + i * 16}" font-size="12" font-family="sans-serif" fill="#f87171">
          - ${escapeXml(item.id)} (${escapeXml(item.status)})
        </text>
      `;
    });
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${overlayEls}</svg>`;

  const outFile = `${pageConfig.name}-annotated.png`;

  // Remove any existing annotated PNG first — sharp can fail to overwrite a
  // file that's still open in another process (e.g. an image viewer) with a
  // cryptic "unable to open for write" error.
  try {
    fs.unlinkSync(outFile);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  await sharp(pageConfig.screenshot)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile(outFile);

  console.log(
    `${pageConfig.name}: ${issues.length} issue(s) highlighted -> ${outFile}`
  );
}

async function main() {
  if (!fs.existsSync("report.json")) {
    console.error("report.json not found. Run: node compare-with-figma.cjs");
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync("report.json", "utf-8"));

  for (const pageConfig of PAGES) {
    await annotatePage(pageConfig, report.results);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
