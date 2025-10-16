import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  { // Global ignores
    ignores: ["dist", "node_modules", "docs"],
  },
  { // Global settings
    languageOptions: {
      globals: globals.node,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
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
);