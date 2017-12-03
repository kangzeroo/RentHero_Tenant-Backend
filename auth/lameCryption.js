const CryptoJS = require("crypto-js")

exports.lameCryption = function(req, res, next){
 const client_key = req.headers.client_key
 DecryptLameShit(client_key)
   .then((data)=>{
    console.log(data.message)
    next()
   })
   .catch((err)=>{
    console.log(data.message)
    res.send(err)
   })
}

const DecryptLameShit = (client_key) => {
  const p = new Promise((res, rej) => {
    const bytes  = CryptoJS.AES.decrypt(client_key.toString(), 'lameCryption')
    const decryptedKey = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    if (decryptedKey === '80/20_principle_FTW') {
      res({
        message: 'Decryption Success!'
      })
    } else {
      rej({
        message: 'Decryption Failure!'
      })
    }
  })
  return p
}
