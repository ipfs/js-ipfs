/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import delay from 'delay'
import PeerId from 'peer-id'
import last from 'it-last'
import { CID } from 'multiformats/cid'
import * as Digest from 'multiformats/hashes/digest'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testResolve (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.resolve offline', function () {
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
    })

    after(() => factory.clean())

    it('should resolve a record default options', async function () {
      // @ts-ignore this is mocha
      this.timeout(20 * 1000)

      const { path } = await ipfs.add(uint8ArrayFromString('should resolve a record default options'))
      const { id: keyId } = await ipfs.key.gen('key-name-default', { type: 'rsa', size: 2048 })

      await ipfs.name.publish(path, { allowOffline: true })
      await ipfs.name.publish(`/ipns/${nodeId}`, { allowOffline: true, key: 'key-name-default' })

      expect(await last(ipfs.name.resolve(`/ipns/${keyId}`)))
        .to.eq(`/ipfs/${path}`)
    })

    it('should resolve a record from peerid as cidv1 in base32', async function () {
      // @ts-ignore this is mocha
      this.timeout(20 * 1000)
      const { cid } = await ipfs.add(uint8ArrayFromString('should resolve a record from cidv1b32'))
      const { id: peerId } = await ipfs.id()
      await ipfs.name.publish(cid, { allowOffline: true })

      // Represent Peer ID as CIDv1 Base32
      // https://github.com/libp2p/specs/blob/master/RFC/0001-text-peerid-cid.md
      const keyCid = CID.createV1(0x72, Digest.decode(PeerId.parse(peerId).toBytes()))
      const resolvedPath = await last(ipfs.name.resolve(`/ipns/${keyCid}`))

      expect(resolvedPath).to.equal(`/ipfs/${cid}`)
    })

    it('should resolve a record recursive === false', async () => {
      const { path } = await ipfs.add(uint8ArrayFromString('should resolve a record recursive === false'))
      await ipfs.name.publish(path, { allowOffline: true })
      expect(await last(ipfs.name.resolve(`/ipns/${nodeId}`, { recursive: false })))
        .to.eq(`/ipfs/${path}`)
    })

    it('should resolve a record recursive === true', async function () {
      // @ts-ignore this is mocha
      this.timeout(20 * 1000)

      const { path } = await ipfs.add(uint8ArrayFromString('should resolve a record recursive === true'))
      const { id: keyId } = await ipfs.key.gen('key-name', { type: 'rsa', size: 2048 })

      await ipfs.name.publish(path, { allowOffline: true })
      await ipfs.name.publish(`/ipns/${nodeId}`, { allowOffline: true, key: 'key-name' })

      expect(await last(ipfs.name.resolve(`/ipns/${keyId}`, { recursive: true })))
        .to.eq(`/ipfs/${path}`)
    })

    it('should resolve a record default options with remainder', async function () {
      // @ts-ignore this is mocha
      this.timeout(20 * 1000)

      const { path } = await ipfs.add(uint8ArrayFromString('should resolve a record default options with remainder'))
      const { id: keyId } = await ipfs.key.gen('key-name-remainder-default', { type: 'rsa', size: 2048 })

      await ipfs.name.publish(path, { allowOffline: true })
      await ipfs.name.publish(`/ipns/${nodeId}`, { allowOffline: true, key: 'key-name-remainder-default' })

      expect(await last(ipfs.name.resolve(`/ipns/${keyId}/remainder/file.txt`)))
        .to.eq(`/ipfs/${path}/remainder/file.txt`)
    })

    it('should resolve a record recursive === false with remainder', async () => {
      const { path } = await ipfs.add(uint8ArrayFromString('should resolve a record recursive = false with remainder'))
      await ipfs.name.publish(path, { allowOffline: true })
      expect(await last(ipfs.name.resolve(`/ipns/${nodeId}/remainder/file.txt`, { recursive: false })))
        .to.eq(`/ipfs/${path}/remainder/file.txt`)
    })

    it('should resolve a record recursive === true with remainder', async function () {
      // @ts-ignore this is mocha
      this.timeout(20 * 1000)

      const { path } = await ipfs.add(uint8ArrayFromString('should resolve a record recursive = true with remainder'))
      const { id: keyId } = await ipfs.key.gen('key-name-remainder', { type: 'rsa', size: 2048 })

      await ipfs.name.publish(path, { allowOffline: true })
      await ipfs.name.publish(`/ipns/${nodeId}`, { allowOffline: true, key: 'key-name-remainder' })

      expect(await last(ipfs.name.resolve(`/ipns/${keyId}/remainder/file.txt`, { recursive: true })))
        .to.eq(`/ipfs/${path}/remainder/file.txt`)
    })

    it('should not get the entry if its validity time expired', async () => {
      const publishOptions = {
        lifetime: '100ms',
        ttl: '10s',
        allowOffline: true
      }

      // we add new data instead of re-using fixture to make sure lifetime handling doesn't break
      const { path } = await ipfs.add(uint8ArrayFromString('should not get the entry if its validity time expired'))
      await ipfs.name.publish(path, publishOptions)
      await delay(500)
      // go only has 1 possible error https://github.com/ipfs/go-ipfs/blob/master/namesys/interface.go#L51
      // so here we just expect an Error and don't match the error type to expiration
      try {
        await last(ipfs.name.resolve(nodeId))
      } catch (/** @type {any} */ error) {
        expect(error).to.exist()
      }
    })
  })

  describe('.name.resolve dns', function () {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    this.retries(5)

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should resolve /ipns/ipfs.io', async () => {
      expect(await last(ipfs.name.resolve('/ipns/ipfs.io')))
        .to.match(/\/ipfs\/.+$/)
    })

    it('should resolve /ipns/ipfs.io recursive === false', async () => {
      expect(await last(ipfs.name.resolve('/ipns/ipfs.io', { recursive: false })))
        .to.match(/\/ipns\/.+$/)
    })

    it('should resolve /ipns/ipfs.io recursive === true', async () => {
      expect(await last(ipfs.name.resolve('/ipns/ipfs.io', { recursive: true })))
        .to.match(/\/ipfs\/.+$/)
    })

    it('should resolve /ipns/ipfs.io with remainder', async () => {
      expect(await last(ipfs.name.resolve('/ipns/ipfs.io/images/ipfs-logo.svg')))
        .to.match(/\/ipfs\/.+\/images\/ipfs-logo.svg$/)
    })

    it('should resolve /ipns/ipfs.io with remainder recursive === false', async () => {
      expect(await last(ipfs.name.resolve('/ipns/ipfs.io/images/ipfs-logo.svg', { recursive: false })))
        .to.match(/\/ipns\/.+\/images\/ipfs-logo.svg$/)
    })

    it('should resolve /ipns/ipfs.io with remainder recursive === true', async () => {
      expect(await last(ipfs.name.resolve('/ipns/ipfs.io/images/ipfs-logo.svg', { recursive: true })))
        .to.match(/\/ipfs\/.+\/images\/ipfs-logo.svg$/)
    })

    it('should fail to resolve /ipns/ipfs.a', async () => {
      try {
        await last(ipfs.name.resolve('ipfs.a'))
      } catch (/** @type {any} */ error) {
        expect(error).to.exist()
      }
    })

    it('should resolve ipns path with hamt-shard recursive === true', async () => {
      expect(await last(ipfs.name.resolve('/ipns/tr.wikipedia-on-ipfs.org/wiki/Anasayfa.html', { recursive: true })))
        .to.match(/\/ipfs\/.+$/)
    })
  })
}
