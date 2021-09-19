/* eslint-env mocha */

import { fixtures } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testLs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.ls', function () {
    this.timeout(50 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
      // two files wrapped in directories, only root CID pinned recursively
      const dir = fixtures.directory.files.map((file) => ({ path: file.path, content: file.data }))
      await all(ipfs.addAll(dir, { pin: false, cidVersion: 0 }))
      await ipfs.pin.add(fixtures.directory.cid, { recursive: true })
      // a file (CID pinned recursively)
      await ipfs.add(fixtures.files[0].data, { pin: false, cidVersion: 0 })
      await ipfs.pin.add(fixtures.files[0].cid, { recursive: true })
      // a single CID (pinned directly)
      await ipfs.add(fixtures.files[1].data, { pin: false, cidVersion: 0 })
      await ipfs.pin.add(fixtures.files[1].cid, { recursive: false })
    })

    after(() => factory.clean())

    // 1st, because ipfs.add pins automatically
    it('should list all recursive pins', async () => {
      const pinset = await all(ipfs.pin.ls({ type: 'recursive' }))

      expect(pinset).to.deep.include({
        type: 'recursive',
        cid: fixtures.files[0].cid
      })
      expect(pinset).to.deep.include({
        type: 'recursive',
        cid: fixtures.directory.cid
      })
    })

    it('should list all indirect pins', async () => {
      const pinset = await all(ipfs.pin.ls({ type: 'indirect' }))

      expect(pinset).to.not.deep.include({
        type: 'recursive',
        cid: fixtures.files[0].cid
      })
      expect(pinset).to.not.deep.include({
        type: 'direct',
        cid: fixtures.files[1].cid
      })
      expect(pinset).to.not.deep.include({
        type: 'recursive',
        cid: fixtures.directory.cid
      })
      expect(pinset).to.deep.include({
        type: 'indirect',
        cid: fixtures.directory.files[0].cid
      })
      expect(pinset).to.deep.include({
        type: 'indirect',
        cid: fixtures.directory.files[1].cid
      })
    })

    it('should list all types of pins', async () => {
      const pinset = await all(ipfs.pin.ls())

      expect(pinset).to.not.be.empty()
      // check the three "roots"
      expect(pinset).to.deep.include({
        type: 'recursive',
        cid: fixtures.directory.cid
      })
      expect(pinset).to.deep.include({
        type: 'recursive',
        cid: fixtures.files[0].cid
      })
      expect(pinset).to.deep.include({
        type: 'direct',
        cid: fixtures.files[1].cid
      })
      expect(pinset).to.deep.include({
        type: 'indirect',
        cid: fixtures.directory.files[0].cid
      })
      expect(pinset).to.deep.include({
        type: 'indirect',
        cid: fixtures.directory.files[1].cid
      })
    })

    it('should list all direct pins', async () => {
      const pinset = await all(ipfs.pin.ls({ type: 'direct' }))
      expect(pinset).to.have.lengthOf(1)
      expect(pinset).to.deep.include({
        type: 'direct',
        cid: fixtures.files[1].cid
      })
    })

    it('should list pins for a specific hash', async () => {
      const pinset = await all(ipfs.pin.ls({
        paths: fixtures.files[0].cid
      }))
      expect(pinset).to.have.lengthOf(1)
      expect(pinset).to.have.deep.members([{
        type: 'recursive',
        cid: fixtures.files[0].cid
      }])
    })

    it('should throw an error on missing direct pins for existing path', () => {
      // ipfs.txt is an indirect pin, so lookup for direct one should throw an error
      return expect(all(ipfs.pin.ls({
        paths: `/ipfs/${fixtures.directory.cid}/files/ipfs.txt`,
        type: 'direct'
      })))
        .to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.to.have.property('message', `path '/ipfs/${fixtures.directory.cid}/files/ipfs.txt' is not pinned`)
    })

    it('should throw an error on missing link for a specific path', () => {
      return expect(all(ipfs.pin.ls({
        paths: `/ipfs/${fixtures.directory.cid}/I-DONT-EXIST.txt`,
        type: 'direct'
      })))
        .to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.to.have.property('message', `no link named "I-DONT-EXIST.txt" under ${fixtures.directory.cid}`)
    })

    it('should list indirect pins for a specific path', async () => {
      const pinset = await all(ipfs.pin.ls({
        paths: `/ipfs/${fixtures.directory.cid}/files/ipfs.txt`,
        type: 'indirect'
      }))
      expect(pinset).to.have.lengthOf(1)
      expect(pinset).to.deep.include({
        type: `indirect through ${fixtures.directory.cid}`,
        cid: fixtures.directory.files[1].cid
      })
    })

    it('should list recursive pins for a specific hash', async () => {
      const pinset = await all(ipfs.pin.ls({
        paths: fixtures.files[0].cid,
        type: 'recursive'
      }))
      expect(pinset).to.have.lengthOf(1)
      expect(pinset).to.deep.include({
        type: 'recursive',
        cid: fixtures.files[0].cid
      })
    })

    it('should list pins for multiple CIDs', async () => {
      const pinset = await all(ipfs.pin.ls({
        paths: [fixtures.files[0].cid, fixtures.files[1].cid]
      }))
      const cids = pinset.map(p => p.cid.toString())
      expect(cids).to.include(fixtures.files[0].cid.toString())
      expect(cids).to.include(fixtures.files[1].cid.toString())
    })

    it('should throw error for invalid non-string pin type option', () => {
      return expect(all(ipfs.pin.ls({ type: 6 })))
        .to.eventually.be.rejected()
        // TODO: go-ipfs does not return error codes
        // .with.property('code').that.equals('ERR_INVALID_PIN_TYPE')
    })

    it('should throw error for invalid string pin type option', () => {
      return expect(all(ipfs.pin.ls({ type: '__proto__' })))
        .to.eventually.be.rejected()
        // TODO: go-ipfs does not return error codes
        // .with.property('code').that.equals('ERR_INVALID_PIN_TYPE')
    })

    it('should list pins with metadata', async () => {
      const { cid } = await ipfs.add(`data-${Math.random()}`, {
        pin: false
      })

      const metadata = {
        key: 'value',
        one: 2,
        array: [{
          thing: 'subthing'
        }],
        obj: {
          foo: 'bar',
          baz: ['qux']
        }
      }

      await ipfs.pin.add(cid, {
        recursive: false,
        metadata
      })

      const pinset = await all(ipfs.pin.ls({
        paths: cid
      }))

      expect(pinset).to.have.deep.members([{
        type: 'direct',
        cid: cid,
        metadata
      }])
    })
  })
}
