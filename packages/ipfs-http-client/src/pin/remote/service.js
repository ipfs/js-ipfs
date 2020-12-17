'use strict'

const Client = require('../../lib/core')
const toUrlSearchParams = require('../../lib/to-url-search-params')

/**
 * @typedef {import('../../lib/core').ClientOptions} ClientOptions
 * @typedef {import('../..').HttpOptions} HttpOptions
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote/service').API} API
 * @typedef {import('ipfs-core-types/src/pin/remote/service').Credentials} Credentials
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinService} RemotePinService
 * @typedef {import('ipfs-core-types/src/pin/remote/service').RemotePinServiceWithStat} RemotePinServiceWithStat
 * @implements {API}
 */
class Service {
  /**
   * @param {ClientOptions} options
   */
  constructor (options) {
    /** @private */
    this.client = new Client(options)
  }

  /**
   * @param {Client} client
   * @param {string} name
   * @param {Credentials & AbortOptions & HttpOptions} options
   */
  static async add (client, name, options) {
    const { endpoint, key, headers, timeout, signal } = options
    await client.post('pin/remote/service/add', {
      timeout,
      signal,
      searchParams: toUrlSearchParams({
        arg: [name, Service.encodeEndpoint(endpoint), key]
      }),
      headers
    })
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
   * @param {Client} client
   * @param {string} name
   * @param {AbortOptions & HttpOptions} [options]
   */
  static async rm (client, name, { timeout, signal, headers } = {}) {
    await client.post('pin/remote/service/rm', {
      timeout,
      signal,
      headers,
      searchParams: toUrlSearchParams({
        arg: name
      })
    })
  }

  /**
   * @template {true} Stat
   * @param {Client} client
   * @param {{ stat?: Stat } & AbortOptions & HttpOptions} [options]
   */
  static async ls (client, { stat, timeout, signal, headers } = {}) {
    const response = await client.post('pin/remote/service/ls', {
      searchParams: stat === true ? toUrlSearchParams({ stat }) : undefined,
      timeout,
      signal,
      headers
    })

    /** @type {{RemoteServices: Object[]}} */
    const { RemoteServices } = await response.json()

    /** @type {Stat extends true ? RemotePinServiceWithStat[] : RemotePinService []} */
    return (RemoteServices.map(Service.decodeRemoteService))
  }

  /**
   * @param {Object} json
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
   * @param {Object} json
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

  /**
   * Registers remote pinning service with a given name. Errors if service
   * with the given name is already registered.
   *
   * @param {string} name
   * @param {Credentials & AbortOptions & HttpOptions} options
   */
  add (name, options) {
    return Service.add(this.client, name, options)
  }

  /**
   * Unregisteres remote pinning service with a given name. If service with such
   * name isn't registerede this is a noop.
   *
   * @param {string} name
   * @param {AbortOptions & HttpOptions} [options]
   */
  rm (name, options) {
    return Service.rm(this.client, name, options)
  }

  /**
   * List registered remote pinning services.
   *
   * @param {{ stat?: true } & AbortOptions & HttpOptions} [options]
   */
  ls (options) {
    return Service.ls(this.client, options)
  }
}

module.exports = Service
