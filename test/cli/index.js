/* eslint-env mocha */
'use strict'

const fs = require('fs')
const ncp = require('ncp').ncp
const expect = require('chai').expect
const path = require('path')
const clean = require('../utils/clean')

describe('cli', () => {
  const repoExample = path.join(__dirname, '../go-ipfs-repo')
  const repoTests = exports.repoPath = path.join(__dirname, '../repo-tests-async/cli')

  before((done) => {
    clean(repoTests)
    ncp(repoExample, repoTests, (err) => {
      expect(err).to.not.exist

      done()
    })
  })

  after(() => {
    clean(repoTests)
  })

  describe('--all', () => {
    const tests = fs.readdirSync(__dirname)
    tests.filter((file) => {
      if (file === 'index.js' || file === 'api.js') {
        return false
      } else {
        return true
      }
    }).forEach((file) => {
      require('./' + file)
    })
  })
})
