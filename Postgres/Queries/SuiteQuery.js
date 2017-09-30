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

exports.get_available_suites = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]

  let get_suites = `SELECT a.suite_id, a.suite_code, a.suite_alias,
                               b.min_price, b.max_price, b.available, b.total,
                               c.imgs, d.thumbnail, d.cover_photo
                          FROM (SELECT DISTINCT ON (suite_alias) suite_id, suite_code, suite_alias
                                  FROM suite
                                  WHERE building_id = $1
                                  ORDER BY suite_alias) a
                          LEFT OUTER JOIN (
                            SELECT suite_id,
                                   MIN(price) AS min_price, MAX(price) AS max_price,
                                   (COUNT(*) - COUNT(CASE WHEN occupied THEN 1 END)) AS available,
                                   COUNT(*) AS total
                              FROM room
                              WHERE building_id = $1
                              GROUP BY suite_id
                              ORDER BY suite_id
                          ) b
                          ON a.suite_id = b.suite_id
                          LEFT OUTER JOIN (
                            SELECT suite_id, array_agg(image_url) AS imgs
                              FROM images
                              WHERE building_id = $1
                              GROUP BY suite_id
                          ) c
                          ON a.suite_id = c.suite_id
                          LEFT OUTER JOIN (
                            SELECT suite_id, thumbnail, cover_photo
                              FROM media
                              WHERE room_id IS NULL
                          ) d
                          ON a.suite_id = d.suite_id
                          ORDER BY a.suite_code
                       `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_suites, values)
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
        res.status(500).send('Failed to get property info')
    })
}

exports.get_amenities_for_suite = (req, res, next) => {
  console.log('get_amenities_for_suite')
  const info = req.body
  const values = [info.building_id, info.suite_id]
  const get_amenities = `SELECT a.amenity_alias, a.amenity_type, a.amenity_class, d.imgs
                          FROM (SELECT * FROM amenities
                                WHERE building_id = $1
                                  AND suite_id = $2
                                  AND room_id IS NULL) a
                          LEFT OUTER JOIN
                            (SELECT b.amenity_id, array_agg(c.image_url) AS imgs
                               FROM
                               (SELECT * FROM amenities_images
                                 WHERE building_id = $1
                                   AND suite_id = $2
                                   AND room_id IS NULL) b
                               INNER JOIN
                               (SELECT * FROM images
                                 WHERE building_id = $1
                                   AND suite_id = $2
                                   AND room_id IS NULL) c
                               ON b.image_id = c.image_id
                               GROUP BY b.amenity_id
                            ) d
                          ON a.amenity_id = d.amenity_id

                          `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_amenities, values)
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
        res.status(500).send('Failed to get suite amenities info')
    })
}

exports.get_suite_page = (req, res, next) => {
  const info = req.body
  const values = [info.building_id, info.suite_id]
  let get_suites = `SELECT a.suite_id, a.suite_code, a.suite_alias, a.suite_desc,
                           b.cover_photo, b.thumbnail, b.istaging_url, b.iguide_url,
                           c.imgs
                      FROM (SELECT * FROM suite
                             WHERE building_id = $1
                               AND suite_id = $2) a
                      INNER JOIN (SELECT * FROM media
                                  WHERE room_id IS NULL) b
                      ON a.building_id = b.building_id AND a.suite_id = b.suite_id
                      LEFT OUTER JOIN (SELECT suite_id, array_agg(image_url) AS imgs
                                    FROM images
                                    WHERE suite_id = $2
                                      AND room_id IS NULL
                                    GROUP BY suite_id) c
                      ON b.suite_id = c.suite_id
                   `
  const return_rows = (rows) => {
    res.json(rows[0])
  }
  query(get_suites, values)
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
        res.status(500).send('Failed to get property info')
    })
}

exports.get_all_rooms_for_suite = (req, res, next) => {
  const info = req.body
  const values = [info.building_id, info.suite_id]
  let get_rooms = `SELECT a.building_id, a.suite_id, a.room_id, a.room_code, a.room_alias, a.room_desc, a.price, a.occupied,
                           b.thumbnail, b.istaging_url, c.imgs
                      FROM (SELECT * FROM room
                             WHERE building_id = $1
                               AND suite_id = $2 ) a
                     LEFT OUTER JOIN (SELECT * FROM media
                                  WHERE building_id = $1
                                    AND suite_id = $2
                                    AND room_id IS NOT NULL) b
                      ON a.building_id = b.building_id AND a.suite_id = b.suite_id AND a.room_id = b.room_id
                      LEFT OUTER JOIN (SELECT room_id, array_agg(image_url) AS imgs
                                    FROM images
                                    WHERE building_id = $1
                                      AND suite_id = $2
                                      AND room_id IS NOT NULL
                                    GROUP BY room_id) c
                      ON b.room_id = c.room_id
                   `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_rooms, values)
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
        res.status(500).send('Failed to get rooms for suite')
    })
}
