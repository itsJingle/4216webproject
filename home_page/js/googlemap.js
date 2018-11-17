var map, directionsService;
var  directionsDisplay=[];
var geocoder, forDebug;
function initAutocomplete() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 22.3351853259, lng: 114.170459318},
        zoom: 14,
        mapTypeId: 'roadmap'
    });
    const color=['#ff0000','#00ff00','#0000ff','#ffff00'];
    for(var i=0; i<4; i++) {
      //directionsDisplay.push(new google.maps.DirectionsRenderer({suppressMarkers: true}));
      directionsDisplay.push(new google.maps.DirectionsRenderer({polylineOptions:{strokeColor:color[i],strokeWeight:5-i}, suppressMarkers:true }));

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
        forDebug = place.geometry.location.lat();
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
            place.formatted_address + '<br>' + place.international_phone_number
            + '<br><a href="' + place.website + '">website</a></div>'
            + '<button onclick="setCurrentLocation(\'' + place.name +  '\', '
            + place.geometry.location.lat()  + ',' + place.geometry.location.lng()
             + ')">Set As Current Location</button>');
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
    geocoder = new google.maps.Geocoder();

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

function setCurrentLocation(placeName, lat, lng) {
  document.getElementById('currentLocation').innerText = placeName;
  app.latitude = lat;
  app.longitude = lng;
  console.log('lat:'+app.latitude +', lng:'+app.longitude);

}
