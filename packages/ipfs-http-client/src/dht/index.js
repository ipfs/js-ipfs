import { createFindPeer } from './find-peer.js'
import { createFindProvs } from './find-provs.js'
import { createGet } from './get.js'
import { createProvide } from './provide.js'
import { createPut } from './put.js'
import { createQuery } from './query.js'

/**
 * @param {import('../types').Options} config
 */
export function createDht (config) {
  return {
    findPeer: createFindPeer(config),
    findProvs: createFindProvs(config),
    get: createGet(config),
    provide: createProvide(config),
    put: createPut(config),
    query: createQuery(config)
  }
}
