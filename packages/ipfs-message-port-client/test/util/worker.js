'use strict'

const IPFS = require('ipfs')
const { IPFSService } = require('ipfs-message-port-server')
const { Server } = require('ipfs-message-port-server/src/server')

const main = async context => {
  const ipfs = await IPFS.create({ offline: true, start: false })
  const service = new IPFSService(ipfs)
  const server = new Server(service)

  for (const event of listen(context, 'connect')) {
    const port = event.ports[0]
    if (port) {
      server.connect(port)
    }
  }
}

const listen = async function * (target, type, options) {
  let next = () => {}
  const read = () => new Promise(resolve => (next = resolve))
  const write = event => next(event)
  target.addEventListener(type, write, options)
  try {
    while (true) {
      yield * await read()
    }
  } finally {
    target.removeEventListener(type, write, options)
  }
}

main(self)
