'use strict'

const createServer = require('../../src')
const EventEmitter = require('events').EventEmitter
const createChannel = require('./channel')

module.exports = ({ ipfs, options }) => {
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
