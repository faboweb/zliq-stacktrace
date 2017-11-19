var path = require('path');

module.exports = {
    devtool: '#source-map',
    entry: './src/index.js',
    output: {
        library: 'zliq-router',
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: [{
                loader: 'babel-loader'
            }]
        }]
    }
}