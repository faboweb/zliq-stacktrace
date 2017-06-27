var path = require('path');

module.exports = {
    devtool: '#cheap-eval-inline-source-map',
    entry: './demo/demo_app.jsx',
    output: {
        path: path.resolve(__dirname, '../demo'),
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.(css|scss)$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader" // compiles Sass to CSS
            }]
        },{
            test: /\.(js|jsx)$/,
            use: [{
                loader: 'babel-loader?sourceMap=inline'
            }]
        },{
            test: /\.(tff|woff|woff2)$/,
            use: [{
                loader: 'null-loader'
            }]
        }]
    },
    devServer: {
        contentBase: path.join(__dirname, "../demo")
    }
}