/* eslint-env mocha */

import { fixtures, clearRemotePins, clearServices } from '../utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testAdd (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  const ENDPOINT = new URL(process.env.PINNING_SERVICE_ENDPOINT || '')
  const KEY = `${process.env.PINNING_SERVICE_KEY}`
  const SERVICE = 'pinbot'

  describe('.pin.remote.add', function () {
    this.timeout(50 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async () => {
      ipfs = (await factory.spawn()).api
      await ipfs.pin.remote.service.add(SERVICE, {
        endpoint: ENDPOINT,
        key: KEY
      })
    })
    after(async () => {
      await clearServices(ipfs)
      await factory.clean()
    })

    beforeEach(async () => {
      await clearRemotePins(ipfs)
    })

    it('should add a CID and return the added CID', async () => {
      const pin = await ipfs.pin.remote.add(fixtures.files[0].cid, {
        name: 'fixtures-files-0',
        background: true,
        service: SERVICE
      })

      expect(pin).to.deep.equal({
        status: 'queued',
        cid: fixtures.files[0].cid,
        name: 'fixtures-files-0'
      })
    })

    it('should fail if service is not provided', async () => {
      const result = ipfs.pin.remote.add(fixtures.files[0].cid, {
        name: 'fixtures-files-0',
        background: true
      })

      await expect(result).to.eventually.be.rejectedWith(/service name must be passed/)
    })

    it('if name is not provided defaults to ""', async () => {
      const pin = await ipfs.pin.remote.add(fixtures.files[0].cid, {
        background: true,
        service: SERVICE
      })

      expect(pin).to.deep.equal({
        cid: fixtures.files[0].cid,
        name: '',
        status: 'queued'
      })
    })

    it('should default to blocking pin', async () => {
      const { cid } = fixtures.files[0]
      const result = ipfs.pin.remote.add(cid, {
        service: SERVICE
      })

      const timeout = {}

      const winner = await Promise.race([
        result,
        new Promise(resolve => setTimeout(resolve, 100, timeout))
      ])

      expect(winner).to.equal(timeout)

      // trigger status change on the mock service
      ipfs.pin.remote.add(cid, {
        service: SERVICE,
        name: 'pinned-block'
      })

      expect(await result).to.deep.equal({
        cid,
        status: 'pinned',
        name: ''
      })
    })
    it('should pin dag-cbor', async () => {
      const cid = await ipfs.dag.put({}, {
        storeCodec: 'dag-cbor',
        hashAlg: 'sha2-256'
      })

      const pin = await ipfs.pin.remote.add(cid, {
        service: SERVICE,
        name: 'cbor-pin',
        background: true
      })

      expect(pin).to.deep.equal({
        cid,
        name: 'cbor-pin',
        status: 'queued'
      })
    })

    it('should pin raw', async () => {
      const cid = await ipfs.dag.put(new Uint8Array(0), {
        storeCodec: 'raw',
        hashAlg: 'sha2-256'
      })

      const pin = await ipfs.pin.remote.add(cid, {
        service: SERVICE,
        background: true
      })

      expect(pin).to.deep.equal({
        cid,
        status: 'queued',
        name: ''
      })
    })
  })
}
