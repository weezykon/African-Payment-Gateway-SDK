import globals from "globals";
import js from "@eslint/js";
import tseslintParser from "@typescript-eslint/parser";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier";

export default [
  { // Global ignores
    ignores: ["dist", "node_modules", "docs"],
  },
  { // Global settings
    languageOptions: {
      globals: globals.node,
    },
  },
  js.configs.recommended,
  ...tseslintPlugin.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {
      // Add any specific rules or overrides here
    },
  },
];