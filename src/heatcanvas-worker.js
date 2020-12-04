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
    var degree = +params.degree || 1;
    var step = +params.step || 1;

    if (!(value instanceof Float32Array) || value.length != params.width * params.height) {
        value = new Float32Array(params.width * params.height);
    }

    var deg2 = degree / 2;

    var v = 0.0, dySq = 0.0;
    var scany = 0;
    var scany2 = 0;
    var dx = 0, rx = 0, base = 0, base2;
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
            fastCalc(params, data, value, x, y, radius, radiusSq);
            continue;
        }

        base = (y - radius)*params.width + x;
        base2 = (y + radius)*params.width + x;

        // calculate point x.y
        var rLeft, rRight;                              // minimum of radius or distance to respective image border
        var maxY = y+radius < params.height - 1 ? y+radius : (params.height - 1);
        for (scany = y - radius; scany < y; scany++, base += params.width, base2 -= params.width) {
            scany2 = (y + y - scany);
            if (scany < 0 && scany2 > maxY) // both scanlines out of extend
                continue;

            dySq = Math.pow(scany-y, 2);
            rx = Math.floor(Math.sqrt(radiusSq - dySq));

            rLeft = rx > x ? x : rx;
            rRight = rx > maxRx ? maxRx : rx;

            if (rLeft < rRight) {
                for (dx = rLeft + 1; dx <= rRight; dx++) {
                    v = data - Math.pow(Math.pow(dx, 2) + dySq, deg2);

                    if (scany >= 0)
                        value[base + dx] += v;
                    if (scany2 <= maxY)
                        value[base2 + dx] += v;
                }
            }
            else if (rRight < rLeft) {
                for (dx = rRight + 1; dx <= rLeft; dx++) {
                    v = data - Math.pow(Math.pow(dx, 2) + dySq, deg2);
                    if (scany >= 0)
                        value[base - dx] += v;
                    if (scany2 <= maxY)
                        value[base2 - dx] += v;
                }
            }

            for (dx = rRight < rLeft ? rRight : rLeft; dx > 0; dx--) {
                v = data - Math.pow(Math.pow(dx, 2) + dySq, deg2);

                if (scany >= 0) {
                    value[base - dx] += v;
                    value[base + dx] += v;
                }
                if (scany2 <= maxY) {
                    value[base2 - dx] += v;
                    value[base2 + dx] += v;
                }
            }
            // dx == 0
            v = data - Math.pow(dySq, deg2);
            if (scany >= 0) {
                value[base] += v;
            }
            if (scany2 <= maxY) {
                value[base2] += v;
            }
        }

        // dy == 0 && dx != 0
        // attention!  power (sqrt(dx^2), degree) == power(dx, degree), but dx SHOULD be non-negative, since degree can be float!
        base = y*params.width + x;
        rLeft = radius > x ? x : radius;
        rRight = radius > maxRx ? maxRx : radius;
        if (rLeft < rRight) {
            for (dx = rLeft + 1; dx <= rRight; dx++)
                value[base + dx] += data - Math.pow(dx, degree);
        }
        else if (rRight < rLeft) {
            for (dx = rRight + 1; dx <= rLeft; dx++)
                value[base - dx] += data - Math.pow(dx, degree);
        }

        for (dx = rRight < rLeft ? rRight : rLeft; dx > 0; dx--) {
            v = data - Math.pow(dx, degree);
            value[base - dx] += v;
            value[base + dx] += v;
        }

        // dy == dx == 0
        value[base] += data;
    }
    postMessage({'value': value, 'width': params.width, 'height': params.height});
}

/* Uses fact that circle on the screen has 4 axes of symmetry: x = 0, y = 0, y = x, y = -x,
 so it computes values for ~1/8 of points and copies them to symmetrical ones

 Does not check bounds of the image!
 */
function fastCalc(params, data, value, x, y, radius, radiusSq) {
    var width = params.width;
    var base = y * width + x;
    var deg2 = params.degree / 2;
    var radiusSq2 = radiusSq / 2;

    var v = 0.0;

    var xOffset = 0;
    var dx = 0, dy = 0, rx = 0.0, dySq = 0;

    var yOffset = base - radius * width;
    var yOffset2 = base + radius * width;

    for (dy = -radius; dy < 0; dy++, yOffset += width, yOffset2 -= width) {
        dySq = Math.pow(dy, 2);
        rx = Math.floor(Math.sqrt(radiusSq - dySq));

        dx = rx >= -dy ? dy + 1 : -rx;
        xOffset = dx * width;
        for (; dx < 0; dx++, xOffset += width) {
            v = data - Math.pow(Math.pow(dx, 2) + dySq, deg2);

            // main and symmetrical over x=0, y = 0;
            value[yOffset + dx] += v;
            value[yOffset - dx] += v;
            value[yOffset2 + dx] += v;
            value[yOffset2 - dx] += v;

            // symmetrical over y = x, y = -x
            value[base + xOffset + dy] += v;
            value[base + xOffset - dy] += v;
            value[base - xOffset + dy] += v;
            value[base - xOffset - dy] += v;
        }
        //dy == dx
        if (dySq <= radiusSq2) {
            v = data - Math.pow(2 * dySq, deg2);
            value[yOffset + dy] += v;
            value[yOffset - dy] += v;
            value[yOffset2 + dy] += v;
            value[yOffset2 - dy] += v;
        }

        // dx = 0
        v = data - Math.pow(dySq, deg2);
        value[yOffset] += v;
        value[yOffset2] += v;
        value[base + dy] += v;
        value[base - dy] += v;
    }

    // dx == dy == 0
    value[base] += data;
}

