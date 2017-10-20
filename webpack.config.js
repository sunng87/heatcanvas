const path = require('path');

module.exports = {
    entry: {
        app: "./src/app.js",
    },
    output: {
        path: __dirname + "/dist/",
        filename: "heatcanvas.js"
    },
    devtool: 'source-map'
};
