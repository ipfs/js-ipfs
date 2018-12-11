/* eslint-env mocha */
'use strict'

const fs = require('fs')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const hat = require('hat')
const API = require('../../src/http/index')
const ncp = require('ncp').ncp
const path = require('path')
const clean = require('../utils/clean')

describe('HTTP API', () => {
  const repoExample = path.join(__dirname, '../fixtures/go-ipfs-repo')
  const repoTests = path.join(__dirname, '../repo-tests-run')

  // bootstrap nodes get the set up too slow and gets timed out
  const testsForCustomConfig = ['dht.js', 'name.js', 'ping.js']

  let http = {}

  const startHttpAPI = (config, cb) => {
    const options = {
      pass: hat(),
      enablePubsubExperiment: true
    }
    http.api = new API(repoTests, config, options)

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

  describe('custom config', () => {
    const config = {
      Bootstrap: [],
      Discovery: {
        MDNS: {
          Enabled: false
        },
        webRTCStar: {
          Enabled: false
        }
      }
    }

    before(function (done) {
      this.timeout(60 * 1000)
      startHttpAPI(config, (err, _http) => {
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
      fs.readdirSync(path.join(`${__dirname}/inject/`))
        .forEach((file) => testsForCustomConfig.includes(file) && require(`./inject/${file}`)(http))
    })
  })

  describe('default config', () => {
    before(function (done) {
      this.timeout(60 * 1000)
      startHttpAPI(null, (err, _http) => {
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
      fs.readdirSync(path.join(`${__dirname}/inject/`))
        .forEach((file) => !testsForCustomConfig.includes(file) && require(`./inject/${file}`)(http))
    })
  })
})
