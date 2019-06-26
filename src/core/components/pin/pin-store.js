'use strict'

const multicodec = require('multicodec')

// Wrapper around dag to set preload to false and write with DAG_PB format
class PinStore {
  constructor (dag) {
    this.dag = dag
  }

  fetch (cid, cb) {
    this.dag.get(cid, '', { preload: false }, cb)
  }

  save (node, cb) {
    this.dag.put(node, {
      version: 0,
      format: multicodec.DAG_PB,
      hashAlg: multicodec.SHA2_256,
      preload: false
    }, cb)
  }
}

module.exports = PinStore
