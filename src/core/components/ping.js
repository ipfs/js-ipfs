'use strict'

const promisify = require('promisify-es6')

module.exports = function ping (self) {
  return promisify((callback) => {
    callback(new Error('Not implemented'))
  })
}
