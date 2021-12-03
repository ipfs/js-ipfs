import parseDuration from 'parse-duration'
import errCode from 'err-code'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import PeerId from 'peer-id'

/**
 * @typedef {Object} BWOptions
 * @property {string} [peer] - Specifies a peer to print bandwidth for
 * @property {string} [proto] - Specifies a protocol to print bandwidth for
 * @property {boolean} [poll] - Is used to yield bandwidth info at an interval
 * @property {number|string} [interval=1000] - The time interval to wait between updating output, if `poll` is `true`.
 *
 * @typedef {Object} BandwidthInfo
 * @property {bigint} totalIn
 * @property {bigint} totalOut
 * @property {number} rateIn
 * @property {number} rateOut
 *
 * @typedef {import('libp2p')} libp2p
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/**
 * @param {libp2p} libp2p
 * @param {BWOptions} opts
 * @returns {BandwidthInfo}
 */
function getBandwidthStats (libp2p, opts) {
  let stats

  if (!libp2p.metrics) {
    stats = undefined
  } else if (opts.peer) {
    stats = libp2p.metrics.forPeer(PeerId.parse(opts.peer))
  } else if (opts.proto) {
    stats = libp2p.metrics.forProtocol(opts.proto)
  } else {
    stats = libp2p.metrics.global
  }

  if (!stats) {
    return {
      totalIn: BigInt(0),
      totalOut: BigInt(0),
      rateIn: 0.0,
      rateOut: 0.0
    }
  }

  const { movingAverages, snapshot } = stats

  return {
    totalIn: BigInt(snapshot.dataReceived.integerValue().toString()),
    totalOut: BigInt(snapshot.dataSent.integerValue().toString()),
    rateIn: movingAverages.dataReceived[60000].movingAverage() / 60,
    rateOut: movingAverages.dataSent[60000].movingAverage() / 60
  }
}

/**
 * @param {Object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createBw ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/stats').API<{}>["bw"]}
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
    } catch (/** @type {any} */ err) {
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
