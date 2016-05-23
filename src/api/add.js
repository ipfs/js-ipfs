'use strict'

const Wreck = require('wreck')
const async = require('async')
const DAGNode = require('ipfs-merkle-dag').DAGNode

module.exports = (send) => {
  return function add (files, opts, cb) {
    if (typeof (opts) === 'function' && cb === undefined) {
      cb = opts
      opts = {}
    }

    send = send.withTransform(transform)

    if (typeof files === 'string' && files.startsWith('http')) {
      return Wreck.request('GET', files, null, (err, res) => {
        if (err) return cb(err)

        send('add', null, opts, res, cb)
      })
    }

    return send('add', null, opts, files, cb)

    // transform returned objects into DAGNodes
    function transform (err, res, done) {
      if (err) return done(err)

      async.map(res,
        function map (entry, fin) {
          send('object/get', entry.Hash, null, null, function (err, result) {
            if (err) return done(err)
            const node = new DAGNode(result.Data, result.Links)
            fin(err, node)
          })
        },
        function complete (err, results) {
          if (done) return done(err, results)
        })
    }
  }
}
