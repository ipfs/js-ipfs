/* eslint-env mocha */
'use strict'

const isIpfs = require('is-ipfs')
const loadFixture = require('aegir/fixtures')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.resolve', () => {
    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
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
      const content = loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')

      ipfs.files.add(content, (err, res) => {
        expect(err).to.not.exist()
        expect(isIpfs.cid(res[0].hash)).to.be.true()

        ipfs.resolve(`/ipfs/${res[0].hash}`, (err, path) => {
          expect(err).to.not.exist()
          expect(path).to.equal(`/ipfs/${res[0].hash}`)
          done()
        })
      })
    })

    // Test resolve turns /ipfs/QmRootHash/path/to/file into /ipfs/QmFileHash
    it('should resolve an IPFS path link', (done) => {
      const path = '/path/to/testfile.txt'
      const content = loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')

      ipfs.files.add([{ path, content }], { wrapWithDirectory: true }, (err, res) => {
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

    it('should not resolve an IPFS path non-link', (done) => {
      const content = { path: { to: { file: hat() } } }
      const options = { format: 'dag-cbor', hashAlg: 'sha2-256' }

      ipfs.dag.put(content, options, (err, cid) => {
        expect(err).to.not.exist()

        const path = `/ipfs/${cid.toBaseEncodedString()}/path/to/file`
        ipfs.resolve(path, (err, path) => {
          expect(err).to.exist()
          expect(err.message).to.equal('found non-link at given path')
          done()
        })
      })
    })

    // Test resolve turns /ipns/domain.com into /ipfs/QmHash
    it('should resolve an IPNS DNS link', function (done) {
      this.timeout(20 * 1000)

      ipfs.resolve('/ipns/ipfs.io', (err, path) => {
        expect(err).to.not.exist()
        expect(isIpfs.ipfsPath(path)).to.be.true()
        done()
      })
    })

    // Test resolve turns /ipns/QmPeerHash into /ipns/domain.com into /ipfs/QmHash
    it('should resolve IPNS link recursively', function (done) {
      this.timeout(2 * 60 * 1000)

      ipfs.name.publish('/ipns/ipfs.io', { resolve: false }, (err, res) => {
        expect(err).to.not.exist()

        ipfs.resolve(`/ipns/${res.name}`, { recursive: true }, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.not.equal('/ipns/ipfs.io')
          expect(isIpfs.ipfsPath(res)).to.be.true()
          done()
        })
      })
    })
  })
}
