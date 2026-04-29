module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        targets: { ie: "11" },
      },
    ],
    "@babel/preset-react",
    "@babel/preset-typescript",
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    [
      "@babel/plugin-transform-runtime",
      {
        absoluteRuntime: false,
        corejs: 3,
        version: "7.11.2",
      },
    ],
  ],
};
