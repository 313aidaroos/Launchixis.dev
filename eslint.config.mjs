import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";
export default [
  { ignores: [".next/**", "node_modules/**", "archive/**"] },
  { files: ["**/*.{js,jsx,mjs,ts,tsx}"], languageOptions: { globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { react, "react-hooks": hooks }, settings: { react: { version: "detect" } },
    rules: { ...js.configs.recommended.rules, ...react.configs.recommended.rules, "react/react-in-jsx-scope": "off", "react/prop-types": "off", "react/no-unescaped-entities": "off", "no-unused-vars": "warn", "no-empty": ["error", { "allowEmptyCatch": true }], "react/no-unknown-property": ["error", { "ignore": ["jsx", "global"] }], "react-hooks/rules-of-hooks": "error", "react-hooks/exhaustive-deps": "warn" } },
  { files: ["lib/apixis-redirect.ts", "lib/apixis-world.ts"], rules: { "no-control-regex": "off" } },
  { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tsParser }, rules: { "no-undef": "off", "no-unused-vars": "off" } },
];
