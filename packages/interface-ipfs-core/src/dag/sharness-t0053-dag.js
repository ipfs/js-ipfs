/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { base64pad } from 'multiformats/bases/base64'
import { base58btc } from 'multiformats/bases/base58'
import { CID } from 'multiformats'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testDagSharnessT0053 (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag (sharness-t0053-dag)', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    /** @type {CID} */
    let hash1
    /** @type {CID} */
    let hash2
    /** @type {CID} */
    let hash3
    /** @type {CID} */
    let hash4
    /** @type {Uint8Array} */
    let ipldObject
    /** @type {Uint8Array} */
    let ipldObjectDagCbor
    /** @type {Uint8Array} */
    let ipldObjectDagPb
    /** @type {Uint8Array} */
    let ipldObjectDagJson
    const ipldHash = 'bafyreiblwimnjbqcdoeafiobk6q27jcw64ew7n2fmmhdpldd63edmjecde'
    const ipldDagCborHash = 'bafyreieculsmrexh3ty5jentbvuku452o27mst4h2tq2rb2zntqhgcstji'
    const ipldDagJsonHash = 'baguqeerajwksxu3lxpomdwxvosl542zl3xknhjgxtq3277gafrhl6vdw5tcq'
    const ipldDagPbHash = 'bafybeibazl2z4vqp2tmwcfag6wirmtpnomxknqcgrauj7m2yisrz3qjbom'

    before(async () => {
      hash1 = (await ipfs.add({ content: 'foo\n', path: 'file1' })).cid
      hash2 = (await ipfs.add({ content: 'bar\n', path: 'file2' })).cid
      hash3 = (await ipfs.add({ content: 'baz\n', path: 'file3' })).cid
      hash4 = (await ipfs.add({ content: 'qux\n', path: 'file4' })).cid

      ipldObject = new TextEncoder().encode(`{"hello":"world","cats":[{"/":"${hash1}"},{"water":{"/":"${hash2}"}}],"magic":{"/":"${hash3}"},"sub":{"dict":"ionary","beep":[0,"bop"]}}`)
      ipldObjectDagCbor = base64pad.decode('MomREYXRhRQABAgMEZUxpbmtzgA==')
      ipldObjectDagPb = base64pad.decode('MCgUAAQIDBA==')
      ipldObjectDagJson = new TextEncoder().encode('{"Data":{"/":{"bytes":"AAECAwQ"}},"Links":[]}')
    })

    it('sanity check', () => {
      expect(hash1.toString()).to.equal('QmYNmQKp6SuaVrpgWRsPTgCQCnpxUYGq76YEKBXuj2N4H6')
      expect(hash2.toString()).to.equal('QmTz3oc4gdpRMKP2sdGUPZTAGRngqjsi99BPoztyP53JMM')
      expect(hash3.toString()).to.equal('QmWLdkp93sNxGRjnFHPaYg8tCQ35NBY3XPn6KiETd3Z4WR')
      expect(hash4.toString()).to.equal('QmZCoKN8vvRbxfn4BMG9678UQTSUwPXRJsRA9jnjoucHUj')
    })

    it('can add an ipld object using defaults (dag-json to dag-cbor)', async () => {
      // dag-json is default on CLI, force it to interpret our bytes here
      const cid = await ipfs.dag.put(ipldObject, { inputCodec: 'dag-json' })
      expect(cid.toString()).to.equal(ipldHash)
    })

    it('can add an ipld object using dag-json to dag-json', async () => {
      const cid = await ipfs.dag.put(ipldObject, { inputCodec: 'dag-json', storeCodec: 'dag-json' })
      expect(cid.toString()).to.equal('baguqeera6gviseelmbzn2ugoddo5vulxlshqs3kw5ymgsb6w4cabnoh4ldpa')
    })

    it('can add an ipld object using dag-json to dag-cbor', async () => {
      const cid = await ipfs.dag.put(ipldObject, { inputCodec: 'dag-json', storeCodec: 'dag-cbor' })
      expect(cid.toString()).to.equal(ipldHash)
    })

    // this is not testing what the upstream sharness is testing since we're converting it locally
    // and not asking the CLI for it, but it's included for completeness
    it('can add an ipld object using cid-base=base58btc', async () => {
      const cid = await ipfs.dag.put(ipldObject, { inputCodec: 'dag-json' })
      expect(cid.toString(base58btc)).to.equal('zdpuAoN1XJ3GsrxEzMuCbRKZzRUVJekJUCbPVgCgE4D9yYqVi')
    })

    // (1) dag-cbor input

    it('can add a dag-cbor input block stored as dag-cbor', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagCbor, { inputCodec: 'dag-cbor', storeCodec: 'dag-cbor' })
      expect(cid.toString()).to.equal(ipldDagCborHash)
    })

    it('can add a dag-cbor input block stored as dag-pb', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagCbor, { inputCodec: 'dag-cbor', storeCodec: 'dag-pb' })
      expect(cid.toString()).to.equal(ipldDagPbHash)
    })

    it('can add a dag-cbor input block stored as dag-json', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagCbor, { inputCodec: 'dag-cbor', storeCodec: 'dag-json' })
      expect(cid.toString()).to.equal(ipldDagJsonHash)
    })

    // (2) dag-json input

    it('can add a dag-json input block stored as dag-cbor', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagJson, { inputCodec: 'dag-json', storeCodec: 'dag-cbor' })
      expect(cid.toString()).to.equal(ipldDagCborHash)
    })

    it('can add a dag-json input block stored as dag-pb', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagJson, { inputCodec: 'dag-json', storeCodec: 'dag-pb' })
      expect(cid.toString()).to.equal(ipldDagPbHash)
    })

    it('can add a dag-json input block stored as dag-json', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagJson, { inputCodec: 'dag-json', storeCodec: 'dag-json' })
      expect(cid.toString()).to.equal(ipldDagJsonHash)
    })

    // (3) dag-pb input

    it('can add a dag-pb input block stored as dag-cbor', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagPb, { inputCodec: 'dag-pb', storeCodec: 'dag-cbor' })
      expect(cid.toString()).to.equal(ipldDagCborHash)
    })

    it('can add a dag-pb input block stored as dag-pb', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagPb, { inputCodec: 'dag-pb', storeCodec: 'dag-pb' })
      expect(cid.toString()).to.equal(ipldDagPbHash)
    })

    it('can add a dag-pb input block stored as dag-json', async () => {
      const cid = await ipfs.dag.put(ipldObjectDagPb, { inputCodec: 'dag-pb', storeCodec: 'dag-json' })
      expect(cid.toString()).to.equal(ipldDagJsonHash)
    })

    it('can get dag-cbor, dag-json, dag-pb blocks as dag-json', async () => {
      const resultCbor = await ipfs.dag.get(CID.parse(ipldDagCborHash))
      const resultJson = await ipfs.dag.get(CID.parse(ipldDagJsonHash))
      const resultPb = await ipfs.dag.get(CID.parse(ipldDagPbHash))
      expect(resultCbor).to.deep.equal(resultJson)
      expect(resultCbor).to.deep.equal(resultPb)
    })

    /*
    This is illustrative only - it's not testing anything meaningful. It's supposed to test
    `outputCodec` which isn't supported for the http client or core since we get the decoded JS
    form of the node. But this test code as it's written is doing the encode locally and
    asserting on that .. which is just testing the codec.

    it('can get dag-pb block transcoded as dag-cbor', async () => {
      const { value } = await ipfs.dag.get(CID.parse(ipldDagPbHash), { outputCodec: 'dag-cbor' })
      const block = await Block.encode({ value, codec: dagCbor, hasher: sha256 })
      expect(bytes.toHex(block.cid.multihash.bytes)).to.equal('122082a2e4c892e7dcf1d491b30d68aa73ba76bec94f87d4e1a887596ce0730a534a')
    })
    */

    // Skipped: 'dag put and dag get transcodings match' - tests the round-trip of the above

    it('resolving sub-objects works', async () => {
      let result = await ipfs.dag.get(CID.parse(ipldHash), { path: 'hello' })
      expect(result.value).to.equal('world')
      result = await ipfs.dag.get(CID.parse(ipldHash), { path: 'sub' })
      expect(result.value).to.deep.equal({ beep: [0, 'bop'], dict: 'ionary' })
      result = await ipfs.dag.get(CID.parse(ipldHash), { path: 'sub/beep' })
      expect(result.value).to.deep.equal([0, 'bop'])
      result = await ipfs.dag.get(CID.parse(ipldHash), { path: 'sub/beep/0' })
      expect(result.value).to.equal(0)
      result = await ipfs.dag.get(CID.parse(ipldHash), { path: 'sub/beep/1' })
      expect(result.value).to.equal('bop')
    })

    // Skipped: 'traversals using /ipld/ work' - not implemented here, yet?

    // Skipped additional pin, resolve and other tests
  })
}
