---
name: figma-codebase-comparison-prompt
description: Runs the Figma codebase comparison agent using explicitly supplied artifact paths.
agent: figma-codebase-comparison
argument-hint: Provide exact Figma artifact paths, source path, route, and optional browser screenshot.
---

Run the `figma-codebase-comparison` agent using the following inputs.

## Inputs

```yaml
figma_inventory: docs\figma-inventory\flightsearch-ui-inventory.json
figma_tokens: docs\figma-inventory\flightsearch-design-tokens.json
figma_screenshot: docs\figma-inventory\screenshots\flightsearch.png
source_path: uicomparison\nexuz-ui\apps\flightsearch
output_name: flightsearch-screen-review-report
scope: single screen