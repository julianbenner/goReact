var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');
var path = require('path');

module.exports = {
    module: {
        loaders: [
            {
                loaders: ['ts-loader'],
                test: /\.tsx?$/
            }, {
                test: /\.css?$/,
                loaders: ['style'],
                include: __dirname
            }
        ]
    },
    ts: {
        configFileName: './client/tsconfig.json'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new CopyWebpackPlugin([
            {
                'from': './client/assets',
                'to': '.'
            }
        ])
    ],
    entry: [
        './client/src/main'
    ],
    output: {
        filename: 'build.js',
        path: './build/client'
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".json", ".ts", ".tsx"]
    },
    devtool: 'source-map'
};