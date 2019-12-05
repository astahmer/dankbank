require("@babel/polyfill");
const path = require("path");
const TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const withCSS = require("@zeit/next-css");

module.exports = withCSS({
    cssModules: false,
    distDir: "../build",
    publicRuntimeConfig: {
        API_URL: process.env.CLIENT_API_URL,
    },
    serverRuntimeConfig: {
        API_URL: process.env.SERVER_API_URL,
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
});

// https://github.com/ryohlan/next-ts-template/blob/master/next.config.js
