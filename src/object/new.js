'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')

module.exports = (send) => {
  return promisify((template, callback) => {
    if (typeof template === 'function') {
      callback = template
      template = undefined
    }
    send({
      path: 'object/new',
      args: template
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      callback(null, new CID(result.Hash))
    })
  })
}
