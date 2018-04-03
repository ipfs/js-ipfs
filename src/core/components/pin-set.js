'use strict'

const multihashes = require('multihashes')
const CID = require('cids')
const protobuf = require('protons')
const fnv1a = require('fnv1a')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const varint = require('varint')
const once = require('once')
const some = require('async/some')

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
    hasChild: (root, childhash, callback) => {
      const seen = {}
      if (CID.isCID(childhash) || Buffer.isBuffer(childhash)) {
        childhash = toB58String(childhash)
      }

      return searchChildren(root, callback, root.links.length, 0)

      function searchChildren (root, cb, numToCheck, numChecked) {
        if (!root.links.length && numToCheck === numChecked) {
          // all nodes have been checked
          return cb(null, false)
        }

        some(root.links, ({ multihash }, someCb) => {
          const bs58Link = toB58String(multihash)
          if (bs58Link in seen) return
          if (bs58Link === childhash) {
            return someCb(null, true)
          }

          seen[bs58Link] = true

          dag.get(multihash, (err, { value }) => {
            if (err) { return someCb(err) }

            numChecked++
            numToCheck += value.links.length
            searchChildren(value, someCb, numToCheck, numChecked)
          })
        }, cb)
      }
    },

    storeSet: (keys, logInternalKey, callback) => {
      const pins = keys.map(key => ({
        key: key,
        data: null
      }))

      pinSet.storeItems(pins, logInternalKey, (err, rootNode) => {
        if (err) { return callback(err) }
        const opts = { cid: new CID(rootNode.multihash) }
        dag.put(rootNode, opts, (err, cid) => {
          if (err) { return callback(err) }
          logInternalKey(rootNode.multihash)
          callback(null, rootNode)
        })
      })
    },

    storeItems: (items, logInternalKey, callback) => {
      logInternalKey(emptyKey)

      return storePins(items, callback)

      function storePins (pins, cb, depth = 0, binsToFill = 0, binsFilled = 0) {
        cb = once(cb)
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
            .map(item => ({
              link: new DAGLink('', 1, item.key),
              data: item.data || Buffer.alloc(0)
            }))
            // sorting makes any ordering of `pins` produce the same DAGNode
            .sort((a, b) => Buffer.compare(a.link.multihash, b.link.multihash))

          const rootLinks = fanoutLinks.concat(nodes.map(item => item.link))
          const rootData = Buffer.concat(
            [headerBuf].concat(nodes.map(item => item.data))
          )

          DAGNode.create(rootData, rootLinks, (err, rootNode) => {
            if (err) { return cb(err) }
            return cb(null, rootNode)
          })
        } else {
          // If the array of pins is > maxItems, we:
          //  - distribute the pins among `defaultFanout` bins
          //    - create a DAGNode for each bin
          //      - add each pin of that bin as a DAGLink
          //  - create a root DAGNode
          //    - store each bin as a DAGLink
          //  - send that root DAGNode via `cb`
          // (using go-ipfs' "wasteful but simple" approach for consistency)

          const bins = pins.reduce((bins, pin) => {
            const n = hash(depth, pin.key) % defaultFanout
            bins[n] = n in bins ? bins[n].concat([pin]) : [pin]
            return bins
          }, {})

          const binKeys = Object.keys(bins)
          binsToFill += binKeys.length
          binKeys.forEach(n => {
            storePins(
              bins[n],
              (err, child) => storeChild(err, child, n),
              depth + 1,
              binsToFill,
              binsFilled
            )
          })
        }

        function storeChild (err, child, bin) {
          if (err) { return cb(err) }

          const cid = new CID(child._multihash)
          dag.put(child, { cid }, (err) => {
            if (err) { return cb(err) }

            logInternalKey(child.multihash)
            fanoutLinks[bin] = new DAGLink('', child.size, child.multihash)
            binsFilled++

            if (binsFilled === binsToFill) {
              // all finished
              DAGNode.create(headerBuf, fanoutLinks, (err, rootNode) => {
                if (err) { return cb(err) }
                return cb(null, rootNode)
              })
            }
          })
        }
      }
    },

    loadSet: (rootNode, name, logInternalKey, callback) => {
      callback = once(callback)
      const link = rootNode.links.find(l => l.name === name)
      if (!link) {
        return callback(new Error('No link found with name ' + name))
      }
      logInternalKey(link.multihash)

      dag.get(link.multihash, (err, res) => {
        if (err) { return callback(err) }
        const keys = []
        const step = link => keys.push(link.multihash)
        pinSet.walkItems(res.value, step, logInternalKey, err => {
          if (err) { return callback(err) }
          return callback(null, keys)
        })
      })
    },

    walkItems: (node, step, logInternalKey, callback) => {
      callback = once(callback)
      let pbh
      try {
        pbh = readHeader(node)
      } catch (err) {
        return callback(err)
      }
      let subwalkCount = 0
      let finishedCount = 0

      node.links.forEach((link, idx) => {
        if (idx < pbh.header.fanout) {
          // the first pbh.header.fanout links are fanout bins
          // if a link is not 'empty', dig into and walk its DAGLinks
          const linkHash = link.multihash
          logInternalKey(linkHash)

          if (!emptyKey.equals(linkHash)) {
            subwalkCount++

            // walk the links of this fanout bin
            dag.get(linkHash, (err, res) => {
              if (err) { return callback(err) }
              pinSet.walkItems(res.value, step, logInternalKey, walkCb)
            })
          }
        } else {
          // otherwise, the link is a pin
          return step(link, idx, pbh.data)
        }
      })

      if (!subwalkCount) {
        // reached end of pins and found no non-empty fanout bins
        return callback()
      }

      function walkCb (err) {
        if (err) { return callback(err) }
        finishedCount++
        if (subwalkCount === finishedCount) {
          // done walking
          return callback()
        }
      }
    }
  }
  return pinSet
}
