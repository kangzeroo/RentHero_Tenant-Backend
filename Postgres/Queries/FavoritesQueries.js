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


exports.insert_building_favorite = (req, res, next) => {
  const info = req.body

  const values = [info.tenant_id, info.building_id]

  const insert_fav = `INSERT INTO favorites (tenant_id, building_id) VALUES ($1, $2)`

  query(insert_fav, values)
  .then((data) => {
    res.json({
      message: 'Successfully inserted favorite'
    })
  })
  .catch((error) => {
    res.status(500).send('Failed to insert building favorite')
  })
}

exports.insert_suite_favorite = (req, res, next) => {
  const info = req.body

  const values = [info.tenant_id, info.building_id, info.suite_id]

  const insert_fav = `INSERT INTO favorites (tenant_id, building_id, suite_id) VALUES ($1, $2, $3)`

  query(insert_fav, values)
  .then((data) => {
    res.json({
      message: 'Successfully inserted favorite'
    })
  })
  .catch((error) => {
    res.status(500).send('Failed to insert building favorite')
  })
}

exports.delete_building_favorite = (req, res, next) => {
  const info = req.body

  const values = [info.tenant_id, info.building_id]

  const delete_fav = `DELETE FROM favorites WHERE tenant_id = $1 AND building_id = $2 AND suite_id IS NULL`

  query(delete_fav, values)
  .then((data) => {
    res.json({
      message: 'Successfully inserted favorite'
    })
  })
  .catch((error) => {
    res.status(500).send('Failed to insert building favorite')
  })
}

exports.delete_suite_favorite = (req, res, next) => {
  const info = req.body

  const values = [info.tenant_id, info.building_id, info.suite_id]

  const delete_fav = `DELETE FROM favorites WHERE tenant_id = $1 AND building_id = $2 AND suite_id = $3`

  query(delete_fav, values)
  .then((data) => {
    res.json({
      message: 'Successfully inserted favorite'
    })
  })
  .catch((error) => {
    res.status(500).send('Failed to insert building favorite')
  })
}


exports.get_all_favorites_for_tenant = (req, res, next) => {
  const info = req.body

  const values = [info.tenant_id]

  const get_favs = `SELECT b.building_id, b.building_alias, b.building_type,
                           c.building_address, c.gps_x, c.gps_y,
                           d.thumbnail,
                           JSON_AGG((e.suite_id, e.suite_alias, f.thumbnail)) AS suites
                      FROM (
                        SELECT building_id, suite_id, created_at
                          FROM favorites
                         WHERE tenant_id = $1
                      ) a
                      INNER JOIN building b
                        ON a.building_id = b.building_id
                      INNER JOIN
                        (SELECT address_id, gps_x, gps_y,
                                CONCAT(street_code, ' ', street_name, ', ', city) AS building_address
                           FROM address
                         ) c
                        ON b.address_id = c.address_id
                      LEFT OUTER JOIN
                        (SELECT building_id, thumbnail, cover_photo FROM media
                          WHERE suite_id IS NULL
                            AND room_id IS NULL) d
                        ON a.building_id = d.building_id
                      LEFT OUTER JOIN (
                        SELECT suite_id, suite_alias
                          FROM suite
                      ) e
                        ON a.suite_id = e.suite_id
                      LEFT OUTER JOIN (
                        SELECT suite_id, thumbnail
                          FROM media
                         WHERE room_id IS NULL
                      ) f
                        ON a.suite_id = f.suite_id
                      GROUP BY b.building_id, b.building_alias, b.building_type,
                               c.building_address, c.gps_x, c.gps_y, d.thumbnail
                   `

  const return_rows = (rows) => {
    res.json(rows)
  }

  query(get_favs, values)
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
      console.log(error)
        res.status(500).send('Failed to get favorites')
    })
}

exports.get_tenant_favorite_for_building = (req, res, next) => {
  const info = req.body
  const values = [info.tenant_id, info.building_id]

  const get_favs = `SELECT * FROM favorites WHERE tenant_id = $1 AND building_id = $2`

  const return_rows = (rows) => {
    res.json(rows)
  }

  query(get_favs, values)
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
        res.status(500).send('Failed to get favorites')
    })
}

exports.get_favorites_for_tenants_of_group = (req, res, next) => {
  const info = req.body
  const array_of_ids = info.tenant_ids.map((val, ind) => { return `$${ind + 1}` }).join(', ')
  console.log(array_of_ids)

  const values = info.tenant_ids

  const get_favs = `SELECT b.building_id, b.building_alias, b.building_type,
                           c.building_address, c.gps_x, c.gps_y,
                           d.thumbnail, JSON_AGG(a.tenant_id) AS tenant_ids,
                           JSON_AGG((e.suite_id, e.suite_alias, f.thumbnail)) AS suites
                      FROM (
                        SELECT building_id, suite_id, tenant_id, created_at
                          FROM favorites
                      ) a
                      INNER JOIN building b
                        ON a.building_id = b.building_id
                      INNER JOIN
                        (SELECT address_id, gps_x, gps_y,
                                CONCAT(street_code, ' ', street_name, ', ', city) AS building_address
                           FROM address
                         ) c
                        ON b.address_id = c.address_id
                      LEFT OUTER JOIN
                        (SELECT building_id, thumbnail, cover_photo FROM media
                          WHERE suite_id IS NULL
                            AND room_id IS NULL) d
                        ON a.building_id = d.building_id
                      LEFT OUTER JOIN (
                        SELECT suite_id, suite_alias
                          FROM suite
                      ) e
                        ON a.suite_id = e.suite_id
                      LEFT OUTER JOIN (
                        SELECT suite_id, thumbnail
                          FROM media
                         WHERE room_id IS NULL
                      ) f
                        ON a.suite_id = f.suite_id
                      WHERE a.tenant_id IN (${array_of_ids})
                      GROUP BY b.building_id, b.building_alias, b.building_type,
                               c.building_address, c.gps_x, c.gps_y, d.thumbnail`

     const return_rows = (rows) => {
       res.json(rows)
     }

     query(get_favs, values)
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
           res.status(500).send('Failed to get favorites')
       })
  }
