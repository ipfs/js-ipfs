'use strict'

const waterfall = require('async/waterfall')
const CID = require('cids')
const log = require('debug')('mfs:utils:load-node')
const bs58 = require('bs58')

const loadNode = (ipfs, cid, callback) => {
  const multihash = cid && (cid.multihash || cid.hash)

  if (!multihash) {
    log(`No multihash passed so cannot load DAGNode`)

    return callback()
  }

  log(`Loading DAGNode for child ${bs58.encode(multihash)}`)

  waterfall([
    (cb) => ipfs.dag.get(new CID(multihash), cb),
    (result, cb) => cb(null, result.value)
  ], callback)
}

module.exports = loadNode
