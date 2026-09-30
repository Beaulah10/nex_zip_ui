/**
 * figma-diff.config.cjs
 *
 * Single source of truth for which pages this Figma <-> React QA pipeline
 * compares. Both compare-with-figma.cjs and highlight-mismatches.cjs import
 * this file, so adding a new page only requires ONE edit instead of two.
 *
 * To add a new page:
 *   1. Add the new frame in Figma, run `node extract-figma-spec.cjs`
 *      (it writes one <frame-name>-spec.json per top-level Figma frame).
 *   2. Tag the corresponding React elements with matching data-design-id
 *      attributes.
 *   3. Add an entry below with the page's spec file, its name (used for
 *      report entries + screenshot filenames), and the route needed to
 *      navigate to it in the running app.
 *
 * `route` is app-specific: this app is a single-page app that switches on
 * window.location.hash (see src/App.jsx). '' means the app's default/home
 * route; any other string is appended as '#<route>'.
 */
module.exports = {
  PAGES: [
    {
      specFile: 'flight-search-spec.json',
      route: '',
      name: 'flight-search',
    },
    {
      specFile: 'flight-selection-spec.json',
      route: 'selection',
      name: 'flight-selection',
    },
  ],
};
