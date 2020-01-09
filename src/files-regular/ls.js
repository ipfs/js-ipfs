/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const CID = require('cids')

const randomName = prefix => `${prefix}${Math.round(Math.random() * 1000)}`

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.ls', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should ls with a base58 encoded CID', async function () {
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

      const cid = 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'
      const output = await ipfs.ls(cid)

      expect(output).to.have.lengthOf(6)
      expect(output).to.have.nested.property('[0].depth', 1)
      expect(output).to.have.nested.property('[0].name', 'alice.txt')
      expect(output).to.have.nested.property('[0].path', 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt')
      expect(output).to.have.nested.property('[0].size', 11685)
      expect(output).to.have.nested.property('[0].type', 'file')

      expect(output).to.have.nested.property('[1].depth', 1)
      expect(output).to.have.nested.property('[1].name', 'empty-folder')
      expect(output).to.have.nested.property('[1].path', 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder')
      expect(output).to.have.nested.property('[1].size', 0)
      expect(output).to.have.nested.property('[1].hash', 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      expect(output).to.have.nested.property('[1].type', 'dir')

      expect(output).to.have.nested.property('[2].depth', 1)
      expect(output).to.have.nested.property('[2].name', 'files')
      expect(output).to.have.nested.property('[2].path', 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files')
      expect(output).to.have.nested.property('[2].size', 0)
      expect(output).to.have.nested.property('[2].hash', 'QmZ25UfTqXGz9RsEJFg7HUAuBcmfx5dQZDXQd2QEZ8Kj74')
      expect(output).to.have.nested.property('[2].type', 'dir')

      expect(output).to.have.nested.property('[3].depth', 1)
      expect(output).to.have.nested.property('[3].name', 'holmes.txt')
      expect(output).to.have.nested.property('[3].path', 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt')
      expect(output).to.have.nested.property('[3].size', 581878)
      expect(output).to.have.nested.property('[3].hash', 'QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr')
      expect(output).to.have.nested.property('[3].type', 'file')

      expect(output).to.have.nested.property('[4].depth', 1)
      expect(output).to.have.nested.property('[4].name', 'jungle.txt')
      expect(output).to.have.nested.property('[4].path', 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt')
      expect(output).to.have.nested.property('[4].size', 2294)
      expect(output).to.have.nested.property('[4].hash', 'QmT6orWioMiSqXXPGsUi71CKRRUmJ8YkuueV2DPV34E9y9')
      expect(output).to.have.nested.property('[4].type', 'file')

      expect(output).to.have.nested.property('[5].depth', 1)
      expect(output).to.have.nested.property('[5].name', 'pp.txt')
      expect(output).to.have.nested.property('[5].path', 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt')
      expect(output).to.have.nested.property('[5].size', 4540)
      expect(output).to.have.nested.property('[5].hash', 'QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn')
      expect(output).to.have.nested.property('[5].type', 'file')
    })

    it('should ls files added as CIDv0 with a CIDv1', async () => {
      const dir = randomName('DIR')

      const input = [
        { path: `${dir}/${randomName('F0')}`, content: Buffer.from(randomName('D0')) },
        { path: `${dir}/${randomName('F1')}`, content: Buffer.from(randomName('D1')) }
      ]

      const res = await ipfs.add(input, { cidVersion: 0 })

      const cidv0 = new CID(res[res.length - 1].hash)
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const output = await ipfs.ls(cidv1)
      expect(output.length).to.equal(input.length)

      output.forEach(({ hash }) => {
        expect(res.find(file => file.hash === hash)).to.exist()
      })
    })

    it('should ls files added as CIDv1 with a CIDv0', async () => {
      const dir = randomName('DIR')

      const input = [
        { path: `${dir}/${randomName('F0')}`, content: Buffer.from(randomName('D0')) },
        { path: `${dir}/${randomName('F1')}`, content: Buffer.from(randomName('D1')) }
      ]

      const res = await ipfs.add(input, { cidVersion: 1, rawLeaves: false })

      const cidv1 = new CID(res[res.length - 1].hash)
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV1()

      const output = await ipfs.ls(cidv0)
      expect(output.length).to.equal(input.length)

      output.forEach(({ hash }) => {
        expect(res.find(file => file.hash === hash)).to.exist()
      })
    })

    it('should correctly handle a non existing hash', () => {
      return expect(ipfs.ls('surelynotavalidhashheh?')).to.eventually.be.rejected()
    })

    it('should correctly handle a non existing path', () => {
      return expect(ipfs.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW/folder_that_isnt_there')).to.eventually.be.rejected()
    })

    it('should ls files by path', async () => {
      const dir = randomName('DIR')

      const input = [
        { path: `${dir}/${randomName('F0')}`, content: Buffer.from(randomName('D0')) },
        { path: `${dir}/${randomName('F1')}`, content: Buffer.from(randomName('D1')) }
      ]

      const res = await ipfs.add(input)
      const output = await ipfs.ls(`/ipfs/${res[res.length - 1].hash}`)
      expect(output.length).to.equal(input.length)

      output.forEach(({ hash }) => {
        expect(res.find(file => file.hash === hash)).to.exist()
      })
    })

    it('should ls with metadata', async () => {
      const dir = randomName('DIR')
      const mtime = new Date()
      const mode = '0532'
      const expectedMode = parseInt(mode, 8)
      const expectedMtime = {
        secs: Math.floor(mtime.getTime() / 1000),
        nsecs: (mtime.getTime() - (Math.floor(mtime.getTime() / 1000) * 1000)) * 1000
      }

      const input = [
        { path: `${dir}/${randomName('F0')}`, content: Buffer.from(randomName('D0')), mode, mtime },
        { path: `${dir}/${randomName('F1')}`, content: Buffer.from(randomName('D1')), mode, mtime }
      ]

      const res = await ipfs.add(input)
      const output = await ipfs.ls(`/ipfs/${res[res.length - 1].hash}`)

      expect(output).to.have.lengthOf(input.length)
      expect(output).to.have.nested.deep.property('[0].mtime', expectedMtime)
      expect(output).to.have.nested.property('[0].mode', expectedMode)
      expect(output).to.have.nested.deep.property('[1].mtime', expectedMtime)
      expect(output).to.have.nested.property('[1].mode', expectedMode)
    })
  })
}
