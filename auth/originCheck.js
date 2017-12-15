

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
   } else {
     res.status(500).send({
       message: 'Incorrect request origin. Not https://localhost:8081'
     })
   }
 }
}
