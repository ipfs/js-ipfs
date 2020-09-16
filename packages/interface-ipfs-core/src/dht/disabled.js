/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const uint8ArrayFromString = require('uint8arrays/from-string')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('disabled', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await factory.spawn({
        ipfsOptions: {
          config: {
            Routing: {
              Type: 'none'
            }
          }
        }
      })).api
    })

    after(() => factory.clean())

    it('should error when DHT not available', async () => {
      await expect(ipfs.dht.put(uint8ArrayFromString('a'), uint8ArrayFromString('b')))
        .to.eventually.be.rejected()
        .and.to.have.property('code', 'ERR_NOT_ENABLED')
    })
  })
}
