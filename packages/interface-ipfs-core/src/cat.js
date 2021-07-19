/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayConcat = require('uint8arrays/concat')
const { fixtures } = require('./utils')
const { CID } = require('multiformats/cid')
const all = require('it-all')
const drain = require('it-drain')
const { getDescribe, getIt, expect } = require('./utils/mocha')
const testTimeout = require('./utils/test-timeout')
const { importer } = require('ipfs-unixfs-importer')
const blockstore = require('./utils/blockstore-adapter')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.cat', function () {
    this.timeout(120 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    before(() => Promise.all([
      all(importer([{ content: fixtures.smallFile.data }], blockstore(ipfs))),
      all(importer([{ content: fixtures.bigFile.data }], blockstore(ipfs)))
    ]))

    it('should respect timeout option when catting files', () => {
      return testTimeout(() => drain(ipfs.cat(CID.parse('QmPDqvcuA4AkhBLBuh2y49yhUB98rCnxPxa3eVNC1kAbS1'), {
        timeout: 1
      })))
    })

    it('should cat with a base58 string encoded multihash', async () => {
      const data = uint8ArrayConcat(await all(ipfs.cat(fixtures.smallFile.cid)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat with a Uint8Array multihash', async () => {
      const cid = fixtures.smallFile.cid

      const data = uint8ArrayConcat(await all(ipfs.cat(cid)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat with a CID object', async () => {
      const cid = fixtures.smallFile.cid

      const data = uint8ArrayConcat(await all(ipfs.cat(cid)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat a file added as CIDv0 with a CIDv1', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: input }], blockstore(ipfs)))

      expect(res).to.have.nested.property('[0].cid.version', 0)

      const cidv1 = res[0].cid.toV1()

      const output = uint8ArrayConcat(await all(ipfs.cat(cidv1)))
      expect(output).to.eql(input)
    })

    it('should cat a file added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: input }], blockstore(ipfs), { cidVersion: 1, rawLeaves: false }))

      expect(res).to.have.nested.property('[0].cid.version', 1)

      const cidv0 = res[0].cid.toV0()

      const output = uint8ArrayConcat(await all(ipfs.cat(cidv0)))
      expect(output.slice()).to.eql(input)
    })

    it('should cat a BIG file', async () => {
      const data = uint8ArrayConcat(await all(ipfs.cat(fixtures.bigFile.cid)))
      expect(data.length).to.equal(fixtures.bigFile.data.length)
      expect(data.slice()).to.eql(fixtures.bigFile.data)
    })

    it('should cat with IPFS path', async () => {
      const ipfsPath = '/ipfs/' + fixtures.smallFile.cid

      const data = uint8ArrayConcat(await all(ipfs.cat(ipfsPath)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat with IPFS path, nested value', async () => {
      const fileToAdd = { path: 'a/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(importer([fileToAdd], blockstore(ipfs)))

      const file = await filesAdded.find((f) => f.path === 'a')
      expect(file).to.exist()

      const data = uint8ArrayConcat(await all(ipfs.cat(`/ipfs/${file.cid}/testfile.txt`)))

      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat with IPFS path, deeply nested value', async () => {
      const fileToAdd = { path: 'a/b/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(importer([fileToAdd], blockstore(ipfs)))

      const file = filesAdded.find((f) => f.path === 'a')
      expect(file).to.exist()

      const data = uint8ArrayConcat(await all(ipfs.cat(`/ipfs/${file.cid}/b/testfile.txt`)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should error on invalid key', () => {
      const invalidCid = 'somethingNotMultihash'

      return expect(drain(ipfs.cat(invalidCid))).to.eventually.be.rejected()
    })

    it('should error on unknown path', () => {
      return expect(drain(ipfs.cat(fixtures.smallFile.cid + '/does-not-exist'))).to.eventually.be.rejected()
        .and.be.an.instanceOf(Error)
        .and.to.have.property('message')
        .to.be.oneOf([
          'file does not exist',
          'no link named "does-not-exist" under Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
        ])
    })

    it('should error on dir path', async () => {
      const file = { path: 'dir/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(importer([file], blockstore(ipfs)))
      expect(filesAdded.length).to.equal(2)

      const files = filesAdded.filter((file) => file.path === 'dir')
      expect(files.length).to.equal(1)

      const dir = files[0]

      const err = await expect(drain(ipfs.cat(dir.cid))).to.eventually.be.rejected()
      expect(err.message).to.contain('this dag node is a directory')
    })

    it('should export a chunk of a file', async () => {
      const offset = 1
      const length = 3

      const data = uint8ArrayConcat(await all(ipfs.cat(fixtures.smallFile.cid, { offset, length })))
      expect(uint8ArrayToString(data)).to.equal('lz ')
    })
  })
}
