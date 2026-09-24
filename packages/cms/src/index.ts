// Client-safe exports only
export { components as prismicSliceComponents } from "./slices";

// Note: prismic/* exports are not re-exported to avoid bundling server-only code (node:fs) on the client.
// Direct imports from "./prismic/*" are only for server-only contexts.
