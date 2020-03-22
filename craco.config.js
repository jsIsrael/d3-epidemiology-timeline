const fastRefreshCracoPlugin = require("./fastRefreshCracoPlugin");
const BabelRcPlugin = require("@jackwilsdon/craco-use-babelrc");

module.exports = {
  plugins: [
    { plugin: BabelRcPlugin },
    {
      plugin: fastRefreshCracoPlugin,
      options: { preText: "Will log the webpack config:" },
    },
  ],
};
