var map, directionsService;
var  directionsDisplay=[];
function initAutocomplete() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 22.3351853259, lng: 114.170459318},
        zoom: 14,
        mapTypeId: 'roadmap'
    });
    for(var i=0; i<4; i++) {
      directionsDisplay.push(new google.maps.DirectionsRenderer({suppressMarkers: true}));
    }

    directionsService = new google.maps.DirectionsService();
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');

    var autocomplete = new google.maps.places.Autocomplete(input);

    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
        map: map
    });
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });

    autocomplete.addListener('place_changed', function() {
        infowindow.close();
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        // Set the position of the marker using the place ID and location.
        marker.setPlace({
            placeId: place.place_id,
            location: place.geometry.location
        });
        marker.setVisible(true);

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
            'Place ID: ' + place.place_id + '<br>' +
            place.formatted_address + '<br>' + place.international_phone_number + '<br><a href="' + place.website + '">website</a></div>'
            + '<button>Set As Current</button>');
        infowindow.open(map, marker);

    });

    var curMarkers;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
            app.longitude = position.coords.longitude;
            app.latitude = position.coords.latitude;
            curMarkers = new google.maps.Marker({
                map: map,
                title: 'current location',
                animation: google.maps.Animation.DROP,
                position: initialLocation
            });
        });
    }

//For convertion from place to lon,lat.
    var geocoder = new google.maps.Geocoder();

    // document.getElementById('submit').addEventListener('click', function() {
    //     geocodeAddress(geocoder, map);
    // });

}

function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });

}
