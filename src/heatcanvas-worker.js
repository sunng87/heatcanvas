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

onmessage = function(e){
    calc(e.data);
}

function calc(params) {
    var value = params.value;
    var degree = params.degree || 1;
    var step = params.step || 1;

    if (!(value instanceof Float32Array) || value.length != params.width * params.height) {
        value = new Float32Array(params.width * params.height);
    }

    var cache = new Cache(params.data, params.height, params.width, step, degree);
    var rows = cache.getRows();

    var v = 0.0;
    var hasLine1 = true, hasLine2 = true;
    var dy = 0, dx = 0, rx = 0, base = 0, base2 = 0;

    for (var pos in params.data) {
        var data = params.data[pos] / step;       // we don't need absolute values, and this allows us to get rid of many step*pow(...)
        var radius = Math.pow(data, 1/degree);
        var radiusSq = Math.pow(radius, 2);
        radius = Math.floor(radius);

        var x = Math.floor(pos%params.width);
        var y = Math.floor(pos/params.width);

        var maxRx = params.width - 1 - x;

        // for all circles, lying inside the screen use fast method
        if (y >= radius && y < params.height-radius && x >= radius && radius <= maxRx) {
            fastCalc(params, data, value, x, y, radius, radiusSq, rows);
            continue;
        }

        var row;
        // calculate point x.y
        var rLeft, rRight;                              // minimum of radius or distance to respective image border
        var maxY = y+radius < params.height - 1 ? y+radius : (params.height - 1);

        var rTop = radius > y ? y : radius;
        var rBottom = maxY - y;

        for (dy = rTop > rBottom ? rTop : rBottom, base = (y - dy) * params.width + x, base2 = (y + dy) * params.width + x;
             dy > 0;
             base += params.width, base2 -= params.width, dy--) {

            hasLine1 = y - dy >= 0;
            hasLine2 = y + dy <= maxY;

            row = rows[dy];

            rx = Math.floor(Math.sqrt(radiusSq - Math.pow(dy, 2)));
            rLeft = rx > x ? x : rx;
            rRight = rx > maxRx ? maxRx : rx;

            if (rLeft < rRight) {
                for (dx = rLeft + 1; dx <= rRight; dx++) {
                    v = data - row[dx];

                    if (hasLine1)
                        value[base + dx] += v;
                    if (hasLine2)
                        value[base2 + dx] += v;
                }
            }
            else if (rRight < rLeft) {
                for (dx = rRight + 1; dx <= rLeft; dx++) {
                    v = data - row[dx];
                    if (hasLine1)
                        value[base - dx] += v;
                    if (hasLine2)
                        value[base2 - dx] += v;
                }
            }

            for (dx = rRight < rLeft ? rRight : rLeft; dx > 0; dx--) {
                v = data - row[dx];

                if (hasLine1) {
                    value[base - dx] += v;
                    value[base + dx] += v;
                }
                if (hasLine2) {
                    value[base2 - dx] += v;
                    value[base2 + dx] += v;
                }
            }
            // dx == 0
            v = data - row[0];
            if (hasLine1) {
                value[base] += v;
            }
            if (hasLine2) {
                value[base2] += v;
            }
        }

        // dy == 0 && dx != 0
        row = rows[0];
        base = y*params.width + x;
        rLeft = radius > x ? x : radius;
        rRight = radius > maxRx ? maxRx : radius;
        if (rLeft < rRight) {
            for (dx = rLeft + 1; dx <= rRight; dx++)
                value[base + dx] += data - row[dx];
        }
        else if (rRight < rLeft) {
            for (dx = rRight + 1; dx <= rLeft; dx++)
                value[base - dx] += data - row[dx];
        }

        for (dx = rRight < rLeft ? rRight : rLeft; dx > 0; dx--) {
            v = data - row[dx];
            value[base - dx] += v;
            value[base + dx] += v;
        }

        // dy == dx == 0
        value[base] += data;
    }

    row = null;
    rows = null;
    cache.clear();
    cache = null;

    postMessage({'value': value, 'width': params.width, 'height': params.height});
}

/* Knows that circle on the screen has 4 axes of symmetry (x = 0, y = 0, y = x, y = -x),
 but uses just first two, because with precomputed weights cache-friendliness seems to be more important.

 Does not check bounds of the image!
 */
function fastCalc(params, data, value, x, y, radius, radiusSq, cacheRows) {
    var base = y * params.width + x;

    var v = 0.0;
    var vRow = null;
    var dx = 0, rx = 0.0;

    for (var dy = 1, yOffset = base - params.width, yOffset2 = base + params.width;
         dy <= radius;
         dy++, yOffset -= params.width, yOffset2 += params.width) {

        vRow = cacheRows[dy];
        rx = Math.floor(Math.sqrt(radiusSq - Math.pow(dy, 2)));
        for (dx = 1; dx <= rx; dx++) {
            v = data - vRow[dx];

            value[yOffset - dx] += v;
            value[yOffset + dx] += v;
            value[yOffset2 - dx] += v;
            value[yOffset2 + dx] += v;
        }
        // dx = 0
        v = data - vRow[0];
        value[yOffset] += v;
        value[yOffset2] += v;
    }

    // dy == 0
    vRow = cacheRows[0];
    for (dx = 1; dx <= radius; dx++) {
        v = data - vRow[dx];
        value[base - dx] += v;
        value[base + dx] += v;
    }

    // dy == dx == 0
    value[base] += data;

}

// precomputes and stores weights for 1/4 of a circle.
// Isn't optimized for 1/8 for the sake of ease of use
var Cache = function(data, height, width, step, degree) {
    this.rows = null;
    this._deg2 = degree / 2;
    this._maxDx = -1;
    this._maxDy = -1;

    this._computeStat(data, height, width, step, 1/degree);
};
Cache.prototype = {

    _computeStat: function(data, height, width, step, reciprocalDegree) {
        var maxV = -1;
        var width1 = width - 1;
        var height1 = height - 1;

        for (var p in data) {
            var p0 = data[p];
            if (p0 <= maxV)
                continue;

            var r0 = Math.pow(p0 / step, reciprocalDegree);
            var floor = Math.floor(r0);
            var x0 = Math.floor(p%width);
            var y0 = Math.floor(p/width);

            var mDx = width1 - x0;
            if (mDx < x0)
                mDx = x0;
            var mDy = height1 - y0;
            if (mDy < y0)
                mDy = y0;

            if (mDx > floor)
                mDx = floor;
            if (mDy > floor)
                mDy = floor;

            if (mDx > this._maxDx)
                this._maxDx = mDx;
            if (mDy > this._maxDy)
                this._maxDy = mDy;

            if ((y0 >= r0 || y0 <= height1 - r0) && (x0 >= r0 || x0 <= width1 - r0)) { // this value's circle has at least a quarter inside the canvas. We aren't interested in smaller values anymore
                maxV = p0;
            }
        }
    },

    getRows: function() {
        if (this.rows) {
            return this.rows;
        }

        var r, j;
        var iSq;
        this.rows = new Array(this._maxDy + 1);
        for (var i = this._maxDy; i >= 0; i--) {
            this.rows[i] = r = new Float32Array(this._maxDx + 1);
            iSq = Math.pow(i, 2);
            for (j = this._maxDx; j >= 0; j--) {
                r[j] = Math.pow(iSq + Math.pow(j, 2), this._deg2);
            }
        }

        return this.rows;
    },

    clear: function() {
        if (!this.rows) {
            return;
        }

        for (var i = this.rows.length - 1; i >= 0; i--) {
            this.rows[i] = null;
        }
        this.rows = null;
    }
};

