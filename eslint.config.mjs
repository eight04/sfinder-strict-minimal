import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist", "dist-extension"]
  },
  js.configs.recommended,
  {
    "rules": {
      "dot-notation": 2,
      "max-statements-per-line": 2,
      "no-unused-vars": [2, {caughtErrors: "none"}],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
];
