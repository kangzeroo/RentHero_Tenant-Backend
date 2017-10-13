const axios = require('axios')


// GET /
exports.authtest = function(req, res, next){
	res.send({message:'Super secret code is ABC123'});
}

exports.longlivetoken = function(req, res, next){
	const fbAccessToken = req.body.accessToken
	CLIENT_ID = '115765432474914'
	CLIENT_SECRET = '61eeb4de2ccf4180cec67f86ba9a0e45'
	if (process.env.NODE_ENV === 'production') {
		// production
		let CLIENT_ID = '1492022030811505'
		let CLIENT_SECRET = 'ab7ff18d40625c64f6a12516f5be8de2'
	}
	axios.get(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&fb_exchange_token=${fbAccessToken}` )
		.then((data)=>{
			// let longLiveToken = data.data.slice(13) 	// remove the 'access_token=' from beggining
			// let positionEnd = longLiveToken.indexOf('&expires=')
			// longLiveToken = longLiveToken.slice(0, positionEnd)
      const longLiveToken = data.data.access_token
			const tokenExpiry = data.data.expires_in
			console.log("================================ FB TOKEN SUCCESS ================================")
			res.json({
				message: "Success getting the long lived fb token!",
				longLiveToken: data.data
			})
		})
		.catch((err)=>{
			console.log(err)
			res.json({
				message: "Failure getting the long lived fb token!"
			})
		})

}

// POST/ checkIfLandlordExists
exports.checkIfLandlordExists = function(req, res, next){
	const landlordId = req.body.landlordId
	res.json({exists: true})
}
