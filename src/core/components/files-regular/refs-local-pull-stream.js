'use strict'

const CID = require('cids')
const base32 = require('base32.js')
const pull = require('pull-stream')
const pullDefer = require('pull-defer')

module.exports = function (self) {
  return () => {
    const deferred = pullDefer.source()

    self._repo.blocks.query({ keysOnly: true }, (err, blocks) => {
      if (err) {
        return deferred.resolve(pull.error(err))
      }

      const refs = blocks.map(b => dsKeyToRef(b.key))
      deferred.resolve(pull.values(refs))
    })

    return deferred
  }
}

function dsKeyToRef (key) {
  try {
    // Block key is of the form /<base32 encoded string>
    const decoder = new base32.Decoder()
    const buff = Buffer.from(decoder.write(key.toString().slice(1)).finalize())
    return { ref: new CID(buff).toString() }
  } catch (err) {
    return { err: `Could not convert block with key '${key}' to CID: ${err.message}` }
  }
}
