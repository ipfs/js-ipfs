/* eslint-env mocha */
'use strict'

const fs = require('fs')
const hat = require('hat')
const API = require('../../../src/http/index')
const promisify = require('promisify-es6')
const ncp = promisify(require('ncp').ncp)
const path = require('path')
const clean = require('../../utils/clean')

describe('HTTP API', () => {
  const repoExample = path.join(__dirname, '../../fixtures/go-ipfs-repo')
  const repoTests = path.join(__dirname, '../../repo-tests-run')

  let http = {}

  const startHttpAPI = async () => {
    http.api = new API({
      repo: repoTests,
      pass: hat(),
      config: { Bootstrap: [] },
      EXPERIMENTAL: {
        pubsub: true
      }
    })
    await ncp(repoExample, repoTests)
    await http.api.start()
  }

  before(async function () {
    this.timeout(60 * 1000)
    await startHttpAPI()
  })

  after(async () => {
    await http.api.stop()
    clean(repoTests)
  })

  describe('## http-api spec tests', () => {
    fs.readdirSync(path.join(__dirname))
      .forEach((file) => file !== 'index.js' && require(`./${file}`)(http))
  })
})
