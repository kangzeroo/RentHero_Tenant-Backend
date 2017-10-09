
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

exports.get_sublets_from_dynamodb = function() {
  const p = new Promise((res, rej) => {
    const timeSince = unixDateSince(100)
    // const params = {
    //   TableName: "Rentburrow_Sublets_Operational",
    //   KeyConditionExpression: "#PLACE_ID > :ANYTHING",
    //   FilterExpression: "#DATE > :date",
    //   ExpressionAttributeNames: {
    //     "#PLACE_ID": "PLACE_ID",
    //     "#DATE": "DATE"
    //   },
    //   ExpressionAttributeValues: {
    //     ":ANYTHING": "0",
    //     ":date": timeSince
    //   }
    // }
    // console.log(timeSince)
    const params = {
       "TableName": "Rentburrow_Sublets_Operational",
       "FilterExpression": "#POSTED_DATE > :timeSince",
       "ExpressionAttributeNames": {
         "#POSTED_DATE": "POSTED_DATE"
       },
       "ExpressionAttributeValues": {
         ":timeSince": timeSince
       },
       "Limit": 300,
    }
    console.log(params)
    docClient.scan(params, function(err, data) {
      if (err){
        console.log(err, err.stack); // an error occurred
        rej(err)
      }else{
        // console.log("====== GOT SUBLETS FROM LAST 100 DAYS =====")
        // console.log(data);           // successful response
        res(data.Items)
      }
    })
  })
  return p
}

exports.getLatestSubletFromDb = function() {
  const p = new Promise((res, rej) => {
    const params = {
       "TableName": "Rentburrow_Sublets_Historical",
       "Limit": 1,
    }
    console.log(params)
    docClient.scan(params, function(err, data) {
      if (err){
        console.log(err, err.stack); // an error occurred
        rej(err)
      }else{
        console.log("====== GOT LATEST SUBLET =====")
        console.log(data);           // successful response
        res(data.Items)
      }
    })
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
         "#POST_ID": "POST_ID"
       },
       "ExpressionAttributeValues": {
         ":fb_post_id": fb_post_id
       }
    }
    console.log(params)
    docClient.scan(params, function(err, data) {
      if (err){
        console.log(err, err.stack); // an error occurred
        rej(err)
      }else{
        console.log("====== GOT LATEST SUBLET =====")
        console.log(data);           // successful response
        res(data.Items)
      }
    })
  })
  return p
}

exports.get_sublets_by_place_id = function(place_id) {
  console.log('get_sublet_by_place_id')
  const p = new Promise((res, rej) => {
    const params = {
       "TableName": "Rentburrow_Sublets_Operational",
       "FilterExpression": "#PLACE_ID = :place_id",
       "ExpressionAttributeNames": {
         "#PLACE_ID": "PLACE_ID"
       },
       "ExpressionAttributeValues": {
         ":place_id": place_id
       }
    }
    console.log(params)
    docClient.scan(params, function(err, data) {
      if (err){
        console.log(err, err.stack); // an error occurred
        rej(err)
      }else{
        console.log("====== GOT LATEST SUBLETS =====")
        console.log(data);           // successful response
        res(data.Items)
      }
    })
  })
  return p
}

exports.get_sublets_by_address = function(address) {
  console.log('get_sublet_by_address')
  const p = new Promise((res, rej) => {
    const params = {
       "TableName": "Rentburrow_Sublets_Operational",
       "FilterExpression": "#ADDRESS = :address",
       "ExpressionAttributeNames": {
         "#ADDRESS": "ADDRESS"
       },
       "ExpressionAttributeValues": {
         ":address": address
       }
    }
    console.log(params)
    docClient.scan(params, function(err, data) {
      if (err){
        console.log(err, err.stack); // an error occurred
        rej(err)
      }else{
        console.log("====== GOT LATEST SUBLETS =====")
        console.log(data);           // successful response
        res(data.Items)
      }
    })
  })
  return p
}

function unixDateSince(numDays){
  const today = new Date()
  const todayUnix = today.getTime()
  const sinceUnix = todayUnix - (numDays*24*60*60*1000)
  return sinceUnix
}
