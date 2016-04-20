/* eslint-env mocha */
'use strict'

const fs = require('fs')
const ncp = require('ncp').ncp
const expect = require('chai').expect
const path = require('path')
const clean = require('../utils/clean')

describe('core', () => {
  const repoExample = path.join(__dirname, '../go-ipfs-repo')
  const repoTests = path.join(__dirname, '../repo-tests-run')

  before((done) => {
    clean(repoTests)
    ncp(repoExample, repoTests, (err) => {
      process.env.IPFS_PATH = repoTests
      expect(err).to.equal(null)
      done()
    })
  })

  after(() => {
    clean(repoTests)
  })

  describe('--all', () => {
    const tests = fs.readdirSync(__dirname)
    tests.filter((file) => {
      if (file === 'index.js' ||
          file.endsWith('browser.js')) {
        return false
      } else {
        return true
      }
    }).forEach((file) => {
      require('./' + file)
    })
  })
})
