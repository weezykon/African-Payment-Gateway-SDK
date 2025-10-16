import globals from "globals";
import pluginJs from "@eslint/js";
import tseslintParser from "@typescript-eslint/parser";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    languageOptions: {
      globals: globals.node,
      parser: tseslintParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
  },
  pluginJs.configs.recommended,
  tseslintPlugin.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.ts"],
    rules: {
      // Add any specific rules or overrides here
    },
  },
];