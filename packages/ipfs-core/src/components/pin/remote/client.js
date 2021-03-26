'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const log = require('debug')('ipfs:components:pin:remote:client')

// TODO: replace this package with one built using ipfs-utils/src/http to reduce bundle size
const PinningClient = require('js-ipfs-pinning-service-client')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')


module.exports = ({ service, endpoint, key, swarm, peerId }) => {

  // TODO: use HTTP requests directly
  const client = new PinningClient({endpoint, accessToken: key})

  async function serviceInfo(includeStats = false) {
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

  async function countForStatus (status) {
    const response = await client.ls({ status: [status], limit: 1 })
    return response.count
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

  async function countForStatus (status) {
    const response = await client.ls({ status: [status], limit: 1 })
    return response.count
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
      pinResponse = await client.get(requestid)
      status = pinResponse.status
    }

    return formatPinResult(pinResponse.status, pinResponse.pin)
  }

  function formatPinResult(status, pin) {
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
      const response = await client.add({ cid: cid.toString(), name, origins })
  
      const { status, pin, delegates } = response
      connectToDelegates(delegates)
  
      if (!background) {
        return awaitPinCompletion(response)
      }
  
      return formatPinResult(status, pin)
    }

  /**
   * List pins from the remote service that match the given criteria. If no criteria are provided, returns all pins with the status 'pinned'.
   *
   * @param {Query} options
   * @returns {AsyncGenerator<Pin>}
   */
  async function* ls (options) {
    const cid = options.cid || []
    const name = options.name
    let status = options.status || []
    if (status.length === 0) {
      status = ['pinned']
    }
    for await (const pinInfo of client.list({ cid, name, status })) {
      const { status, pin } = pinInfo
      yield formatPinResult(status, pin)
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
      const { cid, status } = options
      const resp = await client.ls({ cid, status })
      if (resp.count === 0) {
        return
      }
      if (resp.count > 1) {
        throw new Error('multiple remote pins are matching this query')
      }
  
      const requestid = resp.results[0].requestid
      await client.delete(requestid)
    }


  /**
   * Remove all pins that match the given criteria from a remote pinning service.
   *
   * @param {Query} options
   * @returns {Promise<void>}
   */
     async function rmAll (options) {
      const { cid, status } = options
      const requestIds = []
      for await (const result of client.list({ cid, status })) {
        requestIds.push(result.requestid)
      }
  
      const promises = []
      for (const requestid of requestIds) {
        promises.push(client.delete(requestid))
      }
      await Promise.all(promises)
    }
    
  return {
    info: serviceInfo,
    ls: withTimeoutOption(ls),
    add: withTimeoutOption(add), 
    rm: withTimeoutOption(rm), 
    rmAll: withTimeoutOption(rmAll),
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
 * @typedef {import('ipfs-core-types/src/pin/remote/service').API} API
 * @typedef {import('ipfs-core-types/src/pin/remote/service').Credentials} Credentials
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinService} RemotePinService
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinServiceWithStat} RemotePinServiceWithStat
 */

/**
 * @typedef {Object} RemotePinClient
 * 
 */
