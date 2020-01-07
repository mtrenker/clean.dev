module.exports = {
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/env",
      {
        targets: {
          node: "current"
        },
        useBuiltIns: "usage",
        corejs: 3
      },
    ],
  ],
  plugins: ["@babel/plugin-proposal-optional-chaining"]
};
