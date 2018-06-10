module.exports = {
  comments: false,
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "10"
        },
        loose: true,
        builtins: "entry"
      }
    ],
    "@babel/preset-flow"
  ],
  plugins: [
    "@babel/plugin-proposal-object-rest-spread",
    [
      "module-resolver",
      {
        root: "src"
      }
    ]
  ]
};
