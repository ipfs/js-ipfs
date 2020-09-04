'use strict'

const Big = require('bignumber.js')
const parseDuration = require('parse-duration').default
const errCode = require('err-code')
const { withTimeoutOption } = require('../../utils')

function getBandwidthStats (libp2p, opts) {
  let stats

  if (opts.peer) {
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

module.exports = ({ libp2p }) => {
  return withTimeoutOption(async function * (options) {
    options = options || {}

    if (!options.poll) {
      yield getBandwidthStats(libp2p, options)
      return
    }

    let interval = options.interval || 1000
    try {
      interval = typeof interval === 'string' ? parseDuration(interval) : interval
      if (!interval || interval < 0) throw new Error('invalid poll interval')
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_POLL_INTERVAL')
    }

    let timeoutId
    try {
      while (true) {
        yield getBandwidthStats(libp2p, options)
        // eslint-disable-next-line no-loop-func
        await new Promise(resolve => { timeoutId = setTimeout(resolve, interval) })
      }
    } finally {
      clearTimeout(timeoutId)
    }
  })
}
