/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const repoPath = require('./index').repoPath
const _ = require('lodash')
const pkgversion = require('../../package.json').version

describe('version', () => {
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  describe('api offline', () => {
    it('get the version', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'version'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0]).to.equal('js-ipfs version: ' + pkgversion)
          expect(exitcode).to.equal(0)
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

    it('get the version', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'version'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('js-ipfs version: ' + pkgversion)
          done()
        })
    })
  })
})
