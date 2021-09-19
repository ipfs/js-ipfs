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
export function testGet (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.get', function () {
    this.timeout(30 * 1000)
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should fail with error', async () => {
      // @ts-expect-error missing arg
      await expect(ipfs.config.get()).to.eventually.rejectedWith('key argument is required')
    })

    it('should retrieve a value through a key', async () => {
      const peerId = await ipfs.config.get('Identity.PeerID')
      expect(peerId).to.exist()
    })

    it('should retrieve a value through a nested key', async () => {
      const swarmAddrs = await ipfs.config.get('Addresses.Swarm')
      expect(swarmAddrs).to.exist()
    })

    it('should fail on non valid key', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.config.get(1234)).to.eventually.be.rejected()
    })

    it('should fail on non existent key', () => {
      return expect(ipfs.config.get('Bananas')).to.eventually.be.rejected()
    })
  })

  describe('.config.getAll', function () {
    this.timeout(30 * 1000)
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should retrieve the whole config', async () => {
      const config = await ipfs.config.getAll()

      expect(config).to.be.an('object')
    })

    it('should retrieve the whole config with options', async () => {
      const config = await ipfs.config.getAll({ signal: undefined })

      expect(config).to.be.an('object')
    })
  })
}
