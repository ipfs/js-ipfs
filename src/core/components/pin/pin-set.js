'use strict'

const multihashes = require('multihashes')
const CID = require('cids')
const protobuf = require('protons')
const fnv1a = require('fnv1a')
const varint = require('varint')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const some = require('async/some')
const each = require('async/each')
const eachOf = require('async/eachOf')
const debug = require('debug')
const log = debug('ipfs:pin:pin-set')

const PinSetCache = require('./pin-set-cache')
const pbSchema = require('./pin.proto')

const emptyKeyHash = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
const emptyKey = multihashes.fromB58String(emptyKeyHash)
const defaultFanout = 256
const defaultFanoutLink = new DAGLink('', 1, emptyKey)
const defaultMaxItems = 8192
const pb = protobuf(pbSchema)

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString('base58btc')
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

class PinSet {
  constructor (pinType, store, fanout = defaultFanout, maxItems = defaultMaxItems) {
    this.pinType = pinType
    this.store = store
    this.fanout = fanout
    this.maxItems = maxItems
    this.pinKeys = new Set()
    this.cache = new PinSetCache()
  }

  hasPin (key) {
    return this.pinKeys.has(key)
  }

  // should this be part of `object` API?
  hasDescendant (root, childhash, callback) {
    const seen = {}

    if (CID.isCID(childhash) || Buffer.isBuffer(childhash)) {
      childhash = toB58String(childhash)
    }

    return this.searchChildren(root, childhash, seen, callback)
  }

