/**
 * 
 * Copyright 2010 Sun Ning <classicning@gmail.com>
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 *
 *   http://www.apache.org/licenses/LICENSE-2.0 
 *
 * Unless required by applicable law or agreed to in writing, 
 * software distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions 
 * and limitations under the License. 
 *
 *
 */

/**
 * Heatmap api based on canvas
 *
 */
var HeatCanvas = function(canvas){
    if (typeof(canvas) == "string") {
        this.canvas = document.getElementById(canvas);
    } else {
        this.canvas = canvas;
    }
    if(this.canvas == null){
        return null;
    }
    
    this.worker = new Worker('heatcanvas-worker.js');
    
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.onRenderingStart = null;
    this.onRenderingEnd = null;
    
    this.data = {};
};

HeatCanvas.prototype.push = function(x, y, data){
    // ignore all data out of extent
    if (x < 0 || x > this.width) {
        return ;
    }
    if (y < 0 || y > this.height) {
        return;
    }

    var id = x+y*this.width;
    if(this.data[id]){
        this.data[id] = this.data[id] + data;           
    } else {
        this.data[id] = data;
    }
};

HeatCanvas.prototype.render = function(step, degree, f_value_color){
    step = step || 1;
    degree = degree || HeatCanvas.LINEAR ;

    var self = this;
    this.worker.onmessage = function(e){
        self.value = e.data.value;
        self.data = {};
        self._render(f_value_color);
        if (self.onRenderingEnd){
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
    if (this.onRenderingStart){
        this.onRenderingStart();
    }
};


HeatCanvas.prototype._render = function(f_value_color){
    f_value_color = f_value_color || HeatCanvas.defaultValue2Color;

    var ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);
    
    // reader background as black
    ctx.fillStyle = this.bgcolor || "rgb(0,0,0)";
    ctx.fillRect(0, 0, this.width, this.height);
    
    // maximum 
    var maxValue = 0;
    for(var id in this.value){
        maxValue = Math.max(this.value[id], maxValue);
    }
    
    for(var pos in this.value){
        var x = Math.floor(pos%this.width);
        var y = Math.floor(pos/this.width);
        
        var color = f_value_color(this.value[pos] / maxValue);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
            
        
    }
    
};

HeatCanvas.prototype.clear = function(){
	this.data = {};
	this.value = {};
	
	this.canvas.getContext("2d").clearRect(0, 0, this.width, this.height);
};

HeatCanvas.defaultValue2Color = function(value){
    var hue = (1 - value) * 240;
    var light = value *60;
    return "hsl("+hue+", 80%, "+light+"%)";
}

HeatCanvas.LINEAR = 1;
HeatCanvas.QUAD = 2;
HeatCanvas.CUBIC = 3;

