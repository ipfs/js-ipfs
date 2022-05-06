import { WebSockets } from '@libp2p/websockets'
import { all } from '@libp2p/websockets/filters'

const transportKey = WebSockets.prototype[Symbol.toStringTag]

export function ipfsOptionsWebsocketsFilterAll () {
  return {
    libp2p: {
      config: {
        transport: {
          [transportKey]: {
            filter: all
          }
        }
      }
    }
  }
}
