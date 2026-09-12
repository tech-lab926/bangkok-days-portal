import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Ignore auto-generated and build files
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "app/generated/**",
  ]),
  {
    rules: {
      // Allow any types — many admin pages use dynamic API responses
      "@typescript-eslint/no-explicit-any": "off",
      // Warn on unused vars instead of error (helps during development)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Warn on exhaustive deps instead of error (common in pages that intentionally omit deps)
      "react-hooks/exhaustive-deps": "warn",
      // Allow <img> without next/image in admin pages
      "@next/next/no-img-element": "warn",
    }
  }
]);

export default eslintConfig;
