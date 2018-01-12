'use strict'

const promisify = require('promisify-es6')
const pump = require('pump')
const ndjson = require('ndjson')

module.exports = (send) => {
  return promisify((callback) => {
    return send({
      path: 'log/tail'
    }, (err, response) => {
      if (err) {
        return callback(err)
      }
      const outputStream = ndjson.parse()
      pump(response, outputStream)
      callback(null, outputStream)
    })
  })
}
