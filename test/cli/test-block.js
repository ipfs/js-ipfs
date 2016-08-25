/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const HttpAPI = require('../../src/http-api')
const path = require('path')
const repoPath = require('./index').repoPath
const _ = require('lodash')

const spawn = (args) => {
  const env = _.clone(process.env)
  env.IPFS_PATH = repoPath
  return nexpect.spawn(
    'node',
    [path.join(__dirname, '../../src/cli/bin.js')].concat(args),
    {env}
  )
}

describe('block', () => {
  describe('api offline', () => {
    it('put', (done) => {
      spawn(['block', 'put', process.cwd() + '/test/test-data/hello'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0])
            .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it('get', (done) => {
      spawn(['block', 'get', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0])
            .to.equal('hello world')
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it('stat', (done) => {
      spawn(['block', 'stat', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0])
            .to.equal('Key: QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(stdout[1])
            .to.equal('Size: 12')
          expect(exitcode).to.equal(0)

          done()
        })
    })

    it.skip('rm', (done) => {
      spawn(['block', 'rm', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0])
            .to.equal('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(exitcode).to.equal(0)
          done()
        })
    })
  })

  describe.skip('api running', () => {
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

    it('put', (done) => {
      spawn(['block', 'put', process.cwd() + '/test/test-data/hello'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0])
            .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it('get', (done) => {
      spawn(['block', 'get', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0])
            .to.equal('hello world')
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it('stat', (done) => {
      spawn(['block', 'stat', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0])
            .to.equal('Key: QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(stdout[1])
            .to.equal('Size: 12')
          expect(exitcode).to.equal(0)
          done()
        })
    })

    it.skip('rm', (done) => {
      spawn(['block', 'rm', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(stdout[0])
            .to.equal('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(exitcode).to.equal(0)
          done()
        })
    })
  })
})
