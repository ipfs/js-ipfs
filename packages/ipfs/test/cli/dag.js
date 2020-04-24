/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const cli = require('../utils/cli')
const dagCBOR = require('ipld-dag-cbor')
const dagPB = require('ipld-dag-pb')
const sinon = require('sinon')
const CID = require('cids')
const { Buffer } = require('buffer')

describe('dag', () => {
  let ipfs

  beforeEach(() => {
    ipfs = {
      dag: {
        get: sinon.stub(),
        resolve: sinon.stub(),
        put: sinon.stub()
      }
    }
  })

  describe('get', () => {
    it('get', async () => {
      const cid = new CID('bagiacgzarkhijr4xmbp345ovwwxra7kcecrnwcwtl7lg3g7d2ogyprdswjwq')
      const path = 'parentHash'
      const result = {
        value: Buffer.from('hello world')
      }

      ipfs.dag.get.withArgs(cid, path, {
        localResolve: false
      }).returns(result)

      const out = await cli(`dag get ${cid}/${path}`, { ipfs })

      expect(out).to.be.eql('0x' + result.value.toString('hex') + '\n')
    })
  })

  describe('resolve', () => {
    it('resolves a cid ref', async () => {
      const cid = 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z'

      ipfs.dag.resolve.withArgs(cid, {}).returns([{
        value: new CID(cid)
      }])

      const out = await cli(`dag resolve ${cid}`, { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('resolves an ipfs path', async () => {
      const cid = 'Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z'

      ipfs.dag.resolve.withArgs(`/ipfs/${cid}`, {}).returns([{
        value: new CID(cid)
      }])

      const out = await cli(`dag resolve /ipfs/${cid}`, { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })
  })

  const putOptions = (overrides) => {
    return {
      format: 'dag-cbor',
      hashAlg: 'sha2-256',
      version: 1,
      onlyHash: false,
      preload: true,
      pin: true,
      ...overrides
    }
  }

  describe('put', () => {
    it('puts json string', async () => {
      const cid = 'bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua'
      ipfs.dag.put.withArgs({}, putOptions()).resolves(new CID(cid))

      const out = await cli('dag put "{}"', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped json string', async () => {
      const cid = 'bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua'
      ipfs.dag.put.withArgs({}, putOptions()).resolves(new CID(cid))

      const out = await cli('dag put', {
        getStdin: function * () {
          yield Buffer.from('{}')
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped cbor node', async () => {
      const cid = 'bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua'
      ipfs.dag.put.withArgs({}, putOptions()).resolves(new CID(cid))

      const out = await cli('dag put --input-encoding cbor', {
        getStdin: function * () {
          yield dagCBOR.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped raw node', async () => {
      const cid = 'bafkreiab2rek7wjiazkfrt3hbnqpljmu24226alszdlh6ivic2abgjubzi'
      ipfs.dag.put.withArgs(Buffer.alloc(10), putOptions({
        format: 'raw'
      })).resolves(new CID(cid))

      const out = await cli('dag put --input-encoding raw --format raw', {
        getStdin: function * () {
          yield Buffer.alloc(10)
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped protobuf node', async () => {
      const cid = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      ipfs.dag.put.withArgs(dagPB.util.deserialize(dagPB.util.serialize({})), putOptions({
        format: 'dag-pb',
        version: 0
      })).resolves(new CID(cid))

      const out = await cli('dag put --input-encoding protobuf --format protobuf', {
        getStdin: function * () {
          yield dagPB.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts protobuf node as json', async () => {
      const cid = 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
      ipfs.dag.put.withArgs({ Links: [] }, putOptions({
        format: 'dag-pb',
        version: 0
      })).resolves(new CID(cid))

      const out = await cli('dag put --format protobuf \'{"Links":[]}\'', {
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped protobuf node with cid-v1', async () => {
      const cid = 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku'
      ipfs.dag.put.withArgs(dagPB.util.deserialize(dagPB.util.serialize({})), putOptions({
        format: 'dag-pb',
        version: 1
      })).resolves(new CID(cid))

      const out = await cli('dag put --input-encoding protobuf --format protobuf --cid-version=1', {
        getStdin: function * () {
          yield dagPB.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts json string with esoteric hashing algorithm', async () => {
      const cid = 'bafy4lzacausjadzcia'
      ipfs.dag.put.withArgs({}, putOptions({
        hashAlg: 'blake2s-40'
      })).resolves(new CID(cid))

      const out = await cli('dag put --hash-alg blake2s-40 "{}"', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts json string with cid base', async () => {
      const cid = 'bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua'
      ipfs.dag.put.withArgs({}, putOptions()).resolves(new CID(cid))

      const out = await cli('dag put --cid-base base64 "{}"', { ipfs })
      expect(out).to.equal('mAXESIMGaeX+h/VkM0uW0LRz18kbim5FoTi+HQEuB3DRcelag\n')
    })

    it('pins node after putting', async () => {
      const cid = 'bafy4lzacausjadzcia'
      ipfs.dag.put.withArgs({ hello: 'world' }, putOptions({
        pin: true
      })).resolves(new CID(cid))

      const out = await cli('dag put --pin \'{"hello":"world"}\'', { ipfs })

      expect(out).to.equal(`${cid}\n`)
    })
  })
})
