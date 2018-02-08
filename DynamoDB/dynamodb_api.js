const Rx = require('rxjs')
const moment = require('moment')
const AWS = require('aws-sdk')
const aws_config = require('../credentials/aws_config')
const dynaDoc = require("dynamodb-doc");
AWS.config.update(aws_config)

const dynamodb = new AWS.DynamoDB({
  dynamodb: '2012-08-10',
  region: "us-east-1"
})
const docClient = new dynaDoc.DynamoDB(dynamodb)

const generateSublets = require('./schema/sublet_item').generateSublets
// const createTables = require('./schema/sublet_table').createTables
// createTables()

exports.insert_sublet = function(sublet_item){
  const p = new Promise((res, rej) => {
    const items = generateSublets(sublet_item)
    items.forEach((item) => {
      docClient.putItem(item, function(err, data) {
        if (err){
            console.log(JSON.stringify(err, null, 2));
            rej()
        }else{
            console.log('DYNAMODB INSERTION SUCCESS!')
            res()
        }
      })
    })
  })
  return p
}

// needs to be tested, should work as its the same code as the working 'Tenant-Intel-Backend' repo
exports.batch_insert_sublets = function(sublets){
  const p = new Promise((res, rej) => {
    if (sublets.length > 0) {
      const params = {
        RequestItems: {
          [sublets[0].TableName]: sublets.map((sublet) => {
            return {
              PutRequest: {
                Item: sublet.Item
              }
            }
          })
        }
      }
      docClient.batchWriteItem(params, function(err, data) {
        if (err){
            console.log(JSON.stringify(err, null, 2));
            rej()
        }else{
            console.log('SUBLET BATCH INSERTION SUCCESS!')
            res()
        }
      })
    }
  })
  return p
}

exports.get_sublets_from_dynamodb = function() {
  const p = new Promise((res, rej) => {
    const timeSince = unixDateSince(30)
    console.log('------------------ get_sublets_from_dynamodb ------------------')
    console.log(timeSince)
    const params = {
       "TableName": "Rentburrow_Sublets_Operational",
       "FilterExpression": "#POSTED_DATE > :timeSince",
       "ExpressionAttributeNames": {
         "#POSTED_DATE": "POSTED_DATE"
       },
       "ExpressionAttributeValues": {
         ":timeSince": timeSince
       },
       "Limit": 600,
    }
    scanDynamoDB(params).then((data) => {
      res(data)
    }).catch((err) => {
      rej(err)
    })
    // console.log(params)
    // docClient.scan(params, function(err, data) {
    //   if (err){
    //     console.log(err, err.stack); // an error occurred
    //     rej(err)
    //   }else{
    //     // console.log("====== GOT SUBLETS FROM LAST 100 DAYS =====")
    //     console.log(data.Items.length, 'sublets retrieved');           // successful response
    //     res(data.Items)
    //   }
    // })
  })
  return p
}

function scanDynamoDB(params) {
  const p =  new Promise((res, rej) => {
    let Items = []
    const onNext = ({ obs, params }) => {
      console.log('OBSERVABLE NEXT')
      console.log('=========== accumlated size: ' + Items.length)
      docClient.scan(params, (err, data) => {
        if (err){
          console.log(err, err.stack); // an error occurred
          obs.error(err)
        }else{
          console.log(data);           // successful response
          Items = Items.concat(data.Items)
          if (data.LastEvaluatedKey) {
            params.ExclusiveStartKey = data.LastEvaluatedKey
            obs.next({
              obs,
              params
            })
          } else {
            obs.complete(data)
          }
        }
      })
    }
    Rx.Observable.create((obs) => {
      obs.next({
        obs,
        params
      })
    }).subscribe({
      next: onNext,
      error: (err) => {
        console.log('OBSERVABLE ERROR')
        console.log(err)
        rej()
      },
      complete: (y) => {
        console.log('OBSERVABLE COMPLETE')
        console.log(Items.length)
        res(Items)
      }
    })
  })
  return p
}

exports.getLatestSubletFromDb = function(fb_group_id) {
  const p = new Promise((res, rej) => {
    console.log(fb_group_id)
    const timeSince = unixDateSince(30)
    const params = {
       "TableName": "Rentburrow_Sublets_Historical",
       "FilterExpression": "#FB_GROUP_ID = :fb_group_id and #POSTED_DATE > :timeSince",
       "ExpressionAttributeNames": {
         "#FB_GROUP_ID": "FB_GROUP_ID",
         "#POSTED_DATE": 'POSTED_DATE'
       },
       "ExpressionAttributeValues": {
         ":fb_group_id": fb_group_id,
         ":timeSince": timeSince
       },
      //  "Limit": 1,
    }
    // console.log(params)
    scanDynamoDB(params).then((data) => {
      console.log("====== GOT LATEST SUBLET =====")
      // console.log(data);           // successful response
      res(data.Items.sort((a, b) => {
        return b.POSTED_DATE - a.POSTED_DATE
      })[0])
    }).catch((err) => {
      rej(err)
    })
    // docClient.scan(params, function(err, data) {
    //   if (err){
    //     console.log(err, err.stack); // an error occurred
    //     rej(err)
    //   }else{
    //     console.log("====== GOT LATEST SUBLET =====")
    //     // console.log(data);           // successful response
    //     res(data.Items.sort((a, b) => {
    //       return b.POSTED_DATE - a.POSTED_DATE
    //     })[0])
    //   }
    // })
  })
  return p
}

