module.exports = {
  comments: false,
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "8.7"
        },
        loose: true,
        builtins: "entry"
      }
    ],
    "@babel/preset-flow"
  ],
  plugins: [
    [
      "module-resolver",
      {
        root: "src"
      }
    ]
  ]
};
