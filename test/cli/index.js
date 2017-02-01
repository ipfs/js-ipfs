/* eslint-env mocha */
'use strict'

const fs = require('fs')
const ncp = require('ncp').ncp
const path = require('path')
const clean = require('../utils/clean')

describe('cli', () => {
  const repoExample = path.join(__dirname, '../test-data/go-ipfs-repo')
  const repoTests = exports.repoPath = path.join(__dirname, '../repo-tests-run')

  before((done) => {
    clean(repoTests)
    ncp(repoExample, repoTests, done)
  })

  after(() => clean(repoTests))

  describe('--all', () => {
    fs.readdirSync(__dirname)
      .filter((file) => file !== 'index.js')
      .forEach((file) => require('./' + file))
  })
})
