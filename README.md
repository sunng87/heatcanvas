heatcanvas
======================

This is a simple heatmap api based on HTML5 canvas. A heat map is a graphical representation of data where the values taken by a variable in a two-dimensional table are represented as colors, according to Wikipedia.

You can find an interactive demo at [http://sunng87.github.com/heatcanvas](http://sunng87.github.com/heatcanvas "Visit the live demo")

Available via bower
-------------------

`bower install heatcanvas`

Usage
-----

### 1. Create the HeatCanvas object ###

You can pass the canvas element object or its id to the constructor:

    var heatmap = new HeatCanvas("canvasId");

### 2. Add some data ###

Add *value* to point (*x*,*y*) in canvas coordinate system.

    heatmap.add(x, y, value);

### 3. Render the map ###

Call the *render* function on *heatmap* to draw it.

    heatmap.render();

We use a simple formula to determine value of a pixel, by its
distance to a point that holds data:

    v = f(d)

The first two optional parameters of *render* define the formula.

* *step* 
* *degree* 

    v = &Sigma;(data<sub>i</sub> - step * d<sup>degree</sup>)

A set of constants are predefined for degree:

* HeatCanvas.LINEAR
* HeatCanvas.QUAD
* HeatCanvas.CUBIC

For the third parameter of *render*, you can define a custom
function to define color of pixels. For instance, we can use a 
mono-hue color scheme by this function:

    var colorscheme = function(value){
        return [0.3, 0.75, value, 1];
    }
    heatmap.render(null, null, colorscheme);

The *value* for this function is guaranteed in (0,1].

### 4. Remove everything we just created ###

Call *clear* to erase the canvas and remove all data cached 
in *heatmap* instance.

    heatmap.clear();

GoogleMap extension
-------------------

HeatCanvas can be used as an *OverlayView* in GoogleMaps API V3.

Simply use the Map instance to create an *HeatCanvasOverlayView*    

    var heatmap = new HeatCanvasOverlayView(map, options);

Additional options available:

* *step*, same as described in HeatCanvas.render
* *degree*, same as described in HeatCanvas.render
* *colorscheme*, same as described in HeatCanvas.render
* *opacity*, the opacity of overlay view, [0,1]

Add data to map:

    heatmap.pushData(latitude, longitude, value);

The map will be rendered automatically.

OpenLayers extension
--------------------

Also we have a OpenLayer extension for you to embed heat map in your custom
map application and OpenStreetMap.

The usage is still similar to GoogleMaps. First, construct your heat map
layer with a *name*, *OpenLayers map instance*, *layer options* and
*HeatCanvas options*:

    var heatmap = new OpenLayers.Layer.HeatCanvas("HeatCanvas", map, {},
            {'step':0.3, 'degree':HeatCanvas.QUAD, 'opacity':0.8});

Add data to layer:

    heatmap.pushData(latitude, longitude, value);

Add layer to map:

    map.addLayer(heatmap);

Other extensions
----------------

There are also HeatCanvas extensions for:

* Baidu Map ([demo](http://sunng87.github.com/heatcanvas/baidumap.html "BaiduMap Demo"))
* Cloudmade Leaflet ([demo](http://sunng87.github.com/heatcanvas/leaflet.html "Leaflet Demo"))

These extensions share similar API mentioned above. You can browse the source
code of our demos to get detail.

License
-------

HeatCanvas is released according to MIT License.

Thanks
------

* @lbt05 for his patches on GoogleMap extension and BaiduMap implementation 
* @dazuma for his suggestion to speed up canvas rendering.

