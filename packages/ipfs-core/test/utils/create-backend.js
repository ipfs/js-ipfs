'use strict'

const { MemoryDatastore } = require('interface-datastore')
const BlockstoreDatastoreAdapter = require(('blockstore-datastore-adapter'))

function createBackend (overrides = {}) {
  return {
    datastore: new MemoryDatastore(),
    blocks: new BlockstoreDatastoreAdapter(
      new MemoryDatastore()
    ),
    pins: new MemoryDatastore(),
    keys: new MemoryDatastore(),
    root: new MemoryDatastore(),
    ...overrides
  }
}

module.exports = createBackend
