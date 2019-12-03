function mapbox_init() {
    // MAPBOX
    mapboxgl.accessToken = 'pk.eyJ1Ijoib3BhbDkiLCJhIjoiY2szYjB4djJnMDZmcjNicGl2NzJreGtjbiJ9.evKRAMb-mO-4VEmgWjLuEw';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location, also 'mapbox://styles/mapbox/light-v10',
        center: [-123.09817, 49.23340], // starting position [lng, lat]
        zoom: 11, // starting zoom, can be float
        attributionControl: false
    });

    var geocoder = new MapboxGeocoder({ // Initialize the geocoder
        accessToken: mapboxgl.accessToken, // Set the access token
        mapboxgl: mapboxgl, // Set the mapbox-gl instance
        marker: true, // Use default marker
    });

    map.on('load', function () {
        var mapCanvas = document.getElementsByClassName('mapboxgl-canvas')[0];
        var mapDiv = document.getElementById('map');
        //mapDiv.style.width = '50%';
        //mapCanvas.style.width = '100%';

        map.resize();
        // Listen for the `result` event from the Geocoder
        // `result` event is triggered when a user makes a selection
        //  Add a marker at the result's coordinates
        geocoder.on('result', function (e) {
            map.getSource('single-point').setData(e.result.geometry);
        });
    });

    // Add geocoder to its div
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
    let geocoderInput = document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[0];
    document.getElementsByClassName('mapboxgl-ctrl-geocoder')[0].style.width = "100%";
    console.log(geocoderInput);
    geocoderInput.placeholder = 'In this location...';
    geocoderInput.style.width = "10";
    geocoderInput.style.fontSize = "1.2em";
    console.log('mapbox setup done');
    
}