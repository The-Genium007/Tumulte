/**
 * Nuxt UI Color Configuration
 *
 * This maps semantic color names to the color palettes defined in main.css @theme.
 * Change these values to use different color palettes from your design tokens.
 *
 * Available palettes (defined in assets/css/main.css):
 * - brand: Primary brand color (purple by default)
 * - accent: Secondary accent color (pink by default)
 * - neutral: Gray scale for text/backgrounds
 * - success: Green for success states
 * - error: Red for error states
 * - warning: Amber for warning states
 * - info: Blue for info states
 */
export default defineAppConfig({
  ui: {
    colors: {
      // Main colors - change these to remap the entire UI
      primary: "brand", // Uses --color-brand-* from main.css
      secondary: "accent", // Uses --color-accent-* from main.css

      // Semantic colors for states
      success: "success",
      info: "info",
      warning: "warning",
      error: "error",

      // Neutral color for text, borders, backgrounds
      neutral: "neutral",
    },
  },
});
