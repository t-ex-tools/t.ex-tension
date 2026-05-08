import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "public/js/lz-string.min.js",
      "public/seed/**",
    ],
  },
  {
    files: ["src/**/*.js", "public/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
  },
  {
    files: ["webpack.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
  },
];
