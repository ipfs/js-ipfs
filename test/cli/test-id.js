/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const repoPath = require('./index').repoPath
const _ = require('lodash')

describe('id', () => {
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath

  describe('api offline', () => {
    it('get the id', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'id'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)

          const id = JSON.parse(stdout.join(''))
          expect(id).to.have.property('id')
          expect(id).to.have.property('publicKey')
          expect(id).to.have.property('addresses')
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

    it('get the id', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'id'], {env})
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)

          const id = JSON.parse(stdout.join(''))
          expect(id).to.have.property('id')
          expect(id).to.have.property('publicKey')
          expect(id).to.have.property('addresses')

          done()
        })
    })
  })
})
