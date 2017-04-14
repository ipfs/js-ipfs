'use strict'

const pump = require('pump')
const concat = require('concat-stream')

/*
  Concatenate a stream to a single value.
*/
function streamToValue (res, callback) {
  pump(
    res,
    concat((data) => callback(null, data)),
    (err) => {
      if (err) {
        callback(err)
      }
    })
}

module.exports = streamToValue
