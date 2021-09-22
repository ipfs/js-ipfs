/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import delay from 'delay'
import { create as httpClient } from '../../src/index.js'
import http, { Agent } from 'http'

/**
 * @typedef {import('http').IncomingMessage} IncomingMessage
 *
 * @param {(message: IncomingMessage) => Promise<any>} handler
 */
function startServer (handler) {
  return new Promise((resolve) => {
    // spin up a test http server to inspect the requests made by the library
    const server = http.createServer((req, res) => {
      req.on('data', () => {})
      req.on('end', async () => {
        const out = await handler(req)

        res.writeHead(200)
        res.write(JSON.stringify(out))
        res.end()
      })
    })

    server.listen(0, () => {
      const addressInfo = server.address()

      resolve({
        port: addressInfo && (typeof addressInfo === 'string' ? addressInfo : addressInfo.port),
        close: () => server.close()
      })
    })
  })
}

describe('agent', function () {
  /** @type {import('http').Agent} */
  let agent

  before(() => {
    agent = new Agent({
      maxSockets: 2
    })
  })

  it('restricts the number of concurrent connections', async () => {
    /** @type {((arg: any) => void)[]} */
    const responses = []

    const server = await startServer(() => {
      const p = new Promise((resolve) => {
        responses.push(resolve)
      })

      return p
    })

    const ipfs = httpClient({
      url: `http://localhost:${server.port}`,
      agent
    })

    // make three requests
    const requests = Promise.all([
      ipfs.id(),
      ipfs.id(),
      ipfs.id()
    ])

    // wait for the first two to arrive
    for (let i = 0; i < 5; i++) {
      await delay(100)

      if (responses.length === 2) {
        // wait a little longer, the third should not arrive
        await delay(1000)

        expect(responses).to.have.lengthOf(2)

        // respond to the in-flight requests
        responses[0]({
          res: 0
        })
        responses[1]({
          res: 1
        })

        break
      }

      if (i === 4) {
        // should have first two responses by now
        expect(responses).to.have.lengthOf(2)
      }
    }

    // wait for the final request to arrive
    for (let i = 0; i < 5; i++) {
      await delay(100)

      if (responses.length === 3) {
        // respond to it
        responses[2]({
          res: 2
        })
      }
    }

    const results = await requests
    expect(results).to.have.lengthOf(3)
    expect(results).to.deep.include({
      res: 0
    })
    expect(results).to.deep.include({
      res: 1
    })
    expect(results).to.deep.include({
      res: 2
    })

    server.close()
  })
})
