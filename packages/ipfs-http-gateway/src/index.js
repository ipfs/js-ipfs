'use strict'

const Hapi = require('@hapi/hapi')
const Pino = require('hapi-pino')
const debug = require('debug')
const toMultiaddr = require('uri-to-multiaddr')
const LOG = 'ipfs:http-gateway'
const LOG_ERROR = 'ipfs:http-gateway:error'

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

class HttpGateway {
  constructor (ipfs, options = {}) {
    this._ipfs = ipfs
    this._options = {}
    this._log = Object.assign(debug(LOG), {
      error: debug(LOG_ERROR)
    })
  }

  async start () {
    this._log('starting')

    const ipfs = this._ipfs

    const config = await ipfs.config.getAll()
    config.Addresses = config.Addresses || {}
    const gatewayAddrs = config.Addresses.Gateway

    this._gatewayServers = await serverCreator(gatewayAddrs, this._createGatewayServer, ipfs)

    this._log('started')
    return this
  }

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
        prettyPrint: Boolean(debug.enabled(LOG)),
        logEvents: ['onPostStart', 'onPostStop', 'response', 'request-error'],
        level: debug.enabled(LOG) ? 'debug' : (debug.enabled(LOG_ERROR) ? 'error' : 'fatal')
      }
    })

    server.route(require('./routes'))

    return server
  }

  async stop () {
    this._log('stopping')
    const stopServers = servers => Promise.all((servers || []).map(s => s.stop()))
    await Promise.all([
      stopServers(this._gatewayServers)
    ])
    this._log('stopped')
    return this
  }
}

module.exports = HttpGateway
