
onmessage = function(e){
    value = e.data.value || {};
    for(var pos in e.data.data){
        var data = e.data.data[pos];
        var radius = Math.floor(data / e.data.step);
        
        var x = Math.floor(pos%e.data.width);
        var y = Math.floor(pos/e.data.width);
        
        // calculate point x.y 
        for(var scanx=x-radius; scanx<x+radius; scanx+=1){            
            // out of extend
            if(scanx<0 || scanx>e.data.width){
                continue;
            }
            for(var scany=y-radius; scany<y+radius; scany+=1){
            
                if(scany<0 || scany>e.data.height){
                    continue;
                }                  
                
                var dist = Math.sqrt(Math.pow((scanx-x), 2)+Math.pow((scany-y), 2));
                if(dist > radius){
                    continue;
                } else {
                    var v =data*(1-2*dist/radius-Math.pow(dist/radius,2));      
       		    v=v<0?0:v;         
                    var id = scanx+scany*e.data.width ;
                
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