  searchChildren (root, childhash, seen, cb) {
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

      this.store.fetch(cid, (err, res) => {
        if (err) {
          return done(err)
        }

        this.searchChildren(res.value, childhash, seen, done)
      })
    }, cb)
  }

  addPins (keys, callback) {
    // Make sure there are some new pins to add
    keys = keys.filter(key => !this.hasPin(key))
    if (this.stored && !keys.length) return callback(null, false)

    for (const key of keys) {
      this.pinKeys.add(key)
    }
    this.storeSet(this.pinKeys, (err) => callback(err, true))
  }

  rmPins (keys, callback) {
    // Make sure there are some pins to remove
    keys = keys.filter(key => this.hasPin(key))
    if (this.stored && !keys.length) return callback(null, false)

    for (const key of keys) {
      this.pinKeys.delete(key)
    }
    this.storeSet(this.pinKeys, (err) => callback(err, true))
  }

  // Store the current pin set if it hasn't already been stored
  saveSet (callback) {
    if (this.stored) {
      return callback(null, this.stored)
    }

    this.storeSet(this.pinKeys, callback)
  }

  // Store the given set of keys
  storeSet (keys, callback) {
    const pins = [...keys].map(key => {
      key = new CID(key)

      return {
        key: key,
        data: null
      }
    })

    log(`storing ${pins.length} ${this.pinType} pins`)
    this.storeItems(pins, this.cache, (err, rootNode) => {
      if (err) { return callback(err) }

      log(`stored ${pins.length} ${this.pinType} pins`)
      this.store.save(rootNode, (err, cid) => {
        if (err) { return callback(err) }

        this.stored = {
          cid,
          node: rootNode,
          link: new DAGLink(this.pinType, rootNode.size, cid)
        }

        callback(null, this.stored)
      })
    })
  }

  storeItems (items, cache, callback) {
    if (this.emptyNode) {
      return this.storePins(items, 0, cache, callback)
    }

    // The pin-set nodes link to a special 'empty' node, so make sure it exists
    let empty
    try {
      empty = DAGNode.create(Buffer.alloc(0))
    } catch (err) {
      return callback(err)
    }

    this.emptyNode = this.store.save(empty, (err) => {
      if (err) { return callback(err) }

      this.storePins(items, 0, cache, callback)
    })
  }

  storePins (pins, depth, psCache, storePinsCb) {
    // A header with the version and the fanout (number of bins) at this depth
    const pbHeader = pb.Set.encode({
      version: 1,
      fanout: this.fanout,
      seed: depth
    })
    const headerBuf = Buffer.concat([
      Buffer.from(varint.encode(pbHeader.length)), pbHeader
    ])

    // Initialize the fanout links (links to bins) to point to an empty DAGNode
    const fanoutLinks = []
    for (let i = 0; i < this.fanout; i++) {
      fanoutLinks[i] = defaultFanoutLink
    }

    // If there are less than maxItems pins, just store them all in one DAGNode
    if (pins.length <= this.maxItems) {
      const nodes = pins
        .map(item => {
          return ({
            link: new DAGLink('', 1, item.key),
            data: item.data || Buffer.alloc(0)
          })
        })
        // sorting makes any ordering of `pins` produce the same DAGNode
        .sort((a, b) => Buffer.compare(a.link.Hash.buffer, b.link.Hash.buffer))

      // Add the pin links to the (empty) bin links
      const rootLinks = fanoutLinks.concat(nodes.map(item => item.link))
      const rootData = Buffer.concat(
        [headerBuf].concat(nodes.map(item => item.data))
      )

      let rootNode

      // Create the DAGNode with all the links in it
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
        const n = hash(depth, pin.key) % this.fanout
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

        // Store the pins in this bin
        this.storePins(
          bin,
          depth + 1,
          psCache.getSubcache(idx),
          (err, child) => {
            if (err) { return eachCb(err) }

            this.store.save(child, (err, cid) => {
              if (err) { return eachCb(err) }

              const link = new DAGLink('', child.size, cid)
              fanoutLinks[idx] = link
              psCache.put(idx, bin, link)

              eachCb()
            })
          }
        )
      }, err => {
        if (err) { return storePinsCb(err) }

        let rootNode

        // Create a DAGNode with links to all the bins
        try {
          rootNode = DAGNode.create(headerBuf, fanoutLinks)
        } catch (err) {
          return storePinsCb(err)
        }

        return storePinsCb(null, rootNode)
      })
    }
  }

  // Load the pin set
  loadSet (rootNode, callback) {
    let index = rootNode.Links.findIndex(l => l.Name === this.pinType)
    if (index === -1) {
      return callback(new Error('No link found with name ' + this.pinType))
    }

    return this.loadSetAt(rootNode, index, callback)
  }

  // Load a pin set from the given node at the given index
  loadSetAt (rootNode, index, callback) {
    // Get the link at the given index
    let link = rootNode.Links[index]
    if (!link) {
      return callback(new Error('No link found at index ' + index))
    }

    // Fetch the DAGNode pointed to by the link
    this.store.fetch(link.Hash, (err, res) => {
      if (err) { return callback(err) }

      // Get the pins from the node
      const keys = []
      const stepPin = link => keys.push(link.Hash.buffer)
      const cache = this.cache
      this.walkItems(res.value, { stepPin, cache }, err => {
        if (err) { return callback(err) }

        // Initialize the pin set cache
        this.pinKeys = new Set(keys.map(toB58String))
        return callback(null, keys)
      })
    })
  }

  // Walk items in this pin set's store
  walkItems (node, opts, callback) {
    PinSet.walkStoreItems(this.store, node, opts, callback)
  }

  // Walk items in the given store starting at the given node
  //   stepPin(link, index, data) - called each time a pin is encountered
  //   stepBin(link, index, data) - called each time a (non-empty) bin is encountered
  static walkStoreItems (store, node, { stepPin = () => {}, stepBin = () => {}, cache }, callback) {
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
          return store.fetch(linkHash, (err, res) => {
            if (err) { return eachCb(err) }

            const opts = {
              stepPin,
              stepBin,
              cache: cache && cache.getSubcache(idx)
            }
            PinSet.walkStoreItems(store, res.value, opts, (err, subPins) => {
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
  }

  // Get CIDs used internally by the pinner
  // - the empty block
  // - all internal structural nodes, ie the "bins" that hold groups of pins
  static getInternalCids (store, rootNode, callback) {
    // "Empty block" used by the pinner
    const cids = [new CID(emptyKey)]

    const stepBin = link => cids.push(link.Hash)
    each(rootNode.Links, (topLevelLink, cb) => {
      cids.push(topLevelLink.Hash)

      store.fetch(topLevelLink.Hash, (err, res) => {
        if (err) { return cb(err) }

        PinSet.walkStoreItems(store, res.value, { stepBin }, cb)
      })
    }, (err) => callback(err, cids))
  }
}

module.exports = PinSet
module.exports.EmptyKeyHash = emptyKeyHash
