

exports.originCheck = function(req, res, next){
 const origin = req.get('origin')
 if (process.env.NODE_ENV === 'production') {
   if (origin.indexOf('https://rentburrow.com') > -1) {
     next()
   } else {
     res.status(500).send({
       message: 'Incorrect request origin. Not https://rentburrow.com'
     })
   }
 } else {
   if (origin.indexOf('https://localhost:8081') > -1) {
     next()
   } else if (origin.indexOf('http://localhost:3001') > -1 || origin.indexOf('https://localhost:3000') > -1) {
     next()
   } else if (origin.indexOf('ngrok.io') > -1) {
     next()
   } else {
     next()
     // res.status(500).send({
     //   message: 'Incorrect request origin. Not https://localhost:8081'
     // })
   }
 }
}
