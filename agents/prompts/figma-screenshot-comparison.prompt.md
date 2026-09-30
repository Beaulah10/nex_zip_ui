---
name: figma-screenshot-comparison
description: Compares a developed UI screenshot against the Figma screenshot, UI inventory, and design tokens, then generates readable visual-review reports.
agent: figma-screenshot-comparison
argument-hint: Provide exact paths for the Figma artifacts and developed screenshot.
---

# Compare Figma and Developed Screenshots

Run the `figma-screenshot-comparison` agent using the following inputs.

## Inputs

```yaml
figma_inventory: docs\figma-inventory\non-air-ancillary-page-ui-inventory.json
figma_tokens: docs\figma-inventory\non-air-ancillary-page-design-tokens.json
figma_screenshot: docs\figma-inventory\screenshots\non-air-ancillary-page.png
developed_screenshot: docs\ui-screenshots\ancillarypagedeveloperscrrenshot.png
output_name: non-ancillary-page-ui-reviews-screenshot-comparison
viewport: 
screen_name: non ancillary page

## Comparison requirements

In addition to the structured visual review, perform a deterministic pixel-by-pixel comparison when the two screenshots have matching dimensions and comparable viewport, crop, scroll, and UI state. Compare corresponding pixels without resizing or interpolation and report the method, channel and alpha handling, tolerance, changed-pixel count, unchanged-pixel count, changed-pixel percentage, maximum channel delta, and difference bounds in both Markdown and JSON.

If the screenshots are not dimensionally or semantically comparable, set the pixel comparison status to `NOT COMPARABLE`, do not invent pixel metrics, and document the reason. Keep raw pixel differences separate from semantic UI findings; do not treat anti-aliasing or compression differences alone as semantic defects.
