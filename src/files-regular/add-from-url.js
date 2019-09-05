/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')
const parallel = require('async/parallel')
const { echoUrl, redirectUrl } = require('../utils/echo-http-server')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromURL', function () {
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

    it('should add from a HTTP URL', (done) => {
      const text = `TEST${Date.now()}`
      const url = echoUrl(text)
      parallel({
        result: (cb) => ipfs.addFromURL(url, cb),
        expectedResult: (cb) => ipfs.add(Buffer.from(text), cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result[0].hash).to.equal(expectedResult[0].hash)
        expect(result[0].size).to.equal(expectedResult[0].size)
        expect(result[0].path).to.equal(text)
        done()
      })
    })

    it('should add from a HTTP URL with redirection', (done) => {
      const text = `TEST${Date.now()}`
      const url = echoUrl(text) + '?foo=bar#buzz'

      parallel({
        result: (cb) => ipfs.addFromURL(redirectUrl(url), cb),
        expectedResult: (cb) => ipfs.add(Buffer.from(text), cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result[0].hash).to.equal(expectedResult[0].hash)
        expect(result[0].size).to.equal(expectedResult[0].size)
        expect(result[0].path).to.equal(text)
        done()
      })
    })

    it('should add from a URL with only-hash=true', (done) => {
      const text = `TEST${Date.now()}`
      const url = echoUrl(text)
      ipfs.addFromURL(url, { onlyHash: true }, (err, res) => {
        expect(err).to.not.exist()

        // A successful object.get for this size data took my laptop ~14ms
        let didTimeout = false
        const timeoutId = setTimeout(() => {
          didTimeout = true
          done()
        }, 500)

        ipfs.object.get(res[0].hash, () => {
          clearTimeout(timeoutId)
          if (didTimeout) return
          expect(new Error('did not timeout')).to.not.exist()
        })
      })
    })

    it('should add from a URL with wrap-with-directory=true', (done) => {
      const filename = `TEST${Date.now()}.txt` // also acts as data
      const url = echoUrl(filename) + '?foo=bar#buzz'
      const addOpts = { wrapWithDirectory: true }
      parallel({
        result: (cb) => ipfs.addFromURL(url, addOpts, cb),
        expectedResult: (cb) => ipfs.add([{ path: filename, content: Buffer.from(filename) }], addOpts, cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result).to.deep.equal(expectedResult)
        done()
      })
    })

    it('should add from a URL with wrap-with-directory=true and URL-escaped file name', (done) => {
      const filename = `320px-Domažlice,_Jiráskova_43_(${Date.now()}).jpg` // also acts as data
      const url = echoUrl(filename) + '?foo=bar#buzz'
      const addOpts = { wrapWithDirectory: true }
      parallel({
        result: (cb) => ipfs.addFromURL(url, addOpts, cb),
        expectedResult: (cb) => ipfs.add([{ path: filename, content: Buffer.from(filename) }], addOpts, cb)
      }, (err, { result, expectedResult }) => {
        expect(err).to.not.exist()
        expect(result.err).to.not.exist()
        expect(expectedResult.err).to.not.exist()
        expect(result).to.deep.equal(expectedResult)
        done()
      })
    })

    it('should not add from an invalid url', (done) => {
      ipfs.addFromURL('http://invalid', (err, result) => {
        expect(err).to.exist()
        expect(result).to.not.exist()
        done()
      })
    })
  })
}
