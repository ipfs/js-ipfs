'use strict'

const streamifier = require('streamifier')
const promisify = require('promisify-es6')

module.exports = (send) => {
  return promisify((config, callback) => {
    if (typeof config === 'object') {
      config = streamifier.createReadStream(new Buffer(JSON.stringify(config)))
    }

    send({
      path: 'config/replace',
      files: config,
      buffer: true
    }, callback)
  })
}
