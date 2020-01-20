'use strict'

const callbackify = require('callbackify')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const CID = require('cids')
const mh = require('multihashes')
const multicodec = require('multicodec')
const Unixfs = require('ipfs-unixfs')
const errCode = require('err-code')

function normalizeMultihash (multihash, enc) {
  if (typeof multihash === 'string') {
    if (enc === 'base58' || !enc) {
      return multihash
    }

    return Buffer.from(multihash, enc)
  } else if (Buffer.isBuffer(multihash)) {
    return multihash
  } else if (CID.isCID(multihash)) {
    return multihash.buffer
  } else {
    throw new Error('unsupported multihash')
  }
}

function parseBuffer (buf, encoding) {
  switch (encoding) {
    case 'json':
      return parseJSONBuffer(buf)
    case 'protobuf':
      return parseProtoBuffer(buf)
    default:
      throw new Error(`unkown encoding: ${encoding}`)
  }
}

function parseJSONBuffer (buf) {
  let data
  let links

  try {
    const parsed = JSON.parse(buf.toString())

    links = (parsed.Links || []).map((link) => {
      return new DAGLink(
        link.Name || link.name,
        link.Size || link.size,
        mh.fromB58String(link.Hash || link.hash || link.multihash)
      )
    })
    data = Buffer.from(parsed.Data)
  } catch (err) {
    throw new Error('failed to parse JSON: ' + err)
  }

  return new DAGNode(data, links)
}

function parseProtoBuffer (buf) {
  return dagPB.util.deserialize(buf)
}

function findLinks (node, links = []) {
  for (const key in node) {
    const val = node[key]

    if (key === '/' && Object.keys(node).length === 1) {
      try {
        links.push(new DAGLink('', 0, new CID(val)))
        continue
      } catch (_) {
        // not a CID
      }
    }

    if (CID.isCID(val)) {
      links.push(new DAGLink('', 0, val))

      continue
    }

    if (Array.isArray(val)) {
      findLinks(val, links)
    }

    if (typeof val === 'object' && !(val instanceof String)) {
      findLinks(val, links)
    }
  }

  return links
}

module.exports = function object (self) {
  async function editAndSave (multihash, edit, options) {
    options = options || {}

    const node = await self.object.get(multihash, options)

    // edit applies the edit func passed to
    // editAndSave
    const cid = await self._ipld.put(edit(node), multicodec.DAG_PB, {
      cidVersion: 0,
      hashAlg: multicodec.SHA2_256
    })

    if (options.preload !== false) {
      self._preload(cid)
    }

    return cid
  }

  return {
    new: callbackify.variadic(async (template, options) => {
      options = options || {}

      // allow options in the template position
      if (template && typeof template !== 'string') {
        options = template
        template = null
      }

      let data

      if (template) {
        if (template === 'unixfs-dir') {
          data = (new Unixfs('directory')).marshal()
        } else {
          throw new Error('unknown template')
        }
      } else {
        data = Buffer.alloc(0)
      }

      const node = new DAGNode(data)

      const cid = await self._ipld.put(node, multicodec.DAG_PB, {
        cidVersion: 0,
        hashAlg: multicodec.SHA2_256
      })

      if (options.preload !== false) {
        self._preload(cid)
      }

      return cid
    }),
    put: callbackify.variadic(async (obj, options) => {
      options = options || {}

      const encoding = options.enc
      let node

      if (Buffer.isBuffer(obj)) {
        if (encoding) {
          node = await parseBuffer(obj, encoding)
        } else {
          node = new DAGNode(obj)
        }
      } else if (DAGNode.isDAGNode(obj)) {
        // already a dag node
        node = obj
      } else if (typeof obj === 'object') {
        node = new DAGNode(obj.Data, obj.Links)
      } else {
        throw new Error('obj not recognized')
      }

      const release = await self._gcLock.readLock()

      try {
        const cid = await self._ipld.put(node, multicodec.DAG_PB, {
          cidVersion: 0,
          hashAlg: multicodec.SHA2_256
        })

        if (options.preload !== false) {
          self._preload(cid)
        }

        return cid
      } finally {
        release()
      }
    }),

    get: callbackify.variadic(async (multihash, options) => { // eslint-disable-line require-await
      options = options || {}

      let mh, cid

      try {
        mh = normalizeMultihash(multihash, options.enc)
      } catch (err) {
        throw errCode(err, 'ERR_INVALID_MULTIHASH')
      }

      try {
        cid = new CID(mh)
      } catch (err) {
        throw errCode(err, 'ERR_INVALID_CID')
      }

      if (options.cidVersion === 1) {
        cid = cid.toV1()
      }

      if (options.preload !== false) {
        self._preload(cid)
      }

      return self._ipld.get(cid)
    }),

    data: callbackify.variadic(async (multihash, options) => {
      options = options || {}

      const node = await self.object.get(multihash, options)

      return node.Data
    }),

    links: callbackify.variadic(async (multihash, options) => {
      options = options || {}

      const cid = new CID(multihash)
      const result = await self.dag.get(cid, options)

      if (cid.codec === 'raw') {
        return []
      }

      if (cid.codec === 'dag-pb') {
        return result.value.Links
      }

      if (cid.codec === 'dag-cbor') {
        return findLinks(result)
      }

      throw new Error(`Cannot resolve links from codec ${cid.codec}`)
    }),

    stat: callbackify.variadic(async (multihash, options) => {
      options = options || {}

      const node = await self.object.get(multihash, options)
      const serialized = dagPB.util.serialize(node)
      const cid = await dagPB.util.cid(serialized, {
        cidVersion: 0
      })

      const blockSize = serialized.length
      const linkLength = node.Links.reduce((a, l) => a + l.Tsize, 0)

      return {
        Hash: cid.toBaseEncodedString(),
        NumLinks: node.Links.length,
        BlockSize: blockSize,
        LinksSize: blockSize - node.Data.length,
        DataSize: node.Data.length,
        CumulativeSize: blockSize + linkLength
      }
    }),

    patch: {
      addLink: callbackify.variadic(async (multihash, link, options) => { // eslint-disable-line require-await
        return editAndSave(multihash, (node) => {
          node.addLink(link)

          return node
        }, options)
      }),

      rmLink: callbackify.variadic(async (multihash, linkRef, options) => { // eslint-disable-line require-await
        return editAndSave(multihash, (node) => {
          node.rmLink(linkRef.Name || linkRef.name)

          return node
        }, options)
      }),

      appendData: callbackify.variadic(async (multihash, data, options) => { // eslint-disable-line require-await
        return editAndSave(multihash, (node) => {
          const newData = Buffer.concat([node.Data, data])

          return new DAGNode(newData, node.Links)
        }, options)
      }),

      setData: callbackify.variadic(async (multihash, data, options) => { // eslint-disable-line require-await
        return editAndSave(multihash, (node) => {
          return new DAGNode(data, node.Links)
        }, options)
      })
    }
  }
}
