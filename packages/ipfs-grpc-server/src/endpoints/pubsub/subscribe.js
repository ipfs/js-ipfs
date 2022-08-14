import { subscriptions } from './subscriptions.js'
import { nanoid } from 'nanoid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

/**
 * @typedef {import('@libp2p/interface-pubsub').Message} Message
 */

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {import('../../types').Options} options
 */
export function grpcPubsubSubscribe (ipfs, options = {}) {
  /**
   * TODO: Fill out input/output types after https://github.com/ipfs/js-ipfs/issues/3594
   *
   * @type {import('../../types').ServerStreamingEndpoint<any, any, any>}
   */
  async function pubsubSubscribe (request, sink, metadata) {
    const opts = {
      ...metadata
    }

    const handlerId = nanoid()
    const handler = {
      /** @type {import('@libp2p/interfaces/events').EventHandler<Message>} */
      onMessage: (message) => {
        let sequenceNumber

        if (message.type === 'signed' && message.sequenceNumber != null) {
          let numberString = message.sequenceNumber.toString(16)

          if (numberString.length % 2 !== 0) {
            numberString = `0${numberString}`
          }

          sequenceNumber = uint8ArrayFromString(numberString, 'base16')
        }

        sink.push({
          ...message,
          sequenceNumber
        })
      },
      onUnsubscribe: () => {
        sink.end()
      }
    }

    subscriptions.set(handlerId, handler)

    sink.push({
      handler: handlerId
    })

    await ipfs.pubsub.subscribe(request.topic, handler.onMessage, opts)
  }

  return pubsubSubscribe
}
