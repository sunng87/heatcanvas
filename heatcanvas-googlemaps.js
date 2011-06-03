
function HeatCanvasOverlayView(map, options){
    options = options || {};
    this.setMap(map);
    this.heatmap = null;
    this.step = options.step || 1;
    this.degree = options.degree || HeatCanvas.LINEAR;
    this.opacity = options.opacity || 0.6;
    this.colorscheme = options.colorscheme || null;
    this.data = [];
}

HeatCanvasOverlayView.prototype = new google.maps.OverlayView();

HeatCanvasOverlayView.prototype.onAdd = function(){
    var proj = this.getProjection();
    var sw = proj.fromLatLngToDivPixel(this.getMap().getBounds().getSouthWest());
    var ne = proj.fromLatLngToDivPixel(this.getMap().getBounds().getNorthEast());

    var container = document.createElement("div");
    container.style.cssText = "position:absolute;top:0;left:0;border:0";
    container.style.width = "100%";
    container.style.height = "100%";
    var canvas = document.createElement("canvas");

    canvas.style.width = ne.x-sw.x+"px";
    canvas.style.height = sw.y-ne.y+"px";
    canvas.width = parseInt(canvas.style.width);
    canvas.height = parseInt(canvas.style.height);
    canvas.style.opacity = this.opacity;
    container.appendChild(canvas);

    this.heatmap = new HeatCanvas(canvas);
    
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(container);
    this._div = container;
}

HeatCanvasOverlayView.prototype.pushData = function(lat, lon, value) {
    this.data.push({"lon":lon, "lat":lat, "v":value});
}

HeatCanvasOverlayView.prototype.draw = function() {
    var proj = this.getProjection();
    // fit current viewport
    var sw = proj.fromLatLngToDivPixel(this.getMap().getBounds().getSouthWest());
    var ne = proj.fromLatLngToDivPixel(this.getMap().getBounds().getNorthEast());

    // Resize the image's DIV to fit the indicated dimensions.
    var div = this._div;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';

    this.heatmap.clear();
    if (this.data.length > 0) {
        for (var i=0, l=this.data.length; i<l; i++) {
            latlon = new google.maps.LatLng(this.data[i].lat, this.data[i].lon);
            localXY = proj.fromLatLngToContainerPixel(latlon);
            this.heatmap.push(
                    Math.floor(localXY.x), 
                    Math.floor(localXY.y), 
                    this.data[i].v);
        }

        this.heatmap.render(this.step, this.degree, this.colorscheme);
    }
}

