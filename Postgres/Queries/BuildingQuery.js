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

const json_rows = res => res.map(row => JSON.parse(row))
//log_through: log each row
const log_through = data => {
  // console.log(data)
  return data
}


exports.get_all_active_buildings = (req, res, next) => {
  const info = req.body

  let get_building = `SELECT a.building_id, a.corporation_id, a.building_alias,
                             a.building_desc, a.building_type, a.created_at,
                             b.building_address, b.gps_x, b.gps_y,
                             c.thumbnail, c.cover_photo, d.imgs, e.min_price, e.max_price,
                             f.min_rooms, f.max_rooms,
                             h.ensuite_bath, i.utils_incl, j.label
                      FROM building a
                      INNER JOIN
                        (SELECT address_id, gps_x, gps_y,
                                CONCAT(street_code, ' ', street_name, ', ', city) AS building_address
                           FROM address
                         ) b
                        ON a.address_id = b.address_id
                      LEFT OUTER JOIN
                        (SELECT building_id, thumbnail, cover_photo FROM media
                          WHERE suite_id IS NULL
                            AND room_id IS NULL) c
                        ON a.building_id = c.building_id
                      LEFT OUTER JOIN
                        (SELECT building_id, array_agg(image_url ORDER BY position) AS imgs
                          FROM summary_images
                          GROUP BY building_id
                        ) d
                      ON a.building_id = d.building_id
                      LEFT OUTER JOIN
                        (SELECT building_id, MIN(price) AS min_price, MAX(price) AS max_price FROM room
                         GROUP BY building_id) e
                      ON a.building_id = e.building_id
                      LEFT OUTER JOIN
                        (SELECT au.building_id, MIN(bu.room_count) AS min_rooms, MAX(bu.room_count) AS max_rooms
                           FROM suite au
                           INNER JOIN
                           (SELECT suite_id, COUNT(*) AS room_count
                              FROM room
                              GROUP BY suite_id) bu
                            ON au.suite_id = bu.suite_id
                            GROUP BY au.building_id) f
                       ON a.building_id = f.building_id
                       LEFT OUTER JOIN
                          (SELECT amen.building_id, bmen.ensuite_bath
                             FROM building amen
                           LEFT OUTER JOIN
                              (SELECT DISTINCT building_id, True AS ensuite_bath
                                 FROM amenities
                                 WHERE amenity_alias = 'Ensuite Bathroom') bmen
                           ON amen.building_id = bmen.building_id
                         ) h
                       ON a.building_id = h.building_id
                       LEFT OUTER JOIN
                           (SELECT DISTINCT amen2.building_id, bmen2.utils_incl
                              FROM building amen2
                            LEFT OUTER JOIN
                               (SELECT building_id, True AS utils_incl
                                  FROM amenities
                                  WHERE amenity_class = 'free_utils') bmen2
                            ON amen2.building_id = bmen2.building_id
                          ) i
                        ON a.building_id = i.building_id
                        INNER JOIN (SELECT building_id, label FROM building_details WHERE active=true) j ON a.building_id = j.building_id
                      `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

    })
    .then((data) => {
      return return_rows(data)
    })
    .catch((error) => {
        res.status(500).send('Failed to get buildings info')
    })
}

