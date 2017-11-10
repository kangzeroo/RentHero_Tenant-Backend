const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const moment = require('moment')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

const json_rows = res => res.map(row => JSON.parse(row))
//log_through: log each row
const log_through = data => {
  // console.log(data)
  return data
}

exports.submit_request = (req, res, next) => {
  const info = req.body
  const values = [info.first_name, info.last_name, info.email, info.phone, info.description]

  const insert_request = `INSERT INTO requests (first_name, last_name, email, phone, description, resolved)
                                        VALUES ($1, $2, $3, $4, $5, false)
                          RETURNING created_at`

  query(insert_request, values)
  .then((data) => {
    const time = moment(data.rows[0].created_at).format('MMMM Do YYYY')
    res.json({
      message: 'successfully submitted request',
      created_at: time,
    })
  })
  .catch((data) => {
    res.status(500).send('Failed to submit request')
  })
}
