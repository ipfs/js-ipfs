/* eslint-env mocha */

import { expect } from 'aegir/utils/chai.js'
import { cli } from './utils/cli.js'
import * as dagCBOR from '@ipld/dag-cbor'
import * as dagPB from '@ipld/dag-pb'
import sinon from 'sinon'
import { CID } from 'multiformats/cid'
import * as raw from 'multiformats/codecs/raw'
import { base58btc } from 'multiformats/bases/base58'
import { base64 } from 'multiformats/bases/base64'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { matchIterable } from './utils/match-iterable.js'

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

      const out = await cli(`dag get ${rawCid} --output-codec raw --data-enc base16`, { ipfs })

      expect(out).to.equal(uint8ArrayToString(result.value, 'base16'))
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

      expect(out).to.equal(`{"Data":{"/":{"bytes":"AAED"}},"Links":[{"Hash":{"/":"${dagCborCid.toString()}"},"Name":"foo","Tsize":10}]}`)
    })

    it('should get a dag-pb node as dag-pb', async () => {
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

      const out = await cli(`dag get ${dagPbCid} --output-codec dag-pb`, { ipfs, raw: true })

      expect(out).to.deep.equal(Buffer.from('122d0a2401711220b80784f97f67ad80d52575d643044ffb37b20f8d4db32ae59e47b1ac68df20e01203666f6f180a0a03000103', 'hex'))
    })

    it('should get a dag-pb node as dag-cbor', async () => {
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

      const out = await cli(`dag get ${dagPbCid} --output-codec dag-cbor`, { ipfs, raw: true })

      expect(out).to.deep.equal(Buffer.from('a2644461746143000103654c696e6b7381a36448617368d82a58250001711220b80784f97f67ad80d52575d643044ffb37b20f8d4db32ae59e47b1ac68df20e0644e616d6563666f6f655473697a650a', 'hex'))
    })

    it('should fail to get a non bytes node with "raw"', async () => {
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

      const out = await cli(`dag get ${dagPbCid} --output-codec raw --data-enc base16`, { ipfs })

      expect(out).to.equal('dag get cannot print a non-bytes node as "raw"\n')
    })

    it('should get a bytes node of a non-bytes block with "raw"', async () => {
      // in this instance we're pretending to path into a 'Data' property of a dag-pb block
      const result = {
        value: Buffer.from([0, 1, 3])
      }

      ipfs.dag.get.withArgs(dagPbCid, { ...defaultOptions, path: '/Data' }).returns(result)

      const out = await cli(`dag get ${dagPbCid}/Data --output-codec raw --data-enc base16`, { ipfs })

      expect(out).to.equal('000103')
    })

    it('should get raw bytes without data encoding', async () => {
      // in this instance we're pretending to path into a 'Data' property of a dag-pb block
      const result = {
        value: Buffer.from([0, 1, 3])
      }

      ipfs.dag.get.withArgs(rawCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${rawCid} --output-codec raw`, { ipfs })

      expect(out).to.equal(Buffer.from([0, 1, 3]).toString())
    })

    it('should get a dag-cbor node', async () => {
      const result = {
        value: {
          foo: 'bar'
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('{"foo":"bar"}')
    })

    it('should get a dag-cbor node as dag-cbor', async () => {
      const result = {
        value: {
          foo: 'bar'
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid} --output-codec dag-cbor`, { ipfs, raw: true })

      expect(out).to.deep.equal(Buffer.from('a163666f6f63626172', 'hex'))
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

      expect(out).to.equal(`{"baz":{"/":"${dagPbCid}"},"foo":"bar"}`)
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

      const out = await cli(`dag get ${rawCid}${path} --output-codec raw --data-enc base16`, { ipfs })

      expect(out).to.be.eql(uint8ArrayToString(result.value, 'base16'))
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

      const out = await cli(`dag get /ipfs/${rawCid}${path} --output-codec raw --data-enc base16`, { ipfs })

      expect(out).to.be.eql(uint8ArrayToString(result.value, 'base16'))
    })

    it('should get a node with local resolve', async () => {
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(rawCid, {
        ...defaultOptions,
        localResolve: true
      }).returns(result)

      const out = await cli(`dag get ${rawCid} --local-resolve --output-codec raw --data-enc base16`, { ipfs })

      expect(out).to.include('resolving path within the node only\n')
      expect(out).to.include('remainder path: n/a\n')
      expect(out).to.include(uint8ArrayToString(result.value, 'base16'))
    })

    it('should get a node with a timeout', async () => {
      const result = {
        value: uint8ArrayFromString('hello world')
      }

      ipfs.dag.get.withArgs(rawCid, {
        ...defaultOptions,
        timeout: 1000
      }).returns(result)

      const out = await cli(`dag get ${rawCid} --timeout=1s --output-codec raw --data-enc base16`, { ipfs })

      expect(out).to.be.eql(uint8ArrayToString(result.value, 'base16'))
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

      expect(out).to.equal(`{"Links":[{"Hash":{"/":"${dagPbCid.toString(base58btc)}"},"Name":"foo\\b\\n\\t.txt","Tsize":9000}]}`)
    })

    it('should not strip control characters from dag-cbor nodes', async () => {
      const result = {
        value: {
          'lo\nl': 'ok\t'
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('{"lo\\nl":"ok\\t"}')
    })

    it('should not strip control characters from dag-cbor string nodes', async () => {
      const result = {
        value: 'lo\nl'
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('"lo\\nl"')
    })

    it('should not strip control characters from dag-cbor array nodes', async () => {
      const result = {
        value: ['lo\nl']
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('["lo\\nl"]')
    })

    it('should not strip control characters from dag-cbor nested array nodes', async () => {
      const result = {
        value: {
          'lo\nl': ['ok\t']
        }
      }

      ipfs.dag.get.withArgs(dagCborCid, defaultOptions).returns(result)

      const out = await cli(`dag get ${dagCborCid}`, { ipfs })

      expect(out).to.equal('{"lo\\nl":["ok\\t"]}')
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
      storeCodec: 'dag-cbor',
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

      const out = await cli('dag put --input-codec dag-cbor', {
        getStdin: function * () {
          yield dagCBOR.encode({})
        },
        ipfs
      })
      expect(out).to.equal(`${dagCborCid.toString(base58btc)}\n`)
    })

    it('puts piped raw node', async () => {
      ipfs.dag.put.withArgs(new Uint8Array(10), {
        ...defaultOptions,
        storeCodec: 'raw'
      }).resolves(rawCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --input-codec raw --store-codec raw', {
        getStdin: function * () {
          yield Buffer.alloc(10)
        },
        ipfs
      })
      expect(out).to.equal(`${rawCid.toString(base58btc)}\n`)
    })

    it('puts piped dag-pb node', async () => {
      ipfs.dag.put.withArgs(dagPB.decode(dagPB.encode({ Links: [] })), {
        ...defaultOptions,
        storeCodec: 'dag-pb',
        version: 0
      }).resolves(dagPbCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --input-codec dag-pb --store-codec dag-pb', {
        getStdin: function * () {
          yield dagPB.encode({ Links: [] })
        },
        ipfs
      })
      expect(out).to.equal(`${dagPbCid.toString(base58btc)}\n`)
    })

    it('puts dag-pb node as dag-json', async () => {
      ipfs.dag.put.withArgs({ Links: [] }, {
        ...defaultOptions,
        storeCodec: 'dag-pb',
        version: 0
      }).resolves(dagPbCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --store-codec dag-pb --input-codec dag-json \'{"Links":[]}\'', {
        ipfs
      })
      expect(out).to.equal(`${dagPbCid.toString(base58btc)}\n`)
    })

    it('puts piped dag-pb node with cid-v1', async () => {
      ipfs.dag.put.withArgs(dagPB.decode(dagPB.encode({ Links: [] })), {
        ...defaultOptions,
        storeCodec: 'dag-pb',
        version: 1
      }).resolves(dagPbCid)
      ipfs.bases.getBase.withArgs('base58btc').returns(base58btc)

      const out = await cli('dag put --input-codec dag-pb --store-codec dag-pb --cid-version=1', {
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
