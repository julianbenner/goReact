var webpack = require('webpack');
var path = require('path');

module.exports = {
    module: {
        loaders: [
            {
                loaders: ['ts-loader'],

                // Only run `.js` and `.jsx` files through Babel
                test: /\.tsx?$/
            }, {
                test: /\.css?$/,
                loaders: ['style', 'raw'],
                include: __dirname
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],
    entry: [
        './src/main.tsx'
    ],
    output: {
        filename: 'build.js',
        path: './dist'
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".json", ".ts", ".tsx"]
    },
    devtool: 'source-map'
}