exports.get_all_active_buildings_geo = (req, res, next) => {
  const info = req.body
  const values = [info.lat, info.lng]

  let get_building = `SELECT a.building_id, a.corporation_id, a.building_alias,
                             a.building_desc, a.building_type, a.created_at,
                             b.building_address, b.gps_x, b.gps_y,
                             c.thumbnail, c.cover_photo, d.imgs, e.min_price, e.max_price,
                             f.min_rooms, f.max_rooms,
                             h.ensuite_bath, i.utils_incl, j.label
                      FROM building a
                      INNER JOIN
                        (SELECT address_id, gps_x, gps_y,
                                CONCAT(street_code, ' ', street_name, ', ', city) AS building_address
                           FROM address
                          WHERE ST_DWithin(ST_MakePoint(gps_x::float, gps_y::float), Geography(ST_MakePoint($1, $2)), 2000)
                         ) b
                        ON a.address_id = b.address_id
                      LEFT OUTER JOIN
                        (SELECT building_id, thumbnail, cover_photo FROM media
                          WHERE suite_id IS NULL
                            AND room_id IS NULL) c
                        ON a.building_id = c.building_id
                      LEFT OUTER JOIN
                        (SELECT building_id, array_agg(image_url ORDER BY position) AS imgs
                          FROM summary_images
                          GROUP BY building_id
                        ) d
                      ON a.building_id = d.building_id
                      LEFT OUTER JOIN
                        (SELECT building_id, MIN(price) AS min_price, MAX(price) AS max_price FROM room
                         GROUP BY building_id) e
                      ON a.building_id = e.building_id
                      LEFT OUTER JOIN
                        (SELECT au.building_id, MIN(bu.room_count) AS min_rooms, MAX(bu.room_count) AS max_rooms
                           FROM suite au
                           INNER JOIN
                           (SELECT suite_id, COUNT(*) AS room_count
                              FROM room
                              GROUP BY suite_id) bu
                            ON au.suite_id = bu.suite_id
                            GROUP BY au.building_id) f
                       ON a.building_id = f.building_id
                       LEFT OUTER JOIN
                          (SELECT amen.building_id, bmen.ensuite_bath
                             FROM building amen
                           LEFT OUTER JOIN
                              (SELECT DISTINCT building_id, True AS ensuite_bath
                                 FROM amenities
                                 WHERE amenity_alias = 'Ensuite Bathroom') bmen
                           ON amen.building_id = bmen.building_id
                         ) h
                       ON a.building_id = h.building_id
                       LEFT OUTER JOIN
                           (SELECT DISTINCT amen2.building_id, bmen2.utils_incl
                              FROM building amen2
                            LEFT OUTER JOIN
                               (SELECT building_id, True AS utils_incl
                                  FROM amenities
                                  WHERE amenity_class = 'free_utils') bmen2
                            ON amen2.building_id = bmen2.building_id
                          ) i
                        ON a.building_id = i.building_id
                        INNER JOIN (SELECT * FROM building_details WHERE active=true) j ON a.building_id = j.building_id
                      `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

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
  const values = [info.building_id]
  let get_landlord = `SELECT a.corporation_id, b.corporation_name, b.email, b.phone, b.thumbnail
                      FROM building a
                      INNER JOIN corporation b ON a.corporation_id = b.corporation_id
                      WHERE building_id=$1
                      `
  const return_rows = (rows) => {
    res.json(rows[0])
  }
  query(get_landlord, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

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
  let get_building =  `SELECT a.building_id, a.building_alias,
                             a.building_desc, a.building_type, b.building_address,
                             b.gps_x, b.gps_y, c.istaging_url,
                             c.thumbnail, c.cover_photo, d.label, e.min_price
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
                      INNER JOIN building_details d ON a.building_id = d.building_id
                      LEFT OUTER JOIN
                        (
                         SELECT building_id, MIN(price) AS min_price
                           FROM room
                          WHERE building_id = $1
                          GROUP BY building_id
                        ) e
                      ON a.building_id = e.building_id
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

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
                             b.gps_x, b.gps_y, b.place_id,
                             c.thumbnail, c.cover_photo, c.istaging_url, c.iguide_url, c.video_url, c.matterport_url,
                             d.imgs,
                             e.label, e.prize,
                             f.min_price, f.max_price,
                             g.min_rooms, g.max_rooms
                      FROM (SELECT * FROM building WHERE lower(building_alias) = $1) a
                      INNER JOIN
                        (SELECT address_id, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address,
                                gps_x, gps_y, place_id
                        FROM address) b
                        ON a.address_id = b.address_id
                      INNER JOIN
                        (SELECT building_id, thumbnail, cover_photo, istaging_url, iguide_url, video_url, matterport_url
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
                      INNER JOIN building_details e ON a.building_id = e.building_id
                      LEFT OUTER JOIN
                        (
                         SELECT building_id, MIN(price) AS min_price, MAX(price) AS max_price
                           FROM room
                          GROUP BY building_id
                        ) f
                      ON a.building_id = f.building_id
                      LEFT OUTER JOIN
                        (SELECT au.building_id, MIN(bu.room_count) AS min_rooms, MAX(bu.room_count) AS max_rooms
                           FROM suite au
                           INNER JOIN
                           (SELECT suite_id, COUNT(*) AS room_count
                              FROM room
                              GROUP BY suite_id) bu
                            ON au.suite_id = bu.suite_id
                            GROUP BY au.building_id) g
                       ON a.building_id = g.building_id
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

    })
    .then((data) => {
      return return_rows(data)
    })
    .catch((error) => {
        res.status(500).send('Failed to get property info')
    })
}

exports.get_building_by_place_id = (req, res, next) => {
  const info = req.body
  const values = [info.place_id]
  let get_building =  `SELECT a.building_id, a.corporation_id, a.building_alias,
                             a.building_desc, a.building_type, b.building_address,
                             b.gps_x, b.gps_y, b.place_id
                      FROM
                        (SELECT address_id, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address,
                                gps_x, gps_y, place_id
                        FROM address
                        WHERE place_id = $1) b
                      INNER JOIN
                        building a
                      ON a.address_id = b.address_id
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

    })
    .then((data) => {
      return return_rows(data)
    })
    .catch((error) => {
        res.status(500).send('Failed to get property info')
    })
}

