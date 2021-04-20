const baseConfig = require('./webpack.config.js');

const newConfig = baseConfig;

newConfig.mode = 'development';
newConfig.devtool = 'inline-source-map';
newConfig.watch = true;
newConfig.watchOptions = {
    ignored: /node_modules/,
}

module.exports = newConfig;