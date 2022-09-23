import Hapi from '@hapi/hapi'
import Pino from 'hapi-pino'
import { logger, enabled } from '@libp2p/logger'
import toMultiaddr from '@multiformats/uri-to-multiaddr'
import routes from './routes/index.js'

const LOG = 'ipfs:http-gateway'
const LOG_ERROR = 'ipfs:http-gateway:error'

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 * @typedef {import('./types').Server} Server
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
 * @param {(host: string, port: string, ipfs: IPFS) => Promise<Server>} createServer
 * @param {IPFS} ipfs
 */
async function serverCreator (serverAddrs, createServer, ipfs) {
  serverAddrs = serverAddrs || []
  // just in case the address is just string
  serverAddrs = Array.isArray(serverAddrs) ? serverAddrs : [serverAddrs]

  /** @type {Server[]} */
  const servers = []
  for (const address of serverAddrs) {
    const addrParts = address.split('/')
    const server = await createServer(addrParts[2], addrParts[4], ipfs)
    await server.start()
    server.info.ma = hapiInfoToMultiaddr(server.info)
    servers.push(server)
  }
  return servers
}

export class HttpGateway {
  /**
   * @param {IPFS} ipfs
   */
  constructor (ipfs) {
    this._ipfs = ipfs
    this._log = logger(LOG)
    /** @type {Server[]} */
    this._gatewayServers = []
  }

  async start () {
    this._log('starting')

    const ipfs = this._ipfs
    const config = await ipfs.config.getAll()
    const addresses = config.Addresses || { Swarm: [], Gateway: [] }
    const gatewayAddrs = addresses?.Gateway || []

    this._gatewayServers = await serverCreator(gatewayAddrs, this._createGatewayServer, ipfs)

    this._log('started')
  }

  /**
   * @param {string} host
   * @param {string} port
   * @param {IPFS} ipfs
   */
  async _createGatewayServer (host, port, ipfs) {
    const server = Hapi.server({
      host,
      port,
      routes: {
        cors: true,
        response: {
          emptyStatusCode: 200
        }
      }
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

    server.route(routes.gateway)

    return server
  }

  async stop () {
    this._log('stopping')
    /**
     * @param {Server[]} servers
     */
    const stopServers = servers => Promise.all((servers || []).map(s => s.stop()))
    await Promise.all([
      stopServers(this._gatewayServers)
    ])
    this._log('stopped')
  }
}
