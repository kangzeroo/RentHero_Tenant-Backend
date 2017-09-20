const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../Postgres/db_connect')
const uuid = require('uuid')
const subletParser = require('./api/subletParser')
const fbExtractor = require('./api/fbExtractor')
const get_sublets_from_dynamodb = require('../DynamoDB/dynamodb_api').get_sublets_from_dynamodb
const getLatestSubletFromDb = require('../DynamoDB/dynamodb_api').getLatestSubletFromDb
const get_sublet_by_id_from_dynamodb = require('../DynamoDB/dynamodb_api').get_sublet_by_id_from_dynamodb

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
  getLatestSubletFromDb().then((data) => {
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

exports.new_sublets = (req, res, next) => {
  // set the facebook token so that we can use it for Facebook API requests
	fbExtractor.setFacebookToken(req.body.profile.fbToken)
  // save the sublets to database
	subletParser.parseAndSaveSublets(req.body.newSublets)
}

exports.get_sublet_by_id = (req, res, next) => {
  console.log('get_sublet_by_id')
  get_sublet_by_id_from_dynamodb(req.body.fb_post_id).then((data) => {
    res.json(data)
  }).catch((err) => {
    res.status(err).send(err)
  })
}
