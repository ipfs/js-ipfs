'use strict'

const CID = require('cids')
const base32 = require('base32.js')
const itToPull = require('async-iterator-to-pull-stream')

module.exports = function (self) {
  return () => {
    return itToPull((async function * () {
      for await (const result of self._repo.blocks.query({ keysOnly: true })) {
        yield dsKeyToRef(result.key)
      }
    })())
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
