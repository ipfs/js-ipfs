import { createFindPeer } from './find-peer.js'
import { createFindProvs } from './find-provs.js'
import { createGet } from './get.js'
import { createProvide } from './provide.js'
import { createPut } from './put.js'
import { createQuery } from './query.js'

export class DHTAPI {
  /**
   * @param {import('../types').Options} config
   */
  constructor (config) {
    this.findPeer = createFindPeer(config)
    this.findProvs = createFindProvs(config)
    this.get = createGet(config)
    this.provide = createProvide(config)
    this.put = createPut(config)
    this.query = createQuery(config)
  }
}
