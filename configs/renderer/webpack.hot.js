const path = require('path');
const defaultConfig = require('./webpack.config.js');

const newConfig = defaultConfig;

newConfig.mode = 'development';

newConfig.devServer = {
    contentBase: path.resolve('.', 'dist','renderer'),
};

newConfig.devtool = 'inline-source-map';

module.exports = newConfig;