/* eslint-env mocha */
'use strict'

const fs = require('fs')
const expect = require('chai').expect
const Api = require('../../src/http-api')
const ncp = require('ncp').ncp
const path = require('path')
const clean = require('../utils/clean')

describe('http api', () => {
  const repoExample = path.join(__dirname, '../go-ipfs-repo')
  const repoTests = exports.repoPath = path.join(__dirname, '../repo-tests-run-http')
  const api = new Api(repoTests)

  before((done) => {
    clean(repoTests)
    ncp(repoExample, repoTests, (err) => {
      expect(err).to.not.exist

      api.start((err) => {
        expect(err).to.not.exist
        done()
      })
    })
  })

  after((done) => {
    api.stop((err) => {
      expect(err).to.not.exist

      clean(repoTests)
      done()
    })
  })

  describe('--all', () => {
    var tests = fs.readdirSync(__dirname)
    tests.filter((file) => {
      return file.match(/test-.*\.js/)
    }).forEach((file) => {
      require('./' + file)(api)
    })
  })
})
