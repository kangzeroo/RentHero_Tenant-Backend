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

  const insert_fav = `INSERT INTO favorites (tenant_id, building_id, liked) VALUES ($1, $2, true)`

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

  const get_favs = `SELECT * FROM favorites WHERE tenant_id = $1`

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

exports.get_tenant_favorite_for_building = (req, res, next) => {
  const info = req.body
  const values = [info.tenant_id, info.building_id]

  const get_favs = `SELECT * FROM favorites WHERE tenant_id = $1 AND building_id = $2 AND liked=true AND suite_id IS NULL`

  const return_rows = (rows) => {
    console.log(rows)
    res.json(rows[0])
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
