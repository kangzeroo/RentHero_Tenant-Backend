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
  console.log(data)
  return data
}


exports.get_buildings_info = (req, res, next) => {
  const info = req.body
  let get_building = `SELECT a.building_id, a.corporation_id, a.building_name,
                             a.building_desc, a.building_type, b.building_address,
                             c.thumbnail, c.cover_photo, d.min_price, d.max_price
                      FROM building a
                      INNER JOIN
                        (SELECT address_id, CONCAT(street_code, ' ', street_name, ', ', city, ', ', province, ', ', country) AS building_address
                        FROM address) b
                        ON a.address_id = b.address_id
                      INNER JOIN
                        (SELECT building_id, thumbnail, cover_photo FROM media WHERE building_id IS NOT NULL) c
                        ON a.building_id = c.building_id
                      INNER JOIN
                        (SELECT building_id, MIN(price) AS min_price, MAX(price) AS max_price FROM room GROUP BY building_id) d
                        ON d.building_id = a.building_id
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building)
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
