/* eslint-env mocha */

import { fixtures, clearPins } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'
import drain from 'it-drain'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testAddAll (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.addAll', function () {
    this.timeout(50 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async () => {
      ipfs = (await factory.spawn()).api

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

    after(() => factory.clean())

    beforeEach(() => {
      return clearPins(ipfs)
    })

    /**
     *
     * @param {Iterable<import('ipfs-core-types/src/pin').AddInput> | AsyncIterable<import('ipfs-core-types/src/pin').AddInput>} source
     */
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
  })
}
