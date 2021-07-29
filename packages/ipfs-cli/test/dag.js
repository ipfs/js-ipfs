/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const cli = require('./utils/cli')
const dagCBOR = require('@ipld/dag-cbor')
const dagPB = require('@ipld/dag-pb')
const sinon = require('sinon')
const { CID } = require('multiformats/cid')
const raw = require('multiformats/codecs/raw')
const { base58btc } = require('multiformats/bases/base58')
const { base64 } = require('multiformats/bases/base64')
const { fromString: uint8ArrayFromString } = require('@vascosantos/uint8arrays/from-string')
const { toString: uint8ArrayToString } = require('@vascosantos/uint8arrays/to-string')
const matchIterable = require('./utils/match-iterable')

describe('dag', () => {
  const dagPbCid = CID.parse('Qmaj2NmcyAXT8dFmZRRytE12wpcaHADzbChKToMEjBsj5Z')
  const rawCid = CID.createV1(raw.code, dagPbCid.multihash)
  const dagCborCid = CID.createV1(dagCBOR.code, dagPbCid.multihash)
  let ipfs

  beforeEach(() => {
    ipfs = {
      dag: {
        get: sinon.stub(),
        resolve: sinon.stub(),
        put: sinon.stub(),
        import: sinon.stub(),
        export: sinon.stub()
      },
      bases: {
        getBase: sinon.stub()
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`dag get ${dagPbCid}`, { ipfs })

      expect(out).to.equal(`{"data":"AAED","links":[{"Name":"foo","Size":10,"Cid":{"/":"${dagCborCid.toString(base58btc)}"}}]}\n`)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`dag get ${dagPbCid} --data-enc base16`, { ipfs })

      expect(out).to.equal(`{"data":"000103","links":[{"Name":"foo","Size":10,"Cid":{"/":"${dagCborCid.toString(base58btc)}"}}]}\n`)
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
      ipfs.bases.getBase.withArgs('base64').returns(base64)

      const out = await cli(`dag get ${dagPbCid} --cid-base base64`, { ipfs })

      expect(out).to.equal(`{"data":"AAED","links":[{"Name":"foo","Size":10,"Cid":{"/":"${dagCborCid.toString(base64)}"}}]}\n`)
    })

    it('should get a dag-cbor node', async () => {
      const result = {
        value: {
          foo: 'bar'
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

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
      ipfs.bases.getBase.withArgs('base64').returns(base64)

      const out = await cli(`dag get ${dagCborCid} --cid-base=base64`, { ipfs })

      expect(out).to.equal(`{"foo":"bar","baz":{"/":"${rawCid.toString(base64)}"}}\n`)
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
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli(`dag get ${dagPbCid}`, { ipfs })

      expect(out).to.equal(`{"links":[{"Name":"foo.txt","Size":9000,"Cid":{"/":"${dagPbCid.toString(base58btc)}"}}]}\n`)
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
        value: dagPbCid
      }])

      const out = await cli(`dag resolve ${dagPbCid}`, { ipfs })
      expect(out).to.equal(`${dagPbCid}\n`)
    })

    it('resolves an ipfs path', async () => {
      ipfs.dag.resolve.withArgs(`/ipfs/${dagPbCid}`, defaultOptions).returns([{
        value: dagPbCid
      }])

      const out = await cli(`dag resolve /ipfs/${dagPbCid}`, { ipfs })
      expect(out).to.equal(`${dagPbCid}\n`)
    })

    it('resolves a cid ref with a timeout', async () => {
      ipfs.dag.resolve.withArgs(dagPbCid.toString(), {
        ...defaultOptions,
        timeout: 1000
      }).returns([{
        value: dagPbCid
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
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(dagCborCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put "{}"', { ipfs })
      expect(out).to.equal(`${dagCborCid.toString(base58btc)}\n`)
    })

    it('puts piped json string', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(dagCborCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put', {
        getStdin: function * () {
          yield Buffer.from('{}')
        },
        ipfs
      })
      expect(out).to.equal(`${dagCborCid.toString(base58btc)}\n`)
    })

    it('puts piped cbor node', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(dagCborCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --input-encoding cbor', {
        getStdin: function * () {
          yield dagCBOR.encode({})
        },
        ipfs
      })
      expect(out).to.equal(`${dagCborCid.toString(base58btc)}\n`)
    })

    it('puts piped raw node', async () => {
      ipfs.dag.put.withArgs(Buffer.alloc(10), {
        ...defaultOptions,
        format: 'raw'
      }).resolves(rawCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --input-encoding raw --format raw', {
        getStdin: function * () {
          yield Buffer.alloc(10)
        },
        ipfs
      })
      expect(out).to.equal(`${rawCid.toString(base58btc)}\n`)
    })

    it('puts piped protobuf node', async () => {
      ipfs.dag.put.withArgs(dagPB.decode(dagPB.encode({ Links: [] })), {
        ...defaultOptions,
        format: 'dag-pb',
        version: 0
      }).resolves(dagPbCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --input-encoding protobuf --format protobuf', {
        getStdin: function * () {
          yield dagPB.encode({ Links: [] })
        },
        ipfs
      })
      expect(out).to.equal(`${dagPbCid.toString(base58btc)}\n`)
    })

    it('puts protobuf node as json', async () => {
      ipfs.dag.put.withArgs({ Links: [] }, {
        ...defaultOptions,
        format: 'dag-pb',
        version: 0
      }).resolves(dagPbCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --format protobuf \'{"Links":[]}\'', {
        ipfs
      })
      expect(out).to.equal(`${dagPbCid.toString(base58btc)}\n`)
    })

    it('puts piped protobuf node with cid-v1', async () => {
      ipfs.dag.put.withArgs(dagPB.decode(dagPB.encode({ Links: [] })), {
        ...defaultOptions,
        format: 'dag-pb',
        version: 1
      }).resolves(dagPbCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --input-encoding protobuf --format protobuf --cid-version=1', {
        getStdin: function * () {
          yield dagPB.encode({ Links: [] })
        },
        ipfs
      })
      expect(out).to.equal(`${dagPbCid.toString(base58btc)}\n`)
    })

    it('puts json string with esoteric hashing algorithm', async () => {
      ipfs.dag.put.withArgs({}, {
        ...defaultOptions,
        hashAlg: 'blake2s-40'
      }).resolves(dagCborCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --hash-alg blake2s-40 "{}"', { ipfs })
      expect(out).to.equal(`${dagCborCid.toString(base58btc)}\n`)
    })

    it('puts json string with cid base', async () => {
      ipfs.dag.put.withArgs({}, defaultOptions).resolves(dagCborCid)
      ipfs.bases.getBase.withArgs('base64').returns(base64)

      const out = await cli('dag put --cid-base base64 "{}"', { ipfs })
      expect(out).to.equal(`${dagCborCid.toV1().toString(base64)}\n`)
    })

    it('pins node after putting', async () => {
      ipfs.dag.put.withArgs({ hello: 'world' }, {
        ...defaultOptions,
        pin: true
      }).resolves(dagCborCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --pin \'{"hello":"world"}\'', { ipfs })

      expect(out).to.equal(`${dagCborCid.toString(base58btc)}\n`)
    })

    it('puts json string with a timeout', async () => {
      ipfs.dag.put.withArgs({}, {
        ...defaultOptions,
        timeout: 1000
      }).resolves(dagCborCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put "{}" --timeout=1s', { ipfs })
      expect(out).to.equal(`${dagCborCid.toString(base58btc)}\n`)
    })
  })

  describe('import', () => {
    const defaultOptions = {
      pinRoots: true,
      timeout: undefined
    }

    it('imports car from stdin', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs([matchIterable()], {
        ...defaultOptions
      }).returns([{ root: { cid, pinErrorMsg: '' } }])
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const proc = cli('dag import', {
        ipfs,
        getStdin: function * () {
          yield uint8ArrayFromString('hello\n')
        }
      })

      const out = await proc
      expect(out).to.equal(`importing CAR from stdin...\npinned root\t${cid}\tsuccess\n`)
    })

    it('imports car from path', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions
      }).returns([{ root: { cid, pinErrorMsg: '' } }])
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const proc = cli('dag import README.md', {
        ipfs
      })

      const out = await proc
      expect(out).to.equal(`pinned root\t${cid}\tsuccess\n`)
    })

    it('imports car from path and fails to pin', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions
      }).returns([{ root: { cid, pinErrorMsg: 'oh noes' } }])
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const proc = cli('dag import README.md', {
        ipfs
      })

      const out = await proc
      expect(out).to.equal(`pinned root\t${cid}\toh noes\n`)
    })

    it('imports car from path with no pin arg', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions,
        pinRoots: false
      }).returns([{ root: { cid, pinErrorMsg: '' } }])
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const proc = cli('dag import README.md --pin-roots=false', {
        ipfs
      })

      const out = await proc
      expect(out).to.equal(`pinned root\t${cid}\tsuccess\n`)
    })

    it('imports car from path with different base', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions
      }).returns([{ root: { cid, pinErrorMsg: '' } }])
      ipfs.bases.getBase.withArgs('derp').returns(base58btc)

      const proc = cli('dag import README.md --cid-base=derp', {
        ipfs
      })

      const out = await proc
      expect(out).to.equal(`pinned root\t${cid}\tsuccess\n`)
    })

    it('imports car from path with timeout', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.import.withArgs(matchIterable(), {
        ...defaultOptions,
        timeout: 1000
      }).returns([{ root: { cid, pinErrorMsg: '' } }])
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const proc = cli('dag import README.md --timeout=1s', {
        ipfs
      })

      const out = await proc
      expect(out).to.equal(`pinned root\t${cid}\tsuccess\n`)
    })
  })

  describe('export', () => {
    const defaultOptions = {
      timeout: undefined
    }

    it('exports car', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.export.withArgs(cid, {
        ...defaultOptions
      }).returns(['some bytes'])

      const proc = cli(`dag export ${cid}`, {
        ipfs
      })

      const out = await proc
      expect(out).to.equal('some bytes')
    })

    it('exports car with timeout', async () => {
      const cid = CID.parse('QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

      ipfs.dag.export.withArgs(cid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(['some bytes'])

      const proc = cli(`dag export ${cid} --timeout=1s`, {
        ipfs
      })

      const out = await proc
      expect(out).to.equal('some bytes')
    })
  })
})
