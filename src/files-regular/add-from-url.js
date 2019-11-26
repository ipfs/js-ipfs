/* eslint-env mocha */
'use strict'

const pTimeout = require('p-timeout')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { echoUrl, redirectUrl } = require('../utils/echo-http-server')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromURL', function () {
    this.timeout(60 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

    it('should add from a HTTP URL', async () => {
      const text = `TEST${Date.now()}`
      const url = echoUrl(text)

      const [result, expectedResult] = await Promise.all([
        ipfs.addFromURL(url),
        ipfs.add(Buffer.from(text))
      ])

      expect(result.err).to.not.exist()
      expect(expectedResult.err).to.not.exist()
      expect(result[0].hash).to.equal(expectedResult[0].hash)
      expect(result[0].size).to.equal(expectedResult[0].size)
      expect(result[0].path).to.equal(text)
    })

    it('should add from a HTTP URL with redirection', async () => {
      const text = `TEST${Date.now()}`
      const url = echoUrl(text) + '?foo=bar#buzz'

      const [result, expectedResult] = await Promise.all([
        ipfs.addFromURL(redirectUrl(url)),
        ipfs.add(Buffer.from(text))
      ])

      expect(result.err).to.not.exist()
      expect(expectedResult.err).to.not.exist()
      expect(result[0].hash).to.equal(expectedResult[0].hash)
      expect(result[0].size).to.equal(expectedResult[0].size)
      expect(result[0].path).to.equal(text)
    })

    it('should add from a URL with only-hash=true', async function () {
      const text = `TEST${Date.now()}`
      const url = echoUrl(text)

      const res = await ipfs.addFromURL(url, { onlyHash: true })

      try {
        // A successful object.get for this size data took my laptop ~14ms
        await pTimeout(ipfs.object.get(res[0].hash), 500)
      } catch (err) {
        if (err.name === 'TimeoutError') {
          // This doesn't seem to be the right approach:
          // the test shouldn't be passing when it gets a timeout error
          // but this is pretty the same logic as the previous callback one
          return Promise.resolve()
        }

        throw err
      }
    })

    it('should add from a URL with wrap-with-directory=true', async () => {
      const filename = `TEST${Date.now()}.txt` // also acts as data
      const url = echoUrl(filename) + '?foo=bar#buzz'
      const addOpts = { wrapWithDirectory: true }

      const [result, expectedResult] = await Promise.all([
        ipfs.addFromURL(url, addOpts),
        ipfs.add([{ path: filename, content: Buffer.from(filename) }], addOpts)
      ])
      expect(result.err).to.not.exist()
      expect(expectedResult.err).to.not.exist()
      expect(result).to.deep.equal(expectedResult)
    })

    it('should add from a URL with wrap-with-directory=true and URL-escaped file name', async () => {
      const filename = `320px-Domažlice,_Jiráskova_43_(${Date.now()}).jpg` // also acts as data
      const url = echoUrl(filename) + '?foo=bar#buzz'
      const addOpts = { wrapWithDirectory: true }

      const [result, expectedResult] = await Promise.all([
        ipfs.addFromURL(url, addOpts),
        ipfs.add([{ path: filename, content: Buffer.from(filename) }], addOpts)
      ])

      expect(result.err).to.not.exist()
      expect(expectedResult.err).to.not.exist()
      expect(result).to.deep.equal(expectedResult)
    })

    it('should not add from an invalid url', () => {
      return expect(ipfs.addFromURL('123http://invalid')).to.eventually.be.rejected()
    })
  })
}
