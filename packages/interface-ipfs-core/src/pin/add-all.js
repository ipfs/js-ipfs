/* eslint-env mocha */
'use strict'

const { fixtures, clearPins } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const all = require('it-all')
const drain = require('it-drain')
const testTimeout = require('../utils/test-timeout')
const CID = require('cids')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.addAll', function () {
    this.timeout(50 * 1000)

    let ipfs
    before(async () => {
      ipfs = (await common.spawn()).api

      await drain(
        ipfs.addAll(
          fixtures.files.map(file => ({ content: file.data })), {
            pin: false
          }
        )
      )

      await drain(
        ipfs.addAll(fixtures.directory.files.map(
          file => ({
            path: file.path,
            content: file.data
          })
        ), {
          pin: false
        })
      )
    })

    after(() => common.clean())

    beforeEach(() => {
      return clearPins(ipfs)
    })

    async function testAddPinInput (source) {
      const pinset = await all(ipfs.pin.addAll(source))

      expect(pinset).to.have.deep.members([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ])
    }

    it('should add an array of CIDs', () => {
      return testAddPinInput([
        fixtures.files[0].cid,
        fixtures.files[1].cid
      ])
    })

    it('should add a generator of CIDs', () => {
      return testAddPinInput(function * () {
        yield fixtures.files[0].cid
        yield fixtures.files[1].cid
      }())
    })

    it('should add an async generator of CIDs', () => {
      return testAddPinInput(async function * () { // eslint-disable-line require-await
        yield fixtures.files[0].cid
        yield fixtures.files[1].cid
      }())
    })

    it('should add an array of pins with options', () => {
      return testAddPinInput([
        {
          cid: fixtures.files[0].cid,
          recursive: false
        },
        {
          cid: fixtures.files[1].cid,
          recursive: true
        }
      ])
    })

    it('should add a generator of pins with options', () => {
      return testAddPinInput(function * () {
        yield {
          cid: fixtures.files[0].cid,
          recursive: false
        }
        yield {
          cid: fixtures.files[1].cid,
          recursive: true
        }
      }())
    })

    it('should add an async generator of pins with options', () => {
      return testAddPinInput(async function * () { // eslint-disable-line require-await
        yield {
          cid: fixtures.files[0].cid,
          recursive: false
        }
        yield {
          cid: fixtures.files[1].cid,
          recursive: true
        }
      }())
    })

    it('should respect timeout option when pinning a block', () => {
      return testTimeout(() => ipfs.pin.addAll([new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')], {
        timeout: 1
      }))
    })
  })
}
