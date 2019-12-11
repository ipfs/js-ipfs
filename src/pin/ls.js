/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.ls', function () {
    this.timeout(50 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
      // two files wrapped in directories, only root CID pinned recursively
      const dir = fixtures.directory.files.map((file) => ({ path: file.path, content: file.data }))
      await ipfs.add(dir, { pin: false, cidVersion: 0 })
      await ipfs.pin.add(fixtures.directory.cid, { recursive: true })
      // a file (CID pinned recursively)
      await ipfs.add(fixtures.files[0].data, { pin: false, cidVersion: 0 })
      await ipfs.pin.add(fixtures.files[0].cid, { recursive: true })
      // a single CID (pinned directly)
      await ipfs.add(fixtures.files[1].data, { pin: false, cidVersion: 0 })
      await ipfs.pin.add(fixtures.files[1].cid, { recursive: false })
    })

    after(() => common.clean())

    // 1st, because ipfs.add pins automatically
    it('should list all recursive pins', async () => {
      const pinset = await ipfs.pin.ls({ type: 'recursive' })
      expect(pinset).to.deep.include({
        type: 'recursive',
        hash: fixtures.files[0].cid
      })
      expect(pinset).to.deep.include({
        type: 'recursive',
        hash: fixtures.directory.cid
      })
    })

    it('should list all indirect pins', async () => {
      const pinset = await ipfs.pin.ls({ type: 'indirect' })
      expect(pinset).to.not.deep.include({
        type: 'recursive',
        hash: fixtures.files[0].cid
      })
      expect(pinset).to.not.deep.include({
        type: 'direct',
        hash: fixtures.files[1].cid
      })
      expect(pinset).to.not.deep.include({
        type: 'recursive',
        hash: fixtures.directory.cid
      })
      expect(pinset).to.deep.include({
        type: 'indirect',
        hash: fixtures.directory.files[0].cid
      })
      expect(pinset).to.deep.include({
        type: 'indirect',
        hash: fixtures.directory.files[1].cid
      })
    })

    it('should list all types of pins', async () => {
      const pinset = await ipfs.pin.ls()
      expect(pinset).to.not.be.empty()
      // check the three "roots"
      expect(pinset).to.deep.include({
        type: 'recursive',
        hash: fixtures.directory.cid
      })
      expect(pinset).to.deep.include({
        type: 'recursive',
        hash: fixtures.files[0].cid
      })
      expect(pinset).to.deep.include({
        type: 'direct',
        hash: fixtures.files[1].cid
      })
      expect(pinset).to.deep.include({
        type: 'indirect',
        hash: fixtures.directory.files[0].cid
      })
      expect(pinset).to.deep.include({
        type: 'indirect',
        hash: fixtures.directory.files[1].cid
      })
    })

    it('should list all direct pins', async () => {
      const pinset = await ipfs.pin.ls({ type: 'direct' })
      expect(pinset).to.have.lengthOf(1)
      expect(pinset).to.deep.include({
        type: 'direct',
        hash: fixtures.files[1].cid
      })
    })

    it('should list pins for a specific hash', async () => {
      const pinset = await ipfs.pin.ls(fixtures.files[0].cid)
      expect(pinset).to.deep.equal([{
        type: 'recursive',
        hash: fixtures.files[0].cid
      }])
    })

    it('should throw an error on missing direct pins for existing path', () => {
      // ipfs.txt is an indirect pin, so lookup for direct one should throw an error
      return expect(ipfs.pin.ls(`/ipfs/${fixtures.directory.cid}/files/ipfs.txt`, { type: 'direct' }))
        .to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.to.have.property('message', `path '/ipfs/${fixtures.directory.cid}/files/ipfs.txt' is not pinned`)
    })

    it('should throw an error on missing link for a specific path', () => {
      return expect(ipfs.pin.ls(`/ipfs/${fixtures.directory.cid}/I-DONT-EXIST.txt`, { type: 'direct' }))
        .to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.to.have.property('message', `no link named "I-DONT-EXIST.txt" under ${fixtures.directory.cid}`)
    })

    it('should list indirect pins for a specific path', async () => {
      const pinset = await ipfs.pin.ls(`/ipfs/${fixtures.directory.cid}/files/ipfs.txt`, { type: 'indirect' })
      expect(pinset).to.deep.include({
        type: `indirect through ${fixtures.directory.cid}`,
        hash: fixtures.directory.files[1].cid
      })
    })

    it('should list recursive pins for a specific hash', async () => {
      const pinset = await ipfs.pin.ls(fixtures.files[0].cid, { type: 'recursive' })
      expect(pinset).to.deep.equal([{
        type: 'recursive',
        hash: fixtures.files[0].cid
      }])
    })

    it('should list pins for multiple CIDs', async () => {
      const pinset = await ipfs.pin.ls([fixtures.files[0].cid, fixtures.files[1].cid])
      const cids = pinset.map(({ hash }) => hash)
      expect(cids).to.include(fixtures.files[0].cid)
      expect(cids).to.include(fixtures.files[1].cid)
    })
  })
}
