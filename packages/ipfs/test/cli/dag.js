/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const runOnAndOff = require('../utils/on-and-off')
const path = require('path')
const dagCBOR = require('ipld-dag-cbor')
const dagPB = require('ipld-dag-pb')

describe('dag', () => runOnAndOff.off((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  before(async function () {
    this.timeout(50 * 1000)
    ipfs = thing.ipfs
    await ipfs('add -r test/fixtures/test-data/recursive-get-dir')
  })

  describe('get', () => {
    it('get', async function () {
      this.timeout(20 * 1000)

      // put test eth-block
      const out = await ipfs(`block put --format eth-block --mhtype keccak-256 ${path.resolve(path.join(__dirname, '..'))}/fixtures/test-data/eth-block`)
      expect(out).to.eql('bagiacgzarkhijr4xmbp345ovwwxra7kcecrnwcwtl7lg3g7d2ogyprdswjwq\n')

      // lookup path on eth-block
      const out2 = await ipfs('dag get bagiacgzarkhijr4xmbp345ovwwxra7kcecrnwcwtl7lg3g7d2ogyprdswjwq/parentHash')
      const expectHash = Buffer.from('c8c0a17305adea9bbb4b98a52d44f0c1478f5c48fc4b64739ee805242501b256', 'hex')
      expect(out2).to.be.eql('0x' + expectHash.toString('hex') + '\n')
    })
  })

  describe('resolve', () => {
    it('resolve cid', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag resolve Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
      expect(out).to.equal('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z\n')
    })

    it('resolve sub directory', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag resolve Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z/init-docs/tour/0.0-intro')
      expect(out).to.equal('QmYE7xo6NxbHEVEHej1yzxijYaNY51BaeKxjXxn6Ssa6Bs\n')
    })
  })

  describe('put', () => {
    it('puts json string', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put "{}"')
      expect(out).to.equal('bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua\n')
    })

    it('puts piped json string', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put', {
        input: Buffer.from('{}')
      })
      expect(out).to.equal('bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua\n')
    })

    it('puts piped cbor node', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put --input-encoding cbor', {
        input: dagCBOR.util.serialize({})
      })
      expect(out).to.equal('bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua\n')
    })

    it('puts piped raw node', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put --input-encoding raw --format raw', {
        input: Buffer.alloc(10)
      })
      expect(out).to.equal('bafkreiab2rek7wjiazkfrt3hbnqpljmu24226alszdlh6ivic2abgjubzi\n')
    })

    it('puts piped protobuf node', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put --input-encoding protobuf --format protobuf', {
        input: dagPB.util.serialize({})
      })
      expect(out).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n\n')
    })

    it('puts protobuf node as json', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put --format protobuf "{"Links":[]}"', {
        input: dagPB.util.serialize({})
      })
      expect(out).to.equal('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n\n')
    })

    it('puts piped protobuf node with cid-v1', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put --input-encoding protobuf --format protobuf --cid-version=1', {
        input: dagPB.util.serialize({})
      })
      expect(out).to.equal('bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku\n')
    })

    it('puts json string with esoteric hashing algorithm', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put --hash-alg blake2s-40 "{}"')
      expect(out).to.equal('bafy4lzacausjadzcia\n')
    })

    it('puts json string with cid base', async function () {
      this.timeout(20 * 1000)

      const out = await ipfs('dag put --cid-base base64 "{}"')
      expect(out).to.equal('mAXESIMGaeX+h/VkM0uW0LRz18kbim5FoTi+HQEuB3DRcelag\n')
    })

    it('pins node after putting', async function () {
      this.timeout(20 * 1000)

      const cid = (await ipfs('dag put --pin "{"hello":"world"}"')).trim()

      const out = await ipfs('pin ls')
      expect(out).to.include(cid)
    })

    it('puts a cbor node with a legacy { "/": "<CID>" } links', async function () {
      this.timeout(20 * 1000)

      const input = `dag api rulz ${Date.now()}`

      const linkedCid = (await ipfs('dag put', {
        input: Buffer.from(`"${input}"`)
      })).trim()

      const cid = (await ipfs('dag put', {
        input: Buffer.from(JSON.stringify({
          link: { '/': linkedCid },
          arrayLink: [{ '/': linkedCid }],
          data: { test: Date.now() },
          noData: null
        }))
      })).trim()

      const out0 = (await ipfs(`dag get ${cid}/link`)).trim()
      expect(out0).to.equal(input)

      const out1 = (await ipfs(`dag get ${cid}/arrayLink/0`)).trim()
      expect(out1).to.equal(input)
    })
  })
}))
