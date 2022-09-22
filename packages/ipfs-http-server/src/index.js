import Hapi from '@hapi/hapi'
import Pino from 'hapi-pino'
import { logger, enabled } from '@libp2p/logger'
import { multiaddr } from '@multiformats/multiaddr'
import toMultiaddr from '@multiformats/uri-to-multiaddr'
import Boom from '@hapi/boom'
import { routes } from './api/routes/index.js'
import { errorHandler } from './error-handler.js'
import { setMaxListeners } from 'events'

const LOG = 'ipfs:http-api'
const LOG_ERROR = 'ipfs:http-api:error'

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('./types').Server} Server
 * @typedef {import('libp2p').Libp2p} libp2p
 */

/**
 * @param {import('@hapi/hapi').ServerInfo} info
 */
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

/**
 * @param {string | string[]} serverAddrs
 * @param {(host: string, port: string, ipfs: IPFS, cors: Record<string, any>) => Promise<Server>} createServer
 * @param {IPFS} ipfs
 * @param {Record<string, any>} cors
 */
async function serverCreator (serverAddrs, createServer, ipfs, cors) {
  serverAddrs = serverAddrs || []
  // just in case the address is just string
  serverAddrs = Array.isArray(serverAddrs) ? serverAddrs : [serverAddrs]

  /** @type {Server[]} */
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

/**
 * @param {string} [str]
 * @param {string[]} [allowedOrigins]
 */
function isAllowedOrigin (str, allowedOrigins = []) {
  if (!str) {
    return false
  }

  let origin

  try {
    origin = (new URL(str)).origin
  } catch {
    return false
  }

  for (const allowedOrigin of allowedOrigins) {
    if (allowedOrigin === '*') {
      return true
    }

    if (allowedOrigin === origin) {
      return true
    }
  }

  return false
}

export class HttpApi {
  /**
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this._ipfs = ipfs
    this._log = logger(LOG)
    /** @type {Server[]} */
    this._apiServers = []
  }

  /**
   * Starts the IPFS HTTP server
   */
  async start () {
    this._log('starting')

    const ipfs = this._ipfs

    const config = await ipfs.config.getAll()
    const headers = (config.API && config.API.HTTPHeaders) || {}
    const apiAddrs = (config.Addresses && config.Addresses.API) || []

    this._apiServers = await serverCreator(apiAddrs, this._createApiServer, ipfs, {
      origin: headers['Access-Control-Allow-Origin'] || [],
      credentials: Boolean(headers['Access-Control-Allow-Credentials'])
    })

    // for the CLI to know the whereabouts of the API
    // @ts-expect-error - ipfs.repo.setApiAddr is not part of the core api
    await ipfs.repo.setApiAddr(this._apiServers[0].info.ma)

    this._log('started')
  }

  /**
   * @param {string} host
   * @param {string} port
   * @param {IPFS} ipfs
   * @param {Record<string, any>} cors
   */
  async _createApiServer (host, port, ipfs, cors) {
    cors = {
      ...cors,
      additionalHeaders: ['X-Stream-Output', 'X-Chunked-Output', 'X-Content-Length'],
      additionalExposedHeaders: ['X-Stream-Output', 'X-Chunked-Output', 'X-Content-Length']
    }

    const enableCors = Boolean(cors.origin?.length)

    const server = Hapi.server({
      host,
      port,
      routes: {
        cors: enableCors ? cors : false,
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
        prettyPrint: Boolean(enabled(LOG)),
        logEvents: ['onPostStart', 'onPostStop', 'response', 'request-error'],
        level: enabled(LOG) ? 'debug' : (enabled(LOG_ERROR) ? 'error' : 'fatal')
      }
    })

    // block all non-post or non-options requests
    server.ext({
      type: 'onRequest',
      method: function (request, h) {
        if (request.method === 'post' || request.method === 'options') {
          return h.continue
        }

        if (request.method === 'get') {
          if (request.path.startsWith('/ipfs') || request.path.startsWith('/webui')) {
            // allow requests to the gateway and webui
            return h.continue
          }

          if (process.env.IPFS_MONITORING && request.path.startsWith('/debug')) {
            // allow requests to prometheus stats when monitoring is enabled
            return h.continue
          }
        }

        throw Boom.methodNotAllowed()
      }
    })

    // https://tools.ietf.org/html/rfc7231#section-6.5.5
    server.ext('onPreResponse', (request, h) => {
      const { response } = request

      if (Boom.isBoom(response) && response.output && response.output.statusCode === 405) {
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
        const referer = headers.referer || ''
        const userAgent = headers['user-agent'] || ''

        // If these are set, check them against the configured list
        if (origin || referer) {
          if (!isAllowedOrigin(origin || referer, cors.origin)) {
            // Hapi will not allow an empty CORS origin list so we have to manually
            // reject the request if CORS origins have not been configured
            throw Boom.forbidden()
          }

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
        // make sure we don't cause warnings to be logged for 'abort' event listeners
        setMaxListeners && setMaxListeners(Infinity, controller.signal)
        request.app.signal = controller.signal

        // abort the request if the client disconnects
        request.raw.res.once('close', () => {
          controller.abort()
        })

        // abort the request if the client disconnects
        request.events.once('disconnect', () => {
          controller.abort()
        })

        return h.continue
      }
    })

    server.route(routes)

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
    /**
     * @param {Server[]} servers
     */
    const stopServers = servers => Promise.all((servers || []).map(s => s.stop()))
    await Promise.all([
      stopServers(this._apiServers)
    ])
    this._log('stopped')
  }
}
