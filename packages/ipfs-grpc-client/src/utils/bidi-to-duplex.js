'use strict'

const pushable = require('it-pushable')
const errCode = require('err-code')
const toHeaders = require('./to-headers')

async function sendMessages (service, client, source) {
  for await (const obj of source) {
    client.send({
      serializeBinary: () => service.requestType.serializeBinary(obj)
    })
  }
}

/**
 * Bidirectional streams are many-to-many operations so returns a sink
 * for the caller to write client messages into and a source to read
 * server messages from.
 *
 * @param {object} grpc - an @improbable-eng/grpc-web instance
 * @param {object} service - an @improbable-eng/grpc-web service
 * @param {object} options - RPC options
 * @param {string} options.host - The remote host
 * @param {boolean} [options.debug] - Whether to print debug messages
 * @param {object} [options.metadata] - Metadata sent as headers
 * @returns {{ source: AsyncIterable<object>, sink: { push: Function, end: Function } }}
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

  sendMessages(service, client, source)
    .catch(err => {
      sink.end(err)
    })
    .finally(() => {
      client.finishSend()
    })

  client.start(toHeaders(options.metadata))

  return {
    sink: source,
    source: sink
  }
}
