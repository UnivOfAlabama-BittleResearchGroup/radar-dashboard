var map = new maplibregl.Map({
    container: 'map',
    style:
        'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: [0, 0],
    zoom: 0.5
});

// Create a GeoJSON source with an empty lineString.
var geojson = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': [[0, 0]]
            }
        }
    ]
};

var speedFactor = 30; // number of frames per longitude degree
var animation; // to store and cancel the animation
var startTime = 0;
var progress = 0; // progress = timestamp - startTime
var resetTime = false; // indicator of whether time reset is needed for the animation
var pauseButton = document.getElementById('pause');

map.on('load', function () {
    map.addSource('line', {
        'type': 'geojson',
        'data': geojson
    });

    // add the line which will be modified in the animation
    map.addLayer({
        'id': 'line-animation',
        'type': 'line',
        'source': 'line',
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#ed6498',
            'line-width': 5,
            'line-opacity': 0.8
        }
    });

    startTime = performance.now();

    animateLine();

    // click the button to pause or play
    pauseButton.addEventListener('click', function () {
        pauseButton.classList.toggle('pause');
        if (pauseButton.classList.contains('pause')) {
            cancelAnimationFrame(animation);
        } else {
            resetTime = true;
            animateLine();
        }
    });

    // reset startTime and progress once the tab loses or gains focus
    // requestAnimationFrame also pauses on hidden tabs by default
    document.addEventListener('visibilitychange', function () {
        resetTime = true;
    });

    // animated in a circle as a sine wave along the map.
    function animateLine(timestamp) {
        if (resetTime) {
            // resume previous progress
            startTime = performance.now() - progress;
            resetTime = false;
        } else {
            progress = timestamp - startTime;
        }

        // restart if it finishes a loop
        if (progress > speedFactor * 360) {
            startTime = timestamp;
            geojson.features[0].geometry.coordinates = [];
        } else {
            var x = progress / speedFactor;
            // draw a sine wave with some math.
            var y = Math.sin((x * Math.PI) / 90) * 40;
            // append new coordinates to the lineString
            geojson.features[0].geometry.coordinates.push([x, y]);
            // then update the map
            map.getSource('line').setData(geojson);
        }
        // Request the next frame of the animation.
        animation = requestAnimationFrame(animateLine);
    }
});