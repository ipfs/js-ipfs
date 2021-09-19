// @ts-expect-error no types
import WS from 'libp2p-websockets'
// @ts-expect-error no types
import filters from 'libp2p-websockets/src/filters.js'

const transportKey = WS.prototype[Symbol.toStringTag]

export function ipfsOptionsWebsocketsFilterAll () {
  return {
    libp2p: {
      config: {
        transport: {
          [transportKey]: {
            filter: filters.all
          }
        }
      }
    }
  }
}
