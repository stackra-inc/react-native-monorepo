// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Monorepo: watch all files and resolve packages from both local and root node_modules
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Uniwind must be the outermost wrapper
module.exports = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
  cssEntryFile: "./global.css",
  dtsFile: "./uniwind.d.ts",
});
