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


exports.filter_buildings = (req, res, next) => {
  const info = req.body
  const values = [info.price.min, info.price.max, info.room_count]

  let get_buildings = `SELECT a.building_id, a.corporation_id, a.building_alias,
                             a.building_desc, a.building_type, b.building_address,
                             b.gps_x, b.gps_y,
                             c.thumbnail, c.cover_photo, d.imgs, e.min_price
                      FROM building a
                      INNER JOIN
                        (SELECT address_id, gps_x, gps_y, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address
                        FROM address) b
                        ON a.address_id = b.address_id
                      INNER JOIN
                        (SELECT building_id, thumbnail, cover_photo FROM media
                          WHERE suite_id IS NULL
                            AND room_id IS NULL) c
                        ON a.building_id = c.building_id
                      INNER JOIN
                        (SELECT building_id, array_agg(image_url ORDER BY position) AS imgs
                          FROM images
                          WHERE suite_id IS NULL
                            AND room_id IS NULL
                          GROUP BY building_id
                        ) d
                      ON a.building_id = d.building_id
                      INNER JOIN
                        (SELECT building_id, MIN(price) AS min_price, MAX(price) AS max_price FROM room
                          WHERE price >= $1 AND price <= $2
                          GROUP BY building_id) e
                      ON a.building_id = e.building_id
                      INNER JOIN
                        (SELECT DISTINCT ab.building_id
                           FROM (SELECT building_id, suite_id FROM room) ab
                           INNER JOIN (SELECT suite_id, count(*) AS room_count
                                         FROM room
                                        GROUP BY suite_id) bc
                           ON ab.suite_id = bc.suite_id
                         WHERE bc.room_count >= $3) f
                      ON a.building_id = f.building_id
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

exports.sort_buildings = (req, res, next) => {
  const info = req.body

  let get_buildings

  if (info.sort_by === 'pricelow') {
    get_buildings = `SELECT a.building_id, a.corporation_id, a.building_alias,
                               a.building_desc, a.building_type, b.building_address,
                               b.gps_x, b.gps_y,
                               c.thumbnail, c.cover_photo, d.imgs, e.min_price
                        FROM building a
                        INNER JOIN
                          (SELECT address_id, gps_x, gps_y, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address
                          FROM address) b
                          ON a.address_id = b.address_id
                        INNER JOIN
                          (SELECT building_id, thumbnail, cover_photo FROM media
                            WHERE suite_id IS NULL
                              AND room_id IS NULL) c
                          ON a.building_id = c.building_id
                        INNER JOIN
                          (SELECT building_id, array_agg(image_url ORDER BY position) AS imgs
                            FROM images
                            WHERE suite_id IS NULL
                              AND room_id IS NULL
                            GROUP BY building_id
                          ) d
                        ON a.building_id = d.building_id
                        INNER JOIN
                          (SELECT building_id, MIN(price) AS min_price FROM room
                           GROUP BY building_id) e
                        ON a.building_id = e.building_id
                        ORDER BY e.min_price
                        `
  } else if (info.sort_by === 'pricehigh') {
    get_buildings = `SELECT a.building_id, a.corporation_id, a.building_alias,
                               a.building_desc, a.building_type, b.building_address,
                               b.gps_x, b.gps_y,
                               c.thumbnail, c.cover_photo, d.imgs, e.min_price
                        FROM building a
                        INNER JOIN
                          (SELECT address_id, gps_x, gps_y, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address
                          FROM address) b
                          ON a.address_id = b.address_id
                        INNER JOIN
                          (SELECT building_id, thumbnail, cover_photo FROM media
                            WHERE suite_id IS NULL
                              AND room_id IS NULL) c
                          ON a.building_id = c.building_id
                        INNER JOIN
                          (SELECT building_id, array_agg(image_url ORDER BY position) AS imgs
                            FROM images
                            WHERE suite_id IS NULL
                              AND room_id IS NULL
                            GROUP BY building_id
                          ) d
                        ON a.building_id = d.building_id
                        INNER JOIN
                          (SELECT building_id, MIN(price) AS min_price FROM room
                           GROUP BY building_id) e
                        ON a.building_id = e.building_id
                        ORDER BY e.min_price DESC
                        `
  } else if (info.sort_by === 'date') {
    get_buildings = `SELECT a.building_id, a.corporation_id, a.building_alias,
                               a.building_desc, a.building_type, b.building_address,
                               b.gps_x, b.gps_y,
                               c.thumbnail, c.cover_photo, d.imgs, e.min_price
                        FROM building a
                        INNER JOIN
                          (SELECT address_id, gps_x, gps_y, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address
                          FROM address) b
                          ON a.address_id = b.address_id
                        INNER JOIN
                          (SELECT building_id, thumbnail, cover_photo FROM media
                            WHERE suite_id IS NULL
                              AND room_id IS NULL) c
                          ON a.building_id = c.building_id
                        INNER JOIN
                          (SELECT building_id, array_agg(image_url ORDER BY position) AS imgs
                            FROM images
                            WHERE suite_id IS NULL
                              AND room_id IS NULL
                            GROUP BY building_id
                          ) d
                        ON a.building_id = d.building_id
                        INNER JOIN
                          (SELECT building_id, MIN(price) AS min_price FROM room
                           GROUP BY building_id) e
                        ON a.building_id = e.building_id
                        ORDER BY a.created_at
                        `
  }

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_buildings)
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
