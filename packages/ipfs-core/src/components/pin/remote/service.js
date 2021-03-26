const multiaddr = require('multiaddr')
const CID = require('cids')
const PinningClient = require('js-ipfs-pinning-service-client')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const log = require('debug')('ipfs:components:pin:remote')


/**
 * RemotePinServiceAPI provides methods to add, remove, and list the configured
 * remote pinning services that are used by the remote pinning api.
 * 
 * @implements API
 */
 class PinRemoteServiceAPI {
  constructor ({ config, swarm, peerId }) {
    this.config = config
    this.swarm = swarm
    this.peerId = peerId

    // TODO: read service config from IPFS config to construct remote service at init
    this._services = {}
  }

  /**
   * Adds a new remote pinning service to the set of configured services.
   *
   * @param {string} name - the name of the pinning service. Used to identify the service in future remote pinning API calls.
   * @param {Object} options
   * @param {string|URL} options.endpoint - the remote API endpoint URL
   * @param {string} options.key - an API key that authorizes use of the remote pinning service
   */
  async add (name, options) {
    if (this._services[name]) {
      throw new Error('service already present: ' + name)
    }

    if (!options.endpoint) {
      throw new Error('option "endpoint" is required')
    }

    if (!options.key) {
      throw new Error('option "key" is required')
    }

    const svcOpts = Object.assign({ swarm: this.swarm, peerId: this.peerId }, options)
    this._services[name] = new RemotePinningService(name, svcOpts)
  }

  /**
   * List the configured remote pinning services.
   *
   * @param {{stat: ?boolean} & AbortOptions} opts
   * @returns {Promise<Array<RemotePinService> | Array<RemotePinServiceWithStat>>} - a Promise resolving to an array of objects describing the configured remote pinning services. If stat==true, each object will include more detailed status info, including the number of pins for each pin status.
   */
  async ls (opts) {
    const { stat } = (opts || {})

    const promises = []
    for (const name of Object.keys(this._services)) {
      const svc = this._services[name]
      promises.push(svc.info(stat))
    }
    return Promise.all(promises)
  }

  /**
   * Remove a remote pinning service from the set of configured services.
   *
   * @param {string} name - the name of the pinning service to remove
   * @returns {Promise<void>}
   */
  async rm (name) {
    if (!name) {
      throw new Error('parameter "name" is required')
    }
    delete this._services[name]
  }

  /**
   * Returns a RemotePinningService object for the given service name. Throws if no service has been configured with the given name.
   *
   * @param {string} name
   * @returns {RemotePinningService}
   */
  serviceNamed (name) {
    if (!this._services[name]) {
      throw new Error('no remote pinning service configured with name: ' + name)
    }
    return this._services[name]
  }
}

/**
 * RemotePinningService provides add, ls, and rm operations for a single remote pinning service.
 */
class RemotePinningService {
  /**
   *
   * @param {string} name - pinning service name
   * @param {object} config
   * @param {string|URL} config.endpoint - the remote API endpoint URL
   * @param {string} config.key - an API key that authorizes use of the remote pinning service
   * @param {SwarmAPI} config.swarm - SwarmAPI instance for the local IPFS node
   * @param {PeerId} config.peerId - PeerId of the local IPFS node
   */
  constructor (name, { endpoint, key, swarm, peerId }) {
    this.endpoint = new URL(endpoint.toString())
    this.name = name
    this.swarm = swarm
    this.peerId = peerId
    this.client = new PinningClient({ name, endpoint, accessToken: key })

    this.add = withTimeoutOption(this._add.bind(this))
    this.ls = withTimeoutOption(this._ls.bind(this))
    this.rm = withTimeoutOption(this._rm.bind(this))
    this.rmAll = withTimeoutOption(this._rmAll.bind(this))
  }

  async info (includeStats = false) {
    const { name, endpoint } = this
    const info = { service: name, endpoint }
    if (includeStats) {
      info.stat = await this.stat()
    }
    return info
  }

  async stat () {
    try {
      const promises = []
      for (const pinStatus of ['queued', 'pinning', 'pinned', 'failed']) {
        promises.push(this._countForStatus(pinStatus))
      }
      const [queued, pinning, pinned, failed] = await Promise.all(promises)
      return {
        status: 'valid',
        pinCount: { queued, pinning, pinned, failed }
      }
    } catch (e) {
      log(`error getting stats for service ${this.name}: `, e)
      return {
        status: 'invalid'
      }
    }
  }

