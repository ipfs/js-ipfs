/* eslint-env mocha */
'use strict'

const fs = require('fs')
const ncp = require('ncp').ncp
const expect = require('chai').expect
const path = require('path')
const clean = require('../../utils/clean')

describe('--node only', () => {
  const repoExample = path.join(__dirname, '../../go-ipfs-repo')
  const repoTests = require('../../utils/repo-path')

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

  const tests = fs.readdirSync(__dirname)
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
