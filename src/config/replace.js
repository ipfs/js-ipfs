'use strict'

const { Readable } = require('readable-stream')
const promisify = require('promisify-es6')
const SendOneFile = require('../utils/send-one-file')

function toStream (input) {
  return new Readable({
    read () {
      this.push(input)
      this.push(null)
    }
  })
}

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'config/replace')
  return promisify((config, callback) => {
    if (typeof config === 'object') {
      config = toStream(Buffer.from(JSON.stringify(config)))
    }

    sendOneFile(config, {}, callback)
  })
}
