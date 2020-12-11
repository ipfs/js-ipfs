'use strict'

import IPFS from 'ipfs'
import { Server, IPFSService } from 'ipfs-message-port-server'

const main = async () => {
  // start listening to all incoming connections - they will be from browsing
  // contexts that run `new SharedWorker(...)`
  // Note: It is important to start listening before we do any async work to
  //  ensure that connections aren't missed while awaiting
  const connections = listen(self, 'connect')

  // Start an IPFS node & create server that will expose its API to all clients
  // over message channel
  const ipfs = await IPFS.create()
  // And add hello world for tests
  await ipfs.add({ content: 'hello world' })
  
  // @ts-ignore
  const service = new IPFSService(ipfs)
  const server = new Server(service)
  self.server = server
  self.ipfs = ipfs

  // connect every queued and future connection to the server
  for await (const event of connections) {
    const port = event.ports[0]
    if (port) {
      server.connect(port)
    }
  }
}

/**
 * Creates an AsyncIterable<Event> for all the events on the given `target` for
 * the given event `type`. It is like `target.addEventListener(type, listener, options)`
 * but instead of passing listener you get `AsyncIterable<Event>` instead.
 * @param {EventTarget} target
 * @param {string} type 
 * @param {AddEventListenerOptions} [options]
 */
const listen = function (target, type, options) {
  const events = []
  let resume
  let ready = new Promise(resolve => (resume = resolve))

  const write = event => {
    events.push(event)
    resume()
  }
  const read = async () => {
    await ready
    ready = new Promise(resolve => (resume = resolve))
    return events.splice(0)
  }

  const reader = async function * () {
    try {
      while (true) {
        yield * await read()
      }
    } finally {
      target.removeEventListener(type, write, options)
    }
  }

  target.addEventListener(type, write, options)
  return reader()
}

main()
