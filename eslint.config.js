import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import typescript from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "**/*.css",
      "**/ui/*.tsx",
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
    ],
  },
  js.configs.recommended,
  ...typescript.configs.recommended,
  ...typescript.configs.stylistic,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
      },
    },
    rules: {
      // ── TypeScript 推荐规则覆盖 ──
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-unused-vars": "off",

      // ── TypeScript Stylistic 规则（Node 语言规范） ──
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/unified-signatures": "error",
      // 需要类型信息的规则（未配置 parserOptions.project 时需关闭）
      "@typescript-eslint/no-confusing-void-expression": "off",

      // ── 通用代码规范 ──
      camelcase: "off",
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 1 }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      "no-throw-literal": "error",
      "no-return-await": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "warn",
    },
  },
]);
