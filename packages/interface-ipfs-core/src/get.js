/* eslint-env mocha */
'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayConcat = require('uint8arrays/concat')
const { fixtures } = require('./utils')
const { CID } = require('multiformats/cid')
const all = require('it-all')
const drain = require('it-drain')
const last = require('it-last')
const map = require('it-map')
const { getDescribe, getIt, expect } = require('./utils/mocha')
const testTimeout = require('./utils/test-timeout')
const { importer } = require('ipfs-unixfs-importer')
const blockstore = require('./utils/blockstore-adapter')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.get', function () {
    this.timeout(120 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
      await drain(importer([{ content: fixtures.smallFile.data }], blockstore(ipfs)))
      await drain(importer([{ content: fixtures.bigFile.data }], blockstore(ipfs)))
    })

    after(() => common.clean())

    it('should respect timeout option when getting files', () => {
      return testTimeout(() => drain(ipfs.get(CID.parse('QmPDqvcuA4AkhBLBuh2y49yhUB98rCnxPxa3eVNC1kAbS1'), {
        timeout: 1
      })))
    })

    it('should get with a base58 encoded multihash', async () => {
      const files = await all(ipfs.get(fixtures.smallFile.cid))
      expect(files).to.be.length(1)
      expect(files[0].path).to.eql(fixtures.smallFile.cid.toString())
      expect(uint8ArrayToString(uint8ArrayConcat(await all(files[0].content)))).to.contain('Plz add me!')
    })

    it('should get a file added as CIDv0 with a CIDv1', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: input }], blockstore(ipfs)))

      const cidv0 = res[0].cid
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const output = await all(ipfs.get(cidv1))
      expect(uint8ArrayConcat(await all(output[0].content))).to.eql(input)
    })

    it('should get a file added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: input }], blockstore(ipfs), { cidVersion: 1, rawLeaves: false }))

      const cidv1 = res[0].cid
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const output = await all(ipfs.get(cidv0))
      expect(uint8ArrayConcat(await all(output[0].content))).to.eql(input)
    })

    it('should get a file added as CIDv1 with rawLeaves', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: input }], blockstore(ipfs), { cidVersion: 1, rawLeaves: true }))

      const cidv1 = res[0].cid
      expect(cidv1.version).to.equal(1)

      const output = await all(ipfs.get(cidv1))
      expect(output[0].type).to.eql('file')
      expect(uint8ArrayConcat(await all(output[0].content))).to.eql(input)
    })

    it('should get a BIG file', async () => {
      for await (const file of ipfs.get(fixtures.bigFile.cid)) {
        expect(file.path).to.equal(fixtures.bigFile.cid.toString())
        const content = uint8ArrayConcat(await all(file.content))
        expect(content.length).to.eql(fixtures.bigFile.data.length)
        expect(content.slice()).to.eql(fixtures.bigFile.data)
      }
    })

    it('should get a directory', async function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

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
      const root = res[res.length - 1]

      expect(root.path).to.equal('test-folder')
      expect(root.cid.toString()).to.equal(fixtures.directory.cid.toString())

      let files = await all((async function * () {
        for await (let { path, content } of ipfs.get(fixtures.directory.cid)) {
          content = content ? uint8ArrayToString(uint8ArrayConcat(await all(content))) : null
          yield { path, content }
        }
      })())

      files = files.sort((a, b) => {
        if (a.path > b.path) return 1
        if (a.path < b.path) return -1
        return 0
      })

      // Check paths
      const paths = files.map((file) => { return file.path })
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
      expect(files.map(f => f.content)).to.include.members([
        fixtures.directory.files['alice.txt'].toString(),
        fixtures.directory.files['files/hello.txt'].toString(),
        fixtures.directory.files['files/ipfs.txt'].toString(),
        fixtures.directory.files['holmes.txt'].toString(),
        fixtures.directory.files['jungle.txt'].toString(),
        fixtures.directory.files['pp.txt'].toString()
      ])
    })

    it('should get a nested directory', async function () {
      const content = (name, path) => ({
        path: `test-folder/${path}`,
        content: fixtures.directory.files[name]
      })

      const dirs = [
        content('pp.txt', 'pp.txt'),
        content('holmes.txt', 'foo/holmes.txt'),
        content('jungle.txt', 'foo/bar/jungle.txt')
      ]

      const res = await all(importer(dirs, blockstore(ipfs)))
      const root = res[res.length - 1]
      expect(root.path).to.equal('test-folder')
      expect(root.cid.toString()).to.equal('QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g')

      let files = await all(
        map(ipfs.get(root.cid), async ({ path, content }) => {
          content = content ? uint8ArrayToString(uint8ArrayConcat(await all(content))) : null
          return { path, content }
        })
      )

      files = files.sort((a, b) => {
        if (a.path > b.path) return 1
        if (a.path < b.path) return -1
        return 0
      })

      // Check paths
      const paths = files.map((file) => { return file.path })
      expect(paths).to.include.members([
        'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g',
        'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/pp.txt',
        'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/foo/holmes.txt',
        'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/foo/bar/jungle.txt'
      ])

      // Check contents
      expect(files.map(f => f.content)).to.include.members([
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
      expect(fileAdded).to.have.property('path', 'a')

      const files = await all(ipfs.get(`/ipfs/${fileAdded.cid}/testfile.txt`))
      expect(files).to.be.length(1)
      expect(uint8ArrayToString(uint8ArrayConcat(await all(files[0].content)))).to.contain('Plz add me!')
    })

    it('should error on invalid key', async () => {
      const invalidCid = 'somethingNotMultihash'

      const err = await expect(all(ipfs.get(invalidCid))).to.eventually.be.rejected()

      switch (err.toString()) {
        case 'Error: invalid ipfs ref path':
          expect(err.toString()).to.contain('Error: invalid ipfs ref path')
          break
        case 'Error: Invalid Key':
          expect(err.toString()).to.contain('Error: Invalid Key')
          break
        default:
          break
      }
    })
  })
}
