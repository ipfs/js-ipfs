/* eslint-env mocha */

const fs = require('fs')
const expect = require('chai').expect
const api = require('../../src/http-api')
const ncp = require('ncp').ncp
const rimraf = require('rimraf')

describe('http api', () => {
  const repoExample = process.cwd() + '/tests/repo-example'
  const repoTests = process.cwd() + '/tests/repo-tests-run'
  process.env.IPFS_PATH = repoTests

  before((done) => {
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
      rimraf(repoTests, (err) => {
        expect(err).to.not.exist
        done()
      })
    })
  })

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
