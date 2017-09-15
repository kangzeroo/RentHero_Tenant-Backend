const axios = require('axios')


// GET /
exports.authtest = function(req, res, next){
	res.send({message:'Super secret code is ABC123'});
}

exports.longlivetoken = function(req, res, next){
  console.log('========= longlivetoken =========')
  console.log(req.body)
	const fbAccessToken = req.body.accessToken
	console.log(fbAccessToken)
	axios.get(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${"115765432474914"}&client_secret=${"61eeb4de2ccf4180cec67f86ba9a0e45"}&fb_exchange_token=${fbAccessToken}` )
		.then((data)=>{
			console.log("================================ FB TOKEN START ================================")
      console.log(data.data)
			// let longLiveToken = data.data.slice(13) 	// remove the 'access_token=' from beggining
			// let positionEnd = longLiveToken.indexOf('&expires=')
			// longLiveToken = longLiveToken.slice(0, positionEnd)
      const longLiveToken = data.data.access_token
			const tokenExpiry = data.data.expires_in
			console.log(data.data)
			console.log("================================ FB TOKEN END ================================")
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
