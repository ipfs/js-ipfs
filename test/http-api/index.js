/* eslint-env mocha */
'use strict'

const fs = require('fs')
const expect = require('chai').expect
const Api = require('../../src/http-api')
const ncp = require('ncp').ncp
const path = require('path')
const clean = require('../utils/clean')

describe('HTTP API', () => {
  const repoExample = path.join(__dirname, '../go-ipfs-repo')
  const repoTests = path.join(__dirname, '../repo-tests-run-http')

  let http = {}

  before((done) => {
    http.api = new Api(repoTests)

    clean(repoTests)
    ncp(repoExample, repoTests, (err) => {
      expect(err).to.not.exist

      http.api.start((err) => {
        expect(err).to.not.exist
        done()
      })
    })
  })

  after((done) => {
    http.api.stop((err) => {
      expect(err).to.not.exist
      clean(repoTests)
      done()
    })
  })

  describe('## inject', () => {
    const tests = fs.readdirSync(path.join(__dirname, '/inject'))

    tests.filter((file) => {
      return file.match(/test-.*\.js/)
    }).forEach((file) => {
      require('./inject/' + file)(http)
    })
  })

  // it.skip('## ipfs-api + interface-ipfs-core', () => {
  //   const tests = fs.readdirSync(path.join(__dirname, '/ipfs-api'))
  //   tests.filter((file) => {
  //     return file.match(/test-.*\.js/)
  //   }).forEach((file) => {
  //     require('./ipfs-api/' + file)(http)
  //   })
  // })
})
