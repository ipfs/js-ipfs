
import { createServer } from '../../src/index.js'
import { EventEmitter } from 'events'
import { createChannel } from './channel.js'

export function server ({ ipfs, options }) {
  const socket = new EventEmitter()

  createServer(ipfs, {
    socket
  })

  return {
    send: (path, metadata) => {
      const channel = createChannel()

      socket.emit('data', { path, metadata, channel })

      return channel
    }
  }
}
