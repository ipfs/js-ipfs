'use strict'

const CID = require('cids')
const Client = require('../../lib/core')
const Service = require('./service')
const toUrlSearchParams = require('../../lib/to-url-search-params')

/**
 * @typedef {import('../..').HttpOptions} HttpOptions
 * @typedef {import('../../lib/core').ClientOptions} ClientOptions
 * @typedef {import('ipfs-core-types/src/basic').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').API} API
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').AddOptions} AddOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Query} Query
 * @typedef {import('ipfs-core-types/src/pin/remote').Status} Status
 *
 * @implements {API}
 */
class Remote {
  /**
   * @param {ClientOptions} options
   */
  constructor (options) {
    /** @private */
    this.client = new Client(options)
    /** @readonly */
    this.service = new Service(options)
  }

  /**
   * Stores an IPFS object(s) from a given path to a remote pinning service.
   *
   * @param {CID} cid
   * @param {AddOptions & AbortOptions & HttpOptions} options
   * @returns {Promise<Pin>}
   */
  add (cid, options) {
    return Remote.add(this.client, cid, options)
  }

  /**
   * @param {Client} client
   * @param {CID} cid
   * @param {AddOptions & AbortOptions & HttpOptions} options
   */
  static async add (client, cid, { timeout, signal, headers, ...options }) {
    const response = await client.post('pin/remote/add', {
      timeout,
      signal,
      headers,
      searchParams: encodeAddParams({ cid, ...options })
    })

    return Remote.decodePin(await response.json())
  }

  /**
   * @param {Object} json
   * @param {string} json.Name
   * @param {string} json.Cid
   * @param {Status} json.Status
   * @returns {Pin}
   */
  static decodePin ({ Name: name, Status: status, Cid: cid }) {
    return {
      cid: new CID(cid),
      name,
      status
    }
  }

  /**
   * Returns a list of matching pins on the remote pinning service.
   *
   * @param {Query & AbortOptions & HttpOptions} query
   */
  ls (query) {
    return Remote.ls(this.client, query)
  }

  /**
   *
   * @param {Client} client
   * @param {Query & AbortOptions & HttpOptions} options
   * @returns {AsyncIterable<Pin>}
   */
  static async * ls (client, { timeout, signal, headers, ...query }) {
    const response = await client.post('pin/remote/ls', {
      signal,
      timeout,
      headers,
      searchParams: encodeQuery(query)
    })

    for await (const pin of response.ndjson()) {
      yield Remote.decodePin(pin)
    }
  }

  /**
   * Removes a single pin object matching query allowing it to be garbage
   * collected (if needed). Will error if multiple pins mtach provided
   * query. To remove all matches use `rmAll` instead.
   *
   * @param {Query & AbortOptions & HttpOptions} query
   */
  rm (query) {
    return Remote.rm(this.client, { ...query, all: false })
  }

  /**
   * Removes all pin object that match given query allowing them to be garbage
   * collected if needed.
   *
   * @param {Query & AbortOptions & HttpOptions} query
   */
  rmAll (query) {
    return Remote.rm(this.client, { ...query, all: true })
  }

  /**
   *
   * @param {Client} client
   * @param {{all: boolean} & Query & AbortOptions & HttpOptions} options
   */
  static async rm (client, { timeout, signal, headers, ...query }) {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery(query)
    })
  }
}

/**
 * @param {any} service
 * @returns {string}
 */
const encodeService = (service) => {
  if (typeof service === 'string' && service !== '') {
    return service
  } else {
    throw new TypeError('service name must be passed')
  }
}

/**
 * @param {any} cid
 * @returns {string}
 */
const encodeCID = (cid) => {
  if (CID.isCID(cid)) {
    return cid.toString()
  } else {
    throw new TypeError(`CID instance expected instead of ${cid}`)
  }
}

/**
 * @param {Query & { all?: boolean }} query
 * @returns {URLSearchParams}
 */
const encodeQuery = ({ service, cid, name, status, all }) => {
  const query = toUrlSearchParams({
    service: encodeService(service),
    name,
    force: all ? true : undefined
  })

  if (cid) {
    for (const value of cid) {
      query.append('cid', encodeCID(value))
    }
  }

  if (status) {
    for (const value of status) {
      query.append('status', value)
    }
  }

  return query
}

/**
 * @param {AddOptions & {cid:CID}} options
 * @returns {URLSearchParams}
 */
const encodeAddParams = ({ cid, service, background, name, origins }) => {
  const params = toUrlSearchParams({
    arg: encodeCID(cid),
    service: encodeService(service),
    name,
    background: background ? true : undefined
  })

  if (origins) {
    for (const origin of origins) {
      params.append('origin', origin.toString())
    }
  }

  return params
}

module.exports = Remote
