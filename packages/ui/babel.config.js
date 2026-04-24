/**
 * Babel Configuration — @repo/ui
 *
 * Configures the `module-resolver` plugin so that `@/` path aliases
 * from `tsconfig.json` are resolved at bundle time by Metro.
 *
 * Metro does not read `tsconfig.json` paths — this plugin bridges
 * the gap so `@/contexts/theme.context` resolves to `./src/contexts/theme.context`.
 *
 * @module babel.config
 */

const path = require("path");

module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    [
      "module-resolver",
      {
        extensions: [".tsx", ".ts", ".js", ".json"],
        alias: {
          "@": path.join(__dirname, "src"),
        },
      },
    ],
  ],
};
