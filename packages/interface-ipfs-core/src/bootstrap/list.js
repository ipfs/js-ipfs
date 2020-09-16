/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const testTimeout = require('../utils/test-timeout')
const multiaddr = require('multiaddr')
const { isBrowser, isWebWorker } = require('ipfs-utils/src/env')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bootstrap.list', function () {
    this.timeout(100 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should respect timeout option listing bootstrap nodes', () => {
      return testTimeout(() => ipfs.bootstrap.list({
        timeout: 1
      }))
    })

    it('should return a list of peers', async () => {
      const res = await ipfs.bootstrap.list()

      const peers = res.Peers
      expect(peers).to.exist()
    })

    it('bootstrap list should contain dialable nodes', async () => {
      const list = await ipfs.bootstrap.list()
      const onlyWss = list.some(addr => {
        const ma = multiaddr(addr)

        return ma.protos().some(proto => proto.name === 'wss')
      })

      expect(list).to.not.be.empty()

      if (isBrowser || isWebWorker) {
        expect(onlyWss).to.be.true()
      } else {
        expect(onlyWss).to.be.false()
      }
    })
  })
}
