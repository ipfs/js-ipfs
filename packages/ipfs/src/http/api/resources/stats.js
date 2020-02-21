'use strict'

const { map } = require('streaming-iterables')
const pipe = require('it-pipe')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')

exports.bitswap = require('./bitswap').stat

exports.repo = require('./repo').stat

exports.bw = (request, h) => {
  const { ipfs } = request.server.app

  return streamResponse(request, h, () => pipe(
    ipfs.stats.bw({
      peer: request.query.peer,
      proto: request.query.proto,
      poll: request.query.poll === 'true',
      interval: request.query.interval || '1s'
    }),
    map(stat => ({
      TotalIn: stat.totalIn,
      TotalOut: stat.totalOut,
      RateIn: stat.rateIn,
      RateOut: stat.rateOut
    })),
    ndjson.stringify
  ))
}
