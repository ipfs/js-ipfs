'use strict'

const multihashes = require('multihashes')
const CID = require('cids')
const protobuf = require('protons')
const fnv1a = require('fnv1a')
const varint = require('varint')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const multicodec = require('multicodec')
const { default: Queue } = require('p-queue')
const dagCborLinks = require('dag-cbor-links')
const log = require('debug')('ipfs:pin:pin-set')
const pbSchema = require('./pin.proto')

const emptyKeyHash = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
const emptyKey = multihashes.fromB58String(emptyKeyHash)
const defaultFanout = 256
const maxItems = 8192
const pb = protobuf(pbSchema)

const HAS_DESCENDANT_CONCURRENCY = 100

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

function * cborCids (node) {
  for (const [_, cid] of dagCborLinks(node)) { // eslint-disable-line no-unused-vars
    yield cid
  }
}

exports = module.exports = function (dag) {
  const pinSet = {
    // should this be part of `object` API?
    hasDescendant: async (parentCid, childhash) => {
      if (parentCid.codec !== 'dag-pb' && parentCid.codec !== 'dag-cbor') {
        return false
      }

      const { value: root } = await dag.get(parentCid, { preload: false })
      const queue = new Queue({
        concurrency: HAS_DESCENDANT_CONCURRENCY
      })

      if (CID.isCID(childhash) || Buffer.isBuffer(childhash)) {
        childhash = toB58String(childhash)
      }

      let found = false
      const seen = {}

      function searchChild (linkCid) {
        return async () => {
          if (found) {
            return
          }

          try {
            const { value: childNode } = await dag.get(linkCid, { preload: false })

            searchChildren(linkCid, childNode)
          } catch (err) {
            log(err)
          }
        }
      }

      function searchChildren (cid, node) {
        let links = []

        if (cid.codec === 'dag-pb') {
          links = node.Links
        } else if (cid.codec === 'dag-cbor') {
          links = cborCids(node)
        }

        for (const link of links) {
          const linkCid = cid.codec === 'dag-pb' ? link.Hash : link[1]
          const bs58Link = toB58String(linkCid)

          if (bs58Link === childhash) {
            queue.clear()
            found = true

            return
          }

          if (seen[bs58Link]) {
            continue
          }

          seen[bs58Link] = true

          if (linkCid.codec !== 'dag-pb' && linkCid.codec !== 'dag-cbor') {
            continue
          }

          queue.add(searchChild(linkCid))
        }
      }

      searchChildren(parentCid, root)

      await queue.onIdle()

      return found
    },

    storeSet: async (keys) => {
      const pins = keys.map(key => {
        if (typeof key === 'string' || Buffer.isBuffer(key)) {
          key = new CID(key)
        }

        return {
          key: key,
          data: null
        }
      })

      const rootNode = await pinSet.storeItems(pins)
      const cid = await dag.put(rootNode, {
        version: 0,
        format: multicodec.DAG_PB,
        hashAlg: multicodec.SHA2_256,
        preload: false
      })

      return {
        node: rootNode,
        cid
      }
    },

    storeItems: async (items) => { // eslint-disable-line require-await
      return storePins(items, 0)

      async function storePins (pins, depth) {
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
            .sort((a, b) => Buffer.compare(a.link.Hash.buffer, b.link.Hash.buffer))

          const rootLinks = fanoutLinks.concat(nodes.map(item => item.link))
          const rootData = Buffer.concat(
            [headerBuf].concat(nodes.map(item => item.data))
          )

          return new DAGNode(rootData, rootLinks)
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
          }, [])

          let idx = 0
          for (const bin of bins) {
            const child = await storePins(bin, depth + 1)

            await storeChild(child, idx)

            idx++
          }

          return new DAGNode(headerBuf, fanoutLinks)
        }

        async function storeChild (child, binIdx) {
          const opts = {
            version: 0,
            format: multicodec.DAG_PB,
            hashAlg: multicodec.SHA2_256,
            preload: false
          }

          const cid = await dag.put(child, opts)

          fanoutLinks[binIdx] = new DAGLink('', child.size, cid)
        }
      }
    },

    loadSet: async (rootNode, name) => {
      const link = rootNode.Links.find(l => l.Name === name)

      if (!link) {
        throw new Error('No link found with name ' + name)
      }

      const res = await dag.get(link.Hash, '', { preload: false })
      const keys = []
      const stepPin = link => keys.push(link.Hash)

      await pinSet.walkItems(res.value, { stepPin })

      return keys
    },

    walkItems: async (node, { stepPin = () => {}, stepBin = () => {} }) => {
      const pbh = readHeader(node)
      let idx = 0

      for (const link of node.Links) {
        if (idx < pbh.header.fanout) {
          // the first pbh.header.fanout links are fanout bins
          // if a fanout bin is not 'empty', dig into and walk its DAGLinks
          const linkHash = link.Hash.buffer

          if (!emptyKey.equals(linkHash)) {
            stepBin(link, idx, pbh.data)

            // walk the links of this fanout bin
            const res = await dag.get(linkHash, '', { preload: false })

            await pinSet.walkItems(res.value, { stepPin, stepBin })
          }
        } else {
          // otherwise, the link is a pin
          stepPin(link, idx, pbh.data)
        }

        idx++
      }
    },

    getInternalCids: async (rootNode) => {
      // "Empty block" used by the pinner
      const cids = [new CID(emptyKey)]
      const stepBin = link => cids.push(link.Hash)

      for (const topLevelLink of rootNode.Links) {
        cids.push(topLevelLink.Hash)

        const res = await dag.get(topLevelLink.Hash, '', { preload: false })

        await pinSet.walkItems(res.value, { stepBin })
      }

      return cids
    }
  }

  return pinSet
}
