const path = require('path')

module.exports = {
    mode: 'development',
    target: 'electron-main',
    devtool: 'inline-source-map',
    entry: path.resolve('.', 'src', 'main', 'main.ts'),
    output: {
        filename: 'main.js',
        path: path.resolve('.', 'dist', 'main')
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                loader: 'ts-loader'
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
}