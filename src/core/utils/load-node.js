'use strict'

const waterfall = require('async/waterfall')
const CID = require('cids')
const log = require('debug')('ipfs:mfs:utils:load-node')

const loadNode = (ipfs, object, callback) => {
  const multihash = object && (object.multihash || object.hash)

  if (!multihash) {
    log(`No multihash passed so cannot load DAGNode`)

    return callback()
  }

  const cid = new CID(multihash)

  log(`Loading DAGNode for child ${cid.toBaseEncodedString()}`)

  waterfall([
    (cb) => ipfs.dag.get(cid, cb),
    (result, cb) => cb(null, result.value)
  ], callback)
}

module.exports = loadNode
