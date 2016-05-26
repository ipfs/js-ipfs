/* eslint-env mocha */
'use strict'

const ncp = require('ncp').ncp
const expect = require('chai').expect
const path = require('path')
const clean = require('../utils/clean')

describe('core', () => {
  const repoExample = path.join(__dirname, '../go-ipfs-repo')
  const repoTests = require('../utils/repo-path')

  before((done) => {
    clean(repoTests)
    ncp(repoExample, repoTests, (err) => {
      expect(err).to.equal(null)
      done()
    })
  })

  after(() => {
    clean(repoTests)
  })
  require('./both')
  require('./node-only')
})
