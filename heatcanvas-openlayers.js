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

OpenLayers.Layer.HeatCanvas = OpenLayers.Class(OpenLayers.Layer, {

    isBaseLayer: false,
    heatmap: null,
    data: [],

    initialize: function(name, options, heatCanvasOptions){
        OpenLayers.Layer.prototype.initialize.apply(this, [name, options]);
        
        this.heatCanvasOptions = heatCanvasOptions;
    },

    initHeatCanvas: function(map, options){
        options = options || {};                        
        this._step = options.step || 1;
        this._degree = options.degree || HeatCanvas.LINEAR;
        this._opacity = options.opacity || 0.6;
        this._colorscheme = options.colorscheme || null;

        var container = document.createElement("div");
        container.style.cssText = "position:absolute;top:0;left:0;border:0";
        container.style.width = map.size.w+"px";
        container.style.height = map.size.h+"px";
        var canvas = document.createElement("canvas");

        canvas.style.width = map.size.w+"px";
        canvas.style.height = map.size.h+"px";
        canvas.width = parseInt(canvas.style.width);
        canvas.height = parseInt(canvas.style.height);
        canvas.style.opacity = this._opacity;
        container.appendChild(canvas);

        this.heatmap = new HeatCanvas(canvas);
    },

    pushData: function(lat, lon, value) {
        this.data.push({"lon":lon, "lat":lat, "v":value});
    },

    // override
    redraw: function() {
        console.log('about to redraw');
        this.heatmap.clear();
        if (this.data.length > 0) {
            for (var i=0, l=this.data.length; i<l; i++) {
                var lonlat = new OpenLayers.LonLat(this.data[i].lon, this.data[i].lat);
                var localXY = this.map.getViewPortPxFromLonLat(lonlat);
                this.heatmap.push(
                        Math.floor(localXY.x), 
                        Math.floor(localXY.y), 
                        this.data[i].v);
            }

            this.heatmap.render(this._step, this._degree, this._colorscheme);
            console.log('rendered');
        }
    }

    // override
    afterAdd: function() {
        console.log('after add')
        this.initHeatCanvas(this.map, this.heatCanvasOptions);
        console.log('heatcanvas initialized')
    },

    CLASS_NAME: "OpenLayers.Layer.HeatCanvas"
});
