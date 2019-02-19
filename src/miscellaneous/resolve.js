/* eslint-env mocha */
'use strict'

const isIpfs = require('is-ipfs')
const loadFixture = require('aegir/fixtures')
const hat = require('hat')
const waterfall = require('async/waterfall')
const multibase = require('multibase')
const { spawnNodeWithId } = require('../utils/spawn')
const { connect } = require('../utils/swarm')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.resolve', () => {
    let factory, ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, f) => {
        expect(err).to.not.exist()
        factory = f
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after(function (done) {
      this.timeout(10 * 1000)
      common.teardown(done)
    })

    it('should resolve an IPFS hash', (done) => {
      const content = loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core')

      ipfs.add(content, (err, res) => {
        expect(err).to.not.exist()
        expect(isIpfs.cid(res[0].hash)).to.be.true()

        ipfs.resolve(`/ipfs/${res[0].hash}`, (err, path) => {
          expect(err).to.not.exist()
          expect(path).to.equal(`/ipfs/${res[0].hash}`)
          done()
        })
      })
    })

    it('should resolve an IPFS hash and return a base64url encoded CID in path', (done) => {
      const content = Buffer.from('TEST' + Date.now())

      ipfs.add(content, (err, res) => {
        expect(err).to.not.exist()

        ipfs.resolve(`/ipfs/${res[0].hash}`, { cidBase: 'base64url' }, (err, path) => {
          expect(err).to.not.exist()
          const cid = path.split('/')[2]
          expect(multibase.isEncoded(cid)).to.equal('base64url')
          done()
        })
      })
    })

    // Test resolve turns /ipfs/QmRootHash/path/to/file into /ipfs/QmFileHash
    it('should resolve an IPFS path link', (done) => {
      const path = '/path/to/testfile.txt'
      const content = loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core')

      ipfs.add([{ path, content }], { wrapWithDirectory: true }, (err, res) => {
        expect(err).to.not.exist()

        const rootHash = res.find(r => r.path === '').hash
        const fileHash = res.find(r => r.path === path).hash

        ipfs.resolve(`/ipfs/${rootHash}${path}`, (err, path) => {
          expect(err).to.not.exist()
          expect(path).to.equal(`/ipfs/${fileHash}`)
          done()
        })
      })
    })

    it('should resolve up to the last node', (done) => {
      const content = { path: { to: { file: hat() } } }
      const options = { format: 'dag-cbor', hashAlg: 'sha2-256' }

      ipfs.dag.put(content, options, (err, cid) => {
        expect(err).to.not.exist()

        const path = `/ipfs/${cid}/path/to/file`
        ipfs.resolve(path, (err, resolved) => {
          expect(err).to.not.exist()
          expect(resolved).to.equal(path)
          done()
        })
      })
    })

    it('should resolve up to the last node across multiple nodes', (done) => {
      const options = { format: 'dag-cbor', hashAlg: 'sha2-256' }

      waterfall([
        cb => {
          const content = { node: { with: { file: hat() } } }
          ipfs.dag.put(content, options, cb)
        },
        (childCid, cb) => {
          const content = { path: { to: childCid } }
          ipfs.dag.put(content, options, (err, parentCid) => cb(err, { childCid, parentCid }))
        }
      ], (err, res) => {
        expect(err).to.not.exist()

        const path = `/ipfs/${res.parentCid}/path/to/node/with/file`
        ipfs.resolve(path, (err, resolved) => {
          expect(err).to.not.exist()
          expect(resolved).to.equal(`/ipfs/${res.childCid}/node/with/file`)
          done()
        })
      })
    })

    // Test resolve turns /ipns/domain.com into /ipfs/QmHash
    it('should resolve an IPNS DNS link', function (done) {
      this.timeout(20 * 1000)

      ipfs.resolve('/ipns/ipfs.io', { r: true }, (err, path) => {
        expect(err).to.not.exist()
        expect(isIpfs.ipfsPath(path)).to.be.true()
        done()
      })
    })

    // Test resolve turns /ipns/QmPeerHash into /ipns/domain.com into /ipfs/QmHash
    it('should resolve IPNS link recursively', function (done) {
      this.timeout(5 * 60 * 1000)

      waterfall([
        // Ensure node has another node to publish a name to
        (cb) => spawnNodeWithId(factory, cb),
        (ipfsB, cb) => {
          const addr = ipfsB.peerId.addresses.find((a) => a.includes('127.0.0.1'))
          connect(ipfs, addr, cb)
        },
        (cb) => ipfs.name.publish('/ipns/ipfs.io', { resolve: false }, cb),
        (res, cb) => {
          ipfs.resolve(`/ipns/${res.name}`, { recursive: true }, (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.not.equal('/ipns/ipfs.io')
            expect(isIpfs.ipfsPath(res)).to.be.true()
            cb()
          })
        }
      ], done)
    })
  })
}
