/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const MockPreloadNode = require('../utils/mock-preload-node')
const IPFS = require('../../src')
const createTempRepo = require('../utils/create-repo-nodejs')

describe('preload', () => {
  let ipfs
  let repo

  before(function (done) {
    this.timeout(20 * 1000)

    repo = createTempRepo()
    ipfs = new IPFS({
      repo,
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: {
        enabled: true,
        addresses: [MockPreloadNode.defaultAddr]
      }
    })

    ipfs.on('ready', done)
  })

  afterEach(function (done) {
    this.timeout(10 * 1000)
    MockPreloadNode.clearPreloadCids(done)
  })

  after(function (done) {
    this.timeout(10 * 1000)
    ipfs.stop(done)
  })

  after(function (done) {
    this.timeout(10 * 1000)
    repo.teardown(done)
  })

  it('should preload content added with add', function (done) {
    this.timeout(10 * 1000)
    ipfs.add(Buffer.from(hat()), (err, res) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(res[0].hash, done)
    })
  })

  it('should preload multiple content added with add', function (done) {
    this.timeout(10 * 1000)
    ipfs.add([{
      content: Buffer.from(hat())
    }, {
      content: Buffer.from(hat())
    }, {
      content: Buffer.from(hat())
    }], (err, res) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(res.map(file => file.hash), done)
    })
  })

  it('should preload multiple content and intermediate dirs added with add', function (done) {
    this.timeout(10 * 1000)
    ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(hat())
    }], (err, res) => {
      expect(err).to.not.exist()

      const rootDir = res.find(file => file.path === 'dir0')
      expect(rootDir).to.exist()

      MockPreloadNode.waitForCids(rootDir.hash, done)
    })
  })

  it('should preload multiple content and wrapping dir for content added with add and wrapWithDirectory option', function (done) {
    this.timeout(10 * 1000)
    ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(hat())
    }], { wrapWithDirectory: true }, (err, res) => {
      expect(err).to.not.exist()

      const wrappingDir = res.find(file => file.path === '')
      expect(wrappingDir).to.exist()

      MockPreloadNode.waitForCids(wrappingDir.hash, done)
    })
  })

  it('should preload content retrieved with cat', function (done) {
    this.timeout(10 * 1000)
    ipfs.add(Buffer.from(hat()), { preload: false }, (err, res) => {
      expect(err).to.not.exist()
      ipfs.cat(res[0].hash, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(res[0].hash, done)
      })
    })
  })

  it('should preload content retrieved with get', function (done) {
    this.timeout(10 * 1000)
    ipfs.add(Buffer.from(hat()), { preload: false }, (err, res) => {
      expect(err).to.not.exist()
      ipfs.get(res[0].hash, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(res[0].hash, done)
      })
    })
  })

  it('should preload content retrieved with ls', function (done) {
    this.timeout(10 * 1000)
    ipfs.add([{
      path: 'dir0/dir1/file0',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/dir1/file1',
      content: Buffer.from(hat())
    }, {
      path: 'dir0/file2',
      content: Buffer.from(hat())
    }], { wrapWithDirectory: true }, (err, res) => {
      expect(err).to.not.exist()

      const wrappingDir = res.find(file => file.path === '')
      expect(wrappingDir).to.exist()

      // Adding these files with have preloaded wrappingDir.hash, clear it out
      MockPreloadNode.clearPreloadCids((err) => {
        expect(err).to.not.exist()

        ipfs.ls(wrappingDir.hash, (err) => {
          expect(err).to.not.exist()
          MockPreloadNode.waitForCids(wrappingDir.hash, done)
        })
      })
    })
  })

  it('should preload content added with object.new', function (done) {
    this.timeout(10 * 1000)
    ipfs.object.new((err, cid) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
    })
  })

  it('should preload content added with object.put', function (done) {
    this.timeout(10 * 1000)
    ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, (err, cid) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
    })
  })

  it('should preload content added with object.patch.addLink', function (done) {
    this.timeout(10 * 1000)
    parallel({
      parent: (cb) => {
        waterfall([
          (done) => ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, done),
          (cid, done) => ipfs.object.get(cid, (err, node) => done(err, { node, cid }))
        ], cb)
      },
      link: (cb) => {
        waterfall([
          (done) => ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, done),
          (cid, done) => ipfs.object.get(cid, (err, node) => done(err, { node, cid }))
        ], cb)
      }
    }, (err, result) => {
      expect(err).to.not.exist()

      ipfs.object.patch.addLink(result.parent.cid, {
        name: 'link',
        cid: result.link.cid,
        size: result.link.node.size
      }, (err, cid) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with object.patch.rmLink', function (done) {
    this.timeout(10 * 1000)
    waterfall([
      (cb) => ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, cb),
      (cid, cb) => ipfs.object.get(cid, (err, node) => cb(err, { node, cid })),
      ({ node, cid }, cb) => {
        ipfs.object.put({
          Data: Buffer.from(hat()),
          Links: [{
            name: 'link',
            cid: cid,
            size: node.size
          }]
        }, cb)
      }
    ], (err, parentCid) => {
      expect(err).to.not.exist()

      ipfs.object.patch.rmLink(parentCid, { name: 'link' }, (err, cid) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with object.patch.setData', function (done) {
    this.timeout(10 * 1000)
    ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, (err, cid) => {
      expect(err).to.not.exist()

      ipfs.object.patch.setData(cid, Buffer.from(hat()), (err, cid) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with object.patch.appendData', function (done) {
    this.timeout(10 * 1000)
    ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, (err, cid) => {
      expect(err).to.not.exist()

      ipfs.object.patch.appendData(cid, Buffer.from(hat()), (err, cid) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content retrieved with object.get', function (done) {
    this.timeout(10 * 1000)
    ipfs.object.new(null, { preload: false }, (err, cid) => {
      expect(err).to.not.exist()

      ipfs.object.get(cid, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with block.put', function (done) {
    this.timeout(10 * 1000)
    ipfs.block.put(Buffer.from(hat()), (err, block) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(block.cid.toBaseEncodedString(), done)
    })
  })

  it('should preload content retrieved with block.get', function (done) {
    this.timeout(10 * 1000)
    ipfs.block.put(Buffer.from(hat()), { preload: false }, (err, block) => {
      expect(err).to.not.exist()
      ipfs.block.get(block.cid, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(block.cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content retrieved with block.stat', function (done) {
    this.timeout(10 * 1000)
    ipfs.block.put(Buffer.from(hat()), { preload: false }, (err, block) => {
      expect(err).to.not.exist()
      ipfs.block.stat(block.cid, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(block.cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with dag.put', function (done) {
    this.timeout(10 * 1000)
    const obj = { test: hat() }
    ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
    })
  })

  it('should preload content retrieved with dag.get', function (done) {
    this.timeout(10 * 1000)
    const obj = { test: hat() }
    const opts = { format: 'dag-cbor', hashAlg: 'sha2-256', preload: false }
    ipfs.dag.put(obj, opts, (err, cid) => {
      expect(err).to.not.exist()
      ipfs.dag.get(cid, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })
})

describe('preload disabled', function () {
  this.timeout(20 * 1000)
  let ipfs
  let repo

  before((done) => {
    repo = createTempRepo()
    ipfs = new IPFS({
      repo,
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: {
        enabled: false,
        addresses: [MockPreloadNode.defaultAddr]
      }
    })

    ipfs.on('ready', done)
  })

  afterEach((done) => MockPreloadNode.clearPreloadCids(done))

  after((done) => ipfs.stop(done))

  after((done) => repo.teardown(done))

  it('should not preload if disabled', (done) => {
    ipfs.add(Buffer.from(hat()), (err, res) => {
      expect(err).to.not.exist()

      MockPreloadNode.waitForCids(res[0].hash, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_TIMEOUT')
        done()
      })
    })
  })
})
