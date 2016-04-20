/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const nexpect = require('nexpect')
const httpAPI = require('../../src/http-api')

describe('block', () => {
  describe('api offline', () => {
    it('put', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'block', 'put', process.cwd() + '/test/test-data/hello'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          done()
        })
    })

    it('get', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'block', 'get', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('hello world')
          done()
        })
    })

    it('stat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'block', 'stat', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('Key: QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(stdout[1])
             .to.equal('Size: 12')
          done()
        })
    })

    it('rm', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'block', 'rm', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          done()
        })
    })
  })

  describe('api running', () => {
    before((done) => {
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
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'block', 'put', process.cwd() + '/test/test-data/hello'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          done()
        })
    })

    it('get', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'block', 'get', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('hello world')
          done()
        })
    })

    it('stat', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'block', 'stat', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('Key: QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(stdout[1])
             .to.equal('Size: 12')
          done()
        })
    })

    it.skip('rm', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'block', 'rm', 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0])
             .to.equal('removed QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          done()
        })
    })
  })
})
