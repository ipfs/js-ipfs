/* eslint-env mocha */
'use strict'

const fs = require('fs')
const expect = require('chai').expect
const api = require('../../src/http-api')
const ncp = require('ncp').ncp
const path = require('path')
const fsStore = require('fs-blob-store')
const IPFSRepo = require('ipfs-repo')
const clean = require('../utils/clean')

describe('http api', () => {
  const repoExample = path.join(__dirname, '../go-ipfs-repo')
  const repoTests = path.join(__dirname, '../repo-tests-run-http')
  process.env.IPFS_PATH = repoTests

  before((done) => {
    clean(repoTests)
    ncp(repoExample, repoTests, (err) => {
      expect(err).to.not.exist

      api.start(repoTests, (err) => {
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
      if (file === 'index.js') {
        return false
      } else {
        return true
      }
    }).forEach((file) => {
      require('./' + file)
    })
  })
})
