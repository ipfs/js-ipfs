/* eslint-env mocha */
'use strict'

const fs = require('fs')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const API = require('../../src/http')
const APIctl = require('ipfs-api')
const ncp = require('ncp').ncp
const path = require('path')
const clean = require('../utils/clean')

describe('HTTP API', () => {
  const repoExample = path.join(__dirname, '../fixtures/go-ipfs-repo')
  const repoTests = path.join(__dirname, '../repo-tests-run')

  let http = {}

  before((done) => {
    http.api = new API(repoTests)

    ncp(repoExample, repoTests, (err) => {
      expect(err).to.not.exist()

      http.api.start(false, done)
    })
  })

  after((done) => {
    http.api.stop((err) => {
      expect(err).to.not.exist()
      clean(repoTests)
      done()
    })
  })

  describe('## http-api spec tests', () => {
    fs.readdirSync(path.join(__dirname, '/spec'))
      .forEach((file) => require('./spec/' + file)(http))
  })

  describe('## interface tests', () => {
    fs.readdirSync(path.join(__dirname, '/interface'))
      .forEach((file) => require('./interface/' + file))
  })

  describe('## custom ipfs-api tests', () => {
    const ctl = APIctl('/ip4/127.0.0.1/tcp/6001')

    fs.readdirSync(path.join(__dirname, '/over-ipfs-api'))
      .forEach((file) => require('./over-ipfs-api/' + file)(ctl))
  })
})
