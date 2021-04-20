const path = require('path');
const defaultConfig = require('./webpack.config.js');

const newConfig = defaultConfig;

newConfig.mode = 'development';

newConfig.devServer = {
    contentBase: path.resolve('.', 'renderer-dist'),
    headers: { 'Access-Control-Allow-Origin': '*' },
    // allowedHosts: [
    //     'localhost'
    // ],
    host: '0.0.0.0',
    port: 8000,
    publicPath: `http://localhost:${this.port}/dist`,
    inline: true
};

newConfig.devtool = 'inline-source-map';

module.exports = newConfig;