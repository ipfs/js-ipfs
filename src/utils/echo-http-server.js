/* eslint-env browser */
'use strict'

const http = require('http')
const URL = require('url').URL || self.URL

const defaultPort = 11080

// Create a mock of remote HTTP server that can return arbitrary text in response
// or redirect to other URL. Used in tests of ipfs.addFromURL etc
// It needs to be available to tests run in browsers:
// start it from Node via .aegir.js/hooks/browser/pre|post (example in js-ipfs)
module.exports.createServer = () => {
  const handler = (req, res) => {
    // Relaxed CORS to enable use in tests in web browser with fetch
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, DELETE')
    res.setHeader('Access-Control-Allow-Headers', '*')
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
    // get the path without query or hash
    const { pathname } = new URL(`https://127.0.0.1${req.url}`)
    if (pathname.startsWith('/echo/')) {
      // Respond with text passed in URL after /echo/
      const [, text] = pathname.split('/echo/')
      res.setHeader('Content-Type', 'text/plain')
      res.write(decodeURIComponent(text))
    } else if (req.url.startsWith('/302/')) {
      // Return a redirect to a passed URL
      const [, location] = pathname.split('/302/')
      const url = decodeURI(location)
      res.statusCode = 302
      res.setHeader('Location', url)
    } else {
      res.statusCode = 500
    }
    res.end()
  }

  const server = http.createServer(handler)

  server.start = (opts) => new Promise(
    (resolve) => server.listen(Object.assign({ port: defaultPort, host: '127.0.0.1' }, opts), resolve)
  )

  server.stop = () => new Promise((resolve) => server.close(resolve))

  return server
}

module.exports.defaultPort = defaultPort
module.exports.url = `http://127.0.0.1:${module.exports.defaultPort}`
module.exports.echoUrl = (text) => `${module.exports.url}/echo/${encodeURIComponent(text)}`
module.exports.redirectUrl = (url) => `${module.exports.url}/302/${encodeURI(url)}`
