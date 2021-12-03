/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expect } from 'aegir/utils/chai.js'
import all from 'it-all'
import { waitForCids, defaultAddr, clearPreloadCids } from './utils/mock-preload-node-utils.js'
import createNode from './utils/create-node.js'
import * as dagPB from '@ipld/dag-pb'

describe('preload', () => {
  /** @type {import('ipfs-core-types').IPFS} */
  let ipfs
  /** @type {() => Promise<void>} */
  let cleanup

  before(async () => {
    const res = await createNode({
      preload: {
        enabled: true,
        addresses: [defaultAddr]
      }
    })
    ipfs = res.ipfs
    cleanup = res.cleanup
  })

  after(() => cleanup())
  afterEach(() => clearPreloadCids())

  it('should not preload content multiple times', async function () {
    this.timeout(50 * 1000)
    const { cid } = await ipfs.add(uint8ArrayFromString(nanoid()), { preload: false })

    await all(ipfs.cat(cid))
    await waitForCids(cid)

    // should not preload the second time
    await clearPreloadCids()
    await all(ipfs.cat(cid))
    await expect(waitForCids(cid)).to.eventually.be.rejectedWith('Timed out waiting for CIDs to be preloaded')
  })

  it('should preload content added with add', async function () {
    this.timeout(50 * 1000)
    const res = await ipfs.add(uint8ArrayFromString(nanoid()))
    await waitForCids(res.cid)
  })

  it('should preload multiple content added with add', async function () {
    this.timeout(50 * 1000)

    const res = await all(ipfs.addAll([{
      content: uint8ArrayFromString(nanoid())
    }, {
      content: uint8ArrayFromString(nanoid())
    }, {
      content: uint8ArrayFromString(nanoid())
    }]))

    await waitForCids(res.map(file => file.cid))
  })

  it('should preload multiple content and intermediate dirs added with add', async function () {
    this.timeout(50 * 1000)

    const res = await all(ipfs.addAll([{
      path: 'dir0/dir1/file0',
      content: uint8ArrayFromString(nanoid())
    }, {
      path: 'dir0/dir1/file1',
      content: uint8ArrayFromString(nanoid())
    }, {
      path: 'dir0/file2',
      content: uint8ArrayFromString(nanoid())
    }]))

    const rootDir = res.find(file => file.path === 'dir0')
    expect(rootDir).to.exist()

    if (!rootDir) {
      throw new Error('rootDir did not exist')
    }

    await waitForCids(rootDir.cid)
  })

  it('should preload multiple content and wrapping dir for content added with add and wrapWithDirectory option', async function () {
    this.timeout(50 * 1000)

    const res = await all(ipfs.addAll([{
      path: 'dir0/dir1/file0',
      content: uint8ArrayFromString(nanoid())
    }, {
      path: 'dir0/dir1/file1',
      content: uint8ArrayFromString(nanoid())
    }, {
      path: 'dir0/file2',
      content: uint8ArrayFromString(nanoid())
    }], { wrapWithDirectory: true }))

    const wrappingDir = res.find(file => file.path === '')
    expect(wrappingDir).to.exist()

    if (!wrappingDir) {
      throw new Error('wrappingDir did not exist')
    }

    await waitForCids(wrappingDir.cid)
  })

  it('should preload content retrieved with cat', async function () {
    this.timeout(50 * 1000)
    const res = await ipfs.add(uint8ArrayFromString(nanoid()), { preload: false })
    await all(ipfs.cat(res.cid))
    await waitForCids(res.cid)
  })

  it('should preload content retrieved with get', async function () {
    this.timeout(50 * 1000)
    const res = await ipfs.add(uint8ArrayFromString(nanoid()), { preload: false })
    await all(ipfs.get(res.cid))
    await waitForCids(res.cid)
  })

  it('should preload content retrieved with ls', async function () {
    this.timeout(50 * 1000)

    const res = await all(ipfs.addAll([{
      path: 'dir0/dir1/file0',
      content: uint8ArrayFromString(nanoid())
    }, {
      path: 'dir0/dir1/file1',
      content: uint8ArrayFromString(nanoid())
    }, {
      path: 'dir0/file2',
      content: uint8ArrayFromString(nanoid())
    }], { wrapWithDirectory: true, preload: false }))

    const wrappingDir = res.find(file => file.path === '')
    expect(wrappingDir).to.exist()

    if (!wrappingDir) {
      throw new Error('wrappingDir did not exist')
    }

    // Adding these files with have preloaded wrappingDir.hash, clear it out
    await clearPreloadCids()

    await all(ipfs.ls(wrappingDir.cid))
    await waitForCids(wrappingDir.cid)
  })

  it('should preload content added with object.new', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.object.new()
    await waitForCids(cid)
  })

  it('should preload content added with object.put', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.object.put({ Data: uint8ArrayFromString(nanoid()), Links: [] })
    await waitForCids(cid)
  })

  it('should preload content added with object.patch.addLink', async function () {
    this.timeout(50 * 1000)

    const createNode = async () => {
      const cid = await ipfs.object.put({ Data: uint8ArrayFromString(nanoid()), Links: [] })
      const node = await ipfs.object.get(cid)
      return { cid, node }
    }

    const [parent, link] = await Promise.all([createNode(), createNode()])

    await clearPreloadCids()
    const cid = await ipfs.object.patch.addLink(parent.cid, {
      Name: 'link',
      Hash: link.cid,
      Tsize: dagPB.encode(link.node).length
    })
    await waitForCids(cid)
  })

  it('should preload content added with object.patch.rmLink', async function () {
    this.timeout(50 * 1000)

    const linkCid = await ipfs.object.put({ Data: uint8ArrayFromString(nanoid()), Links: [] })
    const linkNode = await ipfs.object.get(linkCid)
    const linkBuf = dagPB.encode(linkNode)

    const parentCid = await ipfs.object.put({
      Data: uint8ArrayFromString(nanoid()),
      Links: [{
        Name: 'link',
        Hash: linkCid,
        Tsize: linkBuf.length
      }]
    })

    await clearPreloadCids()
    const cid = await ipfs.object.patch.rmLink(parentCid, 'link')
    await waitForCids(cid)
  })

  it('should preload content added with object.patch.setData', async function () {
    this.timeout(50 * 1000)
    const originalCid = await ipfs.object.put({ Data: uint8ArrayFromString(nanoid()), Links: [] })
    await clearPreloadCids()
    const patchedCid = await ipfs.object.patch.setData(originalCid, uint8ArrayFromString(nanoid()))
    await waitForCids(patchedCid)
  })

  it('should preload content added with object.patch.appendData', async function () {
    this.timeout(50 * 1000)
    const originalCid = await ipfs.object.put({ Data: uint8ArrayFromString(nanoid()), Links: [] })
    await clearPreloadCids()
    const patchedCid = await ipfs.object.patch.appendData(originalCid, uint8ArrayFromString(nanoid()))
    await waitForCids(patchedCid)
  })

  it('should preload content retrieved with object.get', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.object.put({ Data: uint8ArrayFromString(nanoid()), Links: [] }, { preload: false })
    await clearPreloadCids()
    await ipfs.object.get(cid)
    await waitForCids(cid)
  })

  it('should preload content added with block.put', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.block.put(uint8ArrayFromString(nanoid()))
    await waitForCids(cid)
  })

  it('should preload content retrieved with block.get', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.block.put(uint8ArrayFromString(nanoid()), { preload: false })
    await clearPreloadCids()
    await ipfs.block.get(cid)
    await waitForCids(cid)
  })

  it('should preload content retrieved with block.stat', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.block.put(uint8ArrayFromString(nanoid()), { preload: false })
    await clearPreloadCids()
    await ipfs.block.stat(cid)
    await waitForCids(cid)
  })

  it('should preload content added with dag.put', async function () {
    this.timeout(50 * 1000)
    const obj = { test: nanoid() }
    const cid = await ipfs.dag.put(obj, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })
    await waitForCids(cid)
  })

  it('should preload content retrieved with dag.get', async function () {
    this.timeout(50 * 1000)
    const obj = { test: nanoid() }
    const opts = { storeCodec: 'dag-cbor', hashAlg: 'sha2-256', preload: false }
    const cid = await ipfs.dag.put(obj, opts)
    await clearPreloadCids()
    await ipfs.dag.get(cid)
    await waitForCids(cid)
  })

  it('should preload content retrieved with files.ls', async () => {
    const res = await ipfs.add({ path: `/t/${nanoid()}`, content: uint8ArrayFromString(nanoid()) }, { preload: false })
    const dirCid = res.cid
    await clearPreloadCids()
    await all(ipfs.files.ls(`/ipfs/${dirCid}`))
    await waitForCids(`/ipfs/${dirCid}`)
  })

  it('should preload content retrieved with files.ls by CID', async () => {
    const res = await ipfs.add({ path: `/t/${nanoid()}`, content: uint8ArrayFromString(nanoid()) }, { preload: false })
    const dirCid = res.cid
    await all(ipfs.files.ls(dirCid))
    await waitForCids(dirCid)
  })

  it('should preload content retrieved with files.read', async () => {
    const { cid } = await ipfs.add(uint8ArrayFromString(nanoid()), { preload: false })
    await clearPreloadCids()
    await ipfs.files.read(`/ipfs/${cid}`)
    await waitForCids(`/ipfs/${cid}`)
  })

  it('should preload content retrieved with files.stat', async () => {
    const { cid: fileCid } = await ipfs.add(uint8ArrayFromString(nanoid()), { preload: false })
    await clearPreloadCids()
    await ipfs.files.stat(`/ipfs/${fileCid}`)
    await waitForCids(`/ipfs/${fileCid}`)
  })
})

describe('preload disabled', function () {
  this.timeout(50 * 1000)
  /** @type {import('ipfs-core-types').IPFS} */
  let ipfs
  /** @type {() => Promise<void>} */
  let cleanup

  before(async () => {
    const res = await createNode({
      preload: {
        enabled: false,
        addresses: [defaultAddr]
      }
    })
    ipfs = res.ipfs
    cleanup = res.cleanup
  })

  after(() => cleanup())

  it('should not preload if disabled', async () => {
    const { cid } = await ipfs.add(uint8ArrayFromString(nanoid()))

    return expect(waitForCids(cid))
      .to.eventually.be.rejected()
      .and.have.property('code')
      .that.equals('ERR_TIMEOUT')
  })
})
