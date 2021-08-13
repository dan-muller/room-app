module.exports = {
  mode: "production", // production or development
  target: "node",
  externals: [/^aws-sdk(\/.+)?$/], // important!!!
  optimization: { minimize: false }, // if needed
  // for TypeScript
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "your/path/to/tsconfig.json", // if needed
            // colors: true,
            // logInfoToStdOut: true,
            // logLevel: 'INFO',
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
};
