const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    target: 'electron-renderer',

    entry: path.resolve('.', 'src', 'renderer', 'main.tsx'),
    output: {
        filename: 'bundle.js',
        path: path.resolve('.', 'dist', 'renderer')
    },
    plugins: [
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new HtmlWebpackPlugin({
            title: 'My App'
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?/,
                loader: 'ts-loader'
            },
            {
                test: /\.css/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'postcss-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ]
    },

    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
}