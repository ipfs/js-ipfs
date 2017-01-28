/* eslint-env mocha */
'use strict'

const HTTPAPI = require('../../src/http-api')

/*
 * CLI Utility to run the tests offline (daemon off) and online (daemon on)
 */
module.exports = (repoPath, tests) => {
  describe('with daemon off (requiring js-ipfs core directly)', () => tests())

  describe('with daemon on (contacting js-ipfs through http-api)', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HTTPAPI(repoPath)
      httpAPI.start(done)
    })

    after((done) => httpAPI.stop(done))

    tests()
  })
}
