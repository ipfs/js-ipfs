/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
module.exports = (factory, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dns', function () {
    this.timeout(60 * 1000)
    this.retries(3)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should non-recursively resolve ipfs.io', async function () {
      try {
        const res = await ipfs.dns('ipfs.io', { recursive: false })

        // matches pattern /ipns/<ipnsaddress>
        expect(res).to.match(/\/ipns\/.+$/)
      } catch (err) {
        if (err instanceof Error && err.message.includes('could not resolve name')) {
          // @ts-ignore this is mocha
          return this.skip()
        }

        throw err
      }
    })

    it('should recursively resolve ipfs.io', async function () {
      try {
        const res = await ipfs.dns('ipfs.io', { recursive: true })

        // matches pattern /ipfs/<hash>
        expect(res).to.match(/\/ipfs\/.+$/)
      } catch (err) {
        if (err instanceof Error && err.message.includes('could not resolve name')) {
          // @ts-ignore this is mocha
          return this.skip()
        }

        throw err
      }
    })

    it('should resolve subdomain docs.ipfs.io', async function () {
      try {
        const res = await ipfs.dns('docs.ipfs.io')

        // matches pattern /ipfs/<hash>
        expect(res).to.match(/\/ipfs\/.+$/)
      } catch (err) {
        if (err instanceof Error && err.message.includes('could not resolve name')) {
          // @ts-ignore this is mocha
          return this.skip()
        }

        throw err
      }
    })
  })
}
