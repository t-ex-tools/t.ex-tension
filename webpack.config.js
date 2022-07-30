const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = (env) => {

  let moduleConfig = {
    output: {
      filename: "js/tex.module.js",
      path: path.resolve(__dirname, "dist/"),
      library: {
        name: "tex",
        type: "commonjs2"
      },
    }
  };
  
  let varConfig = {
    output: {
      filename: "js/tex.var.js",
      path: path.resolve(__dirname, "dist/"),
      library: {
        name: "tex",
        type: "var"
      },
    }
  };
  
  env.mv = (env.mv) ? env.mv : "2";
  
  let config = {
    entry: "./src/index.js",
    mode: "production",
    plugins: [
      new CopyPlugin({
        patterns: [
          { 
            from: "public" 
          }, {
            from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js",
            to: "js/browser-polyfill.min.js"
          }, {
            from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map",
            to: "js/browser-polyfill.min.js.map"
          }, {
            from: "./manifest.mv" + env.mv + ".json",
            to: "manifest.json"
          }
        ],
      }),
      new ESLintPlugin()
    ],
    resolve: {
      extensions: [".js"],
      modules: [
        path.join(__dirname, "node_modules")
      ],
    }
  };

  return [
    Object.assign({ ...config }, moduleConfig),
    Object.assign({ ...config }, varConfig),
  ];

};