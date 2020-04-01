require("@babel/polyfill");
require("dotenv").config();
const path = require("path");
const TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const withCSS = require("@zeit/next-css");
const withOffline = require("next-offline");

module.exports = withOffline(
    withCSS({
        cssModules: false,
        distDir: "../build",
        workboxOpts: {
            swDest: path.join(__dirname, "src/public/service-worker.js"),
        },
        env: {
            API_URL: process.env.API_URL,
        },
        webpack: (config) => {
            config.resolve.alias = {
                ...config.resolve.alias,
                "@/": path.resolve(__dirname, "src"),
            };

            config.resolve.plugins = [
                ...(config.resolve.plugins || []),
                new TsConfigPathsPlugin({ configFile: "./src/tsconfig.json" }),
            ];
            return config;
        },
    })
);

// https://github.com/ryohlan/next-ts-template/blob/master/next.config.js
