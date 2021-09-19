/* eslint-env browser */

import http from 'http'
import { URL } from 'iso-url'
import getPort from 'aegir/utils/get-port.js'

export const defaultPort = 1138
export const defaultAddr = `/dnsaddr/localhost/tcp/${defaultPort}`

// Create a mock preload IPFS node with a gateway that'll respond 200 to a
// request for /api/v0/refs?arg=*. It remembers the preload CIDs it has been
// called with, and you can ask it for them and also clear them by issuing a
// GET/DELETE request to /cids.
export function createNode () {
  /** @type {string[]} */
  let cids = []

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, DELETE')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    if (`${req.url}`.startsWith('/api/v0/refs')) {
      const arg = new URL(`https://ipfs.io${req.url}`).searchParams.get('arg')

      if (arg) {
        cids.push(arg)
      }
    } else if (req.method === 'DELETE' && req.url === '/cids') {
      res.statusCode = 204
      cids = []
    } else if (req.method === 'GET' && req.url === '/cids') {
      res.setHeader('Content-Type', 'application/json')
      res.write(JSON.stringify(cids))
    } else {
      res.statusCode = 500
    }

    res.end()
  })

  // @ts-ignore
  server.start = async () => {
    const port = await getPort(defaultPort)
    return new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (/** @type {any} */ err) => {
        if (err) {
          return reject(err)
        }
        resolve(null)
      })
    })
  }
  // @ts-ignore
  server.stop = () => new Promise(resolve => server.close(resolve))

  return server
}
