const webpack = require('webpack')
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
var defaultInclude = path.join(__dirname, '.', 'wallet-connect');
var BUILD_DIR = path.join(__dirname, 'build','wallet-connect');
module.exports = {
    module: {
        rules: [
            {
                test: /\.jsx?|.tsx?$/,
                use: [{ loader: 'babel-loader' }],
                include: defaultInclude

            },
            { test: /\.(svg)$/, use: 'file-loader'},
            {
                test: /\.(jpe?g|png|gif|bmp|mp3|mp4|ogg|wav)$/,
                use: 'file-loader'
            },
            {
                test: /\.(woff|woff2|eot|ttf)$/,
                use: {
                    loader: 'file-loader',
                },
            },
            {
                test: /\.(css)$/,
                use: [
                    { loader: 'css-modules-typescript-loader' },
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    ]
            }
            ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Skeleton',
            inject: 'body',
            template: path.join(__dirname, "wallet-connect", "index.html"),
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
    entry: "./wallet-connect/index.tsx",
    output: {
        filename: 'bundle.js',
        path: BUILD_DIR,
        publicPath: '/wallet-connect',
        pathinfo: true
    },
    mode: process.env.NODE_ENV || "development",
    resolve: {
        extensions: [".tsx", ".ts", ".js",".jsx",".scss"],
        fallback: {
            "stream": require.resolve("stream-browserify"),
            "os": false,
            "https":false,
            "http":false,
            "crypto":false,
            "buffer":false,
            "process":false,
            "assert":false
        },
        alias: {
            process: "process/browser"
        }
    },
    devServer: {
        contentBase: path.join(__dirname, "build"),
        stats: {
            colors: true,
            chunks: false,
            children: false
        },
        port:3001,
        hot: true,
        historyApiFallback:true,
        after: function () {

        }
    }
};
