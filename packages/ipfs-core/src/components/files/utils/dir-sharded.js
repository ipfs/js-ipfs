import { encode, prepare } from '@ipld/dag-pb'
import { UnixFS } from 'ipfs-unixfs'
import { persist } from './persist.js'
import { createHAMT, Bucket } from 'hamt-sharding'
import {
  hamtHashCode,
  hamtHashFn,
  hamtBucketBits
} from './hamt-constants.js'

/**
 * @typedef {import('ipfs-unixfs-importer').ImporterOptions} ImporterOptions
 * @typedef {import('interface-blockstore').Blockstore} Blockstore
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs-unixfs').Mtime} Mtime
 *
 * @typedef {object} ImportResult
 * @property {CID} cid
 * @property {import('@ipld/dag-pb').PBNode} node
 * @property {number} size
 *
 * @typedef {object} DirContents
 * @property {CID} [cid]
 * @property {number} [size]
 *
 * @typedef {object} DirOptions
 * @property {Mtime} [mtime]
 * @property {number} [mode]
 * @property {import('multiformats/codecs/interface').BlockCodec<any, any>} [codec]
 * @property {import('multiformats/cid').CIDVersion} [cidVersion]
 * @property {boolean} [onlyHash]
 * @property {AbortSignal} [signal]
 */

/**
 * @typedef {object} DirProps
 * @property {boolean} root
 * @property {boolean} dir
 * @property {string} path
 * @property {boolean} dirty
 * @property {boolean} flat
 * @property {Dir} [parent]
 * @property {string} [parentKey]
 * @property {import('ipfs-unixfs').UnixFS} [unixfs]
 * @property {number} [mode]
 * @property {import('ipfs-unixfs').Mtime} [mtime]
 */
export class Dir {
  /**
   * @param {DirProps} props
   * @param {DirOptions} options
   */
  constructor (props, options) {
    this.options = options || {}
    this.root = props.root
    this.dir = props.dir
    this.path = props.path
    this.dirty = props.dirty
    this.flat = props.flat
    this.parent = props.parent
    this.parentKey = props.parentKey
    this.unixfs = props.unixfs
    this.mode = props.mode
    this.mtime = props.mtime
    /** @type {CID | undefined} */
    this.cid = undefined
    /** @type {number | undefined} */
    this.size = undefined
  }

  /**
   * @param {string} name
   * @param {DirContents} value
   */
  async put (name, value) { }
  /**
   * @param {string} name
   * @returns {Promise<DirContents | undefined>}
   */
  get (name) {
    return Promise.resolve(this)
  }

  /**
   * @returns {AsyncIterable<{ key: string, child: DirContents}>}
   */
  async * eachChildSeries () { }
  /**
   * @param {Blockstore} blockstore
   * @returns {AsyncIterable<ImportResult>}
   */
  async * flush (blockstore) { }
}

export class DirSharded extends Dir {
  /**
   * @param {DirProps} props
   * @param {DirOptions} options
   */
  constructor (props, options) {
    super(props, options)

    /** @type {Bucket<DirContents>} */
    this._bucket = createHAMT({
      hashFn: hamtHashFn,
      bits: hamtBucketBits
    })
  }

  /**
   * @param {string} name
   * @param {DirContents} value
   */
  async put (name, value) {
    await this._bucket.put(name, value)
  }

  /**
   * @param {string} name
   */
  get (name) {
    return this._bucket.get(name)
  }

  childCount () {
    return this._bucket.leafCount()
  }

  directChildrenCount () {
    return this._bucket.childrenCount()
  }

  onlyChild () {
    return this._bucket.onlyChild()
  }

  async * eachChildSeries () {
    for await (const { key, value } of this._bucket.eachLeafSeries()) {
      yield {
        key,
        child: value
      }
    }
  }

  /**
   * @param {Blockstore} blockstore
   * @returns {AsyncIterable<ImportResult>}
   */
  async * flush (blockstore) {
    yield * flush(this._bucket, blockstore, this, this.options)
  }
}

/**
 * @param {Bucket<?>} bucket
 * @param {Blockstore} blockstore
 * @param {*} shardRoot
 * @param {DirOptions} options
 * @returns {AsyncIterable<ImportResult>}
 */
async function * flush (bucket, blockstore, shardRoot, options) {
  const children = bucket._children
  const links = []
  let childrenSize = 0

  for (let i = 0; i < children.length; i++) {
    const child = children.get(i)

    if (!child) {
      continue
    }

    const labelPrefix = i.toString(16).toUpperCase().padStart(2, '0')

    if (child instanceof Bucket) {
      let shard

      for await (const subShard of await flush(child, blockstore, null, options)) {
        shard = subShard
      }

      if (!shard) {
        throw new Error('Could not flush sharded directory, no subshard found')
      }

      links.push({
        Name: labelPrefix,
        Tsize: shard.size,
        Hash: shard.cid
      })
      childrenSize += shard.size
    } else if (typeof child.value.flush === 'function') {
      const dir = child.value
      let flushedDir

      for await (const entry of dir.flush(blockstore)) {
        flushedDir = entry

        yield flushedDir
      }

      const label = labelPrefix + child.key
      links.push({
        Name: label,
        Tsize: flushedDir.size,
        Hash: flushedDir.cid
      })

      childrenSize += flushedDir.size
    } else {
      const value = child.value

      if (!value.cid) {
        continue
      }

      const label = labelPrefix + child.key
      const size = value.size

      links.push({
        Name: label,
        Tsize: size,
        Hash: value.cid
      })
      childrenSize += size
    }
  }

  // go-ipfs uses little endian, that's why we have to
  // reverse the bit field before storing it
  const data = Uint8Array.from(children.bitField().reverse())
  const dir = new UnixFS({
    type: 'hamt-sharded-directory',
    data,
    fanout: bucket.tableSize(),
    hashType: hamtHashCode,
    mtime: shardRoot && shardRoot.mtime,
    mode: shardRoot && shardRoot.mode
  })

  const node = {
    Data: dir.marshal(),
    Links: links
  }
  const buffer = encode(prepare(node))
  const cid = await persist(buffer, blockstore, options)
  const size = buffer.length + childrenSize

  yield {
    cid,
    node,
    size
  }
}
