const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [{
    entry: {
        app: "./src/app.js",
    },
    output: {
        path: __dirname + "/dist/",
        filename: "heatcanvas.js",
        library: "HeatCanvas",
        libraryExport: "default"
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin([
            {from:'src/heatcanvas-worker.js',to:'heatcanvas-worker.js'} 
        ]),
    ]
},
{
    entry: {
        app: "./src/heatcanvas-51map.js"
    },
    output: {
        path: __dirname + "/dist/",
        filename: "heatcanvas-51map.js",
        library: "HeatCanvas51Layer",
        libraryExport: "default"
    },
    devtool: 'source-map'
},
{
    entry: {
        app: "./src/heatcanvas-baidumap.js"
    },
    output: {
        path: __dirname + "/dist/",
        filename: "heatcanvas-baidumap.js",
        library: "HeatCanvasBaiduLayer",
        libraryExport: "default"
    },
    devtool: 'source-map'
},
{
    entry: {
        app: "./src/heatcanvas-googlemaps.js"
    },
    output: {
        path: __dirname + "/dist/",
        filename: "heatcanvas-googlemaps.js",
        library: "HeatCanvasOverlayView",
        libraryExport: "default"
    },
    devtool: 'source-map'
},
{
    entry: {
        app: "./src/heatcanvas-leaflet.js"
    },
    output: {
        path: __dirname + "/dist/",
        filename: "heatcanvas-leaflet.js",
        library: "HeatCanvasLeaflet",
        libraryExport: "default"
    },
    devtool: 'source-map'
},
{
    entry: {
        app: "./src/heatcanvas-openlayers.js"
    },
    output: {
        path: __dirname + "/dist/",
        filename: "heatcanvas-openlayers.js",
        library: "HeatCanvasOpenLayers",
        libraryExport: "default"
    },
    devtool: 'source-map'
}
];
