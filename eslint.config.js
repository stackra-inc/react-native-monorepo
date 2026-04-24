/**
 * eslint.config.js — react-native-monorepo
 *
 * Root ESLint flat config. Individual workspaces can extend or override
 * by adding their own eslint.config.js.
 *
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 * @module eslint.config
 */

import js from "@eslint/js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".next/",
      ".turbo/",
      "coverage/",
      "ios/",
      "android/",
      "Pods/",
      ".expo/",
    ],
  },
];
