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

exports.insert_user = (req, res, next) => {
  const info = req.body
  const values = [info.id, info.name, info.picurl]

  const insert_user = `INSERT INTO tenant (id, name, picurl)
                                        SELECT $1, $2, $3
                                        WHERE NOT EXISTS (
                                          SELECT id, name, picurl
                                          FROM tenant
                                          WHERE id = $1
                                            AND name = $2)`
  query(insert_user, values)
  .then((data) => {
    res.json({
      message: 'Successfully saved user'
    })
  })
  .catch((error) => {
    console.log(error)
    res.status(500).send('Failed to Save User')
  })
}
