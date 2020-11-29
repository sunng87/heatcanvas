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
    var value = params.value || {};
    var degree = params.degree || 1;
    var step = params.step || 1;

    var deg2 = degree / 2;
    for (var pos in params.data) {
        var data = params.data[pos] / step;       // we don't need absolute values, and this allows us to get rid of many step*pow(...)
        var radius = Math.floor(Math.pow(data, 1/degree));
        var radiusSq = Math.pow(radius, 2);

        var x = Math.floor(pos%params.width);
        var y = Math.floor(pos/params.width);

        // calculate point x.y
        for(var scanx=x-radius; scanx<x+radius; scanx+=1){
            // out of extend
            if(scanx<0 || scanx>params.width){
                continue;
            }
            for(var scany=y-radius; scany<y+radius; scany+=1){

                if(scany<0 || scany>params.height){
                    continue;
                }

                var distSq = Math.pow((scanx-x), 2) + Math.pow((scany-y), 2);
                if (distSq > radiusSq){
                    continue;
                } else {
                    var v = data - Math.pow(distSq, deg2);

                    var id = scanx+scany*params.width ;

                    if(value[id]){
                        value[id] = value[id] + v;
                    } else {
                        value[id] = v;
                    }
                }
            }
        }
    }
    postMessage({'value': value, 'width': params.width, 'height': params.height});
}
