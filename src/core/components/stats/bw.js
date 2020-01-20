'use strict'

const callbackify = require('callbackify')
const Big = require('bignumber.js')
const Pushable = require('pull-pushable')
const human = require('human-to-milliseconds')
const toStream = require('pull-stream-to-stream')
const errCode = require('err-code')

function bandwidthStats (self, opts) {
  let stats

  if (opts.peer) {
    stats = self.libp2p.stats.forPeer(opts.peer)
  } else if (opts.proto) {
    stats = self.libp2p.stats.forProtocol(opts.proto)
  } else {
    stats = self.libp2p.stats.global
  }

  if (!stats) {
    return {
      totalIn: new Big(0),
      totalOut: new Big(0),
      rateIn: new Big(0),
      rateOut: new Big(0)
    }
  }

  const snapshot = stats.snapshot
  const movingAverages = stats.movingAverages

  return {
    totalIn: snapshot.dataReceived,
    totalOut: snapshot.dataSent,
    rateIn: new Big(movingAverages.dataReceived['60000'].movingAverage() / 60),
    rateOut: new Big(movingAverages.dataSent['60000'].movingAverage() / 60)
  }
}

module.exports = function stats (self) {
  const _bwPullStream = (opts) => {
    opts = opts || {}
    let interval = null
    const stream = Pushable(true, () => {
      if (interval) {
        clearInterval(interval)
      }
    })

    if (opts.poll) {
      let value
      try {
        value = human(opts.interval || '1s')
      } catch (err) {
        // Pull stream expects async work, so we need to simulate it.
        process.nextTick(() => {
          stream.end(errCode(err, 'ERR_INVALID_POLL_INTERVAL'))
        })
      }

      interval = setInterval(() => {
        stream.push(bandwidthStats(self, opts))
      }, value)
    } else {
      stream.push(bandwidthStats(self, opts))
      stream.end()
    }

    return stream.source
  }

  return {
    bitswap: require('./bitswap')(self).stat,
    repo: require('./repo')(self).stat,
    bw: callbackify.variadic(async (opts) => { // eslint-disable-line require-await
      opts = opts || {}
      return bandwidthStats(self, opts)
    }),
    bwReadableStream: (opts) => toStream.source(_bwPullStream(opts)),
    bwPullStream: _bwPullStream
  }
}
