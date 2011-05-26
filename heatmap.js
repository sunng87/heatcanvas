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
var HeatMap = function(canvasId, resolution){
    this.canvas = document.getElementById(canvasId);
    if(this.canvas == null){
        return null;
    }
    
    this.resolution = resolution || 1;
    
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    this.data = {};
};

HeatMap.prototype.push = function(x, y, data){
    var id = x+":"+y;
    if(this.data[id]){
        this.data[id] = this.data[id] + data;           
    } else {
        this.data[id] = data;
    }
};

HeatMap.prototype.spread = function(step){
    step = step || 1;
    this.value = {};

    for(var pos in this.data){
        var data = this.data[pos];
        var radius = data / step;
        
        var x = parseInt(pos.split(":")[0]);
        var y = parseInt(pos.split(":")[1]);
        
        // calculate point x.y 
        for(var scanx=x-radius; scanx<x+radius; scanx+=this.resolution){            
            // out of extend
            if(scanx<0 || scanx>this.width){
                continue;
            }
            for(var scany=y-radius; scany<y+radius; scany+=this.resolution){
            
                if(scany<0 || scany>this.height){
                    continue;
                }                  
                
                var dist = Math.sqrt(Math.pow((scanx-x), 2)+Math.pow((scany-y), 2));
                if(dist > radius){
                    continue;
                } else {
                    var value = data - step * dist;
                    
                    var id = scanx + ":" + scany ;
                
                    if(this.value[id]){
                        this.value[id] = this.value[id] + value;           
                    } else {
                        this.value[id] = value;
                    }
                }
            }
        }        
    }
};


HeatMap.prototype.render = function(f_value_color){
    f_value_color = f_value_color || HeatMap.defaultValue2Color;

    var ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.width, this.height);
    
    // reader background as black
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, this.width, this.height);
    
    // maximum 
    var maxValue = 0;
    for(var id in this.value){
        maxValue = Math.max(this.value[id], maxValue);
    }
    
    for(var pos in this.value){
        var x = parseInt(pos.split(":")[0]);
        var y = parseInt(pos.split(":")[1]);
        
        var color = f_value_color(this.value[pos] / maxValue);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, this.resolution, this.resolution);
            
        
    }
    
};

HeatMap.prototype.clear = function(){
	this.data = {};
	this.value = {};
	
	this.canvas.getContext("2d").clearRect(0, 0, this.width, this.height);
};

HeatMap.defaultValue2Color = function(value){
    var hue = (1 - value) * 240;
    var light = value * 60;
    return "hsl("+hue+", 80%, "+light+"%)";
}

