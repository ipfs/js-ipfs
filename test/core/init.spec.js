/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const isNode = require('detect-node')
const hat = require('hat')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const dagCBOR = require('ipld-dag-cbor')
const dagPB = require('ipld-dag-pb')
const crypto = require('libp2p-crypto')
const isIPFS = require('is-ipfs')
const multiaddr = require('multiaddr')
const multibase = require('multibase')
const multihash = require('multihashes')
const CID = require('cids')
const IPFS = require('../../src/core')

// This gets replaced by `create-repo-browser.js` in the browser
const createTempRepo = require('../utils/create-repo-nodejs.js')

describe('init', () => {
  if (!isNode) { return }

  let ipfs
  let repo

  beforeEach(() => {
    repo = createTempRepo()

    ipfs = new IPFS({
      repo: repo,
      init: false,
      start: false
    })
  })

  afterEach((done) => repo.teardown(done))

  it('basic', (done) => {
    ipfs.init({ bits: 512, pass: hat() }, (err) => {
      expect(err).to.not.exist()

      repo.exists((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.equal(true)

        repo.config.get((err, config) => {
          expect(err).to.not.exist()
          expect(config.Identity).to.exist()
          expect(config.Keychain).to.exist()
          done()
        })
      })
    })
  })

  it('set # of bits in key', function (done) {
    this.timeout(40 * 1000)

    ipfs.init({ bits: 1024, pass: hat() }, (err) => {
      expect(err).to.not.exist()

      repo.config.get((err, config) => {
        expect(err).to.not.exist()
        expect(config.Identity.PrivKey.length).is.above(256)
        done()
      })
    })
  })

  it('init docs are written', (done) => {
    ipfs.init({ bits: 512, pass: hat() }, (err) => {
      expect(err).to.not.exist()
      const multihash = 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'

      ipfs.object.get(multihash, { enc: 'base58' }, (err, node) => {
        expect(err).to.not.exist()
        expect(node.links).to.exist()
        done()
      })
    })
  })

  it('empty repo', (done) => {
    ipfs.init({ bits: 512, emptyRepo: true }, (err) => {
      expect(err).to.not.exist()

      // Should not have default assets
      const multihash = Buffer.from('12205e7c3ce237f936c76faf625e90f7751a9f5eeb048f59873303c215e9cce87599', 'hex')

      ipfs.object.get(multihash, {}, (err, node) => {
        expect(err).to.exist()
        done()
      })
    })
  })

  it('data types', () => {
    expect(ipfs.types).to.be.deep.equal({
      Buffer: Buffer,
      PeerId: PeerId,
      PeerInfo: PeerInfo,
      multiaddr: multiaddr,
      multibase: multibase,
      multihash: multihash,
      CID: CID,
      dagPB: dagPB,
      dagCBOR: dagCBOR
    })
  })

  it('util', () => {
    expect(ipfs.util).to.be.deep.equal({
      crypto: crypto,
      isIPFS: isIPFS
    })
  })
})
