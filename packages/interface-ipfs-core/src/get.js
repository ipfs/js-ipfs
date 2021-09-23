/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fixtures } from './utils/index.js'
import { CID } from 'multiformats/cid'
import all from 'it-all'
import drain from 'it-drain'
import last from 'it-last'
import map from 'it-map'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from './utils/mocha.js'
import testTimeout from './utils/test-timeout.js'
import { importer } from 'ipfs-unixfs-importer'
import blockstore from './utils/blockstore-adapter.js'
import { extract } from 'it-tar'
import { pipe } from 'it-pipe'
import toBuffer from 'it-to-buffer'
import Pako from 'pako'

/**
 * @param {string} name
 * @param {string} [path]
 */
const content = (name, path) => {
  if (!path) {
    path = name
  }

  return {
    path: `test-folder/${path}`,
    content: fixtures.directory.files[name]
  }
}

/**
 * @param {string} name
 */
const emptyDir = (name) => ({ path: `test-folder/${name}` })

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testGet (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.get', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    /**
     * @param {AsyncIterable<Uint8Array>} source
     */
    async function * gzipped (source) {
      const inflator = new Pako.Inflate()

      for await (const buf of source) {
        inflator.push(buf, false)
      }

      inflator.push(new Uint8Array(0), true)

      if (inflator.err) {
        throw new Error(`Error ungzipping - message: "${inflator.msg}" code: ${inflator.err}`)
      }

      if (inflator.result instanceof Uint8Array) {
        yield inflator.result
      } else {
        throw new Error('Unexpected gzip data type')
      }
    }

    /**
     * @param {AsyncIterable<Uint8Array>} source
     */
    async function * tarballed (source) {
      yield * pipe(
        source,
        extract(),
        async function * (source) {
          for await (const entry of source) {
            yield {
              ...entry,
              body: await toBuffer(map(entry.body, (buf) => buf.slice()))
            }
          }
        }
      )
    }

    /**
     * @template T
     * @param {AsyncIterable<T>} source
     */
    async function collect (source) {
      return all(source)
    }

    before(async () => {
      ipfs = (await factory.spawn()).api

      await Promise.all([
        all(importer({ content: fixtures.smallFile.data }, blockstore(ipfs))),
        all(importer({ content: fixtures.bigFile.data }, blockstore(ipfs)))
      ])
    })

    after(() => factory.clean())

    it('should respect timeout option when getting files', () => {
      return testTimeout(() => drain(ipfs.get(CID.parse('QmPDqvcuA4AkhBLBuh2y49yhUB98rCnxPxa3eVNC1kAbS1'), {
        timeout: 1
      })))
    })

    it('should get with a base58 encoded multihash', async () => {
      const output = await pipe(
        ipfs.get(fixtures.smallFile.cid),
        tarballed,
        collect
      )
      expect(output).to.have.lengthOf(1)
      expect(output).to.have.nested.property('[0].header.name', fixtures.smallFile.cid.toString())
      expect(output).to.have.nested.property('[0].body').that.equalBytes(fixtures.smallFile.data)
    })

    it('should get a file added as CIDv0 with a CIDv1', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)
      const res = await all(importer({ content: input }, blockstore(ipfs)))

      const cidv0 = res[0].cid
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const output = await pipe(
        ipfs.get(cidv1),
        tarballed,
        collect
      )
      expect(output).to.have.lengthOf(1)
      expect(output).to.have.nested.property('[0].header.name', cidv1.toString())
      expect(output).to.have.nested.property('[0].body').that.equalBytes(input)
    })

    it('should get a file added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)
      const res = await all(importer({ content: input }, blockstore(ipfs), { cidVersion: 1, rawLeaves: false }))

      const cidv1 = res[0].cid
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const output = await pipe(
        ipfs.get(cidv0),
        tarballed,
        collect
      )
      expect(output).to.have.lengthOf(1)
      expect(output).to.have.nested.property('[0].header.name', cidv0.toString())
      expect(output).to.have.nested.property('[0].body').that.equalBytes(input)
    })

    it('should get a file added as CIDv1 with rawLeaves', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)
      const res = await all(importer({ content: input }, blockstore(ipfs), { cidVersion: 1, rawLeaves: true }))

      const cidv1 = res[0].cid
      expect(cidv1.version).to.equal(1)

      const output = await pipe(
        ipfs.get(cidv1),
        tarballed,
        collect
      )
      expect(output).to.have.lengthOf(1)
      expect(output).to.have.nested.property('[0].header.name', cidv1.toString())
      expect(output).to.have.nested.property('[0].body').that.equalBytes(input)
    })

    it('should get a BIG file', async () => {
      const output = await pipe(
        ipfs.get(fixtures.bigFile.cid),
        tarballed,
        collect
      )
      expect(output).to.have.lengthOf(1)
      expect(output).to.have.nested.property('[0].header.name', fixtures.bigFile.cid.toString())
      expect(output).to.have.nested.property('[0].body').that.equalBytes(fixtures.bigFile.data)
    })

    it('should get a directory', async function () {
      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const res = await all(importer(dirs, blockstore(ipfs)))
      const { cid } = res[res.length - 1]
      expect(`${cid}`).to.equal(fixtures.directory.cid.toString())
      const output = await pipe(
        ipfs.get(cid),
        tarballed,
        collect
      )

      // Check paths
      const paths = output.map((file) => { return file.header.name })
      expect(paths).to.include.members([
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/empty',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/hello.txt',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/ipfs.txt',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt',
        'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt'
      ])

      // Check contents
      expect(output.map(f => uint8ArrayToString(f.body))).to.include.members([
        fixtures.directory.files['alice.txt'].toString(),
        fixtures.directory.files['files/hello.txt'].toString(),
        fixtures.directory.files['files/ipfs.txt'].toString(),
        fixtures.directory.files['holmes.txt'].toString(),
        fixtures.directory.files['jungle.txt'].toString(),
        fixtures.directory.files['pp.txt'].toString()
      ])
    })

    it('should get a nested directory', async function () {
      const dirs = [
        content('pp.txt', 'pp.txt'),
        content('holmes.txt', 'foo/holmes.txt'),
        content('jungle.txt', 'foo/bar/jungle.txt')
      ]

      const res = await all(importer(dirs, blockstore(ipfs)))
      const { cid } = res[res.length - 1]
      expect(`${cid}`).to.equal('QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g')
      const output = await pipe(
        ipfs.get(cid),
        tarballed,
        collect
      )

      // Check paths
      expect(output.map((file) => { return file.header.name })).to.include.members([
        'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g',
        'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/pp.txt',
        'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/foo/holmes.txt',
        'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/foo/bar/jungle.txt'
      ])

      // Check contents
      expect(output.map(f => uint8ArrayToString(f.body))).to.include.members([
        fixtures.directory.files['pp.txt'].toString(),
        fixtures.directory.files['holmes.txt'].toString(),
        fixtures.directory.files['jungle.txt'].toString()
      ])
    })

    it('should get with ipfs path, as object and nested value', async () => {
      const file = {
        path: 'a/testfile.txt',
        content: fixtures.smallFile.data
      }

      const fileAdded = await last(importer([file], blockstore(ipfs)))

      if (!fileAdded) {
        throw new Error('No file was added')
      }

      expect(fileAdded).to.have.property('path', 'a')

      const output = await pipe(
        ipfs.get(`/ipfs/${fileAdded.cid}/testfile.txt`),
        tarballed,
        collect
      )
      expect(output).to.be.length(1)

      expect(uint8ArrayToString(output[0].body)).to.equal('Plz add me!\n')
    })

    it('should compress a file directly', async () => {
      const output = await pipe(
        ipfs.get(fixtures.smallFile.cid, {
          compress: true,
          compressionLevel: 5
        }),
        gzipped,
        collect
      )
      expect(uint8ArrayConcat(output)).to.equalBytes(fixtures.smallFile.data)
    })

    it('should compress a file as a tarball', async () => {
      const output = await pipe(
        ipfs.get(fixtures.smallFile.cid, {
          archive: true,
          compress: true,
          compressionLevel: 5
        }),
        gzipped,
        tarballed,
        collect
      )
      expect(output).to.have.nested.property('[0].body').that.equalBytes(fixtures.smallFile.data)
    })

    it('should not compress a directory', async () => {
      const dirs = [
        content('pp.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt')
      ]

      const res = await all(importer(dirs, blockstore(ipfs)))
      const { cid } = res[res.length - 1]

      await expect(drain(ipfs.get(cid, {
        compress: true,
        compressionLevel: 5
      }))).to.eventually.be.rejectedWith(/file is not regular/)
    })

    it('should compress a file with invalid compression level', async () => {
      await expect(drain(ipfs.get(fixtures.smallFile.cid, {
        compress: true,
        compressionLevel: 10
      }))).to.eventually.be.rejected()
    })

    it('should compress a directory as a tarball', async () => {
      const dirs = [
        content('pp.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt')
      ]

      const res = await all(importer(dirs, blockstore(ipfs)))
      const { cid } = res[res.length - 1]
      const output = await pipe(
        ipfs.get(cid, {
          archive: true,
          compress: true,
          compressionLevel: 5
        }),
        gzipped,
        tarballed,
        collect
      )

      // Check paths
      const paths = output.map((file) => { return file.header.name })
      expect(paths).to.include.members([
        'QmXpbhYKheGs5sopefFjsABsjr363QkRaJT4miRsN88ABU',
        'QmXpbhYKheGs5sopefFjsABsjr363QkRaJT4miRsN88ABU/empty-folder',
        'QmXpbhYKheGs5sopefFjsABsjr363QkRaJT4miRsN88ABU/files/hello.txt',
        'QmXpbhYKheGs5sopefFjsABsjr363QkRaJT4miRsN88ABU/pp.txt'
      ])

      // Check contents
      expect(output.map(f => uint8ArrayToString(f.body))).to.include.members([
        fixtures.directory.files['files/hello.txt'].toString(),
        fixtures.directory.files['pp.txt'].toString()
      ])
    })

    it('should error on invalid key', async () => {
      const invalidCid = 'somethingNotMultihash'

      await expect(all(ipfs.get(invalidCid))).to.eventually.be.rejected()
    })

    it('get path containing "+"s', async () => {
      const filename = 'ti,c64x+mega++mod-pic.txt'
      const subdir = 'tmp/c++files'
      const expectedCid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
      const path = `${subdir}/${filename}`
      const files = await all(ipfs.addAll([{
        path,
        content: path
      }]))

      expect(files[2].cid.toString()).to.equal(expectedCid)

      const cid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'

      const output = await pipe(
        ipfs.get(CID.parse(cid)),
        tarballed,
        collect
      )

      expect(output).to.be.an('array').with.lengthOf(3)
      expect(output).to.have.nested.property('[0].header.name', cid)
      expect(output).to.have.nested.property('[1].header.name', `${cid}/c++files`)
      expect(output).to.have.nested.property('[2].header.name', `${cid}/c++files/ti,c64x+mega++mod-pic.txt`)
    })
  })
}