exports.get_building_by_address = (req, res, next) => {
  const info = req.body
  console.log(info)
  const values = [info.street_code, info.street_name, info.city, info.province, info.country, info.postal_code]

  let get_building =  `SELECT a.building_id, a.corporation_id, a.building_alias,
                             a.building_desc, a.building_type, b.building_address,
                             b.gps_x, b.gps_y, b.place_id
                      FROM
                        (SELECT address_id, CONCAT(street_code, ' ', street_name, ', ', city) AS building_address,
                                gps_x, gps_y, place_id
                        FROM address
                        WHERE street_code = $1
                          AND street_name = $2
                          AND city = $3
                          AND province = $4
                          AND country = $5
                          AND postal_code = $6) b
                      INNER JOIN
                        building a
                      ON a.address_id = b.address_id
                      `
  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_building, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

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
      return json_rows(data)

    })
    .then((data) => {
      return return_rows(data)
    })
    .catch((error) => {
        res.status(500).send('Failed to get property info')
    })
}

exports.get_all_summary_images = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]
  let get_images =  `SELECT id AS image_id, image_url, position FROM summary_images
                        WHERE building_id = $1
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
      return json_rows(data)

    })
    .then((data) => {
      return return_rows(data)
    })
    .catch((error) => {
        res.status(500).send('Failed to get property info')
    })
}

exports.get_all_images_size_for_specific_building = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]
  let get_images =  `SELECT count(*) AS image_count FROM images
                        WHERE building_id = $1
                      `
  const return_rows = (rows) => {
    res.json(rows[0])
  }
  query(get_images, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

    })
    .then((data) => {
      return return_rows(data)
    })
    .catch((error) => {
        res.status(500).send('Failed to get property info')
    })
}

exports.get_num_virtual_tours = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]
  let get_images =  `
                     SELECT SUM(vr_tour_count) vr_tour_count FROM (
                       SELECT COUNT(*) AS vr_tour_count FROM media WHERE istaging_url IS NOT NULL AND room_id IS NULL AND building_id = $1
                       UNION ALL
                       SELECT COUNT(*) AS vr_tour_count FROM media WHERE matterport_url IS NOT NULL AND room_id IS NULL AND building_id = $1
                       UNION ALL
                       SELECT COUNT(*) AS vr_tour_count FROM media WHERE video_url IS NOT NULL AND room_id IS NULL AND building_id = $1
                       UNION ALL
                       SELECT COUNT(*) AS vr_tour_count FROM media WHERE babylon_vr_url IS NOT NULL AND room_id IS NULL AND building_id = $1
                       UNION ALL
                       SELECT COUNT(*) AS vr_tour_count FROM media WHERE iguide_url IS NOT NULL AND room_id IS NULL AND building_id = $1
                     ) s
                      `

  const return_rows = (rows) => {
    res.json(rows[0])
  }
  query(get_images, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return json_rows(data)

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
      return json_rows(data)

    })
    .then((data) => {
      return return_rows(data)
    })
    .catch((error) => {
        res.status(500).send('Failed to get property info')
    })
}
