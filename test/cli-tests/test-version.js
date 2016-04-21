/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const httpAPI = require('../../src/http-api')
const repoPath = require('./index').repoPath

describe('version', () => {
  const env = process.env
  env.IPFS_PATH = repoPath

  describe('api offline', () => {
    it('get the version', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'version'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0]).to.equal('ipfs version 0.4.0-dev')
          expect(exitcode).to.equal(0)
          done()
        })
    })
  })

  describe('api running', () => {
    before((done) => {
      httpAPI.start(repoPath, (err) => {
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

    it('get the version', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'version'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('ipfs version 0.4.0-dev')
          done()
        })
    })
  })
})
