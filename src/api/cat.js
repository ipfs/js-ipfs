'use strict'

const promisify = require('promisify-es6')
const cleanMultihash = require('../clean-multihash')

module.exports = (send) => {
  const cat = promisify((multihash, callback) => {
    try {
      multihash = cleanMultihash(multihash)
    } catch (err) {
      return callback(err)
    }
    send('cat', multihash, null, null, callback)
  })
  return cat
}
