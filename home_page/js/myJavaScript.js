const clientID='4ACEA4ZFEMXM2KWH3U54K0AMSKQRFGK4VQCEUDVPQVIF1QXZ';
const clientSecret='1IBYDVIO1PCMHVCWRTEDKEHCQ0MKFI1NE45FFT0UIKOISCGU';

var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        baseSearchUrl: 'https://api.foursquare.com/v2/venues/search?client_id='+clientID+'&client_secret='+clientSecret+'&v=20180323',
        baseRecUrl: 'https://api.foursquare.com/v2/venues/explore?client_id='+clientID+'&client_secret='+clientSecret+'&v=20180323',
        iconColors:[
          'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
          'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
        ],
        markerLabels:['1','2','3','4'],
        latitude:22.3351853259,
        longitude:114.170459318, // CityU  Location
        curLocation:[],
        near:'hongkong',
        limit:5,
        radius: 5000,
        section:'',
        recommendResult:{},
        //for debug
        recommendList:[{"id":"4b107f95f964a520c17123e3","name":"山頂晨運徑","address":"Harlech Rd and Lugard Rd","geoCode":{"lat":22.2780082676673,"lng":114.14443177978094},"category":"Trail"},{"id":"4bb697b3ef159c74493d76f7","name":"南蓮園池","address":"60 Fung Tak Rd","geoCode":{"lat":22.339033,"lng":114.204766},"category":"Garden"},{"id":"4b63ccd1f964a5202f922ae3","name":"龍脊","address":"Shek O Country Park","geoCode":{"lat":22.236153,"lng":114.243385},"category":"Trail"},{"id":"5180de88498e1752e3765ffb","name":"Big Grizzly Mountain Runaway Mine Cars","address":"Grizzly Gulch, Hong Kong Disneyland","geoCode":{"lat":22.309922623222846,"lng":114.04185962461733},"category":"Theme Park Ride / Attraction"},{"id":"4c6a79b5d0bdc9b6ba80a80b","name":"香港麗思卡爾頓酒店","address":"International Commerce Centre, 1 Austin Road West, (null), Tsim Sha Tsui","geoCode":{"lat":22.3034608,"lng":114.1602184},"category":"Hotel"}],
        totalPoints:0,
        recommendLists:{},
        finalRecommendLists:{},
        distanceMatrixs:{0:{},1:{},2:{},3:{},4:{}},
        nearResult:{},
        nearList:[],
        url:'',
        fetchCount:0,
        bestRouteName:{0:'',1:'',2:'',3:''},
        travelModes:['DRIVING','BICYCLING','TRANSIT','WALKING'],
        stops: ["Stop#1", "Stop#2", "Stop#3", "Stop#4"],
        category: ["Food", "Sight", "Coffee", "Drinks", "Arts", "Outdoors", "Shops","None"],
        defaultValue: {
            "None":0,
            "Food": 5,
            "Sight": 20,
            "Coffee": 5,
            "Drinks": 5,
            "Arts": 2,
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
        customSelect:{
          0:false,
          1:false,
          2:false,
          3:false
        },
        startPlace: 'Current Location',
        enableLike:false,
        like: false,
        wishlist:[
            {Origin: "Origin", Stop1: "Stop#1", Stop2: "Stop#2", Stop3: "Stop#3", Stop4: "Stop#4"},
            {Origin: "Origin", Stop1: "Stop#1", Stop2: "Stop#2", Stop3: "Stop#3", Stop4: "Stop#4"},
            {Origin: "Origin", Stop1: "Stop#1", Stop2: "Stop#2", Stop3: "Stop#3", Stop4: "Stop#4"},
            {Origin: "Origin", Stop1: "Stop#1", Stop2: "Stop#2", Stop3: "Stop#3", Stop4: "Stop#4"},
        ],

    },
    methods: {
        getRecPlace:function(section, n)
        {
          // console.log('getRecPlace');
          // console.log(section);
          this.searchRecommendation(section, n);
        },
        searchPlace: function(event)
        {
          // console.log('searchPlace');
            var url;
            if(this.longitude == undefined || this.latitude == undefined) {
                url = this.baseSearchUrl + '&ll=' + this.latitude + ',' + this.longitude + '&intent=browse'+'&limit=' + this.limit;
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
        searchRecommendation: function(section, whichStop)
        {
          // console.log('searchRecommendation');
          if(section == "None")
          {
              if(app.recommendLists[whichStop]!=undefined)
              {
                for(var i=0; i<app.recommendLists[whichStop].length; i++)
                {
                  if(Object.keys(app.recommendLists[whichStop][i].marker).length>0)
                  {
                    app.recommendLists[whichStop][i].marker.setMap(null);
                  }
                }
              }
              this.recommendLists[whichStop] = {};
              return;
          }
              app.customSelect[whichStop] = false;
              app.finalRecommendLists[whichStop] = [];
              console.log('searchRecommendation called');

              // if same stop#, remove previous markers
              if(app.recommendLists[whichStop]!=undefined) {
                for(var i=0; i<app.recommendLists[whichStop].length; i++) {
                  if(Object.keys(app.recommendLists[whichStop][i].marker).length>0) {
                    app.recommendLists[whichStop][i].marker.setMap(null);
                  }
                }
              }

              var url;
              if(this.longitude != undefined && this.latitude != undefined) {
                  url = this.baseRecUrl + '&ll=' + this.latitude + ',' + this.longitude + '&limit=' + this.limit;
              } else {
                  url = this.baseRecUrl + '&near=' + this.near + '&limit=' + this.limit;
              }
              // section
              url += '&section=' + section;

              if(this.radius.length>0)
              {
                  url += '&radius=' + this.radius;
              }
              fetch(url)
                  .then(response => response.json())
                  .then(myJson => {
                      //app.recommendResult = myJson;
                      app.recommendLists[whichStop]=app.generateRecList(myJson);
                      app.recommendLists[whichStop].forEach(function(item, index){
                        app.finalRecommendLists[whichStop][index] = {name:item.name,address:item.address};
                      });
                      app.totalPoints += app.limit;
                      app.drawRecMarkers(whichStop);
                      console.log(app.finalRecommendLists);
                  })
                  .catch(function(err) {
                      // Code for handling errors
                      console.log("fetch function error: " + err);
                  });

              this.url = url;



        },
        generateRecList:function(list) {
          // console.log('generateRecList');
            var ret = [];
            if(Object.keys(list).length > 0 && list.meta.code == 200) { // fetch successfully
                list.response.groups[0].items.forEach(function(item, index){
                    var tmp =
                        {
                            id:item.venue.id,
                            name:item.venue.name,
                            address:item.venue.location.address,
                            geoCode:{
                                lat:item.venue.location.lat,
                                lng:item.venue.location.lng,
                            },
                            marker:{}
                        };
                    if(item.venue.categories.length > 0){
                        tmp.category=item.venue.categories[0].name;
                    }
                    ret.push(tmp);
                });
            } else {
                console.log("fetch data error");
            }
            console.log(ret);
            return ret;
        },
        fetchRoute:function(origins, dests, travelMode, totalStops) //DRIVING,BICYCLING,TRANSIT,WALKING
        {
            var originArr=[];
            var destArr=[];
            origins.forEach(function(item, index){
                if(item.name!=undefined){
                  originArr.push(item.name);
                }else {
                  console.log("can't find name for "+item);
                }

            });

            dests.forEach(function(item, index){
              if(item.address!=undefined){
                destArr.push(item.address);
              } else if(item.name!=undefined){
                destArr.push(item.name);
              }
              else {
                console.log("can't find name for "+item);
              }
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

            function callback(response, status)
            {
                // See Parsing the Results for
                // the basics of a callback function.
                console.log(response);
                console.log(status);
                app.distanceMatrixs[app.fetchCount] = response;
                app.fetchCount++;
                if(app.fetchCount >= totalStops)
                {
                  app.computeRoute(totalStops);
                }
            }

        },
        firstFetch:function(origin, dests, travelMode, totalStops){
            var destArr=[];
            dests.forEach(function(item, index){
              if(item.address!=undefined)
              {
                destArr.push(item.address);
              } else if(item.name!=undefined)
              {
                destArr.push(item.name);
              } else
              {
                console.log("can't find name for "+item);
              }
            });
            console.log(destArr);
            var service = new google.maps.DistanceMatrixService();
            console.log(origin);
            service.getDistanceMatrix(
            {
                    origins: [origin],
                    destinations: destArr,
                    travelMode: travelMode,
                    // transitOptions: TransitOptions,
                    // drivingOptions: DrivingOptions,
                    // unitSystem: UnitSystem,
                    // avoidHighways: Boolean,
                    // avoidTolls: Boolean,
            }, callback);

            function callback(response, status)
            {
                // See Parsing the Results for
                // the basics of a callback function.
                console.log(response);
                console.log(status);
                app.distanceMatrixs[app.fetchCount] = response;
                app.fetchCount++;
                if(app.fetchCount >= totalStops)
                {
                  app.computeRoute();
                }
            }

        },
        drawRecMarkers: function(whichStop){
          // console.log('drawRecMarkers');
            app.recommendLists[whichStop].forEach(function(item, index) {

                var myMark = new google.maps.Marker({
                    map: map,
                    title: item.name,
                    // icon:app.iconColors[0],
                    label:app.markerLabels[whichStop],
                    animation: google.maps.Animation.DROP,
                    position: app.recommendLists[whichStop][index].geoCode,
                    info:whichStop,
                    index:index,
                });
                var infowindow = new google.maps.InfoWindow({
                    content: item.name
                });
                myMark.addListener('click', function() {
                    if(!app.customSelect[myMark.info]) // first time turn to customSelect
                    {
                      delete app.finalRecommendLists[myMark.info];
                      app.finalRecommendLists[myMark.info] = {};
                      app.totalPoints -= app.limit;
                    }
                    app.customSelect[myMark.info] = true;



                    if(app.finalRecommendLists[myMark.info][myMark.index] == undefined)
                    {
                       app.finalRecommendLists[myMark.info][myMark.index]=myMark.title;
                       myMark.setIcon(app.iconColors[2]);
                       myMark.setLabel('');
                       app.totalPoints += 1;
                    } else
                    {
                       delete app.finalRecommendLists[myMark.info][myMark.index];
                       app.totalPoints -= 1;
                       myMark.setIcon();
                       myMark.setLabel(''+(myMark.info+1));
                    }
                });
                myMark.addListener('mouseover', function()
                {
                    infowindow.open(map, myMark);
                });
                myMark.addListener('mouseout', function()
                {
                    infowindow.close();
                });
                app.recommendLists[whichStop][index].marker = myMark;
            });
        },
        goClicked:function()
        {
          this.fetchCount = 0;
          var stops = Object.keys(app.finalRecommendLists).length;
          console.log(stops)
          if(stops<4 && app.finalRecommendLists[stops] != undefined)
          { //check if the user skip a stop
            alert("Don't leave middle stop blank");
            return;
          }

          var curLocation = {lat: app.latitude, lng: app.longitude};
          app.firstFetch(curLocation, app.finalRecommendLists[0], app.travelModes[0] ,stops);
          for (var i = 0; i < stops-1; i++)
          {
            app.fetchRoute(app.finalRecommendLists[i], app.finalRecommendLists[i+1], app.travelModes[0] ,stops);
          }
          this.enableLike = true;

        },
        reset:function()
        {
          console.log('f');
          // clear makers on the map
          if(app.recommendLists[whichStop]!=undefined)
          {
            for(var i=0; i<app.recommendLists[whichStop].length; i++)
            {
              if(Object.keys(app.recommendLists[whichStop][i].marker).length>0)
              {
                app.recommendLists[whichStop][i].marker.setMap(null);
              }
            }
          }
          //
          app.recommendLists = {};
          this.like = false;
          this.enableLike = false;
        },
        likeClicked:function()
        {
          if(!this.enableLike)
          {
            alert('Please check Go! to get a route first');
            return;
          }
          // TODO: if not login alert('please log in');
        },
        computeRoute:function (totalStops)
        {
          console.log('computeRoute called');
          var minDist = 999999;
          var dij = {};
          var routePoints = {0:0,1:0,2:0,3:0,4:0};
          for(var a = 0; a <= totalStops; a++)
          {
            var tmpDist = 0;
              routePoints[a] = 0;// the first start place
              var rows =  app.distanceMatrixs[a].rows.elements;
              for (var b = 0; b < a.length; b++) // start
              {
                routePoints[1] = b;
                for(var c=0; c < rows[b].length; c++) // dest
                {}
                var time =0;
                routePoints[1] = b;
                tmpDist += 1;
              }
          }
        },
        showBestRoute:function(list,travelMode)
        {
          // clear previous route display
          for(var i=0; i<4; i++)
          {
            directionsDisplay[i].setMap(null);
            directionsDisplay[i].setMap(map);
          }
          // Display bestRoute
          var count = 0;
          for(var i=0; i<list.length-1;i++)
          {
            var request =
            {
                origin: list[i].name,
                destination: list[i+1].name,

                // Note that Javascript allows us to access the constant
                // using square brackets and a string value as its
                // "property."
                travelMode: travelMode
            };

            directionsService.route(request, function(response, status)
            {
              if (status == 'OK')
              {
                if(directionsDisplay[count]==undefined){
                  console.log(count);
                } else {
                    directionsDisplay[count].setDirections(response);
                }
                count += 1;
              }
            });
          }

        }
    },
    computed:{

    }
});
