/* eslint-env jest */
'use strict'

// const fs = require('fs')
// const chai = require('chai')
// const dirtyChai = require('dirty-chai')
// const expect = chai.expect
// chai.use(dirtyChai)
const API = require('../../src/http-api')
const APIctl = require('ipfs-api')
const ncp = require('ncp').ncp
const path = require('path')
const series = require('async/series')
const clean = require('../utils/clean')

const repoExample = path.join(__dirname, '../go-ipfs-repo')
const repoTests = path.join(__dirname, '../repo-tests-run')

exports.before = (done) => {
  const http = {}
  http.api = new API(repoTests)

  series([
    (cb) => ncp(repoExample, repoTests, cb),
    (cb) => http.api.start(false, cb)
  ], (err) => {
    if (err) {
      return done(err)
    }

    done(null, http)
  })
}

exports.after = (http, done) => {
  http.api.stop((err) => {
    if (err) {
      return done(err)
    }

    clean(repoTests)
    done()
  })
}

  // describe('## http-api spec tests', () => {
  //   fs.readdirSync(path.join(__dirname, '/spec'))
  //     .forEach((file) => require('./spec/' + file)(http))
  // })

  // describe('## interface tests', () => {
  //   fs.readdirSync(path.join(__dirname, '/interface'))
  //     .forEach((file) => require('./interface/' + file))
  // })

  // describe('## custom ipfs-api tests', () => {
  //   const ctl = APIctl('/ip4/127.0.0.1/tcp/6001')

  //   fs.readdirSync(path.join(__dirname, '/over-ipfs-api'))
  //     .forEach((file) => require('./over-ipfs-api/' + file)(ctl))
  // })
// })
