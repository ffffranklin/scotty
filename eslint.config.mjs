import js from "@eslint/js";
import ts from 'typescript-eslint';
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, ts },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node }
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "module" } }
]);
