
import { create } from 'ipfs-core'
import { IPFSService, Server } from 'ipfs-message-port-server'

const main = async connections => {
  const ipfs = await create()
  const service = new IPFSService(ipfs)
  const server = new Server(service)

  for await (const event of connections) {
    const port = event.ports[0]
    if (port) {
      server.connect(port)
    }
  }
}

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

main(listen(self, 'connect'))