  /**
   * Request that the remote service add a pin for the given CID.
   *
   * @param {CID|string} cid - CID to pin to remote service
   * @param {AddOptions} options
   *
   * @returns {Promise<Pin>}
   */
  async _add (cid, options) {
    const { background } = options
    const name = options.name || ''
    const origins = await this._originAddresses()
    const response = await this.client.add({ cid: cid.toString(), name, origins })

    const { status, pin, delegates } = response
    this._connectToDelegates(delegates)

    if (!background) {
      return this._awaitPinCompletion(response)
    }

    return this._formatPinResult(status, pin)
  }

  async _awaitPinCompletion (pinResponse) {
    const pollIntervalMs = 100

    let { status, requestid } = pinResponse
    while (status !== 'pinned') {
      if (status === 'failed') {
        throw new Error('pin failed: ' + JSON.stringify(pinResponse.info))
      }

      await delay(pollIntervalMs)
      pinResponse = await this.client.get(requestid)
      status = pinResponse.status
    }

    return this._formatPinResult(pinResponse.status, pinResponse.pin)
  }

  _formatPinResult (status, pin) {
    const name = pin.name || ''
    const cid = new CID(pin.cid)
    return { status, name, cid }
  }

  /**
   * List pins from the remote service that match the given criteria. If no criteria are provided, returns all pins with the status 'pinned'.
   *
   * @param {Query} options
   * @returns {AsyncGenerator<Pin>}
   */
  async * _ls (options) {
    const cid = options.cid || []
    const name = options.name
    let status = options.status || []
    if (status.length === 0) {
      status = ['pinned']
    }
    for await (const pinInfo of this.client.list({ cid, name, status })) {
      const { status, pin } = pinInfo
      const result = this._formatPinResult(status, pin)
      yield result
    }
  }

  /**
   * Remove a single pin from a remote pinning service.
   * Fails if multiple pins match the specified criteria. Use rmAll to remove all pins that match.
   *
   * @param {Query} options
   * @returns {Promise<void>}
   */
  async _rm (options) {
    // the pinning service API only supports deletion by requestid, so we need to lookup the pins first
    const { cid, status } = options
    const resp = await this.client.ls({ cid, status })
    if (resp.count === 0) {
      return
    }
    if (resp.count > 1) {
      throw new Error('multiple remote pins are matching this query')
    }

    const requestid = resp.results[0].requestid
    await this.client.delete(requestid)
  }

  /**
   * Remove all pins that match the given criteria from a remote pinning service.
   *
   * @param {Query} options
   * @returns {Promise<void>}
   */
  async _rmAll (options) {
    const { cid, status } = options
    const requestIds = []
    for await (const result of this.client.list({ cid, status })) {
      requestIds.push(result.requestid)
    }

    const promises = []
    for (const requestid of requestIds) {
      promises.push(this.client.delete(requestid))
    }
    await Promise.all(promises)
  }

  async _originAddresses () {
    const addrs = await this.swarm.localAddrs()
    const id = this.peerId
    return addrs.map(ma => {
      const str = ma.toString()

      // some relay-style transports add our peer id to the ma for us
      // so don't double-add
      if (str.endsWith(`/p2p/${id}`)) {
        return str
      }

      return `${str}/p2p/${id}`
    })
  }

  async _countForStatus (status) {
    const response = await this.client.ls({ status: [status], limit: 1 })
    return response.count
  }

  async _connectToDelegates (delegates) {
    const addrs = delegates.map(multiaddr)
    const promises = []
    for (const addr of addrs) {
      promises.push(this.swarm.connect(addr).catch(e => {
        log('error connecting to pinning service delegate: ', e)
      }))
    }
    await Promise.all(promises)
  }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// TODO: refactor all the things
module.exports = PinRemoteServiceAPI

/**
 * @typedef {import('../..').PeerId} PeerId
 * @typedef {import('../../swarm')} SwarmAPI
 * @typedef {import('../../config').Config} Config
 * 
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Status} Status
 * @typedef {import('ipfs-core-types/src/pin/remote').Query} Query
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').AddOptions} AddOptions
 * @typedef {import('ipfs-core-types/src/pin/remote/service').API} API
 * @typedef {import('ipfs-core-types/src/pin/remote/service').Credentials} Credentials
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinService} RemotePinService
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinServiceWithStat} RemotePinServiceWithStat
 */
