/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { fixtures } = require('../files-regular/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.ls', function () {
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

    it('should not ls not found file/dir, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.ls(`${testDir}/404`, (err, info) => {
        expect(err).to.exist()
        expect(info).to.not.exist()
        done()
      })
    })

    it('should ls directory', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(`${testDir}/lv1`, { parents: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs.files.ls(testDir, (err, info) => {
          expect(err).to.not.exist()
          expect(info.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
            { name: 'b', type: 0, size: 0, hash: '' },
            { name: 'lv1', type: 0, size: 0, hash: '' }
          ])
          done()
        })
      })
    })

    it('should ls directory with long option', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(`${testDir}/lv1`, { parents: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true }, cb)
      ], (err) => {
        expect(err).to.not.exist()

        ipfs.files.ls(testDir, { long: true }, (err, info) => {
          expect(err).to.not.exist()
          expect(info.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
            {
              name: 'b',
              type: 0,
              size: 13,
              hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T'
            },
            {
              name: 'lv1',
              type: 1,
              size: 0,
              hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
            }
          ])
          done()
        })
      })
    })

    it('should ls from outside of mfs', async () => {
      const testFileName = hat()
      const [{
        hash
      }] = await ipfs.add({ path: `/test/${testFileName}`, content: fixtures.smallFile.data })
      const listing = await ipfs.files.ls('/ipfs/' + hash)
      expect(listing).to.have.length(1)
      expect(listing[0].name).to.equal(hash)
    })

    it('should list an empty directory', async () => {
      const testDir = `/test-${hat()}`
      await ipfs.files.mkdir(testDir)
      const contents = await ipfs.files.ls(testDir)

      expect(contents).to.be.an('array').and.to.be.empty()
    })

    it('should list an file directly', async () => {
      const fileName = `single-file-${hat()}.txt`
      const filePath = `/${fileName}`
      await ipfs.files.write(filePath, Buffer.from('Hello world'), {
        create: true
      })
      const contents = await ipfs.files.ls(filePath)

      expect(contents).to.be.an('array').and.have.lengthOf(1).and.to.deep.equal([{
        hash: '',
        name: fileName,
        size: 0,
        type: 0
      }])
    })
  })
}
