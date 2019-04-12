/* eslint-env mocha */
'use strict'

const fs = require('fs')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)
const hat = require('hat')
const Daemon = require('../../src/cli/daemon')
const promisify = require('promisify-es6')
const ncp = promisify(require('ncp').ncp)
const path = require('path')
const clean = require('../utils/clean')

describe('HTTP API', () => {
  const repoExample = path.join(__dirname, '../fixtures/go-ipfs-repo')
  const repoTests = path.join(__dirname, '../repo-tests-run')

  // bootstrap nodes get the set up too slow and gets timed out
  const testsForCustomConfig = ['dht.js', 'files.js', 'name.js', 'pin.js', 'ping.js']

  let http = {}

  const startHttpAPI = async (config) => {
    http.api = new Daemon({
      repo: repoTests,
      pass: hat(),
      config,
      EXPERIMENTAL: {
        pubsub: true
      }
    })
    await ncp(repoExample, repoTests)
    await http.api.start()
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

    before(async function () {
      this.timeout(60 * 1000)

      await startHttpAPI(config)
    })

    after(async function () {
      this.timeout(50 * 1000)

      await http.api.stop()
      clean(repoTests)
    })

    describe('## http-api spec tests for custom config', () => {
      fs.readdirSync(path.join(`${__dirname}/inject/`))
        .forEach((file) => testsForCustomConfig.includes(file) && require(`./inject/${file}`)(http))
    })
  })

  describe('default config', () => {
    const config = {
      Bootstrap: []
    }

    before(async function () {
      this.timeout(60 * 1000)
      await startHttpAPI(config)
    })

    after(async function () {
      this.timeout(50 * 1000)

      await http.api.stop()
      clean(repoTests)
    })

    describe('## http-api spec tests for default config', () => {
      fs.readdirSync(path.join(`${__dirname}/inject/`))
        .forEach((file) => !testsForCustomConfig.includes(file) && require(`./inject/${file}`)(http))
    })
  })
})
