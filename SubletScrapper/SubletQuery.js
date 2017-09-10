const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../Postgres/db_connect')
const uuid = require('uuid')
const subletParser = require('./api/subletParser')
const fbExtractor = require('./api/fbExtractor')
const check_latest_sublet = require('../Postgres/Queries/FBQueries').check_latest_sublet

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
  check_latest_sublet({ fb_group_id: req.body.groupid })
    .then((data) => {
      console.log('========================================================================')
      console.log(data)
      res.json(data)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
}


exports.new_sublets = (req, res, next) => {
  // set the facebook token so that we can use it for Facebook API requests
	fbExtractor.setFacebookToken(req.body.profile.fbToken)
  // save the sublets to database
	subletParser.parseAndSaveSublets(req.body.newSublets)
}
