'use strict'

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
        callback(null, response.pipe(ndjson.parse()))
      })
    })
  }
}
