'use strict'

const pushable = require('it-pushable')
const errCode = require('err-code')
const toHeaders = require('./to-headers')

/**
 * @param {object} grpc - an @improbable-eng/grpc-web instance
 * @param {object} service - an @improbable-eng/grpc-web service
 * @param {object} options - RPC options
 * @param {string} options.host - The remote host
 * @param {boolean} [options.debug] - Whether to print debug messages
 * @param {object} [options.metadata] - Metadata sent as headers
 * @returns {{ source: { push: Function, end: Function }, sink: AsyncIterable<object> }}
 **/
module.exports = function bidiToDuplex (grpc, service, options) {
  // @ts-ignore
  const source = pushable()

  // @ts-ignore
  const sink = pushable()

  const client = grpc.client(service, options)
  client.onMessage(message => {
    sink.push(message)
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

    sink.end(err)
  })

  setTimeout(async () => {
    try {
      for await (const obj of source) {
        client.send({
          serializeBinary: () => service.requestType.serializeBinary(obj)
        })
      }
    } catch (err) {
      sink.end(err)
    } finally {
      client.finishSend()
    }
  }, 0)

  client.start(toHeaders(options.metadata))

  return {
    source,
    sink
  }
}
