'use strict'

const multihashes = require('multihashes')
const CID = require('cids')
const protobuf = require('protons')
const fnv1a = require('fnv1a')
const varint = require('varint')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const multicodec = require('multicodec')
const some = require('async/some')
const each = require('async/each')
const eachOf = require('async/eachOf')
const debug = require('debug')
const log = debug('ipfs:pin:pin-set')

const pbSchema = require('./pin.proto')

const emptyKeyHash = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
const emptyKey = multihashes.fromB58String(emptyKeyHash)
const defaultFanout = 256
const defaultFanoutLink = new DAGLink('', 1, emptyKey)
const maxItems = 8192
const pb = protobuf(pbSchema)

class PinSetCacheManager {
  constructor () {
    this.caches = {}
  }

  get (name) {
    if (!this.caches[name]) {
      this.caches[name] = new PinSetCache()
    }
    return this.caches[name]
  }
}

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

  getSubcache(index) {
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

  static getCacheId (pins) {
    const hashLen = pins[0].key.multihash.length
    const buff = Buffer.concat(pins.map(p => p.key.multihash), hashLen * pins.length)
    return fnv1a(buff.toString('binary'))
  }
}

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString()
}

function readHeader (rootNode) {
  // rootNode.data should be a buffer of the format:
  // < varint(headerLength) | header | itemData... >
  const rootData = rootNode.Data
  const hdrLength = varint.decode(rootData)
  const vBytes = varint.decode.bytes
  if (vBytes <= 0) {
    throw new Error('Invalid Set header length')
  }
  if (vBytes + hdrLength > rootData.length) {
    throw new Error('Impossibly large set header length')
  }
  const hdrSlice = rootData.slice(vBytes, hdrLength + vBytes)
  const header = pb.Set.decode(hdrSlice)
  if (header.version !== 1) {
    throw new Error(`Unsupported Set version: ${header.version}`)
  }
  if (header.fanout > rootNode.Links.length) {
    throw new Error('Impossibly large fanout')
  }
  return {
    header: header,
    data: rootData.slice(hdrLength + vBytes)
  }
}

function hash (seed, key) {
  const buf = Buffer.alloc(4)
  buf.writeUInt32LE(seed, 0)
  const data = Buffer.concat([
    buf, Buffer.from(toB58String(key))
  ])
  return fnv1a(data.toString('binary'))
}

