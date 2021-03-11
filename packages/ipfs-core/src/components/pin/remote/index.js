'use strict'

const multiaddr = require('multiaddr')
const PinningClient = require('js-ipfs-pinning-service-client')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const log = require('debug')('ipfs:components:pin:remote')

/**
 * PinRemoteAPI provides an API for pinning content to remote services.
 */
class PinRemoteAPI {
  /**
   * @param {Object} opts
   * @param {SwarmAPI} opts.swarm
   * @param {Config} opts.config
   * @param {PeerId} opts.peerId
   */
  constructor ({ swarm, config, peerId }) {
    this.swarm = swarm
    this.service = new PinRemoteServiceAPI({ config, swarm, peerId })
  }

  /**
   * Asks a remote pinning service to pin an IPFS object from a given path
   *
   * @param {string|CID} cid
   * @param {object} options
   * @param {string} options.service - name of a configured remote pinning service
   * @param {?string} options.name - optional descriptive name for pin
   * @param {?Object<string, string>} options.meta - optional metadata to attach to pin
   * @param {?number} options.timeout - request timeout (seconds)
   * @param {?boolean} options.background - If true, add returns remote a pin object as soon as the remote service responds.
   * The returned pin object may have a status of 'queued' or 'pinning'.
   * If false, the add method will not resolve until the pin status is 'pinned' before returning.
   * When background==false and the remote service returns a status of 'failed', an Error will be thrown.
   * @returns {Promise<RemotePin>}
   */
  async add (cid, options) {
    const { service, ...addOpts } = options
    if (!service) {
      throw new Error('service name must be passed')
    }
    const svc = this.service.serviceNamed(service)
    return svc.add(cid, addOpts)
  }

  /**
   * List objects that are pinned by a remote service.
   *
   * @param {object} options
   * @param {string} options.service - name of a configured remote pinning service
   * @param {?Array<string|CID>} options.cid - return pins for the specified CID(s)
   * @param {?string} options.name - return pins that contain the provided value (case-sensitive, exact match)
   * @param {?Array<PinStatus>} options.status - return pins with the specified statuses (queued, pinning, pinned, failed). Default: pinned
   * @param {?number} options.timeout - request timeout (seconds)
   * @returns {AsyncGenerator<RemotePin>}
   */
  async * ls (options) {
    const { service, ...lsOpts } = options
    if (!service) {
      throw new Error('service name must be passed')
    }
    const svc = this.service.serviceNamed(service)
    for await (const res of svc.ls(lsOpts)) {
      yield res
    }
  }

  /**
   * Remove a single pin from a remote pinning service.
   * Fails if multiple pins match the specified criteria. Use rmAll to remove all pins that match.
   *
   * @param {object} options
   * @param {string} options.service - name of a configured remote pinning service
   * @param {Array<string>} options.cid - CID(s) to remove from remote pinning service
   * @param {?Array<PinStatus>} options.status - only remove pins that have one of the specified statuses (queued, pinning, pinned, failed). Default: pinned
   * @param {?number} options.timeout - request timeout (seconds)
   * @returns {Promise<void>}
   */
  async rm (options) {
    const { service, ...rmOpts } = options
    if (!service) {
      throw new Error('service name must be passed')
    }
    const svc = this.service.serviceNamed(service)
    return svc.rm(rmOpts)
  }

  /**
   * Remove all pins that match the given criteria from a remote pinning service.
   *
   * @param {object} options
   * @param {string} options.service - name of a configured remote pinning service
   * @param {Array<string>} options.cid - CID(s) to remove from remote pinning service
   * @param {?Array<PinStatus>} options.status - only remove pins that have one of the specified statuses (queued, pinning, pinned, failed). Default: pinned
   * @param {?number} options.timeout - request timeout (seconds)
   * @returns {Promise<void>}
   */
  async rmAll (options) {
    const { service, ...rmOpts } = options
    if (!service) {
      throw new Error('service name must be passed')
    }
    const svc = this.service.serviceNamed(service)
    return svc.rmAll(rmOpts)
  }
}

