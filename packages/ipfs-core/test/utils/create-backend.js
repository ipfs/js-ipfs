
import { MemoryDatastore } from 'interface-datastore'
import BlockstoreDatastoreAdapter from 'blockstore-datastore-adapter'

export function createBackend (overrides = {}) {
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
