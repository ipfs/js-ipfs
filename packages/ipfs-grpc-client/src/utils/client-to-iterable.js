'use strict'

const pushable = require('it-pushable')
const errCode = require('err-code')

/**
 * @param {object} client - an @improbable-eng/grpc-web client
 * @returns {AsyncIterable<object>} - an AsyncIterator
 **/
module.exports = function toIterator (client) {
  // @ts-ignore
  const queue = pushable()

  client.onMessage(message => {
    queue.push(message.toObject())
  })
  client.onEnd((status, message, trailers) => {
    let err

    if (status) {
      const error = new Error(message)

      err = errCode(error, trailers.get('grpc-code')[0], {
        status
      })

      err.stack = trailers.get('grpc-stack')[0] || error.stack
    }

    queue.end(err)
  })

  return queue
}
