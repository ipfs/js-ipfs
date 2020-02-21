/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('./utils/mocha')
const all = require('it-all')

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

      const res = await all(ipfs.add(dirs))

      const root = res[res.length - 1]
      expect(root.path).to.equal('test-folder')
      expect(root.cid.toString()).to.equal(fixtures.directory.cid)

      const cid = 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'
      const output = await all(ipfs.ls(cid))

      expect(output).to.have.lengthOf(6)
      expect(output[0].depth).to.equal(1)
      expect(output[0].name).to.equal('alice.txt')
      expect(output[0].path).to.equal('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt')
      expect(output[0].size).to.equal(11685)
      expect(output[0].cid.toString()).to.equal('QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi')
      expect(output[0].type).to.equal('file')

      expect(output[1].depth).to.equal(1)
      expect(output[1].name).to.equal('empty-folder')
      expect(output[1].path).to.equal('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder')
      expect(output[1].size).to.equal(0)
      expect(output[1].cid.toString()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      expect(output[1].type).to.equal('dir')

      expect(output[2].depth).to.equal(1)
      expect(output[2].name).to.equal('files')
      expect(output[2].path).to.equal('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files')
      expect(output[2].size).to.equal(0)
      expect(output[2].cid.toString()).to.equal('QmZ25UfTqXGz9RsEJFg7HUAuBcmfx5dQZDXQd2QEZ8Kj74')
      expect(output[2].type).to.equal('dir')

      expect(output[3].depth).to.equal(1)
      expect(output[3].name).to.equal('holmes.txt')
      expect(output[3].path).to.equal('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt')
      expect(output[3].size).to.equal(581878)
      expect(output[3].cid.toString()).to.equal('QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr')
      expect(output[3].type).to.equal('file')

      expect(output[4].depth).to.equal(1)
      expect(output[4].name).to.equal('jungle.txt')
      expect(output[4].path).to.equal('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt')
      expect(output[4].size).to.equal(2294)
      expect(output[4].cid.toString()).to.equal('QmT6orWioMiSqXXPGsUi71CKRRUmJ8YkuueV2DPV34E9y9')
      expect(output[4].type).to.equal('file')

      expect(output[5].depth).to.equal(1)
      expect(output[5].name).to.equal('pp.txt')
      expect(output[5].path).to.equal('QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt')
      expect(output[5].size).to.equal(4540)
      expect(output[5].cid.toString()).to.equal('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn')
      expect(output[5].type).to.equal('file')
    })

    it('should ls files added as CIDv0 with a CIDv1', async () => {
      const dir = randomName('DIR')

      const input = [
        { path: `${dir}/${randomName('F0')}`, content: Buffer.from(randomName('D0')) },
        { path: `${dir}/${randomName('F1')}`, content: Buffer.from(randomName('D1')) }
      ]

      const res = await all(ipfs.add(input, { cidVersion: 0 }))

      const cidv0 = res[res.length - 1].cid
      expect(cidv0.version).to.equal(0)

      const cidv1 = cidv0.toV1()

      const output = await all(ipfs.ls(cidv1))
      expect(output.length).to.equal(input.length)

      output.forEach(({ cid }) => {
        expect(res.find(file => file.cid.toString() === cid.toString())).to.exist()
      })
    })

    it('should ls files added as CIDv1 with a CIDv0', async () => {
      const dir = randomName('DIR')

      const input = [
        { path: `${dir}/${randomName('F0')}`, content: Buffer.from(randomName('D0')) },
        { path: `${dir}/${randomName('F1')}`, content: Buffer.from(randomName('D1')) }
      ]

      const res = await all(ipfs.add(input, { cidVersion: 1, rawLeaves: false }))

      const cidv1 = res[res.length - 1].cid
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV1()

      const output = await all(ipfs.ls(cidv0))
      expect(output.length).to.equal(input.length)

      output.forEach(({ cid }) => {
        expect(res.find(file => file.cid.toString() === cid.toString())).to.exist()
      })
    })

    it('should correctly handle a non existing hash', () => {
      return expect(all(ipfs.ls('surelynotavalidhashheh?'))).to.eventually.be.rejected()
    })

    it('should correctly handle a non existing path', () => {
      return expect(all(ipfs.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW/folder_that_isnt_there'))).to.eventually.be.rejected()
    })

    it('should ls files by path', async () => {
      const dir = randomName('DIR')

      const input = [
        { path: `${dir}/${randomName('F0')}`, content: Buffer.from(randomName('D0')) },
        { path: `${dir}/${randomName('F1')}`, content: Buffer.from(randomName('D1')) }
      ]

      const res = await all(ipfs.add(input))
      const output = await all(ipfs.ls(`/ipfs/${res[res.length - 1].cid}`))
      expect(output.length).to.equal(input.length)

      output.forEach(({ cid }) => {
        expect(res.find(file => file.cid.toString() === cid.toString())).to.exist()
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

      const res = await all(ipfs.add(input))
      const output = await all(ipfs.ls(`/ipfs/${res[res.length - 1].cid}`))

      expect(output).to.have.lengthOf(input.length)
      expect(output[0].mtime).to.deep.equal(expectedMtime)
      expect(output[0].mode).to.equal(expectedMode)
      expect(output[1].mtime).to.deep.equal(expectedMtime)
      expect(output[1].mode).to.equal(expectedMode)
    })
  })
}
