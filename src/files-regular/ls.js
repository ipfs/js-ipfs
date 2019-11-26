/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const CID = require('cids')

const randomName = prefix => `${prefix}${Math.round(Math.random() * 1000)}`

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.ls', function () {
    this.timeout(60 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

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
      const files = await ipfs.ls(cid)

      expect(files).to.eql([
        {
          depth: 1,
          name: 'alice.txt',
          path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
          size: 11685,
          hash: 'QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi',
          type: 'file'
        },
        {
          depth: 1,
          name: 'empty-folder',
          path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder',
          size: 0,
          hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
          type: 'dir'
        },
        {
          depth: 1,
          name: 'files',
          path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files',
          size: 0,
          hash: 'QmZ25UfTqXGz9RsEJFg7HUAuBcmfx5dQZDXQd2QEZ8Kj74',
          type: 'dir'
        },
        {
          depth: 1,
          name: 'holmes.txt',
          path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt',
          size: 581878,
          hash: 'QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr',
          type: 'file'
        },
        {
          depth: 1,
          name: 'jungle.txt',
          path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt',
          size: 2294,
          hash: 'QmT6orWioMiSqXXPGsUi71CKRRUmJ8YkuueV2DPV34E9y9',
          type: 'file'
        },
        {
          depth: 1,
          name: 'pp.txt',
          path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt',
          size: 4540,
          hash: 'QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn',
          type: 'file'
        }
      ])
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
  })
}
