/**
 * Heatmap api based on canvas
 *
 */
export default function HeatCanvas(canvas) {
    if (typeof(canvas) == "string") {
        this.canvas = document.getElementById(canvas);
    } else {
        this.canvas = canvas;
    }
    if (this.canvas == null) {
        return null;
    }

    this._createWorker();

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.onRenderingStart = null;
    this.onRenderingEnd = null;

    this.data = {};
    this.value = {};
    this._valueWidth = null;
    this._valueHeight = null;
}

HeatCanvas.prototype.resize = function(w, h) {
    this.width = this.canvas.width = w;
    this.height = this.canvas.height = h;

    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
};

HeatCanvas.prototype.push = function(x, y, data) {
    // ignore all data out of extent
    if (x < 0 || x >= this.width) {
        return ;
    }
    if (y < 0 || y >= this.height) {
        return;
    }

    var id = x+y*this.width;
    if (this.data[id]) {
        this.data[id] = this.data[id] + data;
    } else {
        this.data[id] = data;
    }
};

HeatCanvas.prototype.render = function(step, degree, f_value_color) {
    step = step || 1;
    degree = degree || HeatCanvas.LINEAR ;

    if (this.width <= 0 || this.height <= 0)
        return;

    if (this._runCounter > 0) {
        this.worker.terminate();
        this._createWorker();
    }
    this._runCounter++;

    var self = this;
    this.worker.onmessage = function(e) {
        self._runCounter--;
        self.value = e.data.value;
        self._valueWidth = e.data.width;
        self._valueHeight = e.data.height;
        self.data = {};
        self._render(f_value_color);
        if (self.onRenderingEnd) {
            self.onRenderingEnd();
        }
    }
    var msg = {
        'data': self.data,
        'width': self.width,
        'height': self.height,
        'step': step,
        'degree': degree,
        'value': self.value
    };
    this.worker.postMessage(msg);
    if (this.onRenderingStart) {
        this.onRenderingStart();
    }
};


HeatCanvas.prototype._paletteSize = 512;
HeatCanvas.prototype._defaultPalette = null;

HeatCanvas.prototype._createWorker = function() {
    this.worker = new Worker(HeatCanvas.getPath()+'heatcanvas-worker.js');
    this._runCounter = 0;
};

HeatCanvas.prototype._render = function(f_value_color) {
    var makeColor;
    if (!f_value_color) {
        this._ensureDefaultPalette();
        f_value_color = HeatCanvas.defaultValue2Color;
        var t = this;
        makeColor = function(value) { return t._defaultPalette[Math.round(value * t._paletteSize)]; };
    }
    else
        makeColor = function(value) { return HeatCanvas.hsla2rgba.apply(null, f_value_color(value)); };

    if (this.width <= 0 || this.height <= 0) {
        return;
    }

    var ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);

    var defaultColor = this.bgcolor || [0, 0, 0, 255];
    var canvasData = ctx.createImageData(this.width, this.height);
    for (var i=0; i<canvasData.data.length; i+=4) {
        canvasData.data[i] = defaultColor[0]; // r
        canvasData.data[i+1] = defaultColor[1];
        canvasData.data[i+2] = defaultColor[2];
        canvasData.data[i+3] = defaultColor[3];
    }

    if (this.width != this._valueWidth || this.height != this._valueHeight) {  // canvas was resized while worker was computing heatmap
        return;
    }

    // maximum
    var maxValue = 0;
    for (var id in this.value) {
        maxValue = Math.max(this.value[id], maxValue);
    }

    for (var pos in this.value) {
        var x = Math.floor(pos%this.width);
        var y = Math.floor(pos/this.width);

        // MDC ImageData:
        // data = [r1, g1, b1, a1, r2, g2, b2, a2 ...]
        var pixelColorIndex = y*this.width*4+x*4;

        var color = makeColor(this.value[pos] / maxValue);

        canvasData.data[pixelColorIndex] = color[0]; //r
        canvasData.data[pixelColorIndex+1] = color[1]; //g
        canvasData.data[pixelColorIndex+2] = color[2]; //b
        canvasData.data[pixelColorIndex+3] = color[3]; //a
    }
    ctx.putImageData(canvasData, 0, 0);
};

HeatCanvas.prototype.clear = function() {
    this.data = {};
    this.value = {};

    this.canvas.getContext("2d").clearRect(0, 0, this.width, this.height);
};

HeatCanvas.prototype.exportImage = function() {
    return this.canvas.toDataURL();
};

HeatCanvas.prototype._ensureDefaultPalette = function() {
    if (this._defaultPalette && this._defaultPalette.length == this._paletteSize + 1)
        return this;

    var res = [];
    for (var j = 0; j <= this._paletteSize; j++) {
        var c = HeatCanvas.hsla2rgba.apply(null, HeatCanvas.defaultValue2Color(j / this._paletteSize));
        res[j] = new Uint8ClampedArray(4);
        res[j][0] = c[0];
        res[j][1] = c[1];
        res[j][2] = c[2];
        res[j][3] = c[3];
    }

    this._defaultPalette = res;
    return this;
}

const defaultValue2ColorResult = new Float64Array(4);
defaultValue2ColorResult[1] = 0.8;// s
defaultValue2ColorResult[3] = 1.0;// a
HeatCanvas.defaultValue2Color = function(value){
    defaultValue2ColorResult[0] = (1 - value);// h
    defaultValue2ColorResult[2] = value * 0.6;// l
    return defaultValue2ColorResult;
}

// function copied from:
// http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
const hsla2rgbaResult = new Uint8ClampedArray(4);
HeatCanvas.hsla2rgba = function(h, s, l, a){
    var r, g, b;

    if(s == 0){
        r = g = b = l;
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    hsla2rgbaResult[0] = r * 255;
    hsla2rgbaResult[1] = g * 255;
    hsla2rgbaResult[2] = b * 255;
    hsla2rgbaResult[3] = a * 255;
    return hsla2rgbaResult;
}

HeatCanvas.LINEAR = 1;
HeatCanvas.QUAD = 2;
HeatCanvas.CUBIC = 3;

HeatCanvas.getPath = function() {
    var scriptTags = document.getElementsByTagName("script");
    for (var i=0; i<scriptTags.length; i++) {
        var src = scriptTags[i].src;
        var match = src.match(/heatcanvas(-[a-z0-9]{32})?\.js/);
        var pos = match ? match.index : 0;
        if (pos > 0) {
            return src.substring(0, pos);
        }
    }
    return "";
}
