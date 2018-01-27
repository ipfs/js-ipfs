'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((args, callback) => {
    if (typeof args === 'function') {
      callback = args
      args = '/'
    }

    return send({
      path: 'files/flush',
      args: args
    }, callback)
  })
}
