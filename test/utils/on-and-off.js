/* eslint-env mocha */
'use strict'

const HTTPAPI = require('../../src/http-api')

function off (repoPath, tests) {
  describe('daemon off (directly to core)', () => tests())
}

function on (repoPath, tests) {
  describe('daemon on (through http-api)', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HTTPAPI(repoPath)
      httpAPI.start(done)
    })

    after((done) => httpAPI.stop(done))

    tests()
  })
}

/*
 * CLI Utility to run the tests offline (daemon off) and online (daemon on)
 */
exports = module.exports = (repoPath, tests) => {
  off(repoPath, tests)
  on(repoPath, tests)
}

exports.off = off
exports.on = on
