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
        gateways: [MockPreloadNode.defaultAddr]
      }
    })

    ipfs.on('ready', done)
  })

  afterEach((done) => MockPreloadNode.clearPreloadUrls(done))

  after((done) => ipfs.stop(done))

  it('should preload content added with ipfs.files.add', (done) => {
    ipfs.files.add(Buffer.from(hat()), (err, res) => {
      expect(err).to.not.exist()

      MockPreloadNode.getPreloadUrls((err, urls) => {
        expect(err).to.not.exist()
        expect(urls.length).to.equal(1)
        expect(urls[0]).to.equal(`/ipfs/${res[0].hash}`)
        done()
      })
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

      MockPreloadNode.getPreloadUrls((err, urls) => {
        expect(err).to.not.exist()
        expect(urls.length).to.equal(res.length)
        res.forEach(file => {
          const url = urls.find(url => url === `/ipfs/${file.hash}`)
          expect(url).to.exist()
        })
        done()
      })
    })
  })

  it('should preload root dir for multiple content added with ipfs.files.add', (done) => {
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

      MockPreloadNode.getPreloadUrls((err, urls) => {
        expect(err).to.not.exist()
        expect(urls.length).to.equal(1)
        expect(urls[0]).to.equal(`/ipfs/${rootDir.hash}`)
        done()
      })
    })
  })

  it('should preload wrapping dir for content added with ipfs.files.add and wrapWithDirectory option', (done) => {
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

      MockPreloadNode.getPreloadUrls((err, urls) => {
        expect(err).to.not.exist()
        expect(urls.length).to.equal(1)
        expect(urls[0]).to.equal(`/ipfs/${wrappingDir.hash}`)
        done()
      })
    })
  })
})
