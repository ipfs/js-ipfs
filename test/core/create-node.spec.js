/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const isNode = require('detect-node')
const IPFS = require('../../src/core')

// This gets replaced by require('../utils/create-repo-browser.js')
// in the browser
const createTempRepo = require('../utils/create-repo-node.js')

describe('create node', () => {
  it('custom repoPath', (done) => {
    const node = new IPFS({
      repo: '/tmp/ipfs-repo-' + Math.random()
    })

    node.on('start', (err) => {
      expect(err).to.not.exist()

      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        node.on('stop', done)
        node.stop()
      })
    })
  })

  it('custom repo', (done) => {
    const node = new IPFS({
      repo: createTempRepo()
    })

    node.on('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        node.on('stop', done)
        node.stop()
      })
    })
  })

  it('IPFS.createNode', (done) => {
    const node = IPFS.createNode({
      repo: createTempRepo()
    })

    node.on('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        // note: key length doesn't map to buffer length
        expect(config.Identity.PrivKey.length).is.below(2048)

        node.on('stop', done)
        node.stop()
      })
    })
  })

  it('init: { bits: 1024 }', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: {
        bits: 1024
      }
    })

    node.on('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()
        expect(config.Identity).to.exist()
        expect(config.Identity.PrivKey.length).is.below(1024)
        node.on('stop', done)
        node.stop()
      })
    })
  })

  it('init: false errors (start default: true)', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: false
    })
    node.on('error', (err) => {
      expect(err).to.exist()
      done()
    })
  })

  it('init: false, start: false', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: false,
      start: false
    })

    let happened = false

    function shouldNotHappen () {
      happened = true
    }

    node.on('error', shouldNotHappen)
    node.on('start', shouldNotHappen)
    node.on('stop', shouldNotHappen)

    setTimeout(() => {
      expect(happened).to.equal(false)
      done()
    }, 250)
  })

  it('init: true, start: false', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: true,
      start: false
    })

    setTimeout(() => {
      node.on('stop', () => done())
      node.on('start', () => node.stop())
      node.start()
    }, 800)
  })

  it('init: true, start: false, use callback', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: true,
      start: false
    })

    setTimeout(() => {
      node.start(() => node.stop(done))
    }, 800)
  })

  it('overload config', (done) => {
    if (!isNode) {
      return done()
    }
    const node = new IPFS({
      repo: createTempRepo(),
      config: {
        Addresses: {
          Swarm: ['/ip4/127.0.0.1/tcp/9977']
        }
      }
    })

    node.on('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Addresses.Swarm).to.eql(
          ['/ip4/127.0.0.1/tcp/9977']
        )
        node.stop(done)
      })
    })
  })

  it('start and stop, start and stop', (done) => {
    const node = new IPFS({
      repo: createTempRepo()
    })

    node.once('start', () => {
      node.stop(() => {
        node.start(() => {
          node.stop(done)
        })
      })
    })
  })
})
