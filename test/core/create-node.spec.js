/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')
const sinon = require('sinon')
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
  let tempRepo

  beforeEach(() => {
    tempRepo = createTempRepo()
  })

  afterEach((done) => tempRepo.teardown(done))

  it('custom repoPath', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: path.join(os.tmpdir(), 'ipfs-repo-' + hat()),
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
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
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
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
      repo: tempRepo,
      init: { bits: 512 },
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

  it('should resolve ready promise when initialized not started', async () => {
    const ipfs = new IPFS({
      init: { bits: 512 },
      start: false,
      repo: tempRepo,
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.false()
    await ipfs.ready
    expect(ipfs.isOnline()).to.be.false()
  })

  it('should resolve ready promise when not initialized and not started', async () => {
    const ipfs = new IPFS({
      init: false,
      start: false,
      repo: tempRepo,
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.false()
    await ipfs.ready
    expect(ipfs.isOnline()).to.be.false()
  })

  it('should resolve ready promise when initialized and started', async () => {
    const ipfs = new IPFS({
      init: { bits: 512 },
      start: true,
      repo: tempRepo,
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.false()
    await ipfs.ready
    expect(ipfs.isOnline()).to.be.true()
    await ipfs.stop()
  })

  it('should resolve ready promise when already ready', async () => {
    const ipfs = new IPFS({
      repo: tempRepo,
      init: { bits: 512 },
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.false()
    await ipfs.ready
    expect(ipfs.isOnline()).to.be.true()
    await ipfs.ready
    expect(ipfs.isOnline()).to.be.true()
    await ipfs.stop()
  })

  it('should reject ready promise on boot error', async () => {
    const ipfs = new IPFS({
      repo: tempRepo,
      init: { bits: 256 }, // Too few bits will cause error on boot
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.false()

    try {
      await ipfs.ready
    } catch (err) {
      expect(ipfs.isOnline()).to.be.false()

      // After the error has occurred, it should still reject
      try {
        await ipfs.ready
      } catch (_) {
        return
      }
    }

    throw new Error('ready promise did not reject')
  })

  it('should create a ready node with IPFS.create', async () => {
    const ipfs = await IPFS.create({
      repo: tempRepo,
      init: { bits: 512 },
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.true()
    await ipfs.stop()
  })

  it('init: { bits: 1024 }', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: tempRepo,
      init: {
        bits: 1024
      },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
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

  it('should be silent', function (done) {
    this.timeout(30 * 1000)

    sinon.spy(console, 'log')

    const ipfs = new IPFS({
      silent: true,
      repo: tempRepo,
      init: { bits: 512 },
      preload: { enabled: false }
    })

    ipfs.on('ready', () => {
      // eslint-disable-next-line no-console
      expect(console.log.called).to.be.false()
      // eslint-disable-next-line no-console
      console.log.restore()
      ipfs.stop(done)
    })
  })

  it('init: false errors (start default: true) and errors only once', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: tempRepo,
      init: false,
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
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
      repo: tempRepo,
      init: false,
      start: false,
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
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
      repo: tempRepo,
      init: { bits: 512 },
      start: false,
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      },
      preload: { enabled: false }
    })

    node.once('error', done)
    node.once('stop', done)
    node.once('start', () => node.stop())

    node.once('ready', () => node.start())
  })

  it('init: true, start: false, use callback', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: tempRepo,
      init: { bits: 512 },
      start: false,
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      },
      preload: { enabled: false }
    })

    node.once('error', done)
    node.once('ready', () => node.start(() => node.stop(done)))
  })

  it('overload config', function (done) {
    this.timeout(80 * 1000)

    if (!isNode) { return done() }

    const node = new IPFS({
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: ['/ip4/127.0.0.1/tcp/9977']
        },
        Bootstrap: []
      },
      preload: { enabled: false }
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
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      },
      preload: { enabled: false }
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
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      },
      preload: { enabled: false }
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
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        },
        Bootstrap: []
      },
      preload: { enabled: false }
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
    this.timeout(2 * 60 * 1000)

    let _nodeNumber = 0
    function createNode (repo) {
      _nodeNumber++
      return new IPFS({
        repo,
        init: { bits: 512, emptyRepo: true },
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${5010 + _nodeNumber}`,
            Gateway: `/ip4/127.0.0.1/tcp/${9090 + _nodeNumber}`,
            Swarm: [
              `/ip4/0.0.0.0/tcp/${4010 + _nodeNumber * 2}`
            ]
          },
          Bootstrap: []
        },
        preload: { enabled: false }
      })
    }

    let repoA
    let repoB
    let nodeA
    let nodeB

    waterfall([
      (cb) => {
        repoA = createTempRepo()
        repoB = createTempRepo()
        nodeA = createNode(repoA)
        nodeB = createNode(repoB)
        cb()
      },
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
      ], (stopError) => {
        parallel([
          (cb) => repoA.teardown(cb),
          (cb) => repoB.teardown(cb)
        ], (teardownError) => {
          done(error || stopError || teardownError)
        })
      })
    })
  })

  it('ipld: { }', function (done) {
    this.timeout(80 * 1000)

    const node = new IPFS({
      repo: tempRepo,
      init: { bits: 512 },
      ipld: {},
      preload: { enabled: false }
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      done()
    })
  })
})
