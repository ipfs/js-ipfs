/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { expect } = require('interface-ipfs-core/src/utils/mocha')
const pull = require('pull-stream')
const CID = require('cids')

const MockPreloadNode = require('../utils/mock-preload-node')
const IPFS = require('../../src')
const createTempRepo = require('../utils/create-repo-nodejs')

describe('preload', () => {
  let ipfs
  let repo

  before(async function () {
    repo = createTempRepo()
    ipfs = await IPFS.create({
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
    const res = await ipfs.add(Buffer.from(hat()))
    await MockPreloadNode.waitForCids(res[0].hash)
  })

  it('should preload multiple content added with add', async function () {
    this.timeout(50 * 1000)

    const res = await ipfs.add([{
      content: Buffer.from(hat())
    }, {
      content: Buffer.from(hat())
    }, {
      content: Buffer.from(hat())
    }])

    await MockPreloadNode.waitForCids(res.map(file => file.hash))
  })

  it('should preload multiple content and intermediate dirs added with add', async function () {
    this.timeout(50 * 1000)

    const res = await ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(hat())
    }])

    const rootDir = res.find(file => file.path === 'dir0')
    expect(rootDir).to.exist()

    await MockPreloadNode.waitForCids(rootDir.hash)
  })

  it('should preload multiple content and wrapping dir for content added with add and wrapWithDirectory option', async function () {
    this.timeout(50 * 1000)

    const res = await ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(hat())
    }], { wrapWithDirectory: true })

    const wrappingDir = res.find(file => file.path === '')
    expect(wrappingDir).to.exist()

    await MockPreloadNode.waitForCids(wrappingDir.hash)
  })

  it('should preload content retrieved with cat', async function () {
    this.timeout(50 * 1000)
    const res = await ipfs.add(Buffer.from(hat()), { preload: false })
    await ipfs.cat(res[0].hash)
    await MockPreloadNode.waitForCids(res[0].hash)
  })

  it('should preload content retrieved with get', async function () {
    this.timeout(50 * 1000)
    const res = await ipfs.add(Buffer.from(hat()), { preload: false })
    await ipfs.get(res[0].hash)
    await MockPreloadNode.waitForCids(res[0].hash)
  })

  it('should preload content retrieved with ls', async function () {
    this.timeout(50 * 1000)

    const res = await ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(hat())
    }], { wrapWithDirectory: true })

    const wrappingDir = res.find(file => file.path === '')
    expect(wrappingDir).to.exist()

    // Adding these files with have preloaded wrappingDir.hash, clear it out
    await MockPreloadNode.clearPreloadCids()

    await ipfs.ls(wrappingDir.hash)
    MockPreloadNode.waitForCids(wrappingDir.hash)
  })

  it('should preload content added with object.new', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.object.new()
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content added with object.put', async function () {
    this.timeout(50 * 1000)
    const cid = await ipfs.object.put({ Data: Buffer.from(hat()), Links: [] })
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content added with object.patch.addLink', async function () {
    this.timeout(50 * 1000)

    const createNode = async () => {
      const cid = await ipfs.object.put({ Data: Buffer.from(hat()), Links: [] })
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

    const linkCid = await ipfs.object.put({ Data: Buffer.from(hat()), Links: [] })
    const linkNode = await ipfs.object.get(linkCid)

    const parentCid = await ipfs.object.put({
      Data: Buffer.from(hat()),
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
    const originalCid = await ipfs.object.put({ Data: Buffer.from(hat()), Links: [] })
    const patchedCid = await ipfs.object.patch.setData(originalCid, Buffer.from(hat()))
    await MockPreloadNode.waitForCids(patchedCid)
  })

  it('should preload content added with object.patch.appendData', async function () {
    this.timeout(50 * 1000)
    const originalCid = await ipfs.object.put({ Data: Buffer.from(hat()), Links: [] })
    const patchedCid = await ipfs.object.patch.appendData(originalCid, Buffer.from(hat()))
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
    const block = await ipfs.block.put(Buffer.from(hat()))
    await MockPreloadNode.waitForCids(block.cid)
  })

  it('should preload content retrieved with block.get', async function () {
    this.timeout(50 * 1000)
    const block = await ipfs.block.put(Buffer.from(hat()), { preload: false })
    await ipfs.block.get(block.cid)
    await MockPreloadNode.waitForCids(block.cid)
  })

  it('should preload content retrieved with block.stat', async function () {
    this.timeout(50 * 1000)
    const block = await ipfs.block.put(Buffer.from(hat()), { preload: false })
    await ipfs.block.stat(block.cid)
    await MockPreloadNode.waitForCids(block.cid)
  })

  it('should preload content added with dag.put', async function () {
    this.timeout(50 * 1000)
    const obj = { test: hat() }
    const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content retrieved with dag.get', async function () {
    this.timeout(50 * 1000)
    const obj = { test: hat() }
    const opts = { format: 'dag-cbor', hashAlg: 'sha2-256', preload: false }
    const cid = await ipfs.dag.put(obj, opts)
    await ipfs.dag.get(cid)
    await MockPreloadNode.waitForCids(cid)
  })

  it('should preload content retrieved with files.ls', async () => {
    const res = await ipfs.add({ path: `/t/${hat()}`, content: Buffer.from(hat()) })
    const dirCid = res[res.length - 1].hash
    await MockPreloadNode.waitForCids(dirCid)
    await MockPreloadNode.clearPreloadCids()
    await ipfs.files.ls(`/ipfs/${dirCid}`)
    await MockPreloadNode.waitForCids(`/ipfs/${dirCid}`)
  })

  it('should preload content retrieved with files.ls by CID', async () => {
    const res = await ipfs.add({ path: `/t/${hat()}`, content: Buffer.from(hat()) })
    const dirCid = res[res.length - 1].hash
    await MockPreloadNode.waitForCids(dirCid)
    await MockPreloadNode.clearPreloadCids()
    await ipfs.files.ls(new CID(dirCid))
    await MockPreloadNode.waitForCids(dirCid)
  })

  it('should preload content retrieved with files.lsReadableStream', async () => {
    const res = await ipfs.add({ path: `/t/${hat()}`, content: Buffer.from(hat()) })
    const dirCid = res[res.length - 1].hash
    await MockPreloadNode.waitForCids(dirCid)
    await MockPreloadNode.clearPreloadCids()
    await new Promise((resolve, reject) => {
      ipfs.files.lsReadableStream(`/ipfs/${dirCid}`)
        .on('data', () => {})
        .on('error', reject)
        .on('end', resolve)
    })
    await MockPreloadNode.waitForCids(`/ipfs/${dirCid}`)
  })

  it('should preload content retrieved with files.lsPullStream', async () => {
    const res = await ipfs.add({ path: `/t/${hat()}`, content: Buffer.from(hat()) })
    const dirCid = res[res.length - 1].hash
    await MockPreloadNode.waitForCids(dirCid)
    await MockPreloadNode.clearPreloadCids()
    await new Promise((resolve, reject) => pull(
      ipfs.files.lsPullStream(`/ipfs/${dirCid}`),
      pull.onEnd(err => err ? reject(err) : resolve())
    ))
    await MockPreloadNode.waitForCids(`/ipfs/${dirCid}`)
  })

  it('should preload content retrieved with files.read', async () => {
    const fileCid = (await ipfs.add(Buffer.from(hat())))[0].hash
    await MockPreloadNode.waitForCids(fileCid)
    await MockPreloadNode.clearPreloadCids()
    await ipfs.files.read(`/ipfs/${fileCid}`)
    await MockPreloadNode.waitForCids(`/ipfs/${fileCid}`)
  })

  it('should preload content retrieved with files.readReadableStream', async () => {
    const fileCid = (await ipfs.add(Buffer.from(hat())))[0].hash
    await MockPreloadNode.waitForCids(fileCid)
    await MockPreloadNode.clearPreloadCids()
    await new Promise((resolve, reject) => {
      ipfs.files.readReadableStream(`/ipfs/${fileCid}`)
        .on('data', () => {})
        .on('error', reject)
        .on('end', resolve)
    })
    await MockPreloadNode.waitForCids(`/ipfs/${fileCid}`)
  })

  it('should preload content retrieved with files.readPullStream', async () => {
    const fileCid = (await ipfs.add(Buffer.from(hat())))[0].hash
    await MockPreloadNode.waitForCids(fileCid)
    await MockPreloadNode.clearPreloadCids()
    await new Promise((resolve, reject) => pull(
      ipfs.files.readPullStream(`/ipfs/${fileCid}`),
      pull.onEnd(err => err ? reject(err) : resolve())
    ))
    await MockPreloadNode.waitForCids(`/ipfs/${fileCid}`)
  })

  it('should preload content retrieved with files.stat', async () => {
    const fileCid = (await ipfs.add(Buffer.from(hat())))[0].hash
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
    const res = await ipfs.add(Buffer.from(hat()))

    return expect(MockPreloadNode.waitForCids(res[0].hash))
      .to.eventually.be.rejected
      .and.have.property('code')
      .that.equals('ERR_TIMEOUT')
  })
})
