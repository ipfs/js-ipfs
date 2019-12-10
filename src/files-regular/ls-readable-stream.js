/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const getStream = require('get-stream')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.lsReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should readable stream ls with a base58 encoded CID', async function () {
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
      const stream = ipfs.lsReadableStream(cid)

      const files = await getStream.array(stream)
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
  })
}
