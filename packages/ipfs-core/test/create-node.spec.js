/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import sinon from 'sinon'
import { isNode } from 'ipfs-utils/src/env.js'
import tmpDir from 'ipfs-utils/src/temp-dir.js'
import PeerId from 'peer-id'
import { keys } from 'libp2p-crypto'
import * as IPFS from '../src/index.js'
import defer from 'p-defer'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { createTempRepo } from './utils/create-repo.js'

const { supportedKeys } = keys

describe('create node', function () {
  /** @type {import('ipfs-repo').IPFSRepo} */
  let tempRepo

  beforeEach(async () => {
    tempRepo = await createTempRepo()
  })

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

    const config = await node.config.getAll()
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

    const config = await node.config.getAll()
    expect(config.Identity).to.exist()
    await node.stop()
  })

  it('should create and initialize with algorithm', async () => {
    const ipfs = await IPFS.create({
      init: { algorithm: 'Ed25519' },
      start: false,
      repo: tempRepo,
      config: { Addresses: { Swarm: [] } }
    })

    const id = await ipfs.id()
    const config = await ipfs.config.getAll()
    const peerId = await PeerId.createFromPrivKey(`${config.Identity?.PrivKey}`)
    expect(peerId.privKey).is.instanceOf(supportedKeys.ed25519.Ed25519PrivateKey)
    expect(id.id).to.equal(peerId.toB58String())
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

  it('should create but not start', async () => {
    const ipfs = await IPFS.create({
      start: false,
      repo: tempRepo,
      config: { Addresses: { Swarm: [] } }
    })

    expect(ipfs.isOnline()).to.be.false()
  })

  it('should throw on boot error', () => {
    return expect(IPFS.create({
      repo: tempRepo,
      init: {
        algorithm: 'RSA',
        bits: 1
      }, // Too few bits will cause error on boot
      config: { Addresses: { Swarm: [] } }
    })).to.eventually.be.rejected()
  })

  it('should init with 1024 key bits', async function () {
    this.timeout(80 * 1000)

    const node = await IPFS.create({
      repo: tempRepo,
      init: {
        algorithm: 'RSA',
        bits: 1024
      },
      config: {
        Addresses: {
          Swarm: []
        }
      },
      preload: { enabled: false }
    })

    const config = await node.config.getAll()
    expect(config.Identity).to.exist()
    expect(config.Identity?.PrivKey.length).is.below(1024)
    await node.stop()
  })

  it('should be silent', async function () {
    if (process.env.DEBUG) return this.skip()

    this.timeout(30 * 1000)

    const spy = sinon.spy(console, 'log')

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
    expect(spy.called).to.be.false()
    // eslint-disable-next-line no-console
    spy.restore()
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

    const config = await node.config.getAll()
    expect(config.Addresses?.Swarm).to.eql(['/ip4/127.0.0.1/tcp/9977'])
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
      .with.property('code').that.equals('ERR_NOT_ENABLED')

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
    /**
     * @param {import('ipfs-repo').IPFSRepo} repo
     * @returns
     */
    function createNode (repo) {
      _nodeNumber++
      return IPFS.create({
        repo,
        init: { bits: 512, emptyRepo: true },
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${5010 + _nodeNumber}`,
            Gateway: `/ip4/127.0.0.1/tcp/${9090 + _nodeNumber}`,
            Swarm: isNode
              ? [
              `/ip4/0.0.0.0/tcp/${4010 + _nodeNumber * 2}`
                ]
              : []
          },
          Bootstrap: []
        },
        preload: { enabled: false }
      })
    }

    const repoA = await createTempRepo()
    const repoB = await createTempRepo()
    const [nodeA, nodeB] = await Promise.all([createNode(repoA), createNode(repoB)])
    const [idA, idB] = await Promise.all([nodeA.id(), nodeB.id()])

    expect(idA.id).to.not.equal(idB.id)

    await Promise.all([nodeA.stop(), nodeB.stop()])
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

  it('should error when receiving websocket-star swarm addresses', async () => {
    const node = await IPFS.create({
      repo: tempRepo,
      init: { bits: 512 },
      start: false,
      config: {
        Addresses: {
          Swarm: ['/ip4/127.0.0.1/tcp/13579/wss/p2p-websocket-star']
        },
        Bootstrap: []
      },
      preload: { enabled: false }
    })

    await expect(node.start()).to.eventually.be.rejected().with.property('code', 'ERR_WEBSOCKET_STAR_SWARM_ADDR_NOT_SUPPORTED')
  })

  it('should auto-migrate repos by default', async function () {
    this.timeout(80 * 1000)

    const deferred = defer()
    const id = await PeerId.create({
      bits: 512
    })

    // create an old-looking repo
    const repo = await createTempRepo({
      version: 1,
      spec: 1,
      config: {
        Identity: {
          PeerID: id.toString(),
          PrivKey: uint8ArrayToString(id.marshalPrivKey(), 'base64pad')
        }
      },
      autoMigrate: true,
      onMigrationProgress: () => {
        // migrations are happening
        deferred.resolve()
      }
    })

    const node = await IPFS.create({
      repo
    })

    await deferred.promise

    await node.stop()
  })
})
