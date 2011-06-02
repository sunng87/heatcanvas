
function HeatmapOverlayView(map, options){
    options = options || {};
    this.setMap(map);
    this.heatmap = null;
    this.step = options.step || 1;
    this.degree = options.degree || HeatMap.LINEAR;
    this.opacity = options.opacity || 0.6;
    this.data = [];
}

HeatmapOverlayView.prototype = new google.maps.OverlayView();

HeatmapOverlayView.prototype.onAdd = function(){
    var container = document.createElement("div");
    container.style.cssText = "position:absolute;top:0;left:0;border:0";
    container.style.width = "100%";
    container.style.height = "100%";
    var canvas = document.createElement("canvas");
    canvas.style.width = this.map.getDiv().style.width;
    canvas.style.height = this.map.getDiv().style.height;
    canvas.width = parseInt(canvas.style.width);
    canvas.height = parseInt(canvas.style.height);
    canvas.style.opacity = this.opacity;
    container.appendChild(canvas);

    this.heatmap = new HeatMap(canvas);
    
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(container);
}

HeatmapOverlayView.prototype.pushData = function(lat, lon, value) {
    this.data.push({"lon":lon, "lat":lat, "v":value});
}

HeatmapOverlayView.prototype.draw = function() {
    this.heatmap.clear();
    if (this.data.length > 0) {
        var proj = this.getProjection();
        for (var i=0, l=this.data.length; i<l; i++) {
            latlon = new google.maps.LatLng(this.data[i].lat, this.data[i].lon);
            localXY = proj.fromLatLngToContainerPixel(latlon);
            this.heatmap.push(
                    Math.floor(localXY.x), 
                    Math.floor(localXY.y), 
                    this.data[i].v);
        }

        this.heatmap.render(this.step, this.degree);
    }
}

