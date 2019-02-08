'use strict'

const multihashes = require('multihashes')
const CID = require('cids')
const protobuf = require('protons')
const fnv1a = require('fnv1a')
const varint = require('varint')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const someSeries = require('async/someSeries')
const eachOfSeries = require('async/eachOfSeries')

const pbSchema = require('./pin.proto')

const emptyKeyHash = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
const emptyKey = multihashes.fromB58String(emptyKeyHash)
const defaultFanout = 256
const maxItems = 8192
const pb = protobuf(pbSchema)

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString()
}

function readHeader (rootNode) {
  // rootNode.data should be a buffer of the format:
  // < varint(headerLength) | header | itemData... >
  const rootData = rootNode.data
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
  if (header.fanout > rootNode.links.length) {
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
  const pinSet = {
    // should this be part of `object` API?
    hasDescendant: (root, childhash, callback) => {
      const seen = {}

      if (CID.isCID(childhash) || Buffer.isBuffer(childhash)) {
        childhash = toB58String(childhash)
      }

      return searchChildren(root, callback)

      function searchChildren (root, cb) {
        someSeries(root.links, ({ cid }, done) => {
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

    storeSet: (keys, callback) => {
      const pins = keys.map(key => {
        if (typeof key === 'string' || Buffer.isBuffer(key)) {
          key = new CID(key)
        }

        return {
          key: key,
          data: null
        }
      })

      pinSet.storeItems(pins, (err, rootNode) => {
        if (err) { return callback(err) }

        dag.put(rootNode, {
          version: 0,
          format: 'dag-pb',
          hashAlg: 'sha2-256',
          preload: false
        }, (err, cid) => {
          if (err) { return callback(err, cid) }
          callback(null, { node: rootNode, cid })
        })
      })
    },

    storeItems: (items, callback) => {
      return storePins(items, 0, callback)

      function storePins (pins, depth, storePinsCb) {
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
          fanoutLinks.push(new DAGLink('', 1, emptyKey))
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
            .sort((a, b) => Buffer.compare(a.link.cid.buffer, b.link.cid.buffer))

          const rootLinks = fanoutLinks.concat(nodes.map(item => item.link))
          const rootData = Buffer.concat(
            [headerBuf].concat(nodes.map(item => item.data))
          )

          DAGNode.create(rootData, rootLinks, (err, rootNode) => {
            if (err) { return storePinsCb(err) }
            return storePinsCb(null, rootNode)
          })
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

          eachOfSeries(bins, (bin, idx, eachCb) => {
            storePins(
              bin,
              depth + 1,
              (err, child) => storeChild(err, child, idx, eachCb)
            )
          }, err => {
            if (err) { return storePinsCb(err) }
            DAGNode.create(headerBuf, fanoutLinks, (err, rootNode) => {
              if (err) { return storePinsCb(err) }
              return storePinsCb(null, rootNode)
            })
          })
        }

        function storeChild (err, child, binIdx, cb) {
          if (err) { return cb(err) }

          const opts = {
            version: 0,
            hashAlg: 'sha2-256',
            format: 'dag-pb',
            preload: false
          }

          dag.put(child, opts, (err, cid) => {
            if (err) { return cb(err) }
            fanoutLinks[binIdx] = new DAGLink('', child.size, cid)
            cb(null)
          })
        }
      }
    },

    loadSet: (rootNode, name, callback) => {
      const link = rootNode.links.find(l => l.name === name)
      if (!link) {
        return callback(new Error('No link found with name ' + name))
      }

      dag.get(link.cid, '', { preload: false }, (err, res) => {
        if (err) { return callback(err) }
        const keys = []
        const step = link => keys.push(link.cid.buffer)
        pinSet.walkItems(res.value, step, err => {
          if (err) { return callback(err) }
          return callback(null, keys)
        })
      })
    },

    walkItems: (node, step, callback) => {
      let pbh
      try {
        pbh = readHeader(node)
      } catch (err) {
        return callback(err)
      }

      eachOfSeries(node.links, (link, idx, eachCb) => {
        if (idx < pbh.header.fanout) {
          // the first pbh.header.fanout links are fanout bins
          // if a fanout bin is not 'empty', dig into and walk its DAGLinks
          const linkHash = link.cid.buffer

          if (!emptyKey.equals(linkHash)) {
            // walk the links of this fanout bin
            return dag.get(linkHash, '', { preload: false }, (err, res) => {
              if (err) { return eachCb(err) }
              pinSet.walkItems(res.value, step, eachCb)
            })
          }
        } else {
          // otherwise, the link is a pin
          step(link, idx, pbh.data)
        }

        eachCb(null)
      }, callback)
    }
  }
  return pinSet
}
