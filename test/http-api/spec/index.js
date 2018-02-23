/* eslint-env mocha */
'use strict'

const fs = require('fs')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const hat = require('hat')
const API = require('../../../src/http/index')
const ncp = require('ncp').ncp
const path = require('path')
const clean = require('../../utils/clean')

describe('HTTP API', () => {
  const repoExample = path.join(__dirname, '../../fixtures/go-ipfs-repo')
  const repoTests = path.join(__dirname, '../../repo-tests-run')

  let http = {}

  const startHttpAPI = (cb) => {
    const options = {
      pass: hat(),
      enablePubsubExperiment: true
    }
    http.api = new API(repoTests, null, options)

    ncp(repoExample, repoTests, (err) => {
      if (err) {
        return cb(err)
      }

      http.api.start(false, (err) => {
        if (err) {
          return cb(err)
        }
        cb(null, http)
      })
    })
  }

  before(function (done) {
    this.timeout(60 * 1000)
    startHttpAPI((err, _http) => {
      if (err) {
        throw err
      }
      http = _http
      done()
    })
  })

  after((done) => http.api.stop((err) => {
    expect(err).to.not.exist()
    clean(repoTests)
    done()
  }))

  describe('## http-api spec tests', () => {
    fs.readdirSync(path.join(__dirname))
      .forEach((file) => file !== 'index.js' && require(`./${file}`)(http))
  })
})
