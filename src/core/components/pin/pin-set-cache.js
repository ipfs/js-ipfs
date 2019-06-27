'use strict'

const fnv1a = require('fnv1a')

class PinSetCache {
  constructor () {
    this.fanoutLinks = []
    this.subcaches = []
  }

  get (index, pins) {
    if (!this.fanoutLinks[index]) return null

    const cacheId = PinSetCache.getCacheId(pins)
    if (this.fanoutLinks[index].id === cacheId) {
      return this.fanoutLinks[index].link
    }
    return null
  }

  put (index, pins, link) {
    this.fanoutLinks[index] = {
      id: PinSetCache.getCacheId(pins),
      link
    }
  }

  getSubcache (index) {
    if (!this.subcaches[index]) {
      this.subcaches[index] = new PinSetCache()
    }
    return this.subcaches[index]
  }

  clearMissing (pins) {
    for (const i of Object.keys(this.fanoutLinks)) {
      if (!pins[i]) {
        delete this.fanoutLinks[i]
      }
    }
    for (const i of Object.keys(this.subcaches)) {
      if (!pins[i]) {
        delete this.subcaches[i]
      }
    }
  }

  walkItems (step, level = this) {
    for (const i of Object.keys(level.fanoutLinks)) {
      step(level.fanoutLinks[i].link, i)
    }
    for (const i of Object.keys(level.subcaches)) {
      this.walkItems(step, level.subcaches[i])
    }
  }

  static getCacheId (pins) {
    const hashLen = pins[0].key.multihash.length
    const buff = Buffer.concat(pins.map(p => p.key.multihash), hashLen * pins.length)
    return fnv1a(buff.toString('binary'))
  }
}

module.exports = PinSetCache
