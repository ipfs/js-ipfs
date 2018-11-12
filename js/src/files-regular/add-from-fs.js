/* eslint-env mocha */
'use strict'

const path = require('path')
const expectTimeout = require('../utils/expect-timeout')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const fs = require('fs')
const os = require('os')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromFs', function () {
    this.timeout(40 * 1000)

    const fixturesPath = path.join(__dirname, '../../test/fixtures')
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

    it('should add a directory from the file system', (done) => {
      const filesPath = path.join(fixturesPath, 'test-folder')
      ipfs.addFromFs(filesPath, { recursive: true }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.above(8)
        done()
      })
    })

    it('should add a directory from the file system with an odd name', (done) => {
      const filesPath = path.join(fixturesPath, 'weird name folder [v0]')
      ipfs.addFromFs(filesPath, { recursive: true }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.above(8)
        done()
      })
    })

    it('should ignore a directory from the file system', (done) => {
      const filesPath = path.join(fixturesPath, 'test-folder')
      ipfs.addFromFs(filesPath, { recursive: true, ignore: ['files/**'] }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.below(9)
        done()
      })
    })

    it('should add a file from the file system', (done) => {
      const filePath = path.join(fixturesPath, 'testfile.txt')
      ipfs.addFromFs(filePath, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.equal(1)
        expect(result[0].path).to.equal('testfile.txt')
        done()
      })
    })

    it('should add a hidden file in a directory from the file system', (done) => {
      const filesPath = path.join(fixturesPath, 'hidden-files-folder')
      ipfs.addFromFs(filesPath, { recursive: true, hidden: true }, (err, result) => {
        expect(err).to.not.exist()
        expect(result.length).to.be.above(10)
        expect(result.map(object => object.path)).to.include('hidden-files-folder/.hiddenTest.txt')
        expect(result.map(object => object.hash)).to.include('QmdbAjVmLRdpFyi8FFvjPfhTGB2cVXvWLuK7Sbt38HXrtt')
        done()
      })
    })

    it('should add a file from the file system with only-hash=true', function () {
      this.slow(10 * 1000)

      const content = String(Math.random() + Date.now())
      const filepath = path.join(os.tmpdir(), `${content}.txt`)
      fs.writeFileSync(filepath, content)

      return ipfs.addFromFs(filepath, { onlyHash: true })
        .then(out => {
          fs.unlinkSync(filepath)
          return expectTimeout(ipfs.object.get(out[0].hash), 4000)
        })
    })
  })
}
