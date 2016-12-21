'use strict'

const pump = require('pump')
const concat = require('concat-stream')

/*
  Concatenate a stream to a single value.
*/
function streamToValue (res, callback) {
  const done = (data) => callback(null, data)
  pump(res, concat(done), (err) => {
    if (err) callback(err)
  })
}

module.exports = streamToValue
