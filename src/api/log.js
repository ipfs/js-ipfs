'use strict'

const pump = require('pump')
const ndjson = require('ndjson')
const promisify = require('promisify-es6')

module.exports = (send) => {
  return {
    tail: promisify((callback) => {
      return send({
        path: 'log/tail'
      }, (err, response) => {
        if (err) {
          return callback(err)
        }
        const outputStream = pump(response, ndjson.parse())
        callback(null, outputStream)
      })
    })
  }
}
