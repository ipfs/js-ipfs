/* eslint-env mocha */
'use strict'

const HttpAPI = require('../../src/http-api')

module.exports = function onlineAndOffline (repoPath, tests) {
  describe('api offline', () => {
    tests()
  })

  describe('api running', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HttpAPI(repoPath)
      httpAPI.start(done)
    })

    after((done) => {
      httpAPI.stop(done)
    })

    tests()
  })
}
