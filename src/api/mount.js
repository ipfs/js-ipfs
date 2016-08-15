'use strict'

module.exports = (send) => {
  return function mount (ipfs, ipns, callback) {
    if (typeof ipfs === 'function') {
      callback = ipfs
      ipfs = null
    } else if (typeof ipns === 'function') {
      callback = ipns
      ipns = null
    }
    const opts = {}
    if (ipfs) {
      opts.f = ipfs
    }
    if (ipns) {
      opts.n = ipns
    }

    return send({
      path: 'mount',
      qs: opts
    }, callback)
  }
}
