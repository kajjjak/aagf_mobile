/*
Hacking route
RR = []; for (var r in route){ if (route[r]){ RR.push(route[r]); } }; route = RR;
-21.85435719999998 64.1369583
-21.879833042621613 64.13956716043008
*/

var player_location = [64.1369583, -21.85435719999998];

var CONST_BUTTON_WATCH_ERROR_LOCATION = 'position could not be found';

var game_state = {
  player:{
    watch:true,
    item:{
      //all the items the player owns
    }
  },
  scanner:{
    state: 0,
    charge: 50,
    drain: -0,
    power: 100,
    range: 10}
  };
  
var game_items = {};

function prepData(source, attr, game_items){
  window.game_items = game_items || {};
  game_paths = {};
  var a,n;
  for (var i in attr.path){
    a = attr.path[i];
    n = source + a.area + a.path;
    window.game_items[n] = window.game_items[n] || {path:[], attractions:[]};
    if((a.attraction == "true") || a.attraction === true){
      a.base_class = "attraction_" + a.icon;
      a.latitude = parseFloat(a.lat);
      a.longitude = parseFloat(a.lon);
      a.properties = {description:a.descr, content:a.content, name:a.name};
      window.game_items[n].attractions.push(a);
    }else{
      window.game_items[n].path.push({latlng:{lat:parseFloat(a.lat), lng:parseFloat(a.lon)}});
    }
    window.game_items[n].id = n;
    window.game_items[n].name = a.path;
    window.game_items[n].type = a.area;
    window.game_items[n].size = "";
    window.game_items[n].media = {};
    window.game_items[n].iconSize = [40, 40];
    window.game_items[n].range_detection = 10;
  }
    
  
}

function getObjectLength( object ) {
    var length = 0;
    for( var key in object ) {
        if( object.hasOwnProperty(key) ) {
            ++length;
        }
    }
    return length;
}

function showPathMenu(){
  //location.href = "#page_paths";
  $.mobile.changePage("#page_paths");
  buildPathMenu();
}

function showAreaPaths(route_area_id, route_path_id){
  //location.href = "#page_paths";
  $.mobile.changePage("#page_paths");
  buildPathMenu(route_area_id, route_path_id);
}

 function buildPathMenu(route_area_id, route_path_id){
   loadRouteMenu (function(book_menus){
    $("#menu_route_paths").html("");
    /*if (!$('#menu_route_paths').hasClass('ui-listview')) {
      $('#menu_route_paths').trigger('create');
    }*/
    var cachedid = localStorage.getItem("cached");
    var route_menu = book_menus[route_area_id];
    for (var a in route_menu.area[route_path_id].routes){
      var item = route_menu.area[route_path_id].routes[a];
      owner = "";
      if (cachedid == a){owner = "vistað";}
      $("#menu_route_paths").append('<li><a href='+ "#page_item" + ' id="path_'+a+'"  onclick="showItem(\''+route_area_id+'\', \''+route_path_id+'\', \''+a+'\')" "><h2>'+item.name+'</h2><p>'+ item.summary + '</p><p class="ui-li-aside">' + item.length + '<br>' + owner + '</p></a> </li>');
    }
    $("#menu_route_paths").listview().listview("refresh");
  });
 }

function showRouteArea(route_area_id){
  //location.href = "#page_areas";
  $.mobile.changePage("#page_areas");
  buildAreaMenu(this.id);
}
/*
function buildAreaMenu(route_area_id){
  loadRouteMenu (function(book_menus){
    $("#menu_route_areas").html("");
    var route_menu = book_menus[route_area_id];
    for (var a in route_menu.area){
      var item = route_menu.area[a];
      $("#menu_route_areas").append('<li><a href='+ "#page_route" + ' id="area_'+a+'"  onclick="showAreaPaths(\''+route_area_id+'\', \''+a+'\')" "><h2>'+item.name+'</h2><p>'+ item.summary + '</p><p class="ui-li-aside">' + getObjectLength(item.routes) + '</p></a> </li>');
    }
    $("#menu_route_areas").listview().listview("refresh");
  });
}
*/

