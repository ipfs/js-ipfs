'use strict'

const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((oldName, newName, callback) => {
    send({
      path: 'key/rename',
      args: [oldName, newName]
    }, callback)
  })
}
