/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { fixture } from './utils.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import last from 'it-last'
import PeerId from 'peer-id'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testPublish (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.publish offline', () => {
    const keyName = nanoid()
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    /** @type {string} */
    let nodeId

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
      const peerInfo = await ipfs.id()
      nodeId = peerInfo.id
      await ipfs.add(fixture.data, { pin: false })
    })

    after(() => factory.clean())

    it('should publish an IPNS record with the default params', async function () {
      // @ts-ignore this is mocha
      this.timeout(50 * 1000)

      const value = fixture.cid
      const keys = await ipfs.key.list()
      const self = keys.find(key => key.name === 'self')

      if (!self) {
        throw new Error('No self key found')
      }

      const res = await ipfs.name.publish(value, { allowOffline: true })
      expect(res).to.exist()

      expect(PeerId.parse(res.name).toString()).to.equal(PeerId.parse(self.id).toString())
      expect(res.value).to.equal(`/ipfs/${value}`)
    })

    it('should publish correctly with the lifetime option and resolve', async () => {
      const { path } = await ipfs.add(uint8ArrayFromString('should publish correctly with the lifetime option and resolve'))
      await ipfs.name.publish(path, { allowOffline: true, resolve: false, lifetime: '2h' })
      expect(await last(ipfs.name.resolve(`/ipns/${nodeId}`))).to.eq(`/ipfs/${path}`)
    })

    it('should publish correctly when the file was not added but resolve is disabled', async function () {
      // @ts-ignore this is mocha
      this.timeout(50 * 1000)

      const value = 'QmPFVLPmp9zv5Z5KUqLhe2EivAGccQW2r7M7jhVJGLZoZU'
      const keys = await ipfs.key.list()
      const self = keys.find(key => key.name === 'self')

      if (!self) {
        throw new Error('No self key found')
      }

      const options = {
        resolve: false,
        lifetime: '1m',
        ttl: '10s',
        key: 'self',
        allowOffline: true
      }

      const res = await ipfs.name.publish(value, options)
      expect(res).to.exist()
      expect(PeerId.parse(res.name).toString()).to.equal(PeerId.parse(self.id).toString())
      expect(res.value).to.equal(`/ipfs/${value}`)
    })

    it('should publish with a key received as param, instead of using the key of the node', async function () {
      // @ts-ignore this is mocha
      this.timeout(90 * 1000)

      const value = fixture.cid
      const options = {
        resolve: false,
        lifetime: '24h',
        ttl: '10s',
        key: keyName,
        allowOffline: true
      }

      const key = await ipfs.key.gen(keyName, { type: 'rsa', size: 2048 })
      const res = await ipfs.name.publish(value, options)

      expect(res).to.exist()
      expect(PeerId.parse(res.name).toString()).to.equal(PeerId.parse(key.id).toString())
      expect(res.value).to.equal(`/ipfs/${value}`)
    })
  })
}
