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


exports.get_room_page = (req, res, next) => {
  const info = req.body
  const values = [info.building_id, info.suite_id, info.room_id]

  let get_room = `SELECT a.room_code, a.room_alias, a.room_desc, a.price,
                         b.thumbnail, b.istaging_url,
                         c.imgs
                    FROM (SELECT * FROM room
                          WHERE building_id = $1
                            AND suite_id = $2
                            AND room_id = $3) a
                    INNER JOIN (SELECT * FROM media
                                 WHERE building_id = $1
                                   AND suite_id = $2
                                   AND room_id = $3) b
                    ON a.building_id = b.building_id AND a.suite_id = b.suite_id
                      AND a.room_id = b.room_id
                    INNER JOIN (SELECT room_id, array_agg(image_url) AS imgs
                                  FROM images
                                  WHERE room_id = $3
                                GROUP BY room_id) c
                    ON b.room_id = c.room_id
                      `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_room, values)
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

exports.get_room_amenities = (req, res, next) => {
  const info = req.body
  const values = [info.building_id, info.suite_id, info.room_id]

  let get_room = `SELECT * FROM amenities
                   WHERE building_id = $1
                     AND suite_id = $2
                     AND room_id = $3
                      `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_room, values)
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
