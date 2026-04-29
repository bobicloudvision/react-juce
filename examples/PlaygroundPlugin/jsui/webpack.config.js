const path = require("path");
const webpack = require("webpack");

const nestedNodeModules = path.join(
  __dirname,
  "node_modules/react-juce/node_modules"
);
const reactJuceSrc = path.join(
  __dirname,
  "../../../packages/react-juce/src/index.tsx"
);
const reactJuceDownlevelDeps =
  /[\\/]packages[\\/]react-juce[\\/]node_modules[\\/]matrix-js[\\/]/;

module.exports = (env, argv) => {
  const production = argv.mode === "production";

  return {
    entry: "./src/index.js",
    output: {
      path: __dirname + "/build/js",
      filename: "main.js",
      sourceMapFilename: "[file].map",
      devtoolModuleFilenameTemplate: (info) =>
        `webpack:///${info.absoluteResourcePath.replace(/\\/g, "/")}`,
      environment: {
        arrowFunction: false,
        bigIntLiteral: false,
        const: false,
        destructuring: false,
        dynamicImport: false,
        forOf: false,
        module: false,
      },
    },
    target: ["web", "es5"],
    devtool: "source-map",
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
      conditionNames: ["require", "node"],
      alias: {
        "react-juce": reactJuceSrc,
        ...(production
          ? {
              react: path.join(
                __dirname,
                "node_modules/react/cjs/react.production.min.js"
              ),
              scheduler: path.join(
                nestedNodeModules,
                "scheduler/cjs/scheduler.production.min.js"
              ),
            }
          : {
              react: path.join(
                __dirname,
                "node_modules/react/cjs/react.development.js"
              ),
              scheduler: path.join(
                nestedNodeModules,
                "scheduler/cjs/scheduler.development.js"
              ),
            }),
      },
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          include: reactJuceDownlevelDeps,
          use: [
            {
              loader: "babel-loader",
              options: {
                babelrc: false,
                configFile: false,
                plugins: [
                  "@babel/plugin-transform-arrow-functions",
                  "@babel/plugin-transform-block-scoping",
                  "@babel/plugin-transform-object-rest-spread",
                ],
              },
            },
          ],
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: (p) => {
            if (reactJuceDownlevelDeps.test(p)) {
              return true;
            }
            if (/[\\/]packages[\\/]react-juce[\\/]src[\\/]/.test(p)) {
              return false;
            }
            return /node_modules/.test(p);
          },
          use: ["babel-loader"],
        },
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          use: ["svg-inline-loader"],
        },
        {
          test: /\.(png|jpeg|jpg|gif)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: true,
                esModule: false,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_DEBUG": JSON.stringify(process.env.NODE_DEBUG),
      }),
    ],
  };
};