exports = module.exports = function (dag) {
  const cacheManager = new PinSetCacheManager()

  const pinSet = {
    // should this be part of `object` API?
    hasDescendant: (root, childhash, callback) => {
      const seen = {}

      if (CID.isCID(childhash) || Buffer.isBuffer(childhash)) {
        childhash = toB58String(childhash)
      }

      return searchChildren(root, callback)

      function searchChildren (root, cb) {
        some(root.Links, (link, done) => {
          const cid = link.Hash
          const bs58Link = toB58String(cid)

          if (bs58Link === childhash) {
            return done(null, true)
          }

          if (bs58Link in seen) {
            return done(null, false)
          }

          seen[bs58Link] = true

          dag.get(cid, '', { preload: false }, (err, res) => {
            if (err) {
              return done(err)
            }

            searchChildren(res.value, done)
          })
        }, cb)
      }
    },

    storeSet: (keys, name, callback) => {
      const pins = keys.map(key => {
        if (typeof key === 'string' || Buffer.isBuffer(key)) {
          key = new CID(key)
        }

        return {
          key: key,
          data: null
        }
      })

      const cache = cacheManager.get(name)
      log(`storing ${pins.length} ${name} pins`)
      pinSet.storeItems(pins, cache, (err, rootNode) => {
        if (err) { return callback(err) }

        log(`stored ${pins.length} ${name} pins`)
        dag.put(rootNode, {
          version: 0,
          format: multicodec.DAG_PB,
          hashAlg: multicodec.SHA2_256,
          preload: false
        }, (err, cid) => {
          if (err) { return callback(err, cid) }
          callback(null, { node: rootNode, cid })
        })
      })
    },

    storeItems: (items, cache, callback) => {
      return storePins(items, 0, cache, callback)

      function storePins (pins, depth, psCache, storePinsCb) {
        const pbHeader = pb.Set.encode({
          version: 1,
          fanout: defaultFanout,
          seed: depth
        })
        const headerBuf = Buffer.concat([
          Buffer.from(varint.encode(pbHeader.length)), pbHeader
        ])
        const fanoutLinks = []
        for (let i = 0; i < defaultFanout; i++) {
          fanoutLinks[i] = defaultFanoutLink
        }

        if (pins.length <= maxItems) {
          const nodes = pins
            .map(item => {
              return ({
                link: new DAGLink('', 1, item.key),
                data: item.data || Buffer.alloc(0)
              })
            })
            // sorting makes any ordering of `pins` produce the same DAGNode
            .sort((a, b) => Buffer.compare(a.link.Hash.buffer, b.link.Hash.buffer))

          const rootLinks = fanoutLinks.concat(nodes.map(item => item.link))
          const rootData = Buffer.concat(
            [headerBuf].concat(nodes.map(item => item.data))
          )

          let rootNode

          try {
            rootNode = DAGNode.create(rootData, rootLinks)
          } catch (err) {
            return storePinsCb(err)
          }

          return storePinsCb(null, rootNode)
        } else {
          // If the array of pins is > maxItems, we:
          //  - distribute the pins among `defaultFanout` bins
          //    - create a DAGNode for each bin
          //      - add each pin as a DAGLink to that bin
          //  - create a root DAGNode
          //    - add each bin as a DAGLink
          //  - send that root DAGNode via callback
          // (using go-ipfs' "wasteful but simple" approach for consistency)
          // https://github.com/ipfs/go-ipfs/blob/master/pin/set.go#L57

          const bins = pins.reduce((bins, pin) => {
            const n = hash(depth, pin.key) % defaultFanout
            bins[n] = n in bins ? bins[n].concat([pin]) : [pin]
            return bins
          }, {})

          // Clear any cache slots for removed pins
          psCache.clearMissing(bins)

          eachOf(bins, (bin, idx, eachCb) => {
            // Check if the bin at this index is unchanged
            const link = psCache.get(idx, bin)
            if (link) {
              // log('  cache hit')
              fanoutLinks[idx] = link
              return eachCb()
            }
            // log('  cache miss')

            storePins(
              bin,
              depth + 1,
              psCache.getSubcache(idx),
              (err, child) => {
                if (err) { return cb(err) }

                storeChild(child, (err, link) => {
                  if (err) { return eachCb(err) }

                  fanoutLinks[idx] = link
                  psCache.put(idx, bin, link)

                  eachCb()
                })
              }
            )
          }, err => {
            if (err) { return storePinsCb(err) }

            let rootNode

            try {
              rootNode = DAGNode.create(headerBuf, fanoutLinks)
            } catch (err) {
              return storePinsCb(err)
            }

            return storePinsCb(null, rootNode)
          })
        }

        function storeChild (child, cb) {
          const opts = {
            version: 0,
            format: multicodec.DAG_PB,
            hashAlg: multicodec.SHA2_256,
            preload: false
          }

          dag.put(child, opts, (err, cid) => {
            err ? cb(err) : cb(null, new DAGLink('', child.size, cid))
          })
        }
      }
    },

    loadSet: (rootNode, name, callback) => {
      const link = rootNode.Links.find(l => l.Name === name)
      if (!link) {
        return callback(new Error('No link found with name ' + name))
      }

      dag.get(link.Hash, '', { preload: false }, (err, res) => {
        if (err) { return callback(err) }

        const keys = []
        const stepPin = link => keys.push(link.Hash.buffer)
        const cache = cacheManager.get(name)
        pinSet.walkItems(res.value, { stepPin, cache }, err => {
          if (err) { return callback(err) }
          return callback(null, keys)
        })
      })
    },

    walkItems: (node, { stepPin = () => {}, stepBin = () => {}, cache }, callback) => {
      let pbh
      try {
        pbh = readHeader(node)
      } catch (err) {
        return callback(err)
      }

      let pins = []
      eachOf(node.Links, (link, idx, eachCb) => {
        if (idx < pbh.header.fanout) {
          // the first pbh.header.fanout links are fanout bins
          // if a fanout bin is not 'empty', dig into and walk its DAGLinks
          const linkHash = link.Hash.buffer

          if (!emptyKey.equals(linkHash)) {
            stepBin(link, idx, pbh.data)

            // walk the links of this fanout bin
            return dag.get(linkHash, '', { preload: false }, (err, res) => {
              if (err) { return eachCb(err) }

              const opts = {
                stepPin,
                stepBin,
                cache: cache && cache.getSubcache(idx)
              }
              pinSet.walkItems(res.value, opts, (err, subPins) => {
                if (err) { return eachCb(err) }

                pins = pins.concat(subPins)
                cache && cache.put(idx, subPins, link)

                eachCb(null)
              })
            })
          }
        } else {
          // otherwise, the link is a pin
          stepPin(link, idx, pbh.data)
          pins.push({ key: link.Hash, data: pbh.data })
        }

        eachCb(null)
      }, (err) => callback(err, pins))
    },

    getInternalCids: (rootNode, callback) => {
      // "Empty block" used by the pinner
      const cids = [new CID(emptyKey)]

      const stepBin = link => cids.push(link.Hash)
      each(rootNode.Links, (topLevelLink, cb) => {
        cids.push(topLevelLink.Hash)

        dag.get(topLevelLink.Hash, '', { preload: false }, (err, res) => {
          if (err) { return cb(err) }

          pinSet.walkItems(res.value, { stepBin }, cb)
        })
      }, (err) => callback(err, cids))
    }
  }
  return pinSet
}
