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


exports.get_all_active_buildings = (req, res, next) => {
  const info = req.body

  let get_building = `SELECT a.building_id, a.corporation_id, a.building_alias,
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

exports.get_specific_landlord = (req, res, next) => {
  const info = req.body
  const values = [info.corporation_id]
  let get_landlord = `SELECT *
                      FROM corporation
                      WHERE corporation_id=$1
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_landlord, values)
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
        res.status(500).send('Failed to get landlord info')
    })
}

exports.get_specific_building = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]
  let get_building =  `SELECT a.building_id, a.corporation_id, a.building_alias,
                             a.building_desc, a.building_type, b.building_address,
                             b.gps_x, b.gps_y, b.istaging_url,
                             c.thumbnail, c.cover_photo
                      FROM (SELECT * FROM building WHERE building_id = $1) a
                      INNER JOIN
                        (SELECT address_id, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address,
                                gps_x, gps_y
                        FROM address) b
                        ON a.address_id = b.address_id
                      INNER JOIN
                        (SELECT building_id, thumbnail, cover_photo, istaging_url FROM media
                          WHERE building_id IS NOT NULL
                            AND suite_id IS NULL
                            AND room_id IS NULL) c
                        ON a.building_id = c.building_id
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building, values)
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

exports.get_specific_building_by_alias = (req, res, next) => {
  const info = req.body
  const values = [info.building_alias]
  let get_building =  `SELECT a.building_id, a.corporation_id, a.building_alias,
                             a.building_desc, a.building_type, b.building_address,
                             b.gps_x, b.gps_y,
                             c.thumbnail, c.cover_photo, c.istaging_url, d.imgs
                      FROM (SELECT * FROM building WHERE building_alias = $1) a
                      INNER JOIN
                        (SELECT address_id, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address,
                                gps_x, gps_y
                        FROM address) b
                        ON a.address_id = b.address_id
                      INNER JOIN
                        (SELECT building_id, thumbnail, cover_photo, istaging_url
                           FROM media
                          WHERE building_id IS NOT NULL
                            AND suite_id IS NULL
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
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building, values)
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

exports.get_images_for_specific_building = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]
  let get_images =  `SELECT image_url, caption, position FROM images
                        WHERE building_id = $1
                          AND suite_id IS NULL
                          AND room_id IS NULL
                        ORDER BY position
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_images, values)
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

exports.get_amenities_for_specific_building = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]
  let get_amenities =  `SELECT a.building_id, a.amenity_alias, a.amenity_type, a.amenity_class,
                               array_agg(c.image_url) AS imgs
                         FROM (SELECT * FROM amenities
                                WHERE building_id = $1
                                  AND suite_id IS NULL
                                  AND room_id IS NULL) a
                         LEFT OUTER JOIN
                          amenities_images b
                         ON a.amenity_id = b.amenity_id
                         LEFT OUTER JOIN
                          images c
                         ON b.image_id = c.image_id
                         GROUP BY a.building_id, a.amenity_alias, a.amenity_type, a.amenity_class
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
        res.status(500).send('Failed to get property info')
    })
}
