const fastRefreshCracoPlugin = require("./fastRefreshCracoPlugin");
const libraryCracoPlugin = require("./libraryCracoPlugin");
const BabelRcPlugin = require("@jackwilsdon/craco-use-babelrc");

module.exports = {
  plugins: [
    { plugin: libraryCracoPlugin },
    { plugin: BabelRcPlugin },
    {
      plugin: fastRefreshCracoPlugin,
      options: { preText: "Will log the webpack config:" },
    },
  ],
};
