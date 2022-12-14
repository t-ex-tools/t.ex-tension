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
  env.mode = (env.mode) ? env.mode : "development";
  
  let config = {
    entry: "./src/index.js",
    mode: env.mode,
    devtool: 'inline-source-map',
    optimization: {
      minimize: (env.mode === "production")
    },
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

  let noBrowser = {
    entry: "./src/noBrowser.js",
    mode: env.mode,
    devtool: 'inline-source-map',
    optimization: {
      minimize: (env.mode === "production")
    },
    output: {
      filename: "js/tex.noBrowser.var.js",
      path: path.resolve(__dirname, "dist/"),
      library: {
        name: "tex",
        type: "var"
      },
    },
    plugins: [
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
    noBrowser
  ];

};