/**
 * RemotePinServiceAPI provides methods to add, remove, and list the configured
 * remote pinning services that are used by the remote pinning api.
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

    const svcOpts = Object.assign({ swarm: this.swarm, peerId: this.peerId }, options)
    this._services[name] = new RemotePinningService(name, svcOpts)
  }

  /**
   * List the configured remote pinning services.
   *
   * @typedef {object} PinCounts
   * @property {number} queued
   * @property {number} pinning
   * @property {number} pinned
   * @property {number} failed
   *
   * @typedef {object} RemotePinningServiceDescription
   * @property {string} name
   * @property {URL} endpoint
   * @property {?object} stat
   * @property {PinServiceStatus} stat.status
   * @property {PinCounts} stat.pinCount
   *
   * @param {object} opts
   * @param {?boolean} opts.stat - if true, include status info for each pinning service
   * @returns {Promise<Array<RemotePinningServiceDescription>>}
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
    this.name = name
    this.endpoint = endpoint
    this.swarm = swarm
    this.peerId = peerId
    this.client = new PinningClient({ name, endpoint, accessToken: key })

    this.add = withTimeoutOption(this._add.bind(this))
    this.ls = withTimeoutOption(this._ls.bind(this))
    this.rm = withTimeoutOption(this._rm.bind(this))
    this.rmAll = withTimeoutOption(this._rmAll.bind(this))
  }

  async info (includeStats = false) {
    let stat
    if (includeStats) {
      stat = await this.stat()
    }
    const { name, endpoint } = this
    return { name, endpoint, stat }
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
      log('error getting stats: ', e)
      return {
        status: 'invalid'
      }
    }
  }

  /**
   * Request that the remote service add a pin for the given CID.
   *
   * @param {CID|string} cid - CID to pin to remote service
   * @param {object} options
   * @param {?string} options.name - optional descriptive name for pin
   * @param {?Object<string, string>} options.meta - optional metadata to attach to pin
   * @param {?number} options.timeout - request timeout (seconds)
   * @param {?boolean} options.background - If background==true, add returns remote a pin object as soon as the remote service responds.
   * The returned pin object may have a status of 'queued' or 'pinning'.
   * If background==false, the add method will not resolve until the pin status is 'pinned' before returning.
   * When background==false and the remote service returns a status of 'failed', an Error will be thrown.
   *
   * @returns {Promise<RemotePin>}
   */
  async _add (cid, options) {
    const { name, meta, background } = options
    const origins = await this._originAddresses()
    const response = await this.client.add({ cid: cid.toString(), name, meta, origins })

    const { status, pin, delegates } = response
    this._connectToDelegates(delegates)

    if (!background) {
      return this._awaitPinCompletion(response)
    }

    return {
      status,
      name: pin.name,
      meta: pin.meta
    }
  }

  async _awaitPinCompletion (pinResponse) {
    const pollIntervalMs = 500

    let { status, requestid } = pinResponse
    while (status !== 'pinned') {
      if (status === 'failed') {
        throw new Error('pin failed: ' + JSON.stringify(pinResponse.info))
      }

      log(`pin status for CID ${pinResponse.pin.cid} (request id ${requestid}): ${status}. Waiting ${pollIntervalMs}ms to refresh status.`)
      await delay(pollIntervalMs)
      pinResponse = await this.client.get(requestid)
      status = pinResponse.status
    }

    const { pin } = pinResponse
    return {
      status,
      name: pin.name,
      meta: pin.meta
    }
  }

  /**
   * List pins from the remote service that match the given criteria. If no criteria are provided, returns all pins with the status 'pinned'.
   *
   * @param {object} options
   * @param {?Array<string|CID>} options.cid - return pins for the specified CID(s)
   * @param {?string} options.name - return pins that contain the provided value (case-sensitive, exact match)
   * @param {?Array<PinStatus>} options.status - return pins with the specified statuses (queued, pinning, pinned, failed). Default: pinned
   * @param {?number} options.timeout - request timeout (seconds)
   *
   * @returns {AsyncGenerator<RemotePin>}
   */
  async * _ls (options) {
    const { cid, name, status } = options
    for await (const pinInfo of this.client.list({ cid, name, status })) {
      const { status, pin } = pinInfo
      const { cid, name, meta } = pin
      const result = {
        status,
        cid,
        name,
        meta
      }
      yield result
    }
  }

  /**
   * Remove a single pin from a remote pinning service.
   * Fails if multiple pins match the specified criteria. Use rmAll to remove all pins that match.
   *
   * @param {object} options
   * @param {Array<string>} options.cid - CID(s) to remove from remote pinning service
   * @param {?Array<PinStatus>} options.status - only remove pins that have one of the specified statuses (queued, pinning, pinned, failed). Default: pinned
   * @param {?number} options.timeout - request timeout (seconds)
   */
  async _rm (options) {
    // the pinning service API only supports deletion by requestid, so we need to lookup the pins first
    const { cid, status } = options
    const resp = await this.client.ls({ cid, status })
    if (resp.count > 1) {
      throw new Error('multiple remote pins are matching this query')
    }

    const requestid = resp.results[0].requestid
    await this.client.delete(requestid)
  }

  /**
   * Remove all pins that match the given criteria from a remote pinning service.
   *
   * @param {object} options
   * @param {Array<string>} options.cid - CID(s) to remove from remote pinning service
   * @param {?Array<PinStatus>} options.status - only remove pins that have one of the specified statuses (queued, pinning, pinned, failed). Default: pinned
   * @param {?number} options.timeout - request timeout (seconds)
   * @returns {Promise<void>}
   */
  async _rmAll (options) {
    const { cid, status } = options
    const requestIds = new Set()
    for (const result of this.client.list({ cid, status })) {
      requestIds.add(result.requestid)
    }

    const promises = []
    for (const requestid of requestIds.entries()) {
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

/**
 * @typedef {import('cids')} CID
 * @typedef {import('../..').PeerId} PeerId
 * @typedef {import('../../swarm')} SwarmAPI
 * @typedef {import('../../config').Config} Config
 *
 * @typedef {'queued'|'pinning'|'pinned'|'failed'} PinStatus
 * @typedef {'valid'|'invalid'} PinServiceStatus
 *
 * @typedef {object} RemotePin
 * @property {string} [cid]
 * @property {PinStatus} [status]
 * @property {?string} [name]
 * @property {?object} [meta]
 */

module.exports = PinRemoteAPI
