var val={};
onmessage = delegate;
function delegate(e)
{
val=e.data.value||{};
var worker1= new Worker('heatmap-calc.js');
var keys=this.getKeys(e.data.data);
var gap =keys.length/10;
for(var index=0;index<10;index++)
{	
		worker1.postMessage({
        'data': e.data.data,
        'width': e.data.width,
        'height': e.data.height,
        'step': e.data.step,
        'value': {},
		'keys': keys.slice(index*gap,(index+1)*gap)
    });
	
}
worker1.onmessage= function(ex)
	{
		var morevalue=ex.data.value||{};
		for(var pos in morevalue)
       	       {
                if(val[pos]) {
                        val[pos]+=morevalue[pos];
                        }
                else {
                        val[pos]=morevalue[pos];
                        }
                }
				postMessage({'value':val});
	
	}


}

 function getKeys (hash)
{
  var keys = [];
  for(var i in hash) 
  {
    keys.push(i);
  }
  return keys;
}
