/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const os = require('os')
const path = require('path')
const hat = require('hat')

const isNode = require('detect-node')
const IPFS = require('../../src/core')

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')

describe('create node', function () {
  it('custom repoPath', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: path.join(os.tmpdir(), 'ipfs-repo-' + hat()),
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()

      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        node.once('stop', done)
        node.stop()
      })
    })
  })

  it('custom repo', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: createTempRepo(),
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        node.once('stop', done)
        node.stop()
      })
    })
  })

  it('IPFS.createNode', function (done) {
    this.timeout(80 * 1000)

    const node = IPFS.createNode({
      repo: createTempRepo(),
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        // note: key length doesn't map to buffer length
        expect(config.Identity.PrivKey.length).is.below(2048)

        node.once('stop', done)
        node.stop()
      })
    })
  })

  it('init: { bits: 1024 }', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: createTempRepo(),
      init: {
        bits: 512
      },
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()
        expect(config.Identity).to.exist()
        expect(config.Identity.PrivKey.length).is.below(1024)
        node.once('stop', done)
        node.stop()
      })
    })
  })

  it('init: false errors (start default: true) and errors only once', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: createTempRepo(),
      init: false,
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    const shouldHappenOnce = () => {
      let timeoutId = null

      return (err) => {
        expect(err).to.exist()

        // Bad news, this handler has been executed before
        if (timeoutId) {
          clearTimeout(timeoutId)
          return done(new Error('error handler called multiple times'))
        }

        timeoutId = setTimeout(done, 100)
      }
    }

    node.on('error', shouldHappenOnce())
  })

  it('init: false, start: false', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: createTempRepo(),
      init: false,
      start: false,
      config: {
        Addresses: {
          Swarm: []
        }
      }
    })

    let happened = false

    function shouldNotHappen () {
      happened = true
    }

    node.once('error', shouldNotHappen)
    node.once('start', shouldNotHappen)
    node.once('stop', shouldNotHappen)

    setTimeout(() => {
      expect(happened).to.equal(false)
      done()
    }, 250)
  })

  it('init: true, start: false', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: createTempRepo(),
      init: true,
      start: false,
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      }
    })

    node.once('error', done)
    node.once('stop', done)
    node.once('start', () => node.stop())

    node.once('ready', () => node.start())
  })

  it('init: true, start: false, use callback', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: createTempRepo(),
      init: true,
      start: false,
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      }
    })

    node.once('error', done)
    node.once('ready', () => node.start(() => node.stop(done)))
  })

  it('overload config', function (done) {
    this.timeout(80 * 1000)

    if (!isNode) { return done() }

    const node = new IPFS({
      repo: createTempRepo(),
      config: {
        Addresses: {
          Swarm: ['/ip4/127.0.0.1/tcp/9977']
        },
        Bootstrap: []
      }
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Addresses.Swarm).to.eql(['/ip4/127.0.0.1/tcp/9977'])
        expect(config.Bootstrap).to.eql([])

        node.stop(done)
      })
    })
  })

  it('start and stop, start and stop', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: createTempRepo(),
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      }
    })

    series([
      (cb) => node.once('start', cb),
      (cb) => node.stop(cb),
      (cb) => node.start(cb),
      (cb) => node.stop(cb)
    ], done)
  })

  it('stop as promised', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: createTempRepo(),
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      }
    })

    node.once('ready', () => {
      node.stop()
        .then(done)
        .catch(done)
    })
  })

  it('can start node twice without crash', function (done) {
    this.timeout(80 * 1000)

    const options = {
      repo: createTempRepo(),
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      }
    }

    let node = new IPFS(options)

    series([
      (cb) => node.once('start', cb),
      (cb) => node.stop(cb),
      (cb) => {
        node = new IPFS(options)
        node.once('error', cb)
        node.once('start', cb)
      },
      (cb) => node.stop(cb)
    ], done)
  })

  it('does not share identity with a simultaneously created node', function (done) {
    this.timeout(80 * 1000)

    let _nodeNumber = 0
    function createNode () {
      _nodeNumber++
      return new IPFS({
        repo: createTempRepo(),
        init: { emptyRepo: true },
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${5010 + _nodeNumber}`,
            Gateway: `/ip4/127.0.0.1/tcp/${9090 + _nodeNumber}`,
            Swarm: [
              `/ip4/0.0.0.0/tcp/${4010 + _nodeNumber * 2}`
            ]
          },
          Bootstrap: []
        }
      })
    }

    const nodeA = createNode()
    const nodeB = createNode()

    waterfall([
      (cb) => parallel([
        (cb) => nodeA.once('start', cb),
        (cb) => nodeB.once('start', cb)
      ], cb),
      (_, cb) => parallel([
        (cb) => nodeA.id(cb),
        (cb) => nodeB.id(cb)
      ], cb),
      ([idA, idB], cb) => {
        expect(idA.id).to.not.equal(idB.id)
        cb()
      }
    ], (error) => {
      parallel([
        (cb) => nodeA.stop(cb),
        (cb) => nodeB.stop(cb)
      ], (stopError) => done(error || stopError))
    })
  })
})
