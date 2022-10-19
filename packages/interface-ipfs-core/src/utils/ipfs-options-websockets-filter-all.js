import { webSockets } from '@libp2p/websockets'
import { all } from '@libp2p/websockets/filters'

export function ipfsOptionsWebsocketsFilterAll () {
  return {
    libp2p: {
      config: {
        transports: [
          webSockets({
            filter: all
          })
        ]
      }
    }
  }
}
