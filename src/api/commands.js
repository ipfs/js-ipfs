'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((callback) => {
    send({
      path: 'commands'
    }, callback)
  })
}
