/* eslint-env mocha */

const expect = require('chai').expect
const nexpect = require('nexpect')
const httpAPI = require('../../src/http-api')

describe('version', () => {
  describe('api offline', () => {
    it('get the version', (done) => {
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'version'])
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
      nexpect.spawn('node', [process.cwd() + '/src/cli/bin.js', 'version'])
        .run((err, stdout, exitcode) => {
          expect(err).to.not.exist
          expect(exitcode).to.equal(0)
          expect(stdout[0]).to.equal('ipfs version 0.4.0-dev')
          done()
        })
    })
  })
})
