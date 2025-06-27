import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn", // Use "warn" instead of "error" to avoid breaking builds
        {
          argsIgnorePattern: "^_", // Ignore unused function parameters starting with _
          varsIgnorePattern: "^_", // Ignore unused variables starting with _
          caughtErrorsIgnorePattern: "^_", // Ignore unused caught errors starting with _
        },
      ],
    },
  },
];

export default eslintConfig;