function buildAreaMenu(route_area_id){
  loadRouteMenu (function(book_menus){
    var cachedid = localStorage.getItem("cached");
    $("#menu_route_areas").html("");
    var route_menu = book_menus[route_area_id];
    for (var a in route_menu.area){
      var item = route_menu.area[a];
      $("#menu_route_areas").append('<h2>'+item.name+'</h2><p>'+ item.summary + '</p>');
      for (var b in route_menu.area[a].routes){
        var menu_item = route_menu.area[a].routes[b];
        owner = "";
        if (cachedid == (item.data+b)){owner = "<i style='color:green;'>Vistað</i> - ";}
        $("#menu_route_areas").append('<li><a href='+ "#page_item" + ' id="path_'+b+'"  onclick="showItem(\''+route_area_id+'\', \''+a+'\', \''+b+'\')" "><h2>'+menu_item.name+'</h2><p>'+ menu_item.summary + '</p><p class="ui-li-aside">' + owner + menu_item.length + '</p></a> </li>');
      }      
    }
    $("#menu_route_areas").listview().listview("refresh");
  });
}

function showBookMenu(){
  //location.href = "#page_routes";
  $.mobile.changePage("#page_routes");
  buildBookMenu();
}

function buildBookMenu(force_update){
  loadRouteMenu (function(route_menus){
    $("#menu_route_books").html("");
    for (var b in route_menus){
      var item = route_menus[b];
      //$("#menu_route_books").append('<li><a href='+ "#page_area" + ' id="book_'+b+'"  onclick="showRouteArea(\''+b+'\')" "><h2>'+item.name+'</h2><p>'+ item.summary + '</p><p class="ui-li-aside">' + getObjectLength(item.area) + '</p></a> </li>');
      $("#menu_route_books").append('<li><a class="page_areas_button" href="#page_areas" id="'+b+'"  "><h2>'+item.name+'</h2><p>'+ item.summary + '</p><p class="ui-li-aside">' + getObjectLength(item.area) + '</p></a> </li>');
    }
    $("#menu_route_books").listview().listview("refresh");
    $(".page_areas_button").click(showRouteArea);
  }, force_update);
}

function withinRangeOfPlayer(x){
  //debugger;
  this.marker.openPopup();
}

function outsideRangeOfPlayer(x){
  this.marker.closePopup();
}

function askToPath(){
  savePath();
}

function getPathSelected(){
  var path_info = localStorage.getItem("path_info");
  if (!path_info){
    return $("#item_view_selected").val();
  }
  path_info = JSON.parse(localStorage.getItem("path_info"));
  return path_info.uid;
}

function getPathSelectedInfo(){
  return JSON.parse(localStorage.getItem("path_info"));
}

function savePath(){
  //saves path and tiles on device
  var sel = getPathSelectedInfo();
  offlineMap.cache(sel.center, function(progress, file){
    //$("#item_view_notice").html(progress+""+url);
    var pround = parseInt(progress*100);
    $("#item_view_isowner").html(pround+"%");
  }, function(){
    $("#item_view_isowner").html("Vistað");
  });
  localStorage.setItem("cached", sel.uid);
}

function showAttraction(attraction_index, path_id){
  //location.href="#page_attraction";
  $.mobile.changePage("#page_attraction");
  var sel = path_id || getPathSelected();
  var route = game_items[sel];
  var attraction = route.attractions[attraction_index];
  $("#item_attraction_name").html(attraction.name || attraction.descr);
  $("#item_attraction_description").html(attraction.content);

}
//showPath("2yellow"); setTimeout(function(){ showAttraction(12, "2yellow"); }, 1000);
function showPath(path_id){
  mmgr.clearScene({except:["player"]});
  //var sel = path_id || getPathSelected();
  var sel = getPathSelected();
  var a, route = game_items[sel];
  mmgr.createPath(sel, route.path, {color: route.name, noClip: true, smoothFactor: 0.8});
  for (var i in route.attractions){
    var popup_content = route.attractions[i].descr || route.attractions[i].name || "";
    if (popup_content.length){
      a = mmgr.getOrCreateActor(route.attractions[i]._id, route.attractions[i]);
      a.show();
      
      if(a.properties.content){
        popup_content = "<center><a href='#' onclick='showAttraction(" + i + ")'>" + popup_content + "</a></center>";
      }
      a.setPopup(popup_content);
      a.callback_collision_detected = withinRangeOfPlayer;
      a.callback_collision_distant = outsideRangeOfPlayer;
    }
  }
  setWatchPlayerPosition(false)
  showMap();
  setTimeout(function(){
    console.log("Bounds " + JSON.stringify(mmgr.viewActors()));
  }, 1000);
}

function walkPath(){
  showPath();
  setTimeout(function(){
    locatePlayer();
  }, 2000);
}

