'use strict'

const CID = require('cids')
const Client = require('../../lib/core')
const Service = require('./service')
const toUrlSearchParams = require('../../lib/to-url-search-params')

/**
 * @typedef {import('../../types').Options} Options
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Pin} Pin
 * @typedef {import('ipfs-core-types/src/pin/remote').AddOptions} AddOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').Query} Query
 * @typedef {import('ipfs-core-types/src/pin/remote').Status} Status
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').API<HTTPClientExtraOptions>} RemotePiningAPI
 */

class Remote {
  /**
   * @param {Options} options
   */
  constructor (options) {
    this.client = new Client(options)
    /** @readonly */
    this.service = new Service(options)
  }
}

/**
 * @type {RemotePiningAPI["add"]}
 */
Remote.prototype.add = async function add (cid, { timeout, signal, headers, ...query }) {
  const response = await this.client.post('pin/remote/add', {
    timeout,
    signal,
    headers,
    searchParams: encodeAddParams({ cid, ...query })
  })

  return decodePin(await response.json())
}

/**
 * @type {RemotePiningAPI["ls"]}
 */
Remote.prototype.ls = async function * ls ({ timeout, signal, headers, ...query }) {
  const response = await this.client.post('pin/remote/ls', {
    timeout,
    signal,
    headers,
    searchParams: encodeQuery(query)
  })

  for await (const pin of response.ndjson()) {
    yield decodePin(pin)
  }
}

/**
 * @type {RemotePiningAPI["rm"]}
 */
Remote.prototype.rm = async function rm ({ timeout, signal, headers, ...query }) {
  await this.client.post('pin/remote/rm', {
    timeout,
    signal,
    headers,
    searchParams: encodeQuery({
      ...query,
      all: false
    })
  })
}

/**
 * @type {RemotePiningAPI["rmAll"]}
 */
Remote.prototype.rmAll = async function ({ timeout, signal, headers, ...query }) {
  await this.client.post('pin/remote/rm', {
    timeout,
    signal,
    headers,
    searchParams: encodeQuery({
      ...query,
      all: true
    })
  })
}

/**
 * @param {Object} json
 * @param {string} json.Name
 * @param {string} json.Cid
 * @param {Status} json.Status
 * @returns {Pin}
 */
const decodePin = ({ Name: name, Status: status, Cid: cid }) => {
  return {
    cid: new CID(cid),
    name,
    status
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
