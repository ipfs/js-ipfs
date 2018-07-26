/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const hat = require('hat')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const MockPreloadNode = require('../utils/mock-preload-node')
const IPFS = require('../../src')

describe('preload', () => {
  let ipfs

  before((done) => {
    ipfs = new IPFS({
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

  it('should preload content added with ipfs.files.add', (done) => {
    ipfs.files.add(Buffer.from(hat()), (err, res) => {
      expect(err).to.not.exist()

      // Wait for preloading to finish
      setTimeout(() => {
        MockPreloadNode.getPreloadCids((err, cids) => {
          expect(err).to.not.exist()
          expect(cids.length).to.equal(1)
          expect(cids[0]).to.equal(res[0].hash)
          done()
        })
      }, 100)
    })
  })

  it('should preload multiple content added with ipfs.files.add', (done) => {
    ipfs.files.add([{
      content: Buffer.from(hat())
    }, {
      content: Buffer.from(hat())
    }, {
      content: Buffer.from(hat())
    }], (err, res) => {
      expect(err).to.not.exist()

      // Wait for preloading to finish
      setTimeout(() => {
        MockPreloadNode.getPreloadCids((err, cids) => {
          expect(err).to.not.exist()
          expect(cids.length).to.equal(res.length)
          res.forEach(file => expect(cids).to.include(file.hash))
          done()
        })
      }, 100)
    })
  })

  it('should preload multiple content and intermediate dirs added with ipfs.files.add', (done) => {
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

      // Wait for preloading to finish
      setTimeout(() => {
        MockPreloadNode.getPreloadCids((err, cids) => {
          expect(err).to.not.exist()
          expect(cids.length).to.equal(1)
          expect(cids[0]).to.equal(rootDir.hash)
          done()
        })
      }, 100)
    })
  })

  it('should preload multiple content and wrapping dir for content added with ipfs.files.add and wrapWithDirectory option', (done) => {
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

      // Wait for preloading to finish
      setTimeout(() => {
        MockPreloadNode.getPreloadCids((err, cids) => {
          expect(err).to.not.exist()
          expect(cids.length).to.equal(1)
          expect(cids[0]).to.equal(wrappingDir.hash)
          done()
        })
      })
    })
  })
})