function showItem(route_book_id, route_area_id, item_id){
  loadRouteMenu (function(book_menus){
    var area = book_menus[route_book_id].area[route_area_id];
    var item = area.routes[item_id];
    item.uid = area.data+item_id;
    var game_item = game_items[item.uid];
    if (!game_item){
      $("#item_view_notice").html("Sækir gönguleið ...");
      loadRoutePath(area.data, function(){
        $("#item_view_notice").html("");
      });
    }    
    $("#item_view_name").html(item.name);
    $("#item_view_summary").html(item.summary);
    $("#item_view_description").html(item.description);
    //$("#item_view_image").attr("src",item.media.image);
    $("#item_view_selected").val(item.uid);
    //localStorage.setItem("path_selected", item.uid);
    localStorage.setItem("path_info", JSON.stringify(item));
    $("#item_view_notice").html("");
    var owner = "Vista leið?";
    if(localStorage.getItem("cached") == item.uid){
      owner = "Vistað";
    }
    $("#item_view_isowner").html(owner);
    $("#item_view_notice").html("");
    //checkbox if user has saved the path
  });
}

function loadMap () {
  var map = L.mapbox.map('map', 'kajjjak.gb5plc62', {
    detectRetina: true,
    unloadInvisibleTiles: true,
    zoomControl: false,
    attributionControl: false,
    maxZoom: 17,
    minZoom: 17
  });
  offlineMap.init(['kajjjak.gb5plc62']);
  offlineMap.tileLayer.addTo(map);
  return map;
}

function setUserLocationFailure(){
  setWatchPlayerPosition(null);
}

function setUserLocationSuccess(e){
    var radius = 10;
    if (e.accuracy){
      radius = e.accuracy / 2;
      if (radius < 4){
        radius = 4;
      }
    }
    if(!window.player){
        if(e.bounds){map.fitBounds(e.bounds);}
        window.player = addUserLocation(map, e.latlng);
        // And hide the geolocation button
        //scan_label.parentNode.removeChild(scan_label);   
    }
    window.player.setPosition(e.latlng, {radius: radius});
    if(game_state.player.watch){
      setWatchPlayerPosition(game_state.player.watch);
      if(map.panTo){map.panTo(e.latlng);}
    }
    window.player.runCollisionDetection(game_state.scanner.range);
    if(game_state.player.watch == true){
      setWatchPlayerPosition(true);
    }
}

