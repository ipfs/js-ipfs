/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testDns (factory, options) {
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
      } catch (/** @type {any} */ err) {
        if (err.message.includes('could not resolve name')) {
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
      } catch (/** @type {any} */ err) {
        if (err.message.includes('could not resolve name')) {
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
      } catch (/** @type {any} */ err) {
        if (err.message.includes('could not resolve name')) {
          // @ts-ignore this is mocha
          return this.skip()
        }

        throw err
      }
    })
  })
}
