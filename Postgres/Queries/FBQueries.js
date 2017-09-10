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

exports.insert_facebook_sublets = (info) => {
  const values = [info.post_id, info.post_url, info.fb_user_id, info.fb_user_name, info.fb_user_pic,
                  info.price, info.address, info.description, info.gps_x, info.gps_y, info.ensuite_bath,
                  info.utils_included, info.female_only, info.rooms_left, info.location_id,
                  info.fb_group_id, info.posted_date, info.phone, info.images]

  const insert_sublets = `INSERT INTO facebook_sublets (post_id, post_url, fb_user_id, fb_user_name, fb_user_pic,
                                                        price, address, description, gps_x, gps_y, ensuite_bath, utils_included,
                                                        female_only, rooms_left, location_id, fb_group_id, posted_date, phone, images)
                               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                            `

  return query(insert_sublets, values)
    .then((data) => {
      // console.log('Building info inserted in postgres')
      return Promise.resolve({
        message: 'Successfully saved sublet',
        post_id: info.post_id
      })
      // res.json({
      //   message: 'Successfully saved building',
      //   building_id: building_id
      // })
    })
}

exports.check_latest_sublet = (req, res, next) => {
  const info = req.body
  const values = [info.fb_group_id]

  let get_last_row = `SELECT * FROM facebook_sublets WHERE fb_group_id = $1 ORDER BY created_at DESC LIMIT 1
                      `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_last_row, values)
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
