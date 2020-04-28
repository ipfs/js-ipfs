/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const sinon = require('sinon')
const { isNode } = require('ipfs-utils/src/env')
const tmpDir = require('ipfs-utils/src/temp-dir')
const IPFS = require('../../src/core')

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')

describe('create node', function () {
  let tempRepo

  beforeEach(() => {
    tempRepo = createTempRepo()
  })

  afterEach(() => tempRepo.teardown())

  it('should create a node with a custom repo path', async function () {
    this.timeout(80 * 1000)

    const node = await IPFS.create({
      repo: tmpDir(),
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
    })

    const config = await node.config.get()
    expect(config.Identity).to.exist()
    await node.stop()
  })

  it('should create a node with a custom repo', async function () {
    this.timeout(80 * 1000)

    const node = await IPFS.create({
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
    })

    const config = await node.config.get()
    expect(config.Identity).to.exist()
    await node.stop()
  })

  it('should create and initialize but not start', async () => {
    const ipfs = await IPFS.create({
      init: { bits: 512 },
      start: false,
      repo: tempRepo,
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.false()
  })

  it('should create but not initialize and not start', async () => {
    const ipfs = await IPFS.create({
      init: false,
      start: false,
      repo: tempRepo,
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.false()
  })

  it('should throw on boot error', () => {
    return expect(IPFS.create({
      repo: tempRepo,
      init: { bits: 256 }, // Too few bits will cause error on boot
      config: { Addresses: { Swarm: [] } }
    })).to.eventually.be.rejected()
  })

  it('should init with 1024 key bits', async function () {
    this.timeout(80 * 1000)

    const node = await IPFS.create({
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

    const config = await node.config.get()
    expect(config.Identity).to.exist()
    expect(config.Identity.PrivKey.length).is.below(1024)
    await node.stop()
  })

  it('should be silent', async function () {
    if (process.env.DEBUG) return this.skip()

    this.timeout(30 * 1000)

    sinon.spy(console, 'log')

    const ipfs = await IPFS.create({
      silent: true,
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
    })

    // eslint-disable-next-line no-console
    expect(console.log.called).to.be.false()
    // eslint-disable-next-line no-console
    console.log.restore()
    await ipfs.stop()
  })

  it('should allow configuration of swarm and bootstrap addresses', async function () {
    this.timeout(80 * 1000)
    if (!isNode) return this.skip()

    const node = await IPFS.create({
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

    const config = await node.config.get()
    expect(config.Addresses.Swarm).to.eql(['/ip4/127.0.0.1/tcp/9977'])
    expect(config.Bootstrap).to.eql([])
    await node.stop()
  })

  it('should allow pubsub to be disabled', async function () {
    this.timeout(80 * 1000)
    if (!isNode) return this.skip()

    const node = await IPFS.create({
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Pubsub: {
          Enabled: false
        }
      }
    })

    await expect(node.pubsub.peers('topic'))
      .to.eventually.be.rejected()
      .with.a.property('code').that.equals('ERR_NOT_ENABLED')

    await node.stop()
  })

  it('should start and stop, start and stop', async function () {
    this.timeout(80 * 1000)

    const node = await IPFS.create({
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

    await node.stop()
    await node.start()
    await node.stop()
  })

  it('should not share identity with a simultaneously created node', async function () {
    this.timeout(2 * 60 * 1000)

    let _nodeNumber = 0
    function createNode (repo) {
      _nodeNumber++
      return IPFS.create({
        repo,
        init: { bits: 512, emptyRepo: true },
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${5010 + _nodeNumber}`,
            Gateway: `/ip4/127.0.0.1/tcp/${9090 + _nodeNumber}`,
            Swarm: isNode ? [
              `/ip4/0.0.0.0/tcp/${4010 + _nodeNumber * 2}`
            ] : []
          },
          Bootstrap: []
        },
        preload: { enabled: false }
      })
    }

    const repoA = createTempRepo()
    const repoB = createTempRepo()
    const [nodeA, nodeB] = await Promise.all([createNode(repoA), createNode(repoB)])
    const [idA, idB] = await Promise.all([nodeA.id(), nodeB.id()])

    expect(idA.id).to.not.equal(idB.id)

    await Promise.all([nodeA.stop(), nodeB.stop()])
    await Promise.all([repoA.teardown(), repoB.teardown()])
  })

  it('should not error with empty IPLD config', async function () {
    this.timeout(80 * 1000)

    const node = await IPFS.create({
      repo: tempRepo,
      init: { bits: 512 },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      ipld: {},
      preload: { enabled: false }
    })

    await node.stop()
  })
})
