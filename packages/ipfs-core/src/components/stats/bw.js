'use strict'

const { default: Big } = require('bignumber.js')
const { default: parseDuration } = require('parse-duration')
const errCode = require('err-code')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {LibP2P} libp2p
 * @param {BWOptions} opts
 * @returns {BandwidthInfo}
 */
function getBandwidthStats (libp2p, opts) {
  let stats

  if (!libp2p.metrics) {
    stats = undefined
  } else if (opts.peer) {
    stats = libp2p.metrics.forPeer(opts.peer)
  } else if (opts.proto) {
    stats = libp2p.metrics.forProtocol(opts.proto)
  } else {
    stats = libp2p.metrics.global
  }

  if (!stats) {
    return {
      totalIn: new Big(0),
      totalOut: new Big(0),
      rateIn: new Big(0),
      rateOut: new Big(0)
    }
  }

  const { movingAverages, snapshot } = stats

  return {
    totalIn: snapshot.dataReceived,
    totalOut: snapshot.dataSent,
    rateIn: new Big(movingAverages.dataReceived[60000].movingAverage() / 60),
    rateOut: new Big(movingAverages.dataSent[60000].movingAverage() / 60)
  }
}

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * Get IPFS bandwidth information
   *
   * @param {BWOptions & AbortOptions} options
   * @returns {AsyncIterable<BandwidthInfo>}
   */
  const bw = async function * (options = {}) {
    const { libp2p } = await network.use(options)

    if (!options.poll) {
      yield getBandwidthStats(libp2p, options)
      return
    }

    const interval = options.interval || 1000
    let ms = -1
    try {
      ms = typeof interval === 'string' ? parseDuration(interval) || -1 : interval
      if (!ms || ms < 0) throw new Error('invalid duration')
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_POLL_INTERVAL')
    }

    let timeoutId
    try {
      while (true) {
        yield getBandwidthStats(libp2p, options)
        // eslint-disable-next-line no-loop-func
        await new Promise(resolve => { timeoutId = setTimeout(resolve, ms) })
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return withTimeoutOption(bw)
}

/**
 * @typedef {Object} BWOptions
 * @property {PeerId} [peer] - Specifies a peer to print bandwidth for
 * @property {string} [proto] - Specifies a protocol to print bandwidth for
 * @property {boolean} [poll] - Is used to yield bandwidth info at an interval
 * @property {number|string} [interval=1000] - The time interval to wait between updating output, if `poll` is `true`.
 *
 * @typedef {Object} BandwidthInfo
 * @property {Big} totalIn
 * @property {Big} totalOut
 * @property {Big} rateIn
 * @property {Big} rateOut
 *
 * @typedef {import('.').LibP2P} LibP2P
 * @typedef {import('.').PeerId} PeerId
 * @typedef {import('.').CID} CID
 * @typedef {import('.').AbortOptions} AbortOptions
 */
