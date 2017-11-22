'use strict'

const streamifier = require('streamifier')
const promisify = require('promisify-es6')
const SendOneFile = require('../utils/send-one-file')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'config/replace')
  return promisify((config, callback) => {
    if (typeof config === 'object') {
      config = streamifier.createReadStream(Buffer.from(JSON.stringify(config)))
    }

    sendOneFile(config, {}, callback)
  })
}
