const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

//log_through: log each row
const log_through = data => {
  // console.log(data)
  return data
}


exports.get_buildings_by_type = (req, res, next) => {
  const info = req.body
  const values = [info.type]

  let get_buildings = `SELECT * FROM building
                        WHERE building_type = $1
                      `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_buildings, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return log_through(data)
    })
    .then((data) => {
      return return_rows(data)
    })
    .catch((error) => {
        res.status(500).send('Failed to get buildings info')
    })
}
