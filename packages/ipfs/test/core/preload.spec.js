/* eslint-env mocha */
'use strict'

const { nanoid } = require('nanoid')
const { Buffer } = require('buffer')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const all = require('it-all')
const MockPreloadNode = require('../utils/mock-preload-node')
const IPFS = require('../../src')
const createTempRepo = require('../utils/create-repo-nodejs')

describe('preload', () => {
  let ipfs
  let repo

  before(async function () {
    repo = createTempRepo()
    ipfs = await IPFS.create({
      silent: true,
      repo,
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      },
      preload: {
        enabled: true,
        addresses: [MockPreloadNode.defaultAddr]
      }
    })
  })

  afterEach(() => MockPreloadNode.clearPreloadCids())
  after(() => ipfs.stop())
  after(() => repo.teardown())

  it('should preload content added with add', async function () {
    this.timeout(50 * 1000)
    const res = await all(ipfs.add(Buffer.from(nanoid())))
    await MockPreloadNode.waitForCids(res[0].cid)
  })

  it('should preload multiple content added with add', async function () {
    this.timeout(50 * 1000)

    const res = await all(ipfs.add([{
      content: Buffer.from(nanoid())
    }, {
      content: Buffer.from(nanoid())
    }, {
      content: Buffer.from(nanoid())
    }]))

    await MockPreloadNode.waitForCids(res.map(file => file.cid))
  })

  it('should preload multiple content and intermediate dirs added with add', async function () {
    this.timeout(50 * 1000)

    const res = await all(ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(nanoid())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(nanoid())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(nanoid())
    }]))

    const rootDir = res.find(file => file.path === 'dir0')
    expect(rootDir).to.exist()

    await MockPreloadNode.waitForCids(rootDir.cid)
  })

  it('should preload multiple content and wrapping dir for content added with add and wrapWithDirectory option', async function () {
    this.timeout(50 * 1000)

    const res = await all(ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(nanoid())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(nanoid())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(nanoid())
    }], { wrapWithDirectory: true }))

    const wrappingDir = res.find(file => file.path === '')
    expect(wrappingDir).to.exist()

    await MockPreloadNode.waitForCids(wrappingDir.cid)
  })

  it('should preload content retrieved with cat', async function () {
    this.timeout(50 * 1000)
    const res = await all(ipfs.add(Buffer.from(nanoid()), { preload: false }))
    await all(ipfs.cat(res[0].cid))
    await MockPreloadNode.waitForCids(res[0].cid)
  })

  it('should preload content retrieved with get', async function () {
    this.timeout(50 * 1000)
    const res = await all(ipfs.add(Buffer.from(nanoid()), { preload: false }))
    await all(ipfs.get(res[0].cid))
    await MockPreloadNode.waitForCids(res[0].cid)
  })

  it('should preload content retrieved with ls', async function () {
    this.timeout(50 * 1000)

    const res = await all(ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(nanoid())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(nanoid())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(nanoid())
    }], { wrapWithDirectory: true }))

    const wrappingDir = res.find(file => file.path === '')
    expect(wrappingDir).to.exist()

    // Adding these files with have preloaded wrappingDir.hash, clear it out
    await MockPreloadNode.clearPreloadCids()

    await all(ipfs.ls(wrappingDir.cid))
    MockPreloadNode.waitForCids(wrappingDir.cid)
  })

  it('should preload content added with object.new', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.object.new()
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content added with object.put', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.object.put({ Data: Buffer.from(nanoid()), Links: [] })
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content added with object.patch.addLink', async function () {
    this.timeout(50 * 1000)

    const createNode = async () => {
      const cid = await ipfs.object.put({ Data: Buffer.from(nanoid()), Links: [] })
      const node = await ipfs.object.get(cid)
      return { cid, node }
    }

    const [parent, link] = await Promise.all([createNode(), createNode()])

    const cid = await ipfs.object.patch.addLink(parent.cid, {
      Name: 'link',
      Hash: link.cid,
      Tsize: link.node.size
    })

    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content added with object.patch.rmLink', async function () {
    this.timeout(50 * 1000)

    const linkCid = await ipfs.object.put({ Data: Buffer.from(nanoid()), Links: [] })
    const linkNode = await ipfs.object.get(linkCid)

    const parentCid = await ipfs.object.put({
      Data: Buffer.from(nanoid()),
      Links: [{
        name: 'link',
        cid: linkCid,
        size: linkNode.size
      }]
    })

    const cid = await ipfs.object.patch.rmLink(parentCid, { name: 'link' })
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content added with object.patch.setData', async function () {
    this.timeout(50 * 1000)
    const originalCid = await ipfs.object.put({ Data: Buffer.from(nanoid()), Links: [] })
    const patchedCid = await ipfs.object.patch.setData(originalCid, Buffer.from(nanoid()))
    await MockPreloadNode.waitForCids(patchedCid)
  })

  it('should preload content added with object.patch.appendData', async function () {
    this.timeout(50 * 1000)
    const originalCid = await ipfs.object.put({ Data: Buffer.from(nanoid()), Links: [] })
    const patchedCid = await ipfs.object.patch.appendData(originalCid, Buffer.from(nanoid()))
    await MockPreloadNode.waitForCids(patchedCid)
  })

  it('should preload content retrieved with object.get', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.object.new(null, { preload: false })
    await ipfs.object.get(cid)
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content added with block.put', async function () {
    this.timeout(50 * 1000)
    const block = await ipfs.block.put(Buffer.from(nanoid()))
    await MockPreloadNode.waitForCids(block.cid)
  })

  it('should preload content retrieved with block.get', async function () {
    this.timeout(50 * 1000)
    const block = await ipfs.block.put(Buffer.from(nanoid()), { preload: false })
    await ipfs.block.get(block.cid)
    await MockPreloadNode.waitForCids(block.cid)
  })

  it('should preload content retrieved with block.stat', async function () {
    this.timeout(50 * 1000)
    const block = await ipfs.block.put(Buffer.from(nanoid()), { preload: false })
    await ipfs.block.stat(block.cid)
    await MockPreloadNode.waitForCids(block.cid)
  })

  it('should preload content added with dag.put', async function () {
    this.timeout(50 * 1000)
    const obj = { test: nanoid() }
    const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content retrieved with dag.get', async function () {
    this.timeout(50 * 1000)
    const obj = { test: nanoid() }
    const opts = { format: 'dag-cbor', hashAlg: 'sha2-256', preload: false }
    const cid = await ipfs.dag.put(obj, opts)
    await ipfs.dag.get(cid)
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content retrieved with files.ls', async () => {
    const res = await all(ipfs.add({ path: `/t/${nanoid()}`, content: Buffer.from(nanoid()) }))
    const dirCid = res[res.length - 1].cid
    await MockPreloadNode.waitForCids(dirCid)
    await MockPreloadNode.clearPreloadCids()
    await all(ipfs.files.ls(`/ipfs/${dirCid}`))
    await MockPreloadNode.waitForCids(`/ipfs/${dirCid}`)
  })

  it('should preload content retrieved with files.ls by CID', async () => {
    const res = await all(ipfs.add({ path: `/t/${nanoid()}`, content: Buffer.from(nanoid()) }))
    const dirCid = res[res.length - 1].cid
    await MockPreloadNode.waitForCids(dirCid)
    await MockPreloadNode.clearPreloadCids()
    await all(ipfs.files.ls(dirCid))
    await MockPreloadNode.waitForCids(dirCid)
  })

  it('should preload content retrieved with files.read', async () => {
    const fileCid = (await all(ipfs.add(Buffer.from(nanoid()))))[0].cid
    await MockPreloadNode.waitForCids(fileCid)
    await MockPreloadNode.clearPreloadCids()
    await ipfs.files.read(`/ipfs/${fileCid}`)
    await MockPreloadNode.waitForCids(`/ipfs/${fileCid}`)
  })

  it('should preload content retrieved with files.stat', async () => {
    const fileCid = (await all(ipfs.add(Buffer.from(nanoid()))))[0].cid
    await MockPreloadNode.waitForCids(fileCid)
    await MockPreloadNode.clearPreloadCids()
    await ipfs.files.stat(`/ipfs/${fileCid}`)
    await MockPreloadNode.waitForCids(`/ipfs/${fileCid}`)
  })
})

describe('preload disabled', function () {
  this.timeout(50 * 1000)
  let ipfs
  let repo

  before(async () => {
    repo = createTempRepo()
    ipfs = await IPFS.create({
      silent: true,
      repo,
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      },
      preload: {
        enabled: false,
        addresses: [MockPreloadNode.defaultAddr]
      }
    })
  })

  afterEach(() => MockPreloadNode.clearPreloadCids())
  after(() => ipfs.stop())
  after(() => repo.teardown())

  it('should not preload if disabled', async () => {
    const res = await all(ipfs.add(Buffer.from(nanoid())))

    return expect(MockPreloadNode.waitForCids(res[0].cid))
      .to.eventually.be.rejected()
      .and.have.property('code')
      .that.equals('ERR_TIMEOUT')
  })
})
