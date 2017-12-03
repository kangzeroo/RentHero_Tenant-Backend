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


exports.post_tenant_info = (req, res, next) => {
  // const info = req.body
  // console.log(info)
  // we can optionally accept a pre-defined corporation for this staff member to be associated with
  // let query_string = `INSERT INTO staff (staff_id${info.corporation_id ? ', corporation_id' : ''}, email, name, phone,
  //                                       staff_title)
  //                     VALUES ('${info.staff_id}'${info.corporation_id ? `, '${info.corporation_id}'` : ''},
  //                             '${info.email}', '${info.name}', '${info.phone}', '${info.staff_title}')`
  // console.log(query_string)

  // query(query_string).then((data) => {
  //   // console.log('register info inserted in postgres')
  //   res.json({
  //     message: 'Successfully created account! Check your email for the confirmation link',
  //     data: data
  //   })
  // })
  // .catch((error) => {
  //   console.log(error)
  //     res.status(500).send('Failed to save tenant info')
  // })
}

exports.get_tenant_info = (req, res, next) => {
  // const info = req.body
  // let query_string = `SELECT * FROM staff WHERE staff_id = '${info.staff_id}'`
  // const return_rows = (rows) => {
  //   res.json(rows)
  // }
  //
  // query(query_string)
  //   .then((data) => {
  //     return stringify_rows(data)
  //   })
  //   .then((data) => {
  //     return log_through(data)
  //   })
  //   .then((data) => {
  //     // console.log("========================")
  //     // console.log(typeof JSON.parse(data))
  //     // console.log(JSON.parse(data))
  //     return return_rows(JSON.parse(data))
  //   })
  //   .catch((error) => {
  //       res.status(500).send('Failed to get tenant info')
  //   })
}
