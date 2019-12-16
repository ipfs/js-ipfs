'use strict'

const Big = require('bignumber.js')
const human = require('human-to-milliseconds')
const errCode = require('err-code')

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
  return async function * (options) {
    options = options || {}

    if (!options.poll) {
      yield getBandwidthStats(libp2p, options)
      return
    }

    let interval
    try {
      interval = human(options.interval || '1s')
    } catch (err) {
      throw errCode(err, 'ERR_INVALID_POLL_INTERVAL')
    }

    let timeoutId
    try {
      while (true) {
        yield getBandwidthStats(libp2p, options)
        await new Promise(resolve => { timeoutId = setTimeout(resolve, interval) })
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
