/**
 * Metro Bundler Configuration
 *
 * Configures Metro for a pnpm monorepo with:
 * - Uniwind Pro (Tailwind CSS v4 for React Native) — outermost wrapper
 * - React Native Reanimated — animation support
 * - Monorepo resolution — watches workspace root, resolves from both local and root node_modules
 * - Custom theme registration — lavender, mint, sky theme variants
 *
 * @see https://docs.uniwind.dev/quickstart
 * @see https://docs.swmansion.com/react-native-reanimated/docs/guides/metro-config
 * @see https://docs.expo.dev/guides/monorepos
 *
 * @module metro.config
 */

const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Monorepo: watch workspace root, resolve from both local and root node_modules
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Asset extensions for fonts
config.resolver.assetExts = [...(config.resolver.assetExts ?? []), "ttf", "otf", "woff", "woff2"];

// Uniwind outermost, Reanimated middle, default innermost
module.exports = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
  cssEntryFile: "./src/styles/global.css",
  dtsFile: "./src/types/uniwind.d.ts",
  extraThemes: [
    "lavender-light",
    "lavender-dark",
    "mint-light",
    "mint-dark",
    "sky-light",
    "sky-dark",
  ],
});
