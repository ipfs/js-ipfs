/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const path = require('path')
const os = require('os')
const hat = require('hat')
const CID = require('cids')
const parallel = require('async/parallel')
const waterfall = require('async/waterfall')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const MockPreloadNode = require('../utils/mock-preload-node')
const IPFS = require('../../src')

describe('preload', () => {
  let ipfs

  before(function (done) {
    this.timeout(10 * 1000)

    ipfs = new IPFS({
      repo: path.join(os.tmpdir(), hat()),
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

  afterEach((done) => MockPreloadNode.clearPreloadCids(done))

  after((done) => ipfs.stop(done))

  it('should preload content added with files.add', (done) => {
    ipfs.files.add(Buffer.from(hat()), (err, res) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(res[0].hash, done)
    })
  })

  it('should preload multiple content added with files.add', (done) => {
    ipfs.files.add([{
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

  it('should preload multiple content and intermediate dirs added with files.add', (done) => {
    ipfs.files.add([{
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

  it('should preload multiple content and wrapping dir for content added with files.add and wrapWithDirectory option', (done) => {
    ipfs.files.add([{
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

  it('should preload content retrieved with files.cat', (done) => {
    ipfs.files.add(Buffer.from(hat()), { preload: false }, (err, res) => {
      expect(err).to.not.exist()
      ipfs.files.cat(res[0].hash, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(res[0].hash, done)
      })
    })
  })

  it('should preload content retrieved with files.get', (done) => {
    ipfs.files.add(Buffer.from(hat()), { preload: false }, (err, res) => {
      expect(err).to.not.exist()
      ipfs.files.get(res[0].hash, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(res[0].hash, done)
      })
    })
  })

  it('should preload content retrieved with ls', (done) => {
    ipfs.files.add([{
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

      ipfs.ls(wrappingDir.hash, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(wrappingDir.hash, done)
      })
    })
  })

  it('should preload content added with object.new', (done) => {
    ipfs.object.new((err, node) => {
      expect(err).to.not.exist()

      const cid = new CID(node.multihash)
      MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
    })
  })

  it('should preload content added with object.put', (done) => {
    ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, (err, node) => {
      expect(err).to.not.exist()

      const cid = new CID(node.multihash)
      MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
    })
  })

  it('should preload content added with object.patch.addLink', (done) => {
    parallel({
      parent: (cb) => ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, cb),
      link: (cb) => ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, cb)
    }, (err, nodes) => {
      expect(err).to.not.exist()

      ipfs.object.patch.addLink(nodes.parent.multihash, {
        name: 'link',
        multihash: nodes.link.multihash,
        size: nodes.link.size
      }, (err, node) => {
        expect(err).to.not.exist()

        const cid = new CID(node.multihash)
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with object.patch.rmLink', (done) => {
    waterfall([
      (cb) => ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, cb),
      (link, cb) => {
        ipfs.object.put({
          Data: Buffer.from(hat()),
          Links: [{
            name: 'link',
            multihash: link.multihash,
            size: link.size
          }]
        }, cb)
      }
    ], (err, parent) => {
      expect(err).to.not.exist()

      ipfs.object.patch.rmLink(parent.multihash, { name: 'link' }, (err, node) => {
        expect(err).to.not.exist()

        const cid = new CID(node.multihash)
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with object.patch.setData', (done) => {
    ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, (err, node) => {
      expect(err).to.not.exist()

      ipfs.object.patch.setData(node.multihash, Buffer.from(hat()), (err, node) => {
        expect(err).to.not.exist()

        const cid = new CID(node.multihash)
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with object.patch.appendData', (done) => {
    ipfs.object.put({ Data: Buffer.from(hat()), Links: [] }, (err, node) => {
      expect(err).to.not.exist()

      ipfs.object.patch.appendData(node.multihash, Buffer.from(hat()), (err, node) => {
        expect(err).to.not.exist()

        const cid = new CID(node.multihash)
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content retrieved with object.get', (done) => {
    ipfs.object.new(null, { preload: false }, (err, node) => {
      expect(err).to.not.exist()
      ipfs.object.get(node.multihash, (err) => {
        expect(err).to.not.exist()
        const cid = new CID(node.multihash)
        MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with block.put', (done) => {
    ipfs.block.put(Buffer.from(hat()), (err, block) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(block.cid.toBaseEncodedString(), done)
    })
  })

  it('should preload content retrieved with block.get', (done) => {
    ipfs.block.put(Buffer.from(hat()), { preload: false }, (err, block) => {
      expect(err).to.not.exist()
      ipfs.block.get(block.cid, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(block.cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content retrieved with block.stat', (done) => {
    ipfs.block.put(Buffer.from(hat()), { preload: false }, (err, block) => {
      expect(err).to.not.exist()
      ipfs.block.stat(block.cid, (err) => {
        expect(err).to.not.exist()
        MockPreloadNode.waitForCids(block.cid.toBaseEncodedString(), done)
      })
    })
  })

  it('should preload content added with dag.put', (done) => {
    const obj = { test: hat() }
    ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (err, cid) => {
      expect(err).to.not.exist()
      MockPreloadNode.waitForCids(cid.toBaseEncodedString(), done)
    })
  })

  it('should preload content retrieved with dag.get', (done) => {
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

  it('should not preload if disabled', function (done) {
    this.timeout(10 * 1000)

    const ipfs = new IPFS({
      repo: path.join(os.tmpdir(), hat()),
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

    ipfs.on('ready', () => {
      ipfs.files.add(Buffer.from(hat()), (err, res) => {
        expect(err).to.not.exist()

        MockPreloadNode.waitForCids(res[0].hash, (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_TIMEOUT')
          done()
        })
      })
    })
  })
})
