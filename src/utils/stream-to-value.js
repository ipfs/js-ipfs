'use strict'

const pump = require('pump')
const concat = require('concat-stream')

/*
  Concatenate a stream to a single value.
*/
function streamToValue (response, callback) {
  let data
  pump(
    response,
    concat((d) => { data = d }),
    (err) => callback(err, data)
  )
}

module.exports = streamToValue
