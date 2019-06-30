'use strict'

const { Transform } = require('readable-stream')

const transformBandwidth = (stat) => {
  return {
    TotalIn: stat.totalIn,
    TotalOut: stat.totalOut,
    RateIn: stat.rateIn,
    RateOut: stat.rateOut
  }
}

exports.bitswap = require('./bitswap').stat

exports.repo = require('./repo').stat

exports.bw = (request, h) => {
  const { ipfs } = request.server.app
  const options = {
    peer: request.query.peer,
    proto: request.query.proto,
    poll: request.query.poll === 'true',
    interval: request.query.interval || '1s'
  }

  const res = ipfs.stats.bwReadableStream(options)
  const output = new Transform({
    writableObjectMode: true,
    transform (chunk, encoding, cb) {
      this.push(JSON.stringify(transformBandwidth(chunk)) + '\n')
      cb()
    }
  })

  request.events.on('disconnect', () => {
    res.destroy()
  })

  res.pipe(output)

  return h.response(output)
    .header('content-type', 'application/json')
    .header('x-chunked-output', '1')
}
