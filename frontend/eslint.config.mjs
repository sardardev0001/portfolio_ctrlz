import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import i18n from "./eslint-rules/i18n.mjs";
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { rules: { "react-hooks/set-state-in-effect": "off" } },
  {
    files: ["src/**/*.tsx"],
    ignores: ["**/*.test.tsx"],
    plugins: { ctrlz: { rules: { "localized-jsx": i18n } } },
    rules: { "ctrlz/localized-jsx": "error" },
  },
  globalIgnores([
    ".next/**",
    ".next-*/**",
    "**/.next*/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
