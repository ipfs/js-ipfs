/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fixtures } from './utils/index.js'
import { CID } from 'multiformats/cid'
import all from 'it-all'
import drain from 'it-drain'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from './utils/mocha.js'
import testTimeout from './utils/test-timeout.js'
import { importer } from 'ipfs-unixfs-importer'
import blockstore from './utils/blockstore-adapter.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testCat (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.cat', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    before(() => Promise.all([
      all(importer({ content: fixtures.smallFile.data }, blockstore(ipfs))),
      all(importer({ content: fixtures.bigFile.data }, blockstore(ipfs)))
    ]))

    it('should respect timeout option when catting files', () => {
      return testTimeout(() => drain(ipfs.cat(CID.parse('QmPDqvcuA4AkhBLBuh2y49yhUB98rCnxPxa3eVNC1kAbS1'), {
        timeout: 1
      })))
    })

    it('should cat with a base58 string encoded multihash', async () => {
      const data = uint8ArrayConcat(await all(ipfs.cat(fixtures.smallFile.cid)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat with a Uint8Array multihash', async () => {
      const cid = fixtures.smallFile.cid

      const data = uint8ArrayConcat(await all(ipfs.cat(cid)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat with a CID object', async () => {
      const cid = fixtures.smallFile.cid

      const data = uint8ArrayConcat(await all(ipfs.cat(cid)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat a file added as CIDv0 with a CIDv1', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: (async function * () { yield input }()) }], blockstore(ipfs)))

      expect(res).to.have.nested.property('[0].cid.version', 0)

      const cidv1 = res[0].cid.toV1()

      const output = uint8ArrayConcat(await all(ipfs.cat(cidv1)))
      expect(output).to.eql(input)
    })

    it('should cat a file added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: (async function * () { yield input }()) }], blockstore(ipfs), { cidVersion: 1, rawLeaves: false }))

      expect(res).to.have.nested.property('[0].cid.version', 1)

      const cidv0 = res[0].cid.toV0()

      const output = uint8ArrayConcat(await all(ipfs.cat(cidv0)))
      expect(output.slice()).to.eql(input)
    })

    it('should cat a BIG file', async () => {
      const data = uint8ArrayConcat(await all(ipfs.cat(fixtures.bigFile.cid)))
      expect(data.length).to.equal(fixtures.bigFile.data.length)
      expect(data.slice()).to.eql(fixtures.bigFile.data)
    })

    it('should cat with IPFS path', async () => {
      const ipfsPath = '/ipfs/' + fixtures.smallFile.cid

      const data = uint8ArrayConcat(await all(ipfs.cat(ipfsPath)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat with IPFS path, nested value', async () => {
      const fileToAdd = { path: 'a/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(importer(fileToAdd, blockstore(ipfs)))

      const file = await filesAdded.find((f) => f.path === 'a')
      expect(file).to.exist()

      if (!file) {
        throw new Error('No file added')
      }

      const data = uint8ArrayConcat(await all(ipfs.cat(`/ipfs/${file.cid}/testfile.txt`)))

      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should cat with IPFS path, deeply nested value', async () => {
      const fileToAdd = { path: 'a/b/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(importer([fileToAdd], blockstore(ipfs)))

      const file = filesAdded.find((f) => f.path === 'a')
      expect(file).to.exist()

      if (!file) {
        throw new Error('No file added')
      }

      const data = uint8ArrayConcat(await all(ipfs.cat(`/ipfs/${file.cid}/b/testfile.txt`)))
      expect(uint8ArrayToString(data)).to.contain('Plz add me!')
    })

    it('should error on invalid key', () => {
      const invalidCid = 'somethingNotMultihash'

      return expect(drain(ipfs.cat(invalidCid))).to.eventually.be.rejected()
    })

    it('should error on unknown path', () => {
      return expect(drain(ipfs.cat(fixtures.smallFile.cid + '/does-not-exist'))).to.eventually.be.rejected()
        .and.be.an.instanceOf(Error)
        .and.to.have.property('message')
        .to.be.oneOf([
          'file does not exist',
          'no link named "does-not-exist" under Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
        ])
    })

    it('should error on dir path', async () => {
      const file = { path: 'dir/testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(importer([file], blockstore(ipfs)))
      expect(filesAdded.length).to.equal(2)

      const files = filesAdded.filter((file) => file.path === 'dir')
      expect(files.length).to.equal(1)

      const dir = files[0]

      const err = await expect(drain(ipfs.cat(dir.cid))).to.eventually.be.rejected()
      expect(err.message).to.contain('this dag node is a directory')
    })

    it('should export a chunk of a file', async () => {
      const offset = 1
      const length = 3

      const data = uint8ArrayConcat(await all(ipfs.cat(fixtures.smallFile.cid, { offset, length })))
      expect(uint8ArrayToString(data)).to.equal('lz ')
    })
  })
}
