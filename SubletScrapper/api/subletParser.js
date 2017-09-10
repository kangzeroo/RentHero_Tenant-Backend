const nlp = require('./subletExtractor/nlp')
const fbExtractor = require('./fbExtractor')
const googleMapsExtractor = require('./googleMapsExtractor')
const AsyncJS = require('async')

exports.parseAndSaveSublets = function(newSublets){
	AsyncJS.eachSeries(newSublets, parseSubletForInfo, ()=>{
		console.log("Finish looping through all the new sublets!")
	})
}

function parseSubletForInfo(sublet, callback){
	nlp.BeginParsingChain(sublet)
			.then(nlp.extractAddress)
			.then(nlp.extractFemalesOnly)
			.then(nlp.extractPrice)
			.then(nlp.extractRoomsLeft)
			.then(nlp.extractUtilsIncl)
			.then(nlp.extractEnsuite)
			.then(nlp.extractPhone)
			.then(nlp.extractSemester)
			.then(fbExtractor.extractUser)
			.then(fbExtractor.extractProfileLink)
			.then(fbExtractor.extractProfileImage)
			.then(fbExtractor.extractPostImages)
			.then(googleMapsExtractor.parseGPS)
			.then(saveSublet)
			.then((data)=>{
				console.log("======================================")
				console.log("======================================")
				console.log("======================================")
				console.log(data)
				setTimeout(()=>{
					callback()
				}, 100)
			})
			.catch((err)=>{
				console.log(err)
				callback()
			})
}

// function saveSublet(sublet){
// 	const p = new Promise((resolve, rej)=>{
// 		// check if the post already exists
// 		Sublet.find({$or: [ { 'postid': sublet.postid }, { $and: [{userid: sublet.userid},{coords: sublet.coords}, {active: true}] } ]}, function(err, response){
// 			if(err){return next(err)};
// 			// if our response if empty, that means this post does not yet exist in db
// 			if(response.length == 0){
// 				//console.log('new post');
// 				// save to db only if we successfully extracted an address, coords, userurl and price
// 				if(sublet.address && sublet.coords && sublet.userurl && sublet.price){
// 					sublet.active = true;
// 					console.log(sublet)
// 					const post = new Sublet(sublet);
// 					post.save(function(err, post){
// 						if(err){
// 							console.log(err)
// 							rej(err)
// 						}
// 						console.log("saving this new post: " + post.address);
// 						resolve(post)
// 					});
// 				}else{
// 					//console.log(sublet)
// 					resolve("Missing address, coords, userurl or price")
// 				}
//
// 			// but if our response is not empty, then we must mark the previous posts as inactive before saving new post
// 			}else{
// 				// save to db only if we successfully extracted an address, coords, userurl and price
// 				if(sublet.address && sublet.coords && sublet.userurl && sublet.price){
// 					console.log("Found an existing sublet post already! Matched with "+ response.length +" results from " + sublet.username)
// 					Sublet.update({$and: [{userid: sublet.userid},{coords: sublet.coords}, {active: true}]}, {active: false}, {multi:true}, function(err, res){
// 						if(err){return next(err)};
// 						console.log("=========================")
// 						console.log(res)
// 						sublet.active = true
// 						const post = new Sublet(sublet)
// 						post.save(function(err, post){
// 							if(err){
// 								console.log(err)
// 								rej()
// 							}
// 							console.log("setting olds as inactive and saving this new post: " + post.address + " by " + post.username);
// 							//console.log(post);
// 							resolve(post)
// 						})
// 					})
// 				}else{
// 					//console.log(sublet)
// 					rej("Missing address, coords, userurl or price")
// 				}
// 			}
// 		})
// 	})
// 	return p
// }
