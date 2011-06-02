Sunng's Simple Heatmap
======================

This is a simple heatmap api based on HTML5 canvas.

You can find an interactive demo at [http://sunng.info/heatmap/](http://sunng.info/heatmap/ "Visit the live demo")


Usage
-----

### 1. Create the HeatMap object ###

You can pass the canvas element object or its id to the constructor:

    var heatmap = new HeatMap("canvasId");

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

    v = step * d<sup>degree</sup>

A set of constants are predefined for degree:

* HeatMap.LINEAR
* HeatMap.QUAD
* HeatMap.CUBIC

For the third parameter of *render*, you can define a custom
function to define color of pixels. For instance, we can use a 
mono-hue color scheme by this function:

    var colorscheme = function(value){
        var light = value * 100;
        return "hsl(20, 75%, "+light+"%)";
    }
    heatmap.render(null, null, colorscheme);

The *value* for this function is guaranteed in (0,1].

### 4. Remove everything we just created ###

Call *clear* to erase the canvas and remove all data cached 
in *heatmap* instance.

    heatmap.clear();

GoogleMap extension
-------------------

HeatMap can be used as an *OverlayView* in GoogleMaps API V3.

Simply use the Map instance to create an *HeatMapOverlayView*    

    var heatmap = new HeatmapOverlayView(map, options);

Additional options available:

* *step*, same as described in HeatMap.render
* *degree*, same as described in HeatMap.render
* *colorscheme*, same as described in HeatMap.render
* *opacity*, the opacity of overlay view, [0,1]

Add data to map:

    heatmap.pushData(latitude, longitude, value);

The map will be rendered automatically.
