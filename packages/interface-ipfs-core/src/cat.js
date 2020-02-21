/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const CID = require('cids')
const concat = require('it-concat')
const all = require('it-all')
const { getDescribe, getIt, expect } = require('./utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.cat', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    before(() => Promise.all([
      all(ipfs.add(fixtures.smallFile.data)),
      all(ipfs.add(fixtures.bigFile.data))
    ]))

    it('should cat with a base58 string encoded multihash', async () => {
      const data = await concat(ipfs.cat(fixtures.smallFile.cid))
      expect(data.toString()).to.contain('Plz add me!')
    })

    it('should cat with a Buffer multihash', async () => {
      const cid = new CID(fixtures.smallFile.cid).multihash

      const data = await concat(ipfs.cat(cid))
      expect(data.toString()).to.contain('Plz add me!')
    })

    it('should cat with a CID object', async () => {
      const cid = new CID(fixtures.smallFile.cid)

      const data = await concat(ipfs.cat(cid))
      expect(data.toString()).to.contain('Plz add me!')
    })

    it('should cat a file added as CIDv0 with a CIDv1', async () => {
      const input = Buffer.from(`TEST${Date.now()}`)

      const res = await all(ipfs.add(input, { cidVersion: 0 }))

      const cidv0 = res[0].cid
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const output = await concat(ipfs.cat(cidv1))
      expect(output.slice()).to.eql(input)
    })

    it('should cat a file added as CIDv1 with a CIDv0', async () => {
      const input = Buffer.from(`TEST${Date.now()}`)

      const res = await all(ipfs.add(input, { cidVersion: 1, rawLeaves: false }))

      const cidv1 = res[0].cid
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const output = await concat(ipfs.cat(cidv0))
      expect(output.slice()).to.eql(input)
    })

    it('should cat a BIG file', async () => {
      const data = await concat(ipfs.cat(fixtures.bigFile.cid))
      expect(data.length).to.equal(fixtures.bigFile.data.length)
      expect(data.slice()).to.eql(fixtures.bigFile.data)
    })

    it('should cat with IPFS path', async () => {
      const ipfsPath = '/ipfs/' + fixtures.smallFile.cid

      const data = await concat(ipfs.cat(ipfsPath))
      expect(data.toString()).to.contain('Plz add me!')
    })

    it('should cat with IPFS path, nested value', async () => {
      const fileToAdd = { path: 'a/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(ipfs.add([fileToAdd]))

      const file = await filesAdded.find((f) => f.path === 'a')
      expect(file).to.exist()

      const data = await concat(ipfs.cat(`/ipfs/${file.cid}/testfile.txt`))

      expect(data.toString()).to.contain('Plz add me!')
    })

    it('should cat with IPFS path, deeply nested value', async () => {
      const fileToAdd = { path: 'a/b/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(ipfs.add([fileToAdd]))

      const file = filesAdded.find((f) => f.path === 'a')
      expect(file).to.exist()

      const data = await concat(ipfs.cat(`/ipfs/${file.cid}/b/testfile.txt`))
      expect(data.toString()).to.contain('Plz add me!')
    })

    it('should error on invalid key', () => {
      const invalidCid = 'somethingNotMultihash'

      return expect(concat(ipfs.cat(invalidCid))).to.eventually.be.rejected()
    })

    it('should error on unknown path', () => {
      return expect(concat(ipfs.cat(fixtures.smallFile.cid + '/does-not-exist'))).to.eventually.be.rejected()
        .and.be.an.instanceOf(Error)
        .and.to.have.property('message')
        .to.be.oneOf([
          'file does not exist',
          'no link named "does-not-exist" under Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
        ])
    })

    it('should error on dir path', async () => {
      const file = { path: 'dir/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(ipfs.add([file]))
      expect(filesAdded.length).to.equal(2)

      const files = filesAdded.filter((file) => file.path === 'dir')
      expect(files.length).to.equal(1)

      const dir = files[0]

      const err = await expect(concat(ipfs.cat(dir.cid))).to.be.rejected()
      expect(err.message).to.contain('this dag node is a directory')
    })

    it('should export a chunk of a file', async () => {
      const offset = 1
      const length = 3

      const data = await concat(ipfs.cat(fixtures.smallFile.cid, { offset, length }))
      expect(data.toString()).to.equal('lz ')
    })
  })
}
