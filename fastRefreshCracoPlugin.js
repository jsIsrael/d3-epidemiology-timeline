const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = {
  overrideWebpackConfig: ({
    webpackConfig,
    cracoConfig,
    pluginOptions,
    context: { env, paths },
  }) => {
    if (env === "development") {
      webpackConfig.plugins.push(
        new ReactRefreshWebpackPlugin({
          disableRefreshCheck: true,
        })
      );
    }

    // Always return the config object.
    return webpackConfig;
  },
};
