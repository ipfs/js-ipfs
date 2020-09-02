/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const isIpfs = require('is-ipfs')
const loadFixture = require('aegir/fixtures')
const { nanoid } = require('nanoid')
const multibase = require('multibase')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const { isWebWorker } = require('ipfs-utils/src/env')
const testTimeout = require('../utils/test-timeout')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.resolve', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when resoving an ipfs path', () => {
      return testTimeout(() => ipfs.resolve('/ipfs/Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ/herp/derp', {
        timeout: 1
      }))
    })

    it('should resolve an IPFS hash', async () => {
      const content = loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core')

      const { cid } = await ipfs.add(content)
      const path = await ipfs.resolve(`/ipfs/${cid}`)
      expect(path).to.equal(`/ipfs/${cid}`)
    })

    it('should resolve an IPFS hash and return a base64url encoded CID in path', async () => {
      const { cid } = await ipfs.add(uint8ArrayFromString('base64url encoded'))
      const path = await ipfs.resolve(`/ipfs/${cid}`, { cidBase: 'base64url' })
      const [,, cidStr] = path.split('/')

      expect(multibase.isEncoded(cidStr)).to.equal('base64url')
    })

    // Test resolve turns /ipfs/QmRootHash/path/to/file into /ipfs/QmFileHash
    it('should resolve an IPFS path link', async () => {
      const path = 'path/to/testfile.txt'
      const content = loadFixture('test/fixtures/testfile.txt', 'interface-ipfs-core')
      const [{ cid: fileCid }, , , { cid: rootCid }] = await all(ipfs.addAll([{ path, content }], { wrapWithDirectory: true }))
      const resolve = await ipfs.resolve(`/ipfs/${rootCid}/${path}`)

      expect(resolve).to.equal(`/ipfs/${fileCid}`)
    })

    it('should resolve up to the last node', async () => {
      const content = { path: { to: { file: nanoid() } } }
      const options = { format: 'dag-cbor', hashAlg: 'sha2-256' }
      const cid = await ipfs.dag.put(content, options)
      const path = `/ipfs/${cid}/path/to/file`
      const resolved = await ipfs.resolve(path)

      expect(resolved).to.equal(path)
    })

    it('should resolve up to the last node across multiple nodes', async () => {
      const options = { format: 'dag-cbor', hashAlg: 'sha2-256' }
      const childCid = await ipfs.dag.put({ node: { with: { file: nanoid() } } }, options)
      const parentCid = await ipfs.dag.put({ path: { to: childCid } }, options)
      const resolved = await ipfs.resolve(`/ipfs/${parentCid}/path/to/node/with/file`)

      expect(resolved).to.equal(`/ipfs/${childCid}/node/with/file`)
    })

    // Test resolve turns /ipns/domain.com into /ipfs/QmHash
    it('should resolve an IPNS DNS link', async function () {
      this.retries(3)
      const resolved = await ipfs.resolve('/ipns/ipfs.io')

      expect(isIpfs.ipfsPath(resolved)).to.be.true()
    })

    it('should resolve IPNS link recursively', async function () {
      this.timeout(20 * 1000)
      // webworkers are not dialable because webrtc is not available
      const node = (await common.spawn({ type: isWebWorker ? 'go' : undefined })).api
      await ipfs.swarm.connect(node.peerId.addresses[0])
      const { path } = await ipfs.add(uint8ArrayFromString('should resolve a record recursive === true'))
      const { id: keyId } = await ipfs.key.gen('key-name', { type: 'rsa', size: 2048 })

      await ipfs.name.publish(path, { allowOffline: true })
      await ipfs.name.publish(`/ipns/${ipfs.peerId.id}`, { allowOffline: true, key: 'key-name', resolve: false })

      return expect(await ipfs.resolve(`/ipns/${keyId}`, { recursive: true }))
        .to.eq(`/ipfs/${path}`)
    })
  })
}
