const clientID='4ACEA4ZFEMXM2KWH3U54K0AMSKQRFGK4VQCEUDVPQVIF1QXZ';
const clientSecret='1IBYDVIO1PCMHVCWRTEDKEHCQ0MKFI1NE45FFT0UIKOISCGU';
var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        baseSearchUrl: 'https://api.foursquare.com/v2/venues/search?client_id='+clientID+'&client_secret='+clientSecret+'&v=20180323',
        baseRecUrl: 'https://api.foursquare.com/v2/venues/explore?client_id='+clientID+'&client_secret='+clientSecret+'&v=20180323',
        latitude:114.170459318,
        longitude:22.3351853259, // CityU  Location
        near:'hongkong',
        limit:'5',
        radius: 5000,
        section:'',
        recommendResult:{},
        recommendList:[{"id":"4b107f95f964a520c17123e3","name":"山頂晨運徑","address":"Harlech Rd and Lugard Rd","geoCode":{"lat":22.2780082676673,"lng":114.14443177978094},"category":"Trail"},{"id":"4bb697b3ef159c74493d76f7","name":"南蓮園池","address":"60 Fung Tak Rd","geoCode":{"lat":22.339033,"lng":114.204766},"category":"Garden"},{"id":"4b63ccd1f964a5202f922ae3","name":"龍脊","address":"Shek O Country Park","geoCode":{"lat":22.236153,"lng":114.243385},"category":"Trail"},{"id":"5180de88498e1752e3765ffb","name":"Big Grizzly Mountain Runaway Mine Cars","address":"Grizzly Gulch, Hong Kong Disneyland","geoCode":{"lat":22.309922623222846,"lng":114.04185962461733},"category":"Theme Park Ride / Attraction"},{"id":"4c6a79b5d0bdc9b6ba80a80b","name":"香港麗思卡爾頓酒店","address":"International Commerce Centre, 1 Austin Road West, (null), Tsim Sha Tsui","geoCode":{"lat":22.3034608,"lng":114.1602184},"category":"Hotel"}],
        nearResult:{},
        nearList:[],
        url:'',
        stops: ["Stop#1", "Stop#2", "Stop#3", "Stop#4"],
        category: ["Food", "Sight", "Coffee", "Drinks", "Arts", "Outdoors", "Shops"],
        defaultValue: {
            "Food": 5,
            "Sight": 20,
            "Coffee": 5,
            "Drinks": 5,
            "Arts": 20,
            "Outdoors": 30,
            "Shops": 5,
            "Stop#1": 30,
            "Stop#2": 30,
            "Stop#3": 30,
            "Stop#4": 30,
        },
        sliderValue: {
            "Stop#1": 30,
            "Stop#2": 30,
            "Stop#3": 30,
            "Stop#4": 30,
        },
        startPlace: 'Current Location',
        like: false,
    },
    methods: {
        searchPlace: function(event) {
            var url;
            if(this.longitude == undefined || this.latitude == undefined) {
                url = this.baseSearchUrl + '&ll=' + this.longitude + ',' + this.latitude + '&intent=browse'+'&limit=' + this.limit;
            } else {
                url = this.baseSearchUrl + '&near=' + this.near + '&limit=' + this.limit;
            }
            if(this.radius.length>0 &&this.radius.length<100000)
            {
                url += '&radius=' + this.radius;
            }
            fetch(url)
                .then(response => response.json())
                .then(myJson => this.nearResult = myJson)
                .catch(function() {
                    // Code for handling errors
                    console.log("error");
                });
            this.url = url;
        },
        searchRecommendation: function(event) {
            console.log('recommendation called');
            var url;
            //check inputs
            if(this.limit>30) {
                alert("Maximum is 30 results");
                this.limit=30;
            }
            if(this.radius>100000)
            {
                alert("Maximum radius is 100,000 meters");
                this.radius=100000;
            }
            if(this.longitude == undefined || this.latitude == undefined) {
                url = this.baseRecUrl + '&ll=' + this.longitude + ',' + this.latitude + '&limit=' + this.limit;
            } else {
                url = this.baseRecUrl + '&near=' + this.near + '&limit=' + this.limit;
            }
            if(this.section.length>0)
            {
                url += '&section=' + this.section;
            }
            if(this.radius.length>0)
            {
                url += '&radius=' + this.radius;
            }
            fetch(url)
                .then(response => response.json())
                .then(myJson => {
                    this.recommendResult = myJson;
                    this.generateRecList();
                })
                .catch(function(err) {
                    // Code for handling errors
                    console.log("fetch function error: " + err);
                });

            this.url = url;



        },
        generateRecList:function() {
            if(Object.keys(this.recommendResult).length > 0 && this.recommendResult.meta.code == 200) { // fetch successfully
                this.recommendResult.response.groups[0].items.forEach(function(item, index){
                    var tmp =
                        {
                            id:item.venue.id,
                            name:item.venue.name,
                            address:item.venue.location.address,
                            geoCode:{
                                lat:item.venue.location.lat,
                                lng:item.venue.location.lng,
                            }
                        };
                    if(item.venue.categories.length > 0){
                        tmp.category=item.venue.categories[0].name;
                    }
                    app.recommendList.push(tmp);
                });
            } else {
                console.log("fetch data error");
            }
        },
        computeRoute:function(origins, dests, travelMode){

            var originArr=[];
            var destArr=[];
            origins.forEach(function(item, index){
                originArr.push(item.name);
            });

            dests.forEach(function(item, index){
                destArr.push(item.name);
            });

            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
                {
                    origins: originArr,
                    destinations: destArr,
                    travelMode: travelMode,
                    // transitOptions: TransitOptions,
                    // drivingOptions: DrivingOptions,
                    // unitSystem: UnitSystem,
                    // avoidHighways: Boolean,
                    // avoidTolls: Boolean,
                }, callback);

            function callback(response, status) {
                // See Parsing the Results for
                // the basics of a callback function.
                console.log(response);
                console.log(status);
            }

        }
    },
    computed:{
        drawRecMarkers: function(){
            this.recommendList.forEach(function(item, index) {
                var myMark = new google.maps.Marker({
                    map: map,
                    title: item.name,
                    position: app.recommendList[index].geoCode
                });
                var infowindow = new google.maps.InfoWindow({
                    content: item.name
                });
                myMark.addListener('mouseover', function() {
                    infowindow.open(map, myMark);
                });
                myMark.addListener('mouseout', function() {
                    infowindow.close();
                });
            });
        }
    }
});