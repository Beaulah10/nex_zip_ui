---
name: "Figma UI Inventory and Codebase Comparison prompt"
description: "Extract a structured UI inventory and design tokens from a Figma frame, then compare it line-by-line against the codebase."
argument-hint: "Provide a complete Figma URL, the codebase path to compare against, and optional output name."
agent: "figma-ui-inventory"
---

## Session inputs

Fill in these values once before running. Both steps below reuse them — edit only this block for a new run.

```yaml
figma_url: https://www.figma.com/design/bKbmnibIMXEvV41PTvlQQR/IBE?node-id=16497-101924&m=dev
scope: entire file
output_name: extras-page
source_path: apps/ibe-app/components/extras/extras.tsx
browser_screenshot: # optional — path to an implemented/browser screenshot, leave blank if none
```

- `figma_url`: Required. Full Figma file or frame URL.
- `scope`: Required. `selected-frame` or `entire-file` for Step 1; the equivalent of `single-screen` / `page` / `entire-application` for Step 2.
- `output_name`: Required. Used as the filename prefix for every generated file in both steps.
- `source_path`: Required. Must point to a real, existing codebase directory in this workspace (for example `apps/top-app` or `apps/ibe-app`) — never a placeholder path.
- `browser_screenshot`: Optional. Only set this if the user has supplied an implemented/browser screenshot to compare against.

## Step 1: Extract the Figma UI inventory

Run the `figma-ui-inventory` agent using `figma_url`, `scope`, and `output_name` from the session inputs above.

Use the Figma MCP tools to inspect the selected frame. Follow this sequence:

1. Call `get_metadata` first to understand the hierarchy.
2. Retrieve detailed design context for the selected screen.
3. Retrieve variable definitions and Code Connect mappings when available.
4. Retrieve a screenshot for visual validation.

Generate these files:

1. `docs/figma-inventory/{output_name}-ui-inventory.json`
2. `docs/figma-inventory/{output_name}-ui-inventory.md`
3. `docs/figma-inventory/{output_name}-design-tokens.json`
4. `docs/figma-inventory/screenshots/{output_name}.png`

Preserve the original Figma URL, names, and node IDs. Do not infer interactions, sticky behavior, validations, or responsive behavior unless they are explicitly represented in the MCP output. Put ambiguous items under `reviewRequired` and unavailable information under `notAvailable`.

## Step 2: Switch to the codebase comparison agent

After Step 1 completes and all inventory files are written, immediately continue by invoking the `figma-codebase-comparison` agent (as a subagent, in the same run — do not wait for a separate user request) using the same session inputs:

```text
figma_inventory: docs/figma-inventory/{output_name}-ui-inventory.json
figma_tokens: docs/figma-inventory/{output_name}-design-tokens.json
figma_screenshot: docs/figma-inventory/screenshots/{output_name}.png
source_path: {source_path from session inputs}
browser_screenshot: {browser_screenshot from session inputs, omit if blank}
output_name: {output_name from session inputs}
scope: single-screen
```

If the user provides a different codebase path or scope in their request than the session inputs above, use what the user says instead.

Require the comparison agent to apply its full-rigor methodology, not an abbreviated pass:

- Perform the Stage 4a full line-by-line source sweep on the screen's entry-point file and every component/style file it depends on — every line must be classified `VISUAL`, `SKIP`, or `NOT VERIFIABLE`, with no gaps, and long files swept in tracked windows.
- Perform the Stage 6a exhaustive attribute-level verification on every element — check every class/attribute (size, every color/state variant, every responsive breakpoint's spacing, border, radius, typography), not just the first deviation found on that element.
- Include the Stage 15 line-coverage validation summary in the mismatches report and in the final response.

Generate only:

1. `docs/ui-review/{output_name}-matches.md`
2. `docs/ui-review/{output_name}-mismatches.md`

Do not modify application source code at any point in either step. Report the combined result at the end: inventory files produced, comparison findings by status/severity, and the line-coverage validation summary.

