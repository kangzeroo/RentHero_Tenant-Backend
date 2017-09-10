const FB = require('fb')
const uuid = require('uuid')

module.exports.setFacebookToken = function(accessToken){
	FB.setAccessToken(accessToken)
}

module.exports.extractUser = function(sublet){
	sublet.post_url = "http://facebook.com/"+sublet.post_id
	const p = new Promise((res, rej)=>{
		// first get the fb_user_id of this post via post_id
		const post_id_edge = '/' + sublet.post_id + '?fields=from'
		FB.api(
		    post_id_edge,
		    function (response) {
		      if (response && !response.error) {
	    		sublet.fb_user_id = response.from.id
	    		sublet.fb_user_name = response.from.name
	    		res(sublet)
		      }else{
		      	rej("Could not extract user")
		      }
		    }
		)
	})
	return p
}

module.exports.extractProfileLink = function(sublet){
	const p = new Promise((res, rej)=>{
		// then get the profile link via the fb_user_id
		const fb_user_id_edge = '/' + sublet.fb_user_id + '/?fields=link';
		FB.api(
		    fb_user_id_edge,
		    function (response) {
		      if (response && !response.error) {
		        sublet.userurl = response.link;
		        res(sublet)
		      }else{
		      	rej("Could not extract profile link")
		      }
		    }
		)
	})
	return p
}

module.exports.extractProfileImage = function(sublet){
	const p = new Promise((res, rej)=>{
		// then get the profile image url via the fb_user_id
		const fb_user_id_edge = '/' + sublet.fb_user_id + '?fields=picture&type=small';
		FB.api(
		    fb_user_id_edge,
		    function (response) {
		      if (response && !response.error) {
		        sublet.fb_user_pic = response.picture.data.url
		        res(sublet)
		      }else{
		      	rej("Could not extract profile img")
		      }
		    }
		);
	})
	return p
}

module.exports.extractPostImages = function(sublet){
	const p = new Promise((res, rej)=>{
		// then get the profile image url via the fb_user_id
		const post_edge = '/' + sublet.post_id + '/attachments';
		FB.api(
		    post_edge,
		    function (response) {
		      if (response && !response.error) {
		      	sublet.images = extractImages(response)
		        res(sublet)
		      }else{
		      	rej("Could not extract post imgs")
		      }
		    }
		);
	})
	return p
}

function extractImages(fbData){
	if(fbData.data){
		const images = []
		fbData.data.forEach((file)=>{
			if(file.subattachments && file.subattachments.data){
				file.subattachments.data.forEach((imgData)=>{
					if(imgData.media && imgData.media.image){
						images.push(imgData.media.image.src)
					}
				})
			}
		})
		return JSON.stringify(images)
	}else{
		console.log("No images found")
		return []
	}
}
