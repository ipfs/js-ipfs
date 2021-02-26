'use strict'

const Hapi = require('@hapi/hapi')
const Pino = require('hapi-pino')
const debug = require('debug')
const multiaddr = require('multiaddr')
const toMultiaddr = require('uri-to-multiaddr')
const Boom = require('@hapi/boom')
const { AbortController } = require('native-abort-controller')
const errorHandler = require('./error-handler')
const LOG = 'ipfs:http-api'
const LOG_ERROR = 'ipfs:http-api:error'

function hapiInfoToMultiaddr (info) {
  let hostname = info.host
  let uri = info.uri
  // ipv6 fix
  if (hostname.includes(':') && !hostname.startsWith('[')) {
    // hapi 16 produces invalid URI for ipv6
    // we fix it here by restoring missing square brackets
    hostname = `[${hostname}]`
    uri = uri.replace(`://${info.host}`, `://${hostname}`)
  }
  return toMultiaddr(uri)
}

async function serverCreator (serverAddrs, createServer, ipfs, cors) {
  serverAddrs = serverAddrs || []
  // just in case the address is just string
  serverAddrs = Array.isArray(serverAddrs) ? serverAddrs : [serverAddrs]

  const servers = []
  for (const address of serverAddrs) {
    const addrParts = address.split('/')
    const server = await createServer(addrParts[2], addrParts[4], ipfs, cors)
    await server.start()
    server.info.ma = hapiInfoToMultiaddr(server.info)
    servers.push(server)
  }
  return servers
}

class HttpApi {
  constructor (ipfs, options = {}) {
    this._ipfs = ipfs
    this._log = Object.assign(debug(LOG), {
      error: debug(LOG_ERROR)
    })
  }

  /**
   * Starts the IPFS HTTP server
   *
   * @returns {Promise<HttpApi>}
   */
  async start () {
    this._log('starting')

    const ipfs = this._ipfs

    const config = await ipfs.config.getAll()
    config.Addresses = config.Addresses || {}
    config.API = config.API || {}
    config.API.HTTPHeaders = config.API.HTTPHeaders || {}

    const apiAddrs = config.Addresses.API
    this._apiServers = await serverCreator(apiAddrs, this._createApiServer, ipfs, {
      origin: config.API.HTTPHeaders['Access-Control-Allow-Origin'] || [],
      credentials: Boolean(config.API.HTTPHeaders['Access-Control-Allow-Credentials'])
    })

    this._log('started')
    return this
  }

  async _createApiServer (host, port, ipfs, cors) {
    cors = {
      ...cors,
      additionalHeaders: ['X-Stream-Output', 'X-Chunked-Output', 'X-Content-Length'],
      additionalExposedHeaders: ['X-Stream-Output', 'X-Chunked-Output', 'X-Content-Length']
    }

    if (!cors.origin || !cors.origin.length) {
      cors = false
    }

    const server = Hapi.server({
      host,
      port,
      routes: {
        cors,
        response: {
          emptyStatusCode: 200
        }
      },
      // Disable Compression
      // Why? Streaming compression in Hapi is not stable enough,
      // it requires bug-prone hacks such as https://github.com/hapijs/hapi/issues/3599
      compression: false
    })
    server.app.ipfs = ipfs

    await server.register({
      plugin: Pino,
      options: {
        prettyPrint: process.env.NODE_ENV !== 'production',
        logEvents: ['onPostStart', 'onPostStop', 'response', 'request-error'],
        level: debug.enabled(LOG) ? 'debug' : (debug.enabled(LOG_ERROR) ? 'error' : 'fatal')
      }
    })

    // block all non-post or non-options requests
    server.ext({
      type: 'onRequest',
      method: function (request, h) {
        if (request.method === 'post' || request.method === 'options') {
          return h.continue
        }

        if (request.method === 'get' && (request.path.startsWith('/ipfs') || request.path.startsWith('/webui'))) {
          // allow requests to the webui
          return h.continue
        }

        throw Boom.methodNotAllowed()
      }
    })

    // https://tools.ietf.org/html/rfc7231#section-6.5.5
    server.ext('onPreResponse', (request, h) => {
      const { response } = request

      if (response.isBoom && response.output && response.output.statusCode === 405) {
        response.output.headers.Allow = 'OPTIONS, POST'
      }

      return h.continue
    })

    // https://github.com/ipfs/go-ipfs-cmds/pull/193/files
    server.ext({
      type: 'onRequest',
      method: function (request, h) {
        // This check affects POST as we should never get POST requests from a
        // browser without Origin or Referer, but we might:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=429594
        if (request.method !== 'post') {
          return h.continue
        }

        const headers = request.headers || {}
        const origin = headers.origin || ''
        const referrer = headers.referrer || ''
        const userAgent = headers['user-agent'] || ''

        // If these are set, we leave up to CORS and CSRF checks.
        if (origin || referrer) {
          return h.continue
        }

        // Allow if the user agent includes Electron
        if (userAgent.includes('Electron')) {
          return h.continue
        }

        // Allow if the user agent does not start with Mozilla... (i.e. curl)
        if (!userAgent.startsWith('Mozilla')) {
          return h.continue
        }

        // Disallow otherwise.
        //
        // This means the request probably came from a browser and thus, it
        // should have included Origin or referer headers.
        throw Boom.forbidden()
      }
    })

    server.ext({
      type: 'onRequest',
      method: function (request, h) {
        const controller = new AbortController()
        request.app.signal = controller.signal

        // abort the request if the client disconnects
        request.events.once('disconnect', () => {
          controller.abort()
        })

        return h.continue
      }
    })

    server.route(require('./api/routes'))

    errorHandler(server)

    return server
  }

  get apiAddr () {
    if (!this._apiServers || !this._apiServers.length) {
      throw new Error('API address unavailable - server is not started')
    }
    return multiaddr('/ip4/127.0.0.1/tcp/' + this._apiServers[0].info.port)
  }

  async stop () {
    this._log('stopping')
    const stopServers = servers => Promise.all((servers || []).map(s => s.stop()))
    await Promise.all([
      stopServers(this._apiServers)
    ])
    this._log('stopped')
    return this
  }
}

module.exports = HttpApi
