import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // ESLint 10 removed context.getFilename(); eslint-plugin-react 7.37.5 still
  // calls it when settings.react.version is "detect". Pin the version so detect
  // is skipped until the plugin ships ESLint 10 support.
  {
    settings: {
      react: {
        version: "19.2.8",
      },
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