function locatePlayer(force){
  if ((!navigator.geolocation) || force){
    map.locate({
      watch: true,
      timeout: 1000,
      maximumAge: 0,
      enableHighAccuracy: true
    });
    map.on('locationfound', setUserLocationSuccess);
    map.on('locationerror', setUserLocationFailure);
  }else{
    navigator.geolocation.watchPosition(function(position){
      setUserLocationSuccess({
        accuracy: position.coords.accuracy,
        latlng: [
          position.coords.latitude,
          position.coords.longitude
        ]
      });
    }, setUserLocationFailure, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
  }
  if((map.panTo) && (window.player)){map.panTo(window.player.getPosition());}
  setWatchPlayerPosition(true);
}

function setWatchPlayerPosition(b){
  var c = "white";
  if (b == null){
    c = "red";
  }else{
    game_state.player.watch = b;
    if(game_state.player.watch == true){
      c = "#98C034";
    }
  }
  $("#navigation_button").css("background", c);
}

function loadControls(map){
    /*
    $("#navigation_button").click(showUserLocation);
    $(".page_books_button").click(showBookMenu);
    $(".page_map_button").click(showMap);
    $(".page_path_button").click(showPath);
    $(".page_walk_button").click(walkPath);
    */
    $('#navigation_button').bind('touchstart mousedown', showUserLocation);
    $('.page_books_button').bind('touchstart mousedown', showBookMenu);
    $('.page_map_button').bind('touchstart mousedown', showMap);
    $('.page_path_button').bind('touchstart mousedown', showPath);
    $('.page_walk_button').bind('touchstart mousedown', walkPath);
        
    setWatchPlayerPosition(true);

    // handles the disabling of follow user button
    map.on('dragend', function(){
      setWatchPlayerPosition(false);
    });

    //map.on('click', setUserLocationSuccess);
}

function showUserLocation(e){
  e.preventDefault();
  e.stopPropagation();
  if((map.panTo) && (window.player)){map.panTo(window.player.getPosition());}
  setWatchPlayerPosition(true);
  if(!game_state.player.watch){
    locatePlayer(true);
  }
}


function addUserLocation (map, latlng){
  var p = mmgr.createActor('player', {
    latitude : latlng.lat,
    longitude: latlng.lng,
    base_class:'player',
    range_detection: game_state.scanner.range,
    iconSize: [30, 30],
    map: map
  });
  p.setLayerBaseCircle({
    color:'#7AA3CC',
    fillColor:'#99CCFF',
    fillOpacity: 0.3
  });
  p.show();
  p.click(function(e){
    //alert("clicked self");
  });
  p.callback_collision_detected = function(x){
    //could show message on screen and/or vibration
    if(navigator.notification){
      navigator.notification.vibrate(2500);
      navigator.notification.beep();
    }
  };

  return p;
}

function setViewportChanged(timeout){
  timeout = timeout || 100;
  setTimeout(function(){
    map.invalidateSize();
  }, timeout);
}

function showMap(){
  //window.location.href = "#page_map";
  $.mobile.changePage("#page_map");
  setViewportChanged(1000);
}

function fixDeviceHeaders(){
  //FIX BUTTON AND HEADER
  $(".fix_button").css("padding","4px");
  $(".fix_button").css("border-radius","10px");
  $(".fix_button").css("border-color","darkgray");
  $(".fix_header").css("padding-bottom","8px");

  if (window.device){
    if (parseFloat(window.device.version) >= 7.0) {
      $(".fix_header").css("padding-top", "20px");
      $(".fix_button").css("margin-top", "20px");
    }
  }
}

function onDeviceReady(){
  if (window._been_ready){return;} //do not init twice
  window._been_ready = true;
  setTimeout(fixDeviceHeaders, 1000);

  mmgr = new SceneManager();
  mmgr.loadScene();
  mmgr.init(map);
  loadControls(map);
  
  /* browser dev end */
  showMap();
  setTimeout(function(){
      prepData("attractions2", attractions["2"]);
      locatePlayer();
  }, 500);
}

function loadRouteMenu(callback_menuupdate, force_update){
  var route_menu = localStorage.getItem("route_menu");
  if(force_update){
    fetchRouteMenu(callback_menuupdate);
  }else{
    if(!route_menu){
      callback_menuupdate(routes);
      fetchRouteMenu(callback_menuupdate);
    }else{
      $.extend(routes, JSON.parse(route_menu));
      callback_menuupdate(routes);
    }
  }
}

function fetchRouteMenu(callback_menuupdate){
  var menus = ["route_public"];
  var urldb = "http://54.249.245.7/utikennsluapp/"; //"utikennsluapp.agamecompany.com";
  for(var i in menus){
    var m = menus[i];
    console.info("Updating menu " + urldb + m);
    $("#menu_route_books_update_button").html("Uppfærir listinn");
    $.getJSON(urldb + m, function(route_menu){
      $.extend(routes , route_menu["menu"]);
      localStorage.setItem("route_menu", JSON.stringify(routes));
      callback_menuupdate(routes);
      $("#menu_route_books_update_button").html("Búin að uppfæra lista");
      setTimeout(function(){
        $("#menu_route_books_update_button").html("Uppfæra lista");
        loadRoutePathCache();
      }, 2000);
    });
  }
}

function loadRoutePath(path_name, callback_success){
  var route_path = localStorage.getItem(path_name);
  if(!route_path){
    fetchRoutePath(path_name, callback_success);   
  }else{
    var route_path = JSON.parse(route_path);
    prepData(path_name, route_path, window.game_items);
    callback_success(route_path);
  }
}
function fetchRoutePath(path_name, callback_success){
  var urldb = "http://54.249.245.7/utikennsluapp/"; //"utikennsluapp.agamecompany.com";
  console.info("Updating path " + urldb + path_name);
  $.getJSON(urldb + path_name, function(route_path){
    route_path = JSON.stringify(route_path);
    route_path = route_path.replace(/=\\"\media/g, '=\\"/__db/_design/media');
    route_path = JSON.parse(route_path);
    prepData(path_name, route_path, window.game_items);
    localStorage.setItem(path_name, JSON.stringify(route_path));
    callback_success(route_path);
    //enumerate all sub routes to update the paths as well
  });
}

function loadRoutePathCache(){
  for (var b in routes){ 
    for (var a in routes[b].area){
      if(routes[b].area[a].data != "attractions2"){
        fetchRoutePath(routes[b].area[a].data, function(p){
          console.log("Loading path " + JSON.stringify(p));
        });
        //console.info(routes[b].area[a].data); 
      }
    }
  }
}

