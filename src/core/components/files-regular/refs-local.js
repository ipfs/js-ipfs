'use strict'

const CID = require('cids')
const base32 = require('base32.js')
const promisify = require('promisify-es6')

module.exports = function (self) {
  return promisify((callback) => {
    self._repo.blocks.query({ keysOnly: true }, (err, blocks) => {
      if (err) {
        return callback(err)
      }

      callback(null, blocks.map(b => dsKeyToRef(b.key)))
    })
  })
}

function dsKeyToRef (key) {
  // Block key is of the form /<base32 encoded string>
  const decoder = new base32.Decoder()
  const buff = decoder.write(key.toString().slice(1)).finalize()
  try {
    return { ref: new CID(buff).toString() }
  } catch (err) {
    return { err: `Could not convert block with key '${key}' to CID: ${err.message}` }
  }
}
