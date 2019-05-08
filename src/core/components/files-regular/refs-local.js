'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream')

module.exports = function (self) {
  return promisify((callback) => {
    pull(
      self.refs.localPullStream(),
      pull.collect((err, values) => {
        if (err) {
          return callback(err)
        }
        callback(null, values)
      })
    )
  })
}