exports.get_sublet_by_id_from_dynamodb = function(fb_post_id) {
  console.log('get_sublet_by_id_from_dynamodb')
  const p = new Promise((res, rej) => {
    const params = {
       "TableName": "Rentburrow_Sublets_Historical",
       "FilterExpression": "#POST_ID = :fb_post_id",
       "ExpressionAttributeNames": {
         "#POST_ID": "POST_ID",
       },
       "ExpressionAttributeValues": {
         ":fb_post_id": fb_post_id
       }
    }
    scanDynamoDB(params).then((data) => {
      console.log("====== GOT LATEST SUBLET =====")
      // console.log(data);           // successful response
      res(data.Items.sort((a, b) => {
        return b.POSTED_DATE - a.POSTED_DATE
      })[0])
    }).catch((err) => {
      rej(err)
    })
    // console.log(params)
    // docClient.scan(params, function(err, data) {
    //   if (err){
    //     console.log(err, err.stack); // an error occurred
    //     rej(err)
    //   }else{
    //     console.log("====== GOT LATEST SUBLET =====")
    //     // console.log(data);           // successful response
    //     res(data.Items)
    //   }
    // })
  })
  return p
}

exports.get_sublets_by_place_id = function(place_id) {
  console.log('get_sublet_by_place_id')
  const p = new Promise((res, rej) => {
    const timeSince = unixDateSince(30)
    const params = {
       "TableName": "Rentburrow_Sublets_Operational",
       "FilterExpression": "#PLACE_ID = :place_id and #POSTED_DATE > :timeSince",
       "ExpressionAttributeNames": {
         "#PLACE_ID": "PLACE_ID",
         "#POSTED_DATE": 'POSTED_DATE'
       },
       "ExpressionAttributeValues": {
         ":place_id": place_id,
         ":timeSince": timeSince
       }
    }
    scanDynamoDB(params).then((data) => {
      console.log("====== GOT LATEST SUBLET =====")
      // console.log(data);           // successful response
      res(data)
    }).catch((err) => {
      rej(err)
    })
    // console.log(params)
    // docClient.scan(params, function(err, data) {
    //   if (err){
    //     console.log(err, err.stack); // an error occurred
    //     rej(err)
    //   }else{
    //     console.log("====== GOT LATEST SUBLETS =====")
    //     // console.log(data);           // successful response
    //     res(data.Items)
    //   }
    // })
  })
  return p
}

exports.get_sublets_by_address = function(address) {
  console.log('get_sublet_by_address')
  const p = new Promise((res, rej) => {
    const timeSince = unixDateSince(30)
    const params = {
       "TableName": "Rentburrow_Sublets_Operational",
       "FilterExpression": "#ADDRESS = :address and #POSTED_DATE > :timeSince",
       "ExpressionAttributeNames": {
         "#ADDRESS": "ADDRESS",
         "#POSTED_DATE": 'POSTED_DATE'
       },
       "ExpressionAttributeValues": {
         ":address": address,
         ":timeSince": timeSince
       }
    }
    scanDynamoDB(params).then((data) => {
      console.log("====== GOT LATEST SUBLET =====")
      // console.log(data);           // successful response
      res(data)
    }).catch((err) => {
      rej(err)
    })
    // console.log(params)
    // docClient.scan(params, function(err, data) {
    //   if (err){
    //     console.log(err, err.stack); // an error occurred
    //     rej(err)
    //   }else{
    //     console.log("====== GOT LATEST SUBLETS =====")
    //     // console.log(data);           // successful response
    //     res(data.Items)
    //   }
    // })
  })
  return p
}

function unixDateSince(numDays){
  const today = new Date()
  const todayUnix = today.getTime()
  const sinceUnix = todayUnix - (numDays*24*60*60*1000)
  return sinceUnix
}

exports.post_sublet_to_dynamodb = function(sublet_item) {
  console.log('post_sublet_to_dynamodb')
  const items = generateSublets(sublet_item)
  console.log(items)
  const insertions = items.map((item) => {
    const p = new Promise((res, rej) => {
      docClient.putItem(item, function(err, data) {
        if (err){
            // console.log(JSON.stringify(err, null, 2));
            rej()
        }else{
            console.log('DYNAMODB INSERTION SUCCESS!')
            res()
        }
      })
    })
    return p
  })
  return Promise.all(insertions)
}

exports.get_my_sublets_from_dynamodb = function(fb_user_id) {
  console.log('FACEBOOK ID: ', fb_user_id)
  const p = new Promise((res, rej) => {
    const timeSince = unixDateSince(30)
    const params = {
       "TableName": "Rentburrow_Sublets_Operational",
       "FilterExpression": "#FB_USER_ID = :fb_user_id and #POSTED_DATE > :timeSince",
       "ExpressionAttributeNames": {
         "#FB_USER_ID": "FB_USER_ID",
         "#POSTED_DATE": 'POSTED_DATE'
       },
       "ExpressionAttributeValues": {
         ":fb_user_id": fb_user_id,
         ":timeSince": timeSince
       }
    }
    scanDynamoDB(params).then((data) => {
      console.log("====== GOT MY SUBLETS =====")
      // console.log(data);           // successful response
      res(data)
    }).catch((err) => {
      rej(err)
    })
  })
  return p
}

exports.bump_sublet_in_dynamodb = function(sublet) {
  console.log('bump_sublet_in_dynamodb')
  const p = new Promise((res, rej) => {
    if (sublet.POSTED_DATE + (1000 * 60 * 60 * 24) < moment().valueOf()) {
      console.log('ITS HAPPENING!!')
      sublet.POSTED_DATE = moment().valueOf()
      const updatedSublet = {
        'TableName': "Rentburrow_Sublets_Operational",
        'Item': sublet,
      }
      docClient.putItem(updatedSublet, function(err, data) {
        if (err){
            console.log(JSON.stringify(err, null, 2));
            rej()
        }else{
            console.log('HINT UPDATED!')
            res('success')
        }
      })
    } else {
      console.log('NAHHH AINT HAPPENING')
      rej()
    }
  })
  return p
}
