/* eslint-env mocha */
'use strict'

const { fixtures } = require('../files/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.ls', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should ls with a base58 encoded CID', function (done) {
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

      ipfs.files.add(dirs, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-folder')
        expect(root.hash).to.equal(fixtures.directory.cid)

        const cid = 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP'
        ipfs.ls(cid, (err, files) => {
          expect(err).to.not.exist()

          expect(files).to.eql([
            { depth: 1,
              name: 'alice.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
              size: 11696,
              hash: 'QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi',
              type: 'file' },
            { depth: 1,
              name: 'empty-folder',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder',
              size: 4,
              hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
              type: 'dir' },
            { depth: 1,
              name: 'files',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files',
              size: 183,
              hash: 'QmZ25UfTqXGz9RsEJFg7HUAuBcmfx5dQZDXQd2QEZ8Kj74',
              type: 'dir' },
            { depth: 1,
              name: 'holmes.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt',
              size: 582072,
              hash: 'QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr',
              type: 'file' },
            { depth: 1,
              name: 'jungle.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt',
              size: 2305,
              hash: 'QmT6orWioMiSqXXPGsUi71CKRRUmJ8YkuueV2DPV34E9y9',
              type: 'file' },
            { depth: 1,
              name: 'pp.txt',
              path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt',
              size: 4551,
              hash: 'QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn',
              type: 'file' }
          ])
          done()
        })
      })
    })

    it('should correctly handle a non existing hash', (done) => {
      ipfs.ls('surelynotavalidhashheh?', (err, res) => {
        expect(err).to.exist()
        expect(res).to.not.exist()
        done()
      })
    })

    it('should correctly handle a non exiting path', (done) => {
      ipfs.ls('QmRNjDeKStKGTQXnJ2NFqeQ9oW/folder_that_isnt_there', (err, res) => {
        expect(err).to.exist()
        expect(res).to.not.exist()
        done()
      })
    })
  })
}
