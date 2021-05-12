/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('./utils/cli')
const dagCBOR = require('ipld-dag-cbor')
const dagPB = require('ipld-dag-pb')
const sinon = require('sinon')
const CID = require('cids')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')

describe('dag', () => {
  const dagPbCid = new CID('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
  const rawCid = new CID(1, 'raw', dagPbCid.multihash)
  const dagCborCid = new CID(1, 'dag-cbor', dagPbCid.multihash)
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

    it('should get a raw node', async () => {
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(rawCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${rawCid} --data-enc base16`, { ipfs })

      expect(out).to.equal(uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should get a dag-pb node', async () => {
      const result = {
        value: {
          Data: Buffer.from([0, 1, 3]),
          Links: [{
            Hash: dagCborCid,
            Name: 'foo',
            Tsize: 10
          }]
        }
      }

      ipfs.dag.get.withArgs(dagPbCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagPbCid}`, { ipfs })

      expect(out).to.equal(`{"data":"AAED","links":[{"Name":"foo","Size":10,"Cid":{"/":"${dagCborCid.toString()}"}}]}\n`)
    })

    it('should get a dag-pb node and specify data encoding', async () => {
      const result = {
        value: {
          Data: Buffer.from([0, 1, 3]),
          Links: [{
            Hash: dagCborCid,
            Name: 'foo',
            Tsize: 10
          }]
        }
      }

      ipfs.dag.get.withArgs(dagPbCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagPbCid} --data-enc base16`, { ipfs })

      expect(out).to.equal(`{"data":"000103","links":[{"Name":"foo","Size":10,"Cid":{"/":"${dagCborCid.toString()}"}}]}\n`)
    })

    it('should get a dag-pb node and specify CID encoding', async () => {
      const result = {
        value: {
          Data: Buffer.from([0, 1, 3]),
          Links: [{
            Hash: dagCborCid,
            Name: 'foo',
            Tsize: 10
          }]
        }
      }

      ipfs.dag.get.withArgs(dagPbCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagPbCid} --cid-base base16`, { ipfs })

      expect(out).to.equal(`{"data":"AAED","links":[{"Name":"foo","Size":10,"Cid":{"/":"${dagCborCid.toString('base16')}"}}]}\n`)
    })

    it('should get a dag-cbor node', async () => {
      const result = {
        value: {
          foo: 'bar'
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('{"foo":"bar"}\n')
    })

    it('should get a dag-cbor node with a nested CID', async () => {
      const result = {
        value: {
          foo: 'bar',
          baz: dagPbCid
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal(`{"foo":"bar","baz":{"/":"${dagPbCid}"}}\n`)
    })

    it('should get a dag-cbor node with a nested CID and change the encoding', async () => {
      const result = {
        value: {
          foo: 'bar',
          baz: rawCid
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid} --cid-base=base64`, { ipfs })

      expect(out).to.equal(`{"foo":"bar","baz":{"/":"${rawCid.toString('base64')}"}}\n`)
    })

    it('should get a node with a deep path', async () => {
      const path = '/parentHash'
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(rawCid, {
        ...defaultOptions,
        path
      }).returns(result)

      const out = await cli(`dag get ${rawCid}${path} --data-enc base16`, { ipfs })

      expect(out).to.be.eql(uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should get a node with a deep path and an ipfs prefix', async () => {
      const path = '/parentHash'
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(rawCid, {
        ...defaultOptions,
        path
      }).returns(result)

      const out = await cli(`dag get /ipfs/${rawCid}${path} --data-enc base16`, { ipfs })

      expect(out).to.be.eql(uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should get a node with local resolve', async () => {
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(rawCid, {
        ...defaultOptions,
        localResolve: true
      }).returns(result)

      const out = await cli(`dag get ${rawCid} --local-resolve --data-enc base16`, { ipfs })

      expect(out).to.include('resolving path within the node only\n')
      expect(out).to.include('remainder path: n/a\n')
      expect(out).to.include(uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should get a node with a timeout', async () => {
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(rawCid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(result)

      const out = await cli(`dag get ${rawCid} --timeout=1s --data-enc base16`, { ipfs })

      expect(out).to.be.eql(uint8ArrayToString(result.value, 'base16') + '\n')
    })

    it('should strip control characters from dag-pb nodes', async () => {
      const result = {
        value: {
          Links: [{
            Hash: dagPbCid,
            Name: 'foo\b\n\t.txt',
            Tsize: 9000
          }]
        }
      }

      ipfs.dag.get.withArgs(dagPbCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagPbCid}`, { ipfs })

      expect(out).to.equal(`{"links":[{"Name":"foo.txt","Size":9000,"Cid":{"/":"${dagPbCid}"}}]}\n`)
    })

    it('should strip control characters from dag-cbor nodes', async () => {
      const result = {
        value: {
          'lo\nl': 'ok\t'
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('{"lol":"ok"}\n')
    })

    it('should strip control characters from dag-cbor string nodes', async () => {
      const result = {
        value: 'lo\nl'
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('"lol"\n')
    })

    it('should strip control characters from dag-cbor array nodes', async () => {
      const result = {
        value: ['lo\nl']
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('["lol"]\n')
    })

    it('should strip control characters from dag-cbor nested array nodes', async () => {
      const result = {
        value: {
          'lo\nl': ['ok\t']
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('{"lol":["ok"]}\n')
    })
  })

  describe('resolve', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('resolves a cid ref', async () => {
      ipfs.dag.resolve.withArgs(dagPbCid.toString(), defaultOptions).returns([{
        value: new CID(dagPbCid)
      }])

      const out = await cli(`dag resolve ${dagPbCid}`, { ipfs })
      expect(out).to.equal(`${dagPbCid}\n`)
    })

    it('resolves an ipfs path', async () => {
      ipfs.dag.resolve.withArgs(`/ipfs/${dagPbCid}`, defaultOptions).returns([{
        value: new CID(dagPbCid)
      }])

      const out = await cli(`dag resolve /ipfs/${dagPbCid}`, { ipfs })
      expect(out).to.equal(`${dagPbCid}\n`)
    })

    it('resolves a cid ref with a timeout', async () => {
      ipfs.dag.resolve.withArgs(dagPbCid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        value: new CID(dagPbCid)
      }])

      const out = await cli(`dag resolve ${dagPbCid} --timeout=1s`, { ipfs })
      expect(out).to.equal(`${dagPbCid}\n`)
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
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(new CID(dagCborCid))

      const out = await cli('dag put "{}"', { ipfs })
      expect(out).to.equal(`${dagCborCid}\n`)
    })

    it('puts piped json string', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(new CID(dagCborCid))

      const out = await cli('dag put', {
        getStdin: function * () {
          yield Buffer.from('{}')
        },
        ipfs
      })
      expect(out).to.equal(`${dagCborCid}\n`)
    })

    it('puts piped cbor node', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(new CID(dagCborCid))

      const out = await cli('dag put --input-encoding cbor', {
        getStdin: function * () {
          yield dagCBOR.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${dagCborCid}\n`)
    })

    it('puts piped raw node', async () => {
      ipfs.dag.put.withArgs(Buffer.alloc(10), {
        ...defaultOptions,
        format: 'raw'
      }).resolves(new CID(rawCid))

      const out = await cli('dag put --input-encoding raw --format raw', {
        getStdin: function * () {
          yield Buffer.alloc(10)
        },
        ipfs
      })
      expect(out).to.equal(`${rawCid}\n`)
    })

    it('puts piped protobuf node', async () => {
      ipfs.dag.put.withArgs(dagPB.util.deserialize(dagPB.util.serialize({})), {
        ...defaultOptions,
        format: 'dag-pb',
        version: 0
      }).resolves(new CID(dagPbCid))

      const out = await cli('dag put --input-encoding protobuf --format protobuf', {
        getStdin: function * () {
          yield dagPB.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${dagPbCid}\n`)
    })

    it('puts protobuf node as json', async () => {
      ipfs.dag.put.withArgs({ Links: [] }, {
        ...defaultOptions,
        format: 'dag-pb',
        version: 0
      }).resolves(new CID(dagPbCid))

      const out = await cli('dag put --format protobuf \'{"Links":[]}\'', {
        ipfs
      })
      expect(out).to.equal(`${dagPbCid}\n`)
    })

    it('puts piped protobuf node with cid-v1', async () => {
      ipfs.dag.put.withArgs(dagPB.util.deserialize(dagPB.util.serialize({})), {
        ...defaultOptions,
        format: 'dag-pb',
        version: 1
      }).resolves(new CID(dagPbCid))

      const out = await cli('dag put --input-encoding protobuf --format protobuf --cid-version=1', {
        getStdin: function * () {
          yield dagPB.util.serialize({})
        },
        ipfs
      })
      expect(out).to.equal(`${dagPbCid}\n`)
    })

    it('puts json string with esoteric hashing algorithm', async () => {
      ipfs.dag.put.withArgs({}, {
        ...defaultOptions,
        hashAlg: 'blake2s-40'
      }).resolves(new CID(dagCborCid))

      const out = await cli('dag put --hash-alg blake2s-40 "{}"', { ipfs })
      expect(out).to.equal(`${dagCborCid}\n`)
    })

    it('puts json string with cid base', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(dagCborCid)

      const out = await cli('dag put --cid-base base64 "{}"', { ipfs })
      expect(out).to.equal(`${dagCborCid.toV1().toString('base64')}\n`)
    })

    it('pins node after putting', async () => {
      ipfs.dag.put.withArgs({ hello: 'world' }, {
        ...defaultOptions,
        pin: true
      }).resolves(new CID(dagCborCid))

      const out = await cli('dag put --pin \'{"hello":"world"}\'', { ipfs })

      expect(out).to.equal(`${dagCborCid}\n`)
    })

    it('puts json string with a timeout', async () => {
      ipfs.dag.put.withArgs({}, {
        ...defaultOptions,
        timeout: 1000
      }).resolves(new CID(dagCborCid))

      const out = await cli('dag put "{}" --timeout=1s', { ipfs })
      expect(out).to.equal(`${dagCborCid}\n`)
    })
  })
})
