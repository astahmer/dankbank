module.exports = {
    distDir: "../build",
    publicRuntimeConfig: {
        API_URL: process.env.CLIENT_API_URL,
    },
    serverRuntimeConfig: {
        API_URL: process.env.SERVER_API_URL,
    },
};
