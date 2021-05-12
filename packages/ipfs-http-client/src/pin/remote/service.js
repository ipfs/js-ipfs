'use strict'

const Client = require('../../lib/core')
const toUrlSearchParams = require('../../lib/to-url-search-params')

/**
 * @typedef {import('../../types').Options} Options
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote/service').Credentials} Credentials
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinService} RemotePinService
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinServiceWithStat} RemotePinServiceWithStat
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin/remote/service').API<HTTPClientExtraOptions>} RemotePiningServiceAPI
 */
class Service {
  /**
   * @param {Options} options
   */
  constructor (options) {
    this.client = new Client(options)
  }

  /**
   * @param {URL} url
   */
  static encodeEndpoint (url) {
    const href = String(url)
    if (href === 'undefined') {
      throw Error('endpoint is required')
    }
    // Workaround trailing `/` issue in go-ipfs
    // @see https://github.com/ipfs/go-ipfs/issues/7826
    return href[href.length - 1] === '/' ? href.slice(0, -1) : href
  }

  /**
   * @param {any} json
   * @returns {RemotePinServiceWithStat}
   */
  static decodeRemoteService (json) {
    return {
      service: json.Service,
      endpoint: new URL(json.ApiEndpoint),
      ...(json.Stat && { stat: Service.decodeStat(json.Stat) })
    }
  }

  /**
   * @param {any} json
   * @returns {import('ipfs-core-types/src/pin/remote/service').Stat}
   */
  static decodeStat (json) {
    switch (json.Status) {
      case 'valid': {
        const { Pinning, Pinned, Queued, Failed } = json.PinCount
        return {
          status: 'valid',
          pinCount: {
            queued: Queued,
            pinning: Pinning,
            pinned: Pinned,
            failed: Failed
          }
        }
      }
      case 'invalid': {
        return { status: 'invalid' }
      }
      default: {
        return { status: json.Status }
      }
    }
  }
}

/**
 * @type {RemotePiningServiceAPI["add"]}
 */
Service.prototype.add = async function add (name, options) {
  const { endpoint, key, headers, timeout, signal } = options

  await this.client.post('pin/remote/service/add', {
    timeout,
    signal,
    searchParams: toUrlSearchParams({
      arg: [name, Service.encodeEndpoint(endpoint), key]
    }),
    headers
  })
}

/**
 * @type {RemotePiningServiceAPI["rm"]}
 */
Service.prototype.rm = async function rm (name, options = {}) {
  await this.client.post('pin/remote/service/rm', {
    timeout: options.timeout,
    signal: options.signal,
    headers: options.headers,
    searchParams: toUrlSearchParams({
      arg: name
    })
  })
}

/**
 * @type {RemotePiningServiceAPI["ls"]}
 */
Service.prototype.ls = async function ls (options = {}) {
  // @ts-ignore cannot derive option type from typedef
  const { stat, headers, timeout, signal } = options

  const response = await this.client.post('pin/remote/service/ls', {
    timeout,
    signal,
    headers,
    searchParams: stat === true ? toUrlSearchParams({ stat }) : undefined
  })

  /** @type {{RemoteServices: Object[]}} */
  const { RemoteServices } = await response.json()

  /** @type {Stat extends true ? RemotePinServiceWithStat[] : RemotePinService []} */
  return (RemoteServices.map(Service.decodeRemoteService))
}

module.exports = Service
