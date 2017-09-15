const GoogleMapsAPI = require('googlemaps')

module.exports.parseGPS = function(sublet){
	const p = new Promise((res, rej)=>{
		const publicConfig = {
		  key: 'AIzaSyA1NTulhRf2hKBV-BEbBLW8NRD7AnpqvMg',
		  stagger_time:       1000, // for elevationPath
		  encode_polylines:   false,
		  secure:             true // use https
		  //proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
		}
		const gmAPI = new GoogleMapsAPI(publicConfig);

		// geocode API
		const geocodeParams = {
		  "address":    sublet.address,
		  "components": "components=country:CA"
		}

		gmAPI.geocode(geocodeParams, function(err, result){
		  if(err){console.log(err)};
		   //console.log(result);
		  if(result){
		  	if(result.results[0]){
			  	// take the coords of the first result
			  	sublet.gps_x = parseFloat(result.results[0].geometry.location.lat.toFixed(7))
					sublet.gps_y = parseFloat(result.results[0].geometry.location.lng.toFixed(7))
					sublet.place_id = result.results[0].place_id
			  	res(sublet);
			}else{
				console.log(sublet.address)
				console.log(result)
		  	rej("No geocoding data!");
			}
		  }
		})
	})
	return p
}
