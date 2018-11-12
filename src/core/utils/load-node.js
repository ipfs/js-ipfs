'use strict'

const waterfall = require('async/waterfall')
const CID = require('cids')
const log = require('debug')('ipfs:mfs:utils:load-node')

const loadNode = (context, dagLink, callback) => {
  const cid = new CID(dagLink.cid)

  log(`Loading DAGNode for child ${cid.toBaseEncodedString()}`)

  waterfall([
    (cb) => context.ipld.get(cid, cb),
    (result, cb) => cb(null, {
      node: result.value,
      cid
    })
  ], callback)
}

module.exports = loadNode
