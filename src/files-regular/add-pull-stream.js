/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const pull = require('pull-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const pullToPromise = require('pull-to-promise')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should add pull stream of valid files and dirs', async function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const files = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const stream = ipfs.addPullStream()

      const filesAdded = await pullToPromise.any(pull(pull.values(files), stream))
      const testFolderIndex = filesAdded.length - 1

      expect(filesAdded).to.have.nested.property(`[${testFolderIndex}].path`, 'test-folder')
      expect(filesAdded).to.have.nested.property(`[${testFolderIndex}].hash`, fixtures.directory.cid)
    })

    it('should add with object chunks and pull stream content', async () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'
      const data = [{ content: pull.values([Buffer.from('test')]) }]
      const stream = ipfs.addPullStream()

      const res = await pullToPromise.any(pull(pull.values(data), stream))
      expect(res).to.have.property('length', 1)
      expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
    })
  })
}
