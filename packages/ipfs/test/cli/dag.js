/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('../utils/cli')
const dagCBOR = require('ipld-dag-cbor')
const dagPB = require('ipld-dag-pb')
const sinon = require('sinon')
const CID = require('cids')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')

describe('dag', () => {
  const cid = new CID('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
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
    const defaultOptions = {
      localResolve: false,
      timeout: undefined,
      path: undefined
    }

    it('should get a node', async () => {
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(cid, defaultOptions).returns(result)

      const out = await cli(`dag get ${cid}`, { ipfs })

      expect(out).to.be.eql('0x' + uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should get a node with a deep path', async () => {
      const path = '/parentHash'
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(cid, {
        ...defaultOptions,
        path
      }).returns(result)

      const out = await cli(`dag get ${cid}${path}`, { ipfs })

      expect(out).to.be.eql('0x' + uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should get a node with a deep path and an ipfs prefix', async () => {
      const path = '/parentHash'
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(cid, {
        ...defaultOptions,
        path
      }).returns(result)

      const out = await cli(`dag get /ipfs/${cid}${path}`, { ipfs })

      expect(out).to.be.eql('0x' + uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should get a node with local resolve', async () => {
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(cid, {
        ...defaultOptions,
        localResolve: true
      }).returns(result)

      const out = await cli(`dag get ${cid} --local-resolve`, { ipfs })

      expect(out).to.include('resolving path within the node only\n')
      expect(out).to.include('remainder path: n/a\n')
      expect(out).to.include('0x' + uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should get a node with a timeout', async () => {
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(result)

      const out = await cli(`dag get ${cid} --timeout=1s`, { ipfs })

      expect(out).to.be.eql('0x' + uint8ArrayToString(result.value, 'base16') + '\n')
    })
  })

  describe('resolve', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('resolves a cid ref', async () => {
      ipfs.dag.resolve.withArgs(cid.toString(), defaultOptions).returns([{
        value: new CID(cid)
      }])

      const out = await cli(`dag resolve ${cid}`, { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('resolves an ipfs path', async () => {
      ipfs.dag.resolve.withArgs(`/ipfs/${cid}`, defaultOptions).returns([{
        value: new CID(cid)
      }])

      const out = await cli(`dag resolve /ipfs/${cid}`, { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('resolves a cid ref with a timeout', async () => {
      ipfs.dag.resolve.withArgs(cid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        value: new CID(cid)
      }])

      const out = await cli(`dag resolve ${cid} --timeout=1s`, { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })
  })

  describe('put', () => {
    const defaultOptions = {
      format: 'dag-cbor',
      hashAlg: 'sha2-256',
      version: 1,
      onlyHash: false,
      preload: true,
      pin: true,
      timeout: undefined
    }

    it('puts json string', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(new CID(cid))

      const out = await cli('dag put "{}"', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped json string', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(new CID(cid))

      const out = await cli('dag put', {
        getStdin: function * () {
          yield uint8ArrayFromString('{}')
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped cbor node', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(new CID(cid))

      const out = await cli('dag put --input-encoding cbor', {
        getStdin: function * () {
          yield dagCBOR.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped raw node', async () => {
      ipfs.dag.put.withArgs(Buffer.alloc(10), {
        ...defaultOptions,
        format: 'raw'
      }).resolves(new CID(cid))

      const out = await cli('dag put --input-encoding raw --format raw', {
        getStdin: function * () {
          yield Buffer.alloc(10)
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped protobuf node', async () => {
      ipfs.dag.put.withArgs(dagPB.util.deserialize(dagPB.util.serialize({})), {
        ...defaultOptions,
        format: 'dag-pb',
        version: 0
      }).resolves(new CID(cid))

      const out = await cli('dag put --input-encoding protobuf --format protobuf', {
        getStdin: function * () {
          yield dagPB.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts protobuf node as json', async () => {
      ipfs.dag.put.withArgs({ Links: [] }, {
        ...defaultOptions,
        format: 'dag-pb',
        version: 0
      }).resolves(new CID(cid))

      const out = await cli('dag put --format protobuf \'{"Links":[]}\'', {
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts piped protobuf node with cid-v1', async () => {
      ipfs.dag.put.withArgs(dagPB.util.deserialize(dagPB.util.serialize({})), {
        ...defaultOptions,
        format: 'dag-pb',
        version: 1
      }).resolves(new CID(cid))

      const out = await cli('dag put --input-encoding protobuf --format protobuf --cid-version=1', {
        getStdin: function * () {
          yield dagPB.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts json string with esoteric hashing algorithm', async () => {
      ipfs.dag.put.withArgs({}, {
        ...defaultOptions,
        hashAlg: 'blake2s-40'
      }).resolves(new CID(cid))

      const out = await cli('dag put --hash-alg blake2s-40 "{}"', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })

    it('puts json string with cid base', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(cid)

      const out = await cli('dag put --cid-base base64 "{}"', { ipfs })
      expect(out).to.equal(`${cid.toV1().toString('base64')}\n`)
    })

    it('pins node after putting', async () => {
      ipfs.dag.put.withArgs({ hello: 'world' }, {
        ...defaultOptions,
        pin: true
      }).resolves(new CID(cid))

      const out = await cli('dag put --pin \'{"hello":"world"}\'', { ipfs })

      expect(out).to.equal(`${cid}\n`)
    })

    it('puts json string with a timeout', async () => {
      ipfs.dag.put.withArgs({}, {
        ...defaultOptions,
        timeout: 1000
      }).resolves(new CID(cid))

      const out = await cli('dag put "{}" --timeout=1s', { ipfs })
      expect(out).to.equal(`${cid}\n`)
    })
  })
})
