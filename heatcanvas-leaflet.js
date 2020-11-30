/**
 * Copyright 2010 Sun Ning <classicning@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {default as HeatCanvas} from './heatcanvas.js';

L.TileLayer.HeatCanvas = L.Layer.extend({

    initialize: function(options, heatCanvasOptions){
        L.Util.setOptions(this, options);

        this.heatCanvasOptions = heatCanvasOptions;
        this.data = [];
        this._onRenderingStart = null;
        this._onRenderingEnd = null;
    },

    onRenderingStart: function(cb){
        this._onRenderingStart = cb;
    },

    onRenderingEnd: function(cb) {
        this._onRenderingEnd = cb;
    },

    onAdd: function(map) {
        this.map = map;
        this._initHeatCanvas(this.map, this.heatCanvasOptions);
        map.on("moveend", this._redraw, this);
        map.on("resize", this._resize, this);
        this._redraw();
    },

    onRemove: function(map) {
        map.getPanes().overlayPane.removeChild(this._div);
        map.off("resize", this._resize, this);
        map.off("moveend", this._redraw, this);
    },

    _initHeatCanvas: function(map, options) {
        options = options || {};
        this._step = options.step || 1;
        this._degree = options.degree || HeatCanvas.LINEAR;
        this._opacity = options.opacity || 0.6;
        this._zIndex = options.zIndex || null;
        this._colorscheme = options.colorscheme || null;

        var mapSize = this.map.getSize();
        var container = L.DomUtil.create('div', 'leaflet-heatmap-container');
        container.style.position = 'absolute';
        container.style.width = mapSize.x+"px";
        container.style.height = mapSize.y+"px";
        if (this._zIndex != null) {
            container.style.zIndex = this._zIndex;
        }

        var canv = document.createElement("canvas");
        canv.width = mapSize.x;
        canv.height = mapSize.y;
        canv.style.width = canv.width+"px";
        canv.style.height = canv.height+"px";
        canv.style.opacity = this._opacity;
        container.appendChild(canv);

        this.heatmap = new HeatCanvas(canv);
        this.heatmap.onRenderingStart = this._onRenderingStart;
        this.heatmap.onRenderingEnd = this._onRenderingEnd;
        this.heatmap.bgcolor = options.bgcolor || null;
        this._div = container;
        this.map.getPanes().overlayPane.appendChild(this._div);
    },

    pushData: function(lat, lon, value) {
        this.data.push({"lat":lat, "lon":lon, "v":value});
    },

    _resetCanvasPosition: function() {
        var bounds = this.map.getBounds();
        var topLeft = this.map.latLngToLayerPoint(bounds.getNorthWest());
        L.DomUtil.setPosition(this._div, topLeft);
    },

    _redraw: function() {
        this._resetCanvasPosition();
        this.heatmap.clear();
        var sz = this.map.getSize();
        if (this.data.length > 0 && sz.x > 0 && sz.y > 0) {
            for (var i=0, l=this.data.length; i<l; i++) {
                var lonlat = new L.LatLng(this.data[i].lat, this.data[i].lon);
                var localXY = this.map.latLngToLayerPoint(lonlat);
                localXY = this.map.layerPointToContainerPoint(localXY);
                this.heatmap.push(
                    Math.floor(localXY.x),
                    Math.floor(localXY.y),
                    this.data[i].v);
            }

            this.heatmap.render(this._step, this._degree, this._colorscheme);
        }
        return this;
    },

    _resize: function() {
        var sz = this.map.getSize();

        this._div.style.width = sz.x + "px";
        this._div.style.height = sz.y + "px";
        this.heatmap.resize(sz.x, sz.y);
    },

    clear: function() {
        if (this.heatmap) {
            this.heatmap.clear();
        }
        this.data = [];
    },

    redraw: function() {
        this._redraw();
    }

});

L.TileLayer.heatcanvas = function (options, heatCanvasOptions) {
    return new L.TileLayer.HeatCanvas(options, heatCanvasOptions);
};

export default L.TileLayer.heatcanvas;