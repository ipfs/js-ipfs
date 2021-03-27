'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const HTTP = require('ipfs-utils/src/http')
const log = require('debug')('ipfs:components:pin:remote:client')

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = ({ service, endpoint, key, swarm, peerId }) => {
  const api = new HTTP({
    base: endpoint,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  })

  async function info ({ stat: includeStats }) {
    if (includeStats) {
      return {
        service,
        endpoint: new URL(endpoint),
        stat: await stat()
      }
    }
    return { service, endpoint: new URL(endpoint) }
  }

  async function stat () {
    try {
      const promises = []
      for (const pinStatus of ['queued', 'pinning', 'pinned', 'failed']) {
        promises.push(countForStatus(pinStatus))
      }
      const [queued, pinning, pinned, failed] = await Promise.all(promises)
      return {
        status: 'valid',
        pinCount: { queued, pinning, pinned, failed }
      }
    } catch (e) {
      log(`error getting stats for service ${service}: `, e)
      return {
        status: 'invalid'
      }
    }
  }

  /**
   * @param {string} status
   * @returns {Promise<number>} - the number of remote pins with the given status
   */
  async function countForStatus (status) {
    const searchParams = new URLSearchParams({ status, limit: '1' })
    const response = await api.get('/pins', { searchParams })
    const body = await response.json()
    return body.count
  }

  async function originAddresses () {
    const addrs = await swarm.localAddrs()
    return addrs.map(ma => {
      const str = ma.toString()

      // some relay-style transports add our peer id to the ma for us
      // so don't double-add
      if (str.endsWith(`/p2p/${peerId}`)) {
        return str
      }

      return `${str}/p2p/${peerId}`
    })
  }

  async function connectToDelegates (delegates) {
    const addrs = delegates.map(multiaddr)
    const promises = []
    for (const addr of addrs) {
      promises.push(swarm.connect(addr).catch(e => {
        log('error connecting to pinning service delegate: ', e)
      }))
    }
    await Promise.all(promises)
  }

  async function awaitPinCompletion (pinResponse) {
    const pollIntervalMs = 100

    let { status, requestid } = pinResponse
    while (status !== 'pinned') {
      if (status === 'failed') {
        throw new Error('pin failed: ' + JSON.stringify(pinResponse.info))
      }

      await delay(pollIntervalMs)
      const resp = await api.get(`/pins/${requestid}`)
      pinResponse = await resp.json()
      status = pinResponse.status
    }

    return formatPinResult(pinResponse.status, pinResponse.pin)
  }

  function formatPinResult (status, pin) {
    const name = pin.name || ''
    const cid = new CID(pin.cid)
    return { status, name, cid }
  }

  /**
   * Request that the remote service add a pin for the given CID.
   *
   * @param {CID|string} cid - CID to pin to remote service
   * @param {AddOptions} options
   *
   * @returns {Promise<Pin>}
   */
  async function add (cid, options) {
    const { background } = options
    const name = options.name || ''
    const origins = await originAddresses()
    const addOpts = { cid: cid.toString(), name, origins }
    const response = await api.post('/pins', { json: addOpts })
    const responseBody = await response.json()

    const { status, pin, delegates } = responseBody
    connectToDelegates(delegates)

    if (!background) {
      return awaitPinCompletion(responseBody)
    }

    return formatPinResult(status, pin)
  }

  /**
   * List pins from the remote service that match the given criteria. If no criteria are provided, returns all pins with the status 'pinned'.
   *
   * @param {Query} options
   * @returns {AsyncGenerator<PinDetails>}
   */
  async function * _lsRaw (options) {
    let status = options.status || []
    if (status.length === 0) {
      status = ['pinned']
    }

    const searchParams = new URLSearchParams()
    if (options.name) {
      searchParams.append('name', options.name)
    }
    for (const cid of (options.cid || [])) {
      searchParams.append('cid', cid.toString())
    }
    for (const s of status) {
      searchParams.append('status', s)
    }

    let resp = await api.get('/pins', { searchParams })
    let body = await resp.json()
    const total = body.count
    let yielded = 0
    while (true) {
      if (body.results.length < 1) {
        return
      }
      for (const result of body.results) {
        yield result
        yielded += 1
      }

      if (yielded === total) {
        return
      }

      // if we've run out of results and haven't yielded everything, fetch a page of older results
      const oldestResult = body.results[body.results.length - 1]
      searchParams.set('before', oldestResult.created)
      resp = await api.get('/pins', { searchParams })
      body = await resp.json()
    }
  }

  /**
   * List pins from the remote service that match the given criteria. If no criteria are provided, returns all pins with the status 'pinned'.
   *
   * @param {Query} options
   * @returns {AsyncGenerator<Pin>}
   */
  async function * ls (options) {
    for await (const result of _lsRaw(options)) {
      yield formatPinResult(result.status, result.pin)
    }
  }

  /**
   * Remove a single pin from a remote pinning service.
   * Fails if multiple pins match the specified criteria. Use rmAll to remove all pins that match.
   *
   * @param {Query} options
   * @returns {Promise<void>}
   */
  async function rm (options) {
    // the pinning service API only supports deletion by requestid, so we need to lookup the pins first
    const searchParams = new URLSearchParams()
    if (options.name) {
      searchParams.set('name', options.name)
    }
    for (const cid of (options.cid || [])) {
      searchParams.append('cid', cid.toString())
    }
    for (const status of (options.status || [])) {
      searchParams.append('status', status)
    }
    const resp = await api.get('/pins', { searchParams })
    const body = await resp.json()
    if (body.count === 0) {
      return
    }
    if (body.count > 1) {
      throw new Error('multiple remote pins are matching this query')
    }

    const requestid = body.results[0].requestid
    try {
      await api.delete(`/pins/${requestid}`)
    } catch (e) {
      if (e.status !== 404) {
        throw e
      }
    }
  }

  /**
   * Remove all pins that match the given criteria from a remote pinning service.
   *
   * @param {Query} options
   * @returns {Promise<void>}
   */
  async function rmAll (options) {
    const requestIds = []
    for await (const result of _lsRaw(options)) {
      requestIds.push(result.requestid)
    }

    const promises = []
    for (const requestid of requestIds) {
      promises.push(api.delete(`/pins/${requestid}`))
    }
    await Promise.all(promises)
  }

  return {
    info: withTimeoutOption(info),
    ls: withTimeoutOption(ls),
    add: withTimeoutOption(add),
    rm: withTimeoutOption(rm),
    rmAll: withTimeoutOption(rmAll)
  }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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
 * @typedef {import('ipfs-core-types/src/pin/remote/service').Credentials} Credentials
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinService} RemotePinService
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinServiceWithStat} RemotePinServiceWithStat
 */

/**
 * @typedef {Object} PinDetails
 * @property {string} requestid
 * @property {string} created
 * @property {Status} status
 * @property {Pin} pin
 * @property {Array<string>} delegates
 *
 */
