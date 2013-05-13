/**
 * Copyright 2013 Codefor <hk.yuhe@gmail.com>
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


function HeatCanvas51Layer(map,options){
    options = options || {};
    this._map = map;
    this.heatmap = null;
    this.setp = options.step || 1;
    this.degree = options.degree || HeatCanvas.LINEAR;
    this.opacity = options.opacity || 0.6;
    this.colorscheme = options.colorscheme || null;
    this.data = [];
    var self = this;
    LTEvent.addListener(this._map,'mousedrag',function(){self.draw();});
    LTEvent.addListener(this._map,'click',function(){self.draw();});
}


HeatCanvas51Layer.prototype.initialize = function(map) {
    var container = document.createElement("div");
    a = this._map.getViewSize();
    var size = {width:a[0],height:a[1]}
    container.style.cssText = "position:absolute;top:0;left:0;border:0";
    container.style.width  = "100%";
    container.style.height = "100%";

    var canvas = document.createElement("canvas");
    canvas.style.width  = size.width + 'px';
    canvas.style.height = size.height + 'px';
    canvas.width = size.width;
    canvas.height= size.height;
    canvas.style.opacity = this.opacity;
    container.appendChild(canvas);

    this.heatmap = new HeatCanvas(canvas);
    this._map.container.appendChild(container);
    this._div = container;
}

HeatCanvas51Layer.prototype.pushData = function (lat, lon,value) {
    this.data.push({"lon":lon, "lat": lat, "v": value});
}

HeatCanvas51Layer.prototype.getObject = function(){
    return this._div
}

HeatCanvas51Layer.prototype.reDraw = function(){
    return this.draw()
}

HeatCanvas51Layer.prototype.draw = function() {
    var div = this._div;
    a = this._map.getViewSize();
    var size = {width:a[0],height:a[1]}

    var bounds = this._map.getBoundsLatLng();
    sw = this._map.getOverLayPosition(new LTPoint(bounds.getXmin(),bounds.getYmin()));
    ne = this._map.getOverLayPosition(new LTPoint(bounds.getXmax(),bounds.getYmax()));

    div.style.left = sw[0]+'px';
    div.style.top  = ne[1]+'px';
    div.style.width = size.width+'px';	 
    div.style.height = size.height +'px';

    this.heatmap.clear();
    if(this.data.length>0) {
        for(var i=0 , l=this.data.length;i<l;i++) {
            latlon = new  LTPoint(this.data[i].lat, this.data[i].lon);
            localXY = this._map.getOverLayPosition(latlon);
            this.heatmap.push(
                    Math.floor(localXY[0]-sw[0]),
                    Math.floor(localXY[1]-ne[1]),
                    this.data[i].v);
        }
    }
    this.heatmap.render(this.step, this.degree, this.colorscheme);
}
