/* eslint-env mocha */

import { create } from '../src/index.js'
import WebSocket from 'ws'

function startServer () {
  return new Promise((resolve) => {
    const wss = new WebSocket.Server({ port: 0 })

    wss.on('listening', () => {
      resolve({
        port: wss.address().port,
        close: () => wss.close()
      })
    })

    wss.on('connection', (ws) => {
      ws.once('message', () => {
        ws.send('')
        ws.end()
      })
    })
  })
}

describe('agent', function () {
  it('uses the passed agent', async () => {
    const server = await startServer()

    try {
      await new Promise((resolve) => {
        const ipfs = create({
          url: `http://localhost:${server.port}`,
          agent: {
            addRequest () {
              // an agent method was invoked
              resolve()
            }
          }
        })

        ipfs.id().catch(() => {})
      })
    } finally {
      server.close()
    }
  })
})
