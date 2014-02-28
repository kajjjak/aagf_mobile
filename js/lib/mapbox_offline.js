/*
  Offline mapbox (leaflet) tile layer for offline caching of tiles.
  Displays a layer of tiles if cached on top of current tile layer (which can be null).

  TODO: hasNetworkConnection
  
  Example use:
	
	var map = L.mapbox.map('map', 'kajjjak.gb5plc62', {
	    detectRetina: true,
	    unloadInvisibleTiles: true,
	    zoomControl: false,
	    attributionControl: false
	  });
	  //offlineLayer.addTo(map);
	  offlineMap.init(['kajjjak.gb5plc62']);
	  offlineMap.tileLayer.addTo(map);


  then call

  	offlineMap.cache([lat,lng])

  and the tile layer will be loaded if cached tiles exists (else default_image will be used)
*/

offlineMap = function() {
	var mapIDs = [];
	var mapServiceURL = 'http://api.tiles.mapbox.com/v3/';
	var default_image = ""; //"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAA4ElEQVRYw+2ZsQkCQRAAD4wEU8ECrMEaHmzC6MoQvg/hmxCE78AaLEAwFYyEdTcweJS/C+TZkQ0mH45nbn8viUgikUI4hP9JOOfskqmE1zThq7IhCYtyVxqSsPFUdiThN3uasHFQZiRh46jMScLGWVmShI1Lbau9CEttq0vCMjHFVnsTLrbao/Boqz0Lf221d+GPVhOEB62mCBs97YRXFOGTsqB8wx2pEi3ppsuUm+6hbCnT2u0X01rMw2ONJQgPGutduCP9NbekzU+mbH6KjfUkXNXY2A+73sDHo0wIA4VfkiVRi8ohOKQAAAAASUVORK5CYII=";
	downloadFileURL = function(urls, index, callback_progress, callback_complete) {
		if (index >= urls.length) { //callback if done
			if(callback_complete){
				callback_complete();
			}
			return;
		}
		//update modal progress
		var url = urls[index];
		var file = url.replace(mapServiceURL+offlineMap.mapIDs[0], "");
		if(callback_progress){
			callback_progress(((index+1)/urls.length), file);
		}
		downloadFileContent(url, function(){
			downloadFileURL(urls, index+1, callback_progress, callback_complete);
		}, function(){
			//downloadFileURL(urls, index+1, callback_progress, callback_complete);	
		});
	};

	function init(mapIDs){
		this.mapIDs = mapIDs;
	}

	function convertImageToBase64(img){
		var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0,0);
        var imgbase64 = null;
        try {
            imgbase64 = ctx.canvas.toDataURL("image/png");
        } catch(err) { console.log ("Failure converting image " + JSON.stringify(err)); }
        //console.log("Image: " + imgbase64);
        return imgbase64;
	}

	function getEncodeedExternalImage(url, callback_success) {
		//http://planet.jboss.org/post/using_html5_and_canvas_to_base64_and_cache_public_images
		var img = new Image(); // width, height values are optional params
		//http://blog.chromium.org/2011/07/using-cross-domain-images-in-webgl-and.html
		//remote server has to support CORS
		img.crossOrigin = '';
		img.src = url;
		img.onload = function() {
			if(img.complete){
				callback_success(convertImageToBase64(img));
			}
		}
		//callback_success(convertImageToBase64(img));
	}
	function localStorageSetItem(k, v){
		try{
			localStorage.setItem(k, v);
		} catch(e) {

		}
	}

	function localStorageClear(){
		//localStorage.clear();
		var urls = localStorage.getItem("cached_tiles");
		if (urls){
			urls = JSON.parse(urls);
			for (var i in urls){
				localStorage.removeItem(urls[i]);
			}
		}
	}

	function localStorageGetItem(k, default_value){
		var v = localStorage.getItem(k);
		if(v && (v.length > 10)) return v;
		v = sessionStorage.getItem(k);
		if(v) return v;
		return default_value;  
	}
	downloadFileContent = function(url, callback_success, callback_failure){
		getEncodeedExternalImage(url, function(img){
			localStorageSetItem(url, img);
			callback_success();
		});
	}

	function bulkDownload(urls, callback_progress, callback_complete) {
		/*
		* Bulk download of urls to the targetDir (relative path from root) 
		*/
		downloadFileURL(urls, 0, callback_progress, callback_complete);
	}

	function pyramid(mapIDs, lat, lon, options) {
		/*    
		Given a list of mapIDs, a central lat/lng, and zoomLimit/radius options 
		generate the urls for the pyramid of tiles for zoom levels 3-17

		radius is how many tiles from the center at zoomLimit
		(by default 
		zooms 3-14 have radius of 1.  
		15 has radius 2
		16 has radius 4.  
		17 has radius 8
		)
		*/

		//handle options
		var zoomLimit = options['zoomLimit'] || 15; //14
		var minZoom = options['minZoom'] || 17;
		var maxZoom = options['maxZoom'] || 18;
		var radius = options['radius'] || 1;

		//declare vars outside of loop
		var urls = [], mapID, zoom, t_x, t_y, r, x, y;
		for (var i=0, l=mapIDs.length; i<l; i++) { //iterate over map ids
			mapID = mapIDs[i];
			for (zoom=minZoom; zoom<maxZoom; zoom++) { //iterate over zoom levels
				t_x = long2tile(lon, zoom);
				t_y = lat2tile(lat, zoom);
				r = radius * Math.pow(2, (Math.max(zoom, zoomLimit) - zoomLimit));
				for (x = t_x-r; x <= t_x+r; x++) { //iterate over x's
					for (y = t_y-r; y <= t_y+r; y++) { //iterate over y's
						urls.push(tile2url(mapID, zoom, x, y));
					}
				}
			}
		}
		return urls;
	}

	function tile2url(mapID, zoom, x, y) {
		/*  Given a mapID, zoom, tile_x, and tile_y,
		 *  return the url of that tile
		 */
		return mapServiceURL + mapID + '/' + zoom + '/' + x + '/' + y + '.png';
	}

	//both from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
	function long2tile(lon, zoom) {
		return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
	}
	function lat2tile(lat, zoom)  {
		return (Math.floor(
			(1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)
		));
	}
	function hasNetworkConnection(){
		return false;
	}
	
	this.funcLayer = new L.TileLayer.Functional(function (view) {
		//var deferred = $.Deferred();
		var path = tile2url(offlineMap.mapIDs[0], view.zoom, view.tile.column, view.tile.row); //'http://api.tiles.mapbox.com/v3/kajjjak.map-wgrdoudp/{z}/{y}/{x}.png'
		var img_base = localStorageGetItem (path);
		if ((img_base === undefined) || (img_base.length < 10)) {
			if (hasNetworkConnection()){
				console.info ("Loading from server for " + path);
				//deferred.resolve(path);
				return path;
			} else {
				console.info ("Loading default image for " + path);
				//deferred.resolve(default_image);
				return default_image;
			}
		} else {
			console.info ("Loading cached image for " + path);
			//deferred.resolve(img_base);
			return img_base;
		}
		return path; //deferred.promise();
	}, {
		subdomains: '1234'
	});

	function cacheTiles(pos, callback_progress, callback_completed){
		localStorageClear();
		if (pos.lat){ //if this is a latlng object
			pos = [pos.lat, pos.lng];
		}
		var urls = pyramid(this.mapIDs, pos[0], pos[1], {});
		localStorage.setItem("cached_tiles", JSON.stringify(urls));
		bulkDownload(
			urls, //tile urls
			callback_progress,
			callback_completed
		);		
	}

	return {
		'init': init,
		'_tileURLs': pyramid,
		'cache': cacheTiles,
		'tileLayer': funcLayer
	};

}();

