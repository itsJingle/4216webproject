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
        curLocation:"Current Location",
        near:'hongkong',
        limit:5,
        oldLimit:5,
        radius: 5000,
        section:'',
        recommendResult:{},
        //for debug
        recommendList:[{"id":"4b107f95f964a520c17123e3","name":"山頂晨運徑","address":"Harlech Rd and Lugard Rd","geoCode":{"lat":22.2780082676673,"lng":114.14443177978094},"category":"Trail"},{"id":"4bb697b3ef159c74493d76f7","name":"南蓮園池","address":"60 Fung Tak Rd","geoCode":{"lat":22.339033,"lng":114.204766},"category":"Garden"},{"id":"4b63ccd1f964a5202f922ae3","name":"龍脊","address":"Shek O Country Park","geoCode":{"lat":22.236153,"lng":114.243385},"category":"Trail"},{"id":"5180de88498e1752e3765ffb","name":"Big Grizzly Mountain Runaway Mine Cars","address":"Grizzly Gulch, Hong Kong Disneyland","geoCode":{"lat":22.309922623222846,"lng":114.04185962461733},"category":"Theme Park Ride / Attraction"},{"id":"4c6a79b5d0bdc9b6ba80a80b","name":"香港麗思卡爾頓酒店","address":"International Commerce Centre, 1 Austin Road West, (null), Tsim Sha Tsui","geoCode":{"lat":22.3034608,"lng":114.1602184},"category":"Hotel"}],
        totalPoints:0,
        recommendLists:{},
        finalRecommendLists:{},
        distanceMatrixs:new Array(4),
        nearResult:{},
        nearList:[],
        url:'',
        picSize:'286x180',
        fetchCount:0,
        bestRouteName:[0,0,0,0,0],
        bestRouteAddress:[0,0,0,0,0],
        bestRouteDetails:[0,0,0,0],
        travelModes:['DRIVING','BICYCLING','TRANSIT','WALKING'],
        travelMode:'WALKING',
        stops: ["Stop#1", "Stop#2", "Stop#3", "Stop#4"],
        category: ["Food", "Sight", "Coffee", "Arts", "Outdoors", "Shops"],
        defaultValue: {
            "Food": 5,
            "Sight": 20,
            "Coffee": 5,
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
        wishList:[
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
          app.searchRecommendation(section, n);
        },
        searchRecommendation: function(section, whichStop)
        {
          // clear previous route display
          for(var i=0; i<4; i++)
          {
            directionsDisplay[i].setMap(null);
          }
          // console.log('searchRecommendation');
          if(section.includes('Stop'))
          {
              // clear markers

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
              app.recommendLists[whichStop] = {};
              return;
          }
              app.customSelect[whichStop] = false;
              app.finalRecommendLists[whichStop] = [];


              // if same stop#, remove previous markers
              if(app.recommendLists[whichStop]!=undefined) {
                for(var i=0; i<app.recommendLists[whichStop].length; i++) {
                  if(Object.keys(app.recommendLists[whichStop][i].marker).length>0) {
                    app.recommendLists[whichStop][i].marker.setMap(null);
                  }
                }
              }

              var url;
              if(app.longitude != undefined && app.latitude != undefined) {
                  url = app.baseRecUrl + '&ll=' + app.latitude + ',' + app.longitude + '&limit=' + app.limit;
              } else {
                  url = app.baseRecUrl + '&near=' + app.near + '&limit=' + app.limit;
              }
              // section

              url += '&section=' + section;

              if(app.sliderValue["Stop#" + (whichStop+1)]>0)
              {
                  url += '&radius=' + (app.sliderValue["Stop#" + (whichStop+1)]*1000);
              }
              fetch(url)
                  .then(response => response.json())
                  .then(myJson => {
                      //app.recommendResult = myJson;
                      app.recommendLists[whichStop] = app.generateRecList(myJson);
                      app.recommendLists[whichStop].forEach(function(item, index){
                        app.finalRecommendLists[whichStop][index] =
                        {name:item.name,address:item.address,FSid:item.FSid};
                      });
                      app.totalPoints += app.limit;
                      app.drawRecMarkers(whichStop, 0);
                  })
                  .catch(function(err) {
                      // Code for handling errors
                      console.log("fetch function error: " + err);
                  });
        },
        generateRecList:function(list) {
          // console.log('generateRecList');
            var ret = [];
            if(Object.keys(list).length > 0 && list.meta.code == 200) { // fetch successfully
                list.response.groups[0].items.forEach(function(item, index){
                    var tmp =
                        {
                            FSid:item.venue.id,
                            name:item.venue.name,
                            address:item.venue.location.address,
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

            return ret;
        },
        fetchRoute:function(origins, dests, travelMode, thisStop, totalStops)
        {
            var originArr=[];
            var destArr=[];
            origins.forEach(function(item, index){
              if(item.name!=undefined)
              {
                if(item.address!=undefined)
                {
                  originArr.push(item.name + " " + item.address);
                }  else {
                  originArr.push(item.name);
                }
              } else if(item.address!=undefined)
              {
                originArr.push(item.address);
              }
              else {
                console.log("can't find name for "+item);
              }
            });

            dests.forEach(function(item, index){
              if(item.name!=undefined)
              {
                if(item.name!=undefined)
                {
                  destArr.push(item.name + " " + item.address);
                }  else {
                  destArr.push(item.address);
                }
              } else if(item.name!=undefined)
              {
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
                // console.log(response);
                // console.log(status);
                app.distanceMatrixs[thisStop] = response;
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
              if(item.name!=undefined)
              {
                if(item.address!=undefined)
                {
                  destArr.push(item.address + " " + item.name);
                }
                else
                {
                  destArr.push(item.name);
                }
              }
              else if(item.address!=undefined)
              {
                destArr.push(item.address);
              }
              else {
                  console.log("can't find name for "+item);
              }
            });
            var service = new google.maps.DistanceMatrixService();

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
                //console.log(response);
                //console.log(status);
                app.distanceMatrixs[0] = response;
                app.fetchCount++;
                if(app.fetchCount >= totalStops)
                {
                  app.computeRoute(totalStops);
                }


            }

        },
        drawSingleMarker: function(whichStop, index)
        {
          item = app.recommendLists[whichStop][index];
          var googleGeo, myMark;
          var address = "";
          if(item.address != undefined) {
            address += item.address;
          }
          if(item.name != undefined) {
            address += " " + item.name;
          }

          geocoder.geocode({'address': address}, function(results, status)
          {
              if (status === 'OK') {
                  googleGeo = results[0].geometry.location;
                  myMark = new google.maps.Marker({
                      map: map,
                      title: item.name,
                      // icon:app.iconColors[0],
                      label:app.markerLabels[whichStop],
                      animation: google.maps.Animation.DROP,
                      position: googleGeo,
                      info:whichStop,
                      index:index,
                      address:address
                  });
                  var onlyNameInfoWin = new google.maps.InfoWindow({
                      content: item.name
                  });
                  var isSelect = false;
                  var infowindow = new google.maps.InfoWindow({
                      content: '<strong>'+item.name+'</strong></br>'+
                      '<button onclick="app.selectClicked('+ whichStop + ',' + index + ', false, false' + ')">select</button>' +
                      '<button onclick="app.moreInfoClicked(' + whichStop + ',' + index + ', false, false' + ')">more info</button>'
                  });

                  myMark.addListener('click', function() {
                    onlyNameInfoWin.close();
                    infowindow.open(map, myMark);
                  });
                  myMark.addListener('mouseover', function()
                  {
                      onlyNameInfoWin.open(map, myMark);
                  });
                  myMark.addListener('mouseout', function()
                  {
                      onlyNameInfoWin.close();
                  });
                  app.recommendLists[whichStop][index].marker = myMark;
                  app.recommendLists[whichStop][index].infowindow = infowindow;
                }
                else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT)
                {
                  alert(status);
                  setTimeout(app.drawSingleMarker(whichStop, index), 1000);

                }
                else
                {
                  alert('Geocode was not successful for the following reason: ' + status
                  + "\nname:" + item.name + "\naddress:" + item.address);
                  app.recommendLists[whichStop].splice(index, 1);
                  if(!app.customSelect[whichStop]){
                    app.finalRecommendLists[whichStop].splice(index, 1);
                  }
                }
          });
        },
        selectClicked: function(whichStop, index, isSelect, isMoreInfo) {
          isSelect = !isSelect;
          var myMark = app.recommendLists[whichStop][index].marker;
          if(!app.customSelect[myMark.info]) // first time turn to customSelect
          {
            delete app.finalRecommendLists[myMark.info];
            app.finalRecommendLists[myMark.info] = new Array();
            app.totalPoints -= app.limit;
          }
          app.customSelect[myMark.info] = true;

          if(app.finalRecommendLists[myMark.info][myMark.index] == undefined)
          {
             app.finalRecommendLists[myMark.info][myMark.index]={name:myMark.title, address:myMark.address};
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
          var infowindow = app.recommendLists[whichStop][index].infowindow;
          var selectBtnText = isSelect? 'unselect':'select';
          var moreInfoBtnText=isMoreInfo? 'less info':'more info';
        },
        moreInfoClicked: function(whichStop, index, isSelect, isMoreInfo) {
            isMoreInfo = !isMoreInfo;
            var myMark = app.recommendLists[whichStop][index].marker;
            var selectBtnText = isSelect? 'unselect':'select';
            var moreInfoBtnText=isMoreInfo? 'less info':'more info';

            var infowindow = app.recommendLists[whichStop][index].infowindow;
            var fsid = app.recommendLists[whichStop][index].FSid;
            if(isMoreInfo)
            {
              var detailUrl= 'https://api.foursquare.com/v2/venues/' + fsid + '?client_id='+clientID+'&client_secret='+clientSecret+'&v=20180323';
              fetch(detailUrl)
                .then(res => res.json())
                .then(myJson => {

                  if(myJson.meta.code == '200') {
                    var name =  myMark.title;
                    var address = myJson.response.venue.location.address==undefined?"not avaliable":myJson.response.venue.location.address;
                    var phoneNum = "not avaliable";
                    var website = myJson.response.venue.url==undefined?"not avaliable":myJson.response.venue.url;
                    var fsWebsite = myJson.response.venue.canonicalUrl==undefined?"not avaliable":myJson.response.venue.canonicalUrl;
                    var likeNum = myJson.response.venue.likes.count==undefined?"0":myJson.response.venue.likes.count;
                    var rating = myJson.response.venue.rating==undefined?"N/A":myJson.response.venue.rating;
                    var photo = "";
                    var tip = "No tip";
                    try {
                      tip = myJson.response.venue.tips.groups[0].items[0].text==undefined?"not avaliable":myJson.response.venue.tips.groups[0].items[0].text;
                    } catch (e) {

                    }

                    var jsonContact = myJson.response.venue.contact;
                    if(Object.keys(jsonContact).length > 0) {
                      phoneNum = myJson.response.venue.contact.phone==undefined?"not avaliable":myJson.response.venue.contact.phone;
                    }

                    if(myJson.response.venue.photos.groups[1].items[0].prefix!=undefined && myJson.response.venue.photos.groups[1].items[0].suffix!=undefined)
                    {
                      photo = myJson.response.venue.photos.groups[1].items[0].prefix + app.picSize + myJson.response.venue.photos.groups[1].items[0].suffix;
                    }
                    var content = '<div style="width: 38rem"><div style="width: 50%; float: left"><img src="'
                    + photo + '"></div><div style="width: 50%; float: right"><br><h5>'
                    + myMark.title +'</h5><span style="color: darkslategrey">'
                    + address + '</span><br><span style="color: darkslategrey">Phone Number: '
                    + phoneNum +'</span><br><span style="color: darkslategrey">Link:'
                    + '<a href="'+website+' ">'
                        +  website + '</a ></span><br><span style="color: salmon">'
                    + tip + '</span></div></div></br>';
                    infowindow.setContent(content+
                    '<button onclick="app.selectClicked(' + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo + ')">' +
                    selectBtnText + '</button><button onclick="app.moreInfoClicked('
                    + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo +')">' + moreInfoBtnText + '</button>');
                  } else {
                    infowindow.setContent('<strong>' + name + '</strong></br><p>no more infomation of this place</p></br>' +
                    '<button onclick="app.selectClicked(' + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo + ')">' +
                    selectBtnText + '</button><button onclick="app.moreInfoClicked('
                    + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo +')">' + moreInfoBtnText + '</button>');
                  }
                })
                .catch(function(err) {
                    // Code for handling errors
                    infowindow.setContent('<strong>' + myMark.title + '</strong></br><p>no more infomation of this place</p></br>' +
                    '<button onclick="app.selectClicked(' + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo + ')">' +
                    selectBtnText + '</button><button onclick="app.moreInfoClicked('
                    + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo +')">' + moreInfoBtnText + '</button>');
                    console.log("fetch function error: " + err);
                });
                infowindow.setContent('<strong>'+myMark.title+'</strong></br><p>Loading</p></br>' +
                '<button onclick="app.selectClicked(' + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo + ')">' +
                selectBtnText + '</button><button onclick="app.moreInfoClicked('
                + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo +')">' + moreInfoBtnText + '</button>');
            }

            infowindow.setContent('<strong>'+myMark.title+'</strong></br>' +
            '<button onclick="app.selectClicked(' + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo + ')">' +
            selectBtnText + '</button><button onclick="app.moreInfoClicked('
            + whichStop + ',' + index + ',' + isSelect + ',' + isMoreInfo +')">' + moreInfoBtnText + '</button>');
        },
        drawRecMarkers: function(whichStop, start){

            app.recommendLists[whichStop].forEach(function(item, index) {
              if(index >= start)
              {
                //for(var index = start; index < app.recommendLists[whichStop].length; index++){

                  item = app.recommendLists[whichStop][index];
                  var googleGeo, myMark;
                  var address = "";
                  if(item.address != undefined) {
                    address += item.address;
                  }
                  if(item.name != undefined) {
                    address += " " + item.name;
                  }

                  geocoder.geocode({'address': address}, function(results, status)
                  {
                      if (status === 'OK') {
                          googleGeo = results[0].geometry.location;
                          myMark = new google.maps.Marker({
                              map: map,
                              title: item.name,
                              // icon:app.iconColors[0],
                              label:app.markerLabels[whichStop],
                              animation: google.maps.Animation.DROP,
                              position: googleGeo,
                              info:whichStop,
                              index:index,
                              address:address
                          });
                          var onlyNameInfoWin = new google.maps.InfoWindow({
                              content: item.name
                          });
                          var isSelect = false;
                          var infowindow = new google.maps.InfoWindow({
                              content: '<strong>'+item.name+'</strong></br>'+
                              '<button onclick="app.selectClicked('+ whichStop + ',' + index + ', false, false' + ')">select</button>' +
                              '<button onclick="app.moreInfoClicked(' + whichStop + ',' + index + ', false, false' + ')">more info</button>'
                          });

                          myMark.addListener('click', function() {
                            onlyNameInfoWin.close();
                            infowindow.open(map, myMark);
                          });
                          myMark.addListener('mouseover', function()
                          {
                              onlyNameInfoWin.open(map, myMark);
                          });
                          myMark.addListener('mouseout', function()
                          {
                              onlyNameInfoWin.close();
                          });
                          app.recommendLists[whichStop][index].marker = myMark;
                          app.recommendLists[whichStop][index].infowindow = infowindow;
                        }
                        else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT)
                        {
                          alert('Please wait, Google map:' + status);
                          setTimeout(app.drawSingleMarker(whichStop, index), 1000);

                        }
                        else
                        {
                          alert('Geocode was not successful for the following reason: ' + status
                          + "\nname:" + item.name + "\naddress:" + item.address);
                          app.recommendLists[whichStop].splice(index, 1);
                          if(!app.customSelect[whichStop]){
                            app.finalRecommendLists[whichStop].splice(index, 1);
                          }
                        }
                  });

              }

            });
        },
        goClicked:function()
        {
          this.fetchCount = 0;
          this.bestRouteName = [0,0,0,0,0];
          this.bestRouteAddress = [0,0,0,0,0];
          this.bestRouteDetails = [0,0,0,0],
          this.distanceMatrixs = new Array(4);
          var stops = Object.keys(app.finalRecommendLists).length;

          if(stops<4 && app.finalRecommendLists[stops] != undefined)
          { //check if the user skip a stop
            alert("Don't leave middle stop blank");
            return;
          }

          var curLocation = {lat: app.latitude, lng: app.longitude};
          app.firstFetch(curLocation, app.finalRecommendLists[0], app.travelMode, stops);
          for (var i = 0; i < stops-1; i++)
          {
            app.fetchRoute(app.finalRecommendLists[i], app.finalRecommendLists[i+1], app.travelMode, i+1, stops);
          }
          this.enableLike = true;

        },
        reset:function()
        {
          // console.log('reset');
          this.limit = 5;
          this.customSelect = {
            0:false,
            1:false,
            2:false,
            3:false
          };
          this.stops.splice(0, 4,"Stop#1", "Stop#2", "Stop#3", "Stop#4" );
          // clear previous route display
          for(var i=0; i<4; i++)
          {
            directionsDisplay[i].setMap(null);
            if(app.recommendLists[i]!=undefined)
            {
              for(var j = 0; j <app.recommendLists[i].length; j++)
              {
                if(Object.keys(app.recommendLists[i][j].marker).length>0)
                {
                  app.recommendLists[i][j].marker.setMap(null);
                }
              }
            }
          }
          // clear makers on the map

          //
          app.recommendLists = {};
          app.finalRecommendLists = {};
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
          else
          {

          }
          // TODO: if not login alert('please log in');
        },
        computeRoute:function (totalStops)
        {
          // console.log('computeRoute called: totalStops=' + totalStops);

          var dist = new Array(5);
          dist[0] = new Array(30);
          // start point
          for(var j = 0; j < 30; j++)
          {
              dist[0][j] = {
                d:0,
                parent:-1
              }
          }
          // initialization
          for(var i = 1; i<5; i++)
          {
            dist[i] = new Array(30);
            for(var j = 0; j < 30; j++)
            {
                dist[i][j] = {
                  d:99999999,
                  parent:-1
                }
            }
          }
          // Dijkstra
          for(var a = 0; a < totalStops; a++)
          {
            var originNum = app.distanceMatrixs[a].originAddresses.length;
            for(var b = 0; b < originNum; b++)
            {
                var neighborNum = app.distanceMatrixs[a].destinationAddresses.length;
                for(var c = 0; c < neighborNum; c++)
                {
                    var status = app.distanceMatrixs[a].rows[b].elements[c].status;
                    if(status == 'OK')
                    {
                        var durationVal = app.distanceMatrixs[a].rows[b].elements[c].duration.value;
                        if(dist[a+1][c].d > durationVal + dist[a][b].d)
                        {
                          dist[a+1][c].d = durationVal + dist[a][b].d;
                          dist[a+1][c].parent = b;
                        }
                    } else
                    {
                        alert('some destination is not avaliable in Google Map. \nStop#'+(a+1)+': No.'+(b+1)+app.distanceMatrixs[a].destinationAddresses[b]);
                        console.log('dist matrix error: '+ app.distanceMatrixs[a].destinationAddresses[b] + " a:" + a + ", b:" + b);
                        return;
                    }
                }
              }
          }

          // find min dist
          var minDist = 99999999;
          var minIndex = -1;
          for(var i = 0; i < app.distanceMatrixs[totalStops-1].destinationAddresses.length; i++ )
          {
            if(dist[totalStops][i].d < minDist) {
              minDist = dist[totalStops][i].d;
              minIndex = i;
            } else {
              console.log(dist[totalStops][i].d);
              console.log(dist);
            }
          }

          app.bestRouteAddress[0] = app.distanceMatrixs[0].originAddresses[0];
          app.bestRouteName[0] = app.distanceMatrixs[0].originAddresses[0];
          for(var i = totalStops; i > 0; i--)
          {
            //console.log("backwards: min route is "+minIndex);
            app.bestRouteAddress[i] = app.distanceMatrixs[i-1].destinationAddresses[minIndex];
            var tmp = Object.keys(app.finalRecommendLists[i-1])[minIndex];
            app.bestRouteName[i] = app.finalRecommendLists[i-1][tmp].name;
            app.bestRouteDetails[i-1] = {
              duration:app.distanceMatrixs[i-1].rows[dist[i][minIndex].parent].elements[minIndex].duration.text,
              distance:app.distanceMatrixs[i-1].rows[dist[i][minIndex].parent].elements[minIndex].distance.text,
            },
            minIndex = dist[i][minIndex].parent;
          }
          for(var i = totalStops; i < 4; i++){
            app.bestRouteName.pop();
            app.bestRouteAddress.pop();
            app.bestRouteDetails.pop();
          }

          app.showBestRoute(app.bestRouteAddress, app.travelMode);

        },
        showBestRoute:function(list,travelMode)
        {
          //console.log(list);
          // clear previous route display
          for(var i=0; i<4; i++)
          {
            directionsDisplay[i].setMap(null);
          }
          // Display bestRoute
          var count = 0;
          for(var i=0; i<list.length-1;i++)
          {
            var request =
            {
                origin: list[i],
                destination: list[i+1],

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
                    directionsDisplay[count].setMap(map);
                }
                count += 1;
              } else{
                console.log("directionsService failed: "+status);
                console.log("request: ");
                console.log(request);
                console.log("response:");
                console.log(response);
              }
            });

          }

        },
        resetLimit: function(){
          var url = new Array(4);
          for(var i=0; i<4; i++)
          {
            directionsDisplay[i].setMap(null);  //clear route
            if(!app.stops[i].includes('Stop#'))
            {
              if(app.customSelect[i] == false) {
                app.searchRecommendation(app.stops[i], i);
              } else
              {
                if(this.longitude != undefined && this.latitude != undefined) {
                    url[i] = this.baseRecUrl + '&ll=' + this.latitude + ',' + this.longitude + '&limit=' + this.limit;
                } else {
                    url[i] = this.baseRecUrl + '&near=' + this.near + '&limit=' + this.limit;
                }
                // section
                url[i] += '&section=' + app.stops[i];
              }
            }
          }


          url.forEach(function(item, whichStop){
            if(item != undefined)
            {
              // below are customSelect cases
              if(app.sliderValue["Stop#" + (whichStop+1)]>0)
              {
                  url += '&radius=' + (app.sliderValue["Stop#" + (whichStop+1)]*1000);
              }
              fetch(item)
                  .then(response => response.json())
                  .then(myJson => {
                      //app.recommendResult = myJson;
                      var newItemCount = 0;
                      var list = app.generateRecList(myJson);
                      // new limit is smaller:
                      if(list.length<app.recommendLists[whichStop].length)
                      {
                        app.recommendLists[whichStop].forEach(function(item, index){
                          var found = false;
                          list.forEach(function(itemList, indexList){
                            if(!found && itemList.name == [item.name]) {
                              found = true;
                            }
                          });
                          if(!found) {
                            var inFinal = false;

                            app.finalRecommendLists[whichStop].forEach(function(itemFinal, indexFinal){
                              if(itemFinal.name==item.name){
                                inFinal = true;
                              }
                            });
                            if(!inFinal){
                              app.recommendLists[whichStop][index].marker.setMap(null);
                            }

                          }
                        });
                      }
                      else
                      {
                        // new limit is larger:
                        list.forEach(function(item, index){
                          var found = false;
                          app.recommendLists[whichStop].forEach(function(itemRec, indexRec){
                            if(!found && itemRec.name == [item.name]) {
                              found = true;
                            }
                          });
                          if(!found) {
                            app.recommendLists[whichStop].push(item);
                            newItemCount += 1;
                          }
                        });
                        app.drawRecMarkers(whichStop, app.recommendLists[whichStop].length-newItemCount);
                      }

                  })
                  .catch(function(err) {
                      // Code for handling errors
                      console.log("fetch function error: " + err);
                  });
            }

          });
        },
        wishListDisplay:function(list) {

        },

    }, // methods ends here
    computed:{

    }
});
