/**
 * Metro Bundler Configuration
 *
 * Configures Metro for a pnpm monorepo with:
 * - Uniwind (Tailwind CSS v4 for React Native) — outermost wrapper
 * - React Native Reanimated — animation support
 * - Monorepo resolution — watches workspace root, resolves from both local and root node_modules
 * - Custom theme registration — lavender, mint, sky theme variants
 *
 * ## Wrapper Order (critical)
 *
 * ```
 * withUniwindConfig(          ← outermost (required by Uniwind docs)
 *   wrapWithReanimatedMetroConfig(  ← middle
 *     defaultConfig             ← innermost
 *   )
 * )
 * ```
 *
 * @see https://docs.uniwind.dev/quickstart
 * @see https://docs.swmansion.com/react-native-reanimated/docs/guides/metro-config
 * @see https://docs.expo.dev/guides/monorepos
 *
 * @module metro.config
 */

const path = require("path");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const { getDefaultConfig } = require("expo/metro-config");

// ── Path Constants ──────────────────────────────────────────────────────────

/** Absolute path to the monorepo workspace root (two levels up from apps/native) */
const workspaceRoot = path.resolve(__dirname, "../..");

/** Absolute path to this project */
const projectRoot = __dirname;

// ── Base Configuration ──────────────────────────────────────────────────────

const defaultConfig = getDefaultConfig(projectRoot);

// ── Monorepo Resolution ─────────────────────────────────────────────────────

const config = {
  ...defaultConfig,

  /**
   * Watch the entire workspace so Metro detects changes in shared packages
   * (e.g., @repo/ui, @stackra/* packages).
   */
  watchFolders: [workspaceRoot],

  resolver: {
    ...defaultConfig.resolver,

    /**
     * Tell Metro where to find node_modules. Order matters:
     * 1. Local node_modules (project-specific symlinks from pnpm)
     * 2. Root node_modules (hoisted packages via shamefully-hoist)
     */
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules"),
    ],

    /**
     * Register additional asset extensions for fonts and vector graphics.
     * Metro needs these to bundle font files and SVGs as assets.
     */
    assetExts: [...(defaultConfig.resolver.assetExts ?? []), "ttf", "otf", "woff", "woff2"],
  },
};

// ── Export ───────────────────────────────────────────────────────────────────

/**
 * Final config with Uniwind as the outermost wrapper (required).
 * Reanimated wraps the base config for worklet transformation support.
 */
module.exports = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
  /** Path to the CSS entry file relative to project root */
  cssEntryFile: "./src/styles/global.css",

  /** Path where Uniwind generates TypeScript theme type declarations */
  dtsFile: "./src/types/uniwind.d.ts",

  /**
   * Custom theme variants registered with Uniwind.
   * Each theme must have a corresponding CSS file imported in global.css
   * and matching @variant blocks defining the theme's CSS variables.
   */
  extraThemes: [
    "lavender-light",
    "lavender-dark",
    "mint-light",
    "mint-dark",
    "sky-light",
    "sky-dark",
  ],
});
