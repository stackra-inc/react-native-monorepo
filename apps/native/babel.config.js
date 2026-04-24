/**
 * Babel Configuration — Native App
 *
 * Extends `babel-preset-expo` with `module-resolver` to support `@/`
 * path aliases across the monorepo. The `resolvePath` function detects
 * which package a file belongs to and resolves `@/` relative to that
 * package's `src/` directory.
 *
 * This allows both `apps/native/src/` and `packages/ui/src/` (and any
 * future workspace packages) to use `@/` without collision.
 *
 * @module babel.config
 */

const path = require("path");

/** Monorepo workspace root */
const workspaceRoot = path.resolve(__dirname, "../..");

/**
 * Map of workspace directories to their `@/` source roots.
 * Add new entries here when a workspace package needs `@/` support.
 */
const packageAliasRoots = {
  [path.resolve(__dirname, "src")]: path.resolve(__dirname, "src"),
  [path.resolve(workspaceRoot, "packages/ui/src")]: path.resolve(workspaceRoot, "packages/ui/src"),
};

/**
 * Custom path resolver that maps `@/` to the correct `src/` directory
 * based on which package the importing file belongs to.
 *
 * @param {string} sourcePath - The import specifier (e.g. `@/contexts/theme.context`)
 * @param {string} currentFile - Absolute path of the file containing the import
 * @returns {string|undefined} Resolved absolute path, or undefined to fall through
 */
function resolvePath(sourcePath, currentFile) {
  if (!sourcePath.startsWith("@/")) {
    return undefined;
  }

  const relativePart = sourcePath.slice(2);

  for (const [dir, srcRoot] of Object.entries(packageAliasRoots)) {
    if (currentFile.startsWith(dir + "/") || currentFile.startsWith(dir + path.sep)) {
      return path.resolve(srcRoot, relativePart);
    }
  }

  // Fallback: resolve relative to the app's src/
  return path.resolve(__dirname, "src", relativePart);
}

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".tsx", ".ts", ".js", ".json"],
          resolvePath,
        },
      ],
    ],
  };
};
