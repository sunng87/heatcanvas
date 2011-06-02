
onmessage = function(e){
    calc(e.data);
}

function calc(params) {
    value = params.value || {};
    degree = params.degree || 1;

    for(var pos in params.data){
        var data = params.data[pos];
        var radius = Math.floor(Math.pow((data / params.step), 1/degree));
        
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
                
                var dist = Math.sqrt(Math.pow((scanx-x), 2)+Math.pow((scany-y), 2));
                if(dist > radius){
                    continue;
                } else {
                    var v = data - params.step * Math.pow(dist, degree);
                    
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
    postMessage({'value': value});
}
