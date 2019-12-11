/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const bs58 = require('bs58')
const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.get', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
      await ipfs.add(fixtures.smallFile.data)
      await ipfs.add(fixtures.bigFile.data)
    })

    after(() => common.clean())

    it('should get with a base58 encoded multihash', async () => {
      const files = await ipfs.get(fixtures.smallFile.cid)
      expect(files).to.be.length(1)
      expect(files[0].path).to.eql(fixtures.smallFile.cid)
      expect(files[0].content.toString('utf8')).to.contain('Plz add me!')
    })

    it('should get with a Buffer multihash', async () => {
      const cidBuf = Buffer.from(bs58.decode(fixtures.smallFile.cid))

      const files = await ipfs.get(cidBuf)
      expect(files).to.be.length(1)
      expect(files[0].path).to.eql(fixtures.smallFile.cid)
      expect(files[0].content.toString('utf8')).to.contain('Plz add me!')
    })

    it('should get a file added as CIDv0 with a CIDv1', async () => {
      const input = Buffer.from(`TEST${Date.now()}`)

      const res = await ipfs.add(input, { cidVersion: 0 })

      const cidv0 = new CID(res[0].hash)
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const output = await ipfs.get(cidv1)
      expect(output[0].content).to.eql(input)
    })

    it('should get a file added as CIDv1 with a CIDv0', async () => {
      const input = Buffer.from(`TEST${Date.now()}`)

      const res = await ipfs.add(input, { cidVersion: 1, rawLeaves: false })

      const cidv1 = new CID(res[0].hash)
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const output = await ipfs.get(cidv0)
      expect(output[0].content).to.eql(input)
    })

    it('should get a BIG file', async () => {
      const files = await ipfs.get(fixtures.bigFile.cid)
      expect(files.length).to.equal(1)
      expect(files[0].path).to.equal(fixtures.bigFile.cid)
      expect(files[0].content.length).to.eql(fixtures.bigFile.data.length)
      expect(files[0].content).to.eql(fixtures.bigFile.data)
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

      const res = await ipfs.add(dirs)
      const root = res[res.length - 1]

      expect(root.path).to.equal('test-folder')
      expect(root.hash).to.equal(fixtures.directory.cid)

      let files = await ipfs.get(fixtures.directory.cid)

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
      const contents = files.map((file) => {
        return file.content
          ? file.content.toString()
          : null
      })

      expect(contents).to.include.members([
        fixtures.directory.files['alice.txt'].toString(),
        fixtures.directory.files['files/hello.txt'].toString(),
        fixtures.directory.files['files/ipfs.txt'].toString(),
        fixtures.directory.files['holmes.txt'].toString(),
        fixtures.directory.files['jungle.txt'].toString(),
        fixtures.directory.files['pp.txt'].toString()
      ])
    })

    it('should get with ipfs path, as object and nested value', async () => {
      const file = {
        path: 'a/testfile.txt',
        content: fixtures.smallFile.data
      }

      const filesAdded = await ipfs.add(file)

      filesAdded.forEach(async (file) => {
        if (file.path === 'a') {
          const files = await ipfs.get(`/ipfs/${file.hash}/testfile.txt`)
          expect(files).to.be.length(1)
          expect(files[0].content.toString('utf8')).to.contain('Plz add me!')
        }
      })
    })

    it('should get with ipfs path, as array and nested value', async () => {
      const file = {
        path: 'a/testfile.txt',
        content: fixtures.smallFile.data
      }

      const filesAdded = await ipfs.add([file])

      filesAdded.forEach(async (file) => {
        if (file.path === 'a') {
          const files = await ipfs.get(`/ipfs/${file.hash}/testfile.txt`)
          expect(files).to.be.length(1)
          expect(files[0].content.toString('utf8')).to.contain('Plz add me!')
        }
      })
    })

    it('should error on invalid key', async () => {
      const invalidCid = 'somethingNotMultihash'

      const err = await expect(ipfs.get(invalidCid)).to.be.rejected()

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
