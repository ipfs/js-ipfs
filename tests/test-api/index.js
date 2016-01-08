/* globals describe, before, after */

'use strict'

const fs = require('fs')
const expect = require('chai').expect
process.env.IPFS_PATH = process.cwd() + '/tests/repo-example'
const api = require('../../src/http-api')

describe('api', () => {
  before(done => {
    api.start(err => {
      expect(err).to.not.exist
      done()
    })
  })

  after(done => {
    api.stop((err) => {
      expect(err).to.not.exist
      done()
    })
  })

  var tests = fs.readdirSync(__dirname)
  tests.filter(file => {
    if (file === 'index.js') {
      return false
    } else {
      return true
    }
  }).forEach(file => {
    require('./' + file)
  })
})
