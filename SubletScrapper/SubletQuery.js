const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../Postgres/db_connect')
const uuid = require('uuid')
const subletParser = require('./api/subletParser')
const fbExtractor = require('./api/fbExtractor')
const get_sublets_from_dynamodb = require('../DynamoDB/dynamodb_api').get_sublets_from_dynamodb
const getLatestSubletFromDb = require('../DynamoDB/dynamodb_api').getLatestSubletFromDb
const get_sublet_by_id_from_dynamodb = require('../DynamoDB/dynamodb_api').get_sublet_by_id_from_dynamodb
const get_sublets_by_place_id = require('../DynamoDB/dynamodb_api').get_sublets_by_place_id
const post_sublet_to_dynamodb = require('../DynamoDB/dynamodb_api').post_sublet_to_dynamodb
const get_my_sublets_from_dynamodb = require('../DynamoDB/dynamodb_api').get_my_sublets_from_dynamodb
const bump_sublet_in_dynamodb = require('../DynamoDB/dynamodb_api').bump_sublet_in_dynamodb

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

//log_through: log each row
const log_through = data => {
  return data
}

exports.check_latest_sublet = (req, res, next) => {
  console.log(`GROUP ID = ${typeof req.body.groupid} ${req.body.groupid}`)
  getLatestSubletFromDb(req.body.groupid).then((data) => {
    console.log('getLatestSubletFromDb')
    console.log(data)
    res.json(data)
  }).catch((err) => {
    res.status(err).send(err)
  })
}

exports.get_sublets = (req, res, next) => {
  get_sublets_from_dynamodb().then((data) => {
    res.json(data)
  }).catch((err) => {
    res.status(err).send(err)
  })
}

exports.get_my_sublets = (req, res, next) => {
  const fb_user_id = req.body.fb_user_id
  get_my_sublets_from_dynamodb(fb_user_id).then((data) => {
    res.json(data)
  }).catch((err) => {
    res.status(err).send(err)
  })
}

exports.bump_sublet = (req, res, next) => {
  const sublet = req.body.sublet
  bump_sublet_in_dynamodb(sublet).then((data) => {
    res.json({
      message: 'successfully bumped'
    })
  }).catch((err) => {
    res.status(500).send({
      message: 'min 24 hours between bumps'
    })
  })
}

exports.new_sublets = (req, res, next) => {
  // set the facebook token so that we can use it for Facebook API requests
	fbExtractor.setFacebookToken(req.body.profile.fbToken)
  // save the sublets to database
	subletParser.parseAndSaveSublets(req.body.newSublets)
}

exports.get_matching_sublets = (req, res, next) => {
  console.log('get_matching_sublets')
  // get_sublet_by_id_from_dynamodb(req.body.fb_post_id).then((data) => {
  //   console.log(data)
  //   return get_sublets_by_place_id(data[0].PLACE_ID)
  // })
  get_sublets_by_place_id(req.body.place_id).then((data) => {
    res.json(data)
  }).catch((err) => {
    res.status(err).send(err)
  })
}

exports.get_matching_sublets_by_address = (req, res, next) => {
  console.log('get_matching_sublets_by_address')
  // get_sublet_by_id_from_dynamodb(req.body.fb_post_id).then((data) => {
  //   console.log(data)
  //   return get_sublets_by_place_id(data[0].PLACE_ID)
  // })
  get_sublets_by_address(req.body.address).then((data) => {
    res.json(data)
  }).catch((err) => {
    res.status(err).send(err)
  })
}

exports.post_sublet = (req, res, next) => {
  console.log('post_sublet')
  console.log(req.body)
  post_sublet_to_dynamodb(req.body.sublet).then((data) => {
    console.log('SUCCESSFULLY INSERTED SUBLET')
    console.log(data)
    res.json({
      message: 'success'
    })
  }).catch((err) => {
    res.status(err).send(err)
  })
}
