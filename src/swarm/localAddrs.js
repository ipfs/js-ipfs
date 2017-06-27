'use strict'

const promisify = require('promisify-es6')
const multiaddr = require('multiaddr')

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    send({
      path: 'swarm/addrs/local',
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }
      callback(null, result.Strings.map((addr) => {
        return multiaddr(addr)
      }))
    })
  })
}
