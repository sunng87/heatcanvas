
onmessage = function(e){
    value = {};
    for(var pos in e.data.data){
        var data = e.data.data[pos];
        var radius = data / e.data.step;
        
        var x = parseInt(pos.split(":")[0]);
        var y = parseInt(pos.split(":")[1]);
        
        // calculate point x.y 
        for(var scanx=x-radius; scanx<x+radius; scanx+=e.data.resolution){            
            // out of extend
            if(scanx<0 || scanx>e.data.width){
                continue;
            }
            for(var scany=y-radius; scany<y+radius; scany+=e.data.resolution){
            
                if(scany<0 || scany>e.data.height){
                    continue;
                }                  
                
                var dist = Math.sqrt(Math.pow((scanx-x), 2)+Math.pow((scany-y), 2));
                if(dist > radius){
                    continue;
                } else {
                    var v = data - e.data.step * dist;
                    
                    var id = scanx + ":" + scany ;
                
                    if(value[id]){
                        value[id] = value[id] + v;           
                    } else {
                        value[id] = v;
                    }
                }
            }
        }        
    }
    postMessage({'value': value});
}
