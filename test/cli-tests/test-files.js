/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const repoPath = require('./index').repoPath
const _ = require('lodash')

describe('files', () => {
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  describe('api offline', () => {
    it('add', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'add', process.cwd() + '/test/test-data/node.json'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('added QmRRdjTN2PjyEPrW73GBxJNAZrstH5tCZzwHYFJpSTKkhe node.json')
          done()
        })
    })

    it('get', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'get', 'QmRRdjTN2PjyEPrW73GBxJNAZrstH5tCZzwHYFJpSTKkhe'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it('cat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'cat', 'QmRRdjTN2PjyEPrW73GBxJNAZrstH5tCZzwHYFJpSTKkhe'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
              .to.equal('{ "Data": "another", "Links": [ { "Name": "some link", "Hash": "QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V", "Size": 8 } ] }')
          done()
        })
    })
  })

  describe('api running', () => {
    let httpAPI

    before((done) => {
      httpAPI = new HttpAPI(repoPath)
      httpAPI.start((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    after((done) => {
      httpAPI.stop((err) => {
        expect(err).to.not.exist
        done()
      })
    })

    it('add', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'add', process.cwd() + '/test/test-data/node.json'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('added QmRRdjTN2PjyEPrW73GBxJNAZrstH5tCZzwHYFJpSTKkhe node.json')
          done()
        })
    })

    it.skip('get', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'get', 'QmRRdjTN2PjyEPrW73GBxJNAZrstH5tCZzwHYFJpSTKkhe'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it('cat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'files', 'cat', 'QmRRdjTN2PjyEPrW73GBxJNAZrstH5tCZzwHYFJpSTKkhe'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
              .to.equal('{ "Data": "another", "Links": [ { "Name": "some link", "Hash": "QmXg9Pp2ytZ14xgmQjYEiHjVjMFXzCVVEcRTWJBmLgR39V", "Size": 8 } ] }')
          done()
        })
    })
  })